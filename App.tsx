
import React, { useState, useMemo, useEffect } from 'react';
import { UserProfile, CreatureInstance, View, DailyActivity, SkillLevel, MissionInstance, Question, User, LeagueType, TutorialState } from './types';
import { SUBTOPICS, INITIAL_CREATURES, AURA_POINTS_PER_PRACTICE_STREAK, LEAGUES } from './constants';
import useLocalStorage from './hooks/useLocalStorage';
import { generateDailyMissions } from './utils/missionGenerator';
import Dashboard from './components/Dashboard';
import MissionView from './components/MissionView';
import SummonView from './components/SummonView';
import BestiaryView from './components/BestiaryView';
import BottomNavBar from './components/BottomNavBar';
import ProgressView from './components/ProgressView';
import ReviewView from './components/ReviewView';
import ShopView from './components/ShopView';
import StreakPopup from './components/StreakPopup';
import LeaderboardView from './components/LeaderboardView';
import LoginView from './components/LoginView';
import { generateSatQuestion } from './services/questionService';
import { getDifficultyForLevel } from './utils/mastery';
import { AuthService } from './services/authService';
import PikachuGuide from './components/Tutorial/PikachuGuide';
import TutorialOverlay from './components/Tutorial/TutorialOverlay';
import StarterSelection from './components/Tutorial/StarterSelection';
import BaselineTest from './components/Tutorial/BaselineTest';
import BaselineResults from './components/Tutorial/BaselineResults';
import UnlockAnimation from './components/Tutorial/UnlockAnimation';
import { INITIAL_TUTORIAL_STATE, TUTORIAL_DIALOGUE, STARTER_IDS } from './utils/tutorialSteps';
import { processBaselineResults, baselineResultsToStats } from './utils/baselineScoring';

const App: React.FC = () => {
    const [user, setUser] = useLocalStorage<User | null>('user', null);
    const [currentView, setCurrentView] = useState<View>(View.DASHBOARD);
    const [isCheckingSession, setIsCheckingSession] = useState(true);
    const [tutorialState, setTutorialState] = useLocalStorage<TutorialState>('tutorialState', INITIAL_TUTORIAL_STATE);
    const [baselineResults, setBaselineResults] = useState<any>(null);

    // Check for valid session on app load
    useEffect(() => {
        const checkSession = async () => {
            try {
                const validatedUser = await AuthService.getCurrentSession();
                if (validatedUser) {
                    setUser(validatedUser);
                } else if (user) {
                    // User exists in localStorage but session is invalid/expired
                    setUser(null);
                }
            } catch (error) {
                console.error('Session check failed:', error);
                // On error, keep existing user state if any
            } finally {
                setIsCheckingSession(false);
            }
        };
        checkSession();
    }, []);
    const [activeMissionId, setActiveMissionId] = useState<string | null>(null);
    const [preparingMissionId, setPreparingMissionId] = useState<string | null>(null);
    const [streakToShow, setStreakToShow] = useState<number | null>(null);

    const [profile, setProfile] = useLocalStorage<UserProfile>('userProfile', () => {
        const initialProfile: UserProfile = { 
            stats: {},
            inventory: {
                'ELIMINATE': 0,
                'SKIP': 0,
                'HINT': 0,
                'SECOND_CHANCE': 0,
                'DOUBLE_JEOPARDY': 0
            },
            dailyStreak: 0,
            lastStreakDate: '',
            weeklyAuraGain: 0,
            lastWeekResetDate: '',
            league: LeagueType.BRONZE
        };
        SUBTOPICS.forEach(subtopic => {
            initialProfile.stats[subtopic] = { correct: 0, incorrect: 0, level: 'Easy' };
        });
        return initialProfile;
    });

    const [auraPoints, setAuraPoints] = useLocalStorage<number>('auraPoints', 1500);
    const [creatures, setCreatures] = useLocalStorage<CreatureInstance[]>('userCreatures', []);
    const [activeCreatureId, setActiveCreatureId] = useLocalStorage<number | null>('activeCreatureId', null);
    const [reviewQueue, setReviewQueue] = useLocalStorage<Question[]>('reviewQueue', []);
    
    const [dailyActivity, setDailyActivity] = useLocalStorage<DailyActivity>('dailyActivity', {
        date: '',
        missions: [],
    });

    // Mock competitors for the week - generated once per reset
    const [mockCompetitors, setMockCompetitors] = useLocalStorage<any[]>('mockCompetitors', []);

    // Helper to get ISO week number
    const getWeekNumber = (date: Date) => {
        const d = new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()));
        const dayNum = d.getUTCDay() || 7;
        d.setUTCDate(d.getUTCDate() + 4 - dayNum);
        const yearStart = new Date(Date.UTC(d.getUTCFullYear(), 0, 1));
        return Math.ceil((((d.getTime() - yearStart.getTime()) / 86400000) + 1) / 7);
    };

    const generateCompetitors = (league: LeagueType) => {
        const leagueIndex = LEAGUES.indexOf(league);
        const baseAura = (leagueIndex + 1) * 800;
        const names = [
            "ShadowStep", "StarGazer", "PixelLord", "MathWhiz24", "StudyBeast", 
            "AuraHunter", "ExamSlayer", "QuestMaster", "LogicKing", "ProDigy",
            "NerdLord", "BookWorm", "Summoner7", "EvoExpert", "ScribeX",
            "Gladiator", "OwlEye", "Thinker", "GrindSet"
        ];
        // We need 19 to make 20 total with the player
        return names.slice(0, 19).map((name, i) => ({
            username: name,
            weeklyGain: Math.floor(Math.random() * baseAura) + (baseAura / 2),
            guardianId: Math.floor(Math.random() * 10) + 1,
            isUser: false
        }));
    };

    // Daily reset and streak check logic + Weekly Reset
    useEffect(() => {
        if (!user) return;
        const now = new Date();
        const today = now.toISOString().split('T')[0];
        
        // Daily reset
        if (dailyActivity.date !== today) {
            if (profile.lastStreakDate) {
                const lastDate = new Date(profile.lastStreakDate);
                const currentDate = new Date(today);
                const diffTime = Math.abs(currentDate.getTime() - lastDate.getTime());
                const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
                
                if (diffDays > 1) {
                    setProfile(prev => ({ ...prev, dailyStreak: 0 }));
                }
            }

            // Tutorial: Generate special missions during tutorial phases
            let newMissions: MissionInstance[];
            if (!tutorialState.baselineCompleted) {
                // During tutorial: Show only baseline test mission
                if (tutorialState.currentPhase === 'baseline-test' || tutorialState.currentPhase === 'baseline-intro') {
                    newMissions = [{
                        id: 'baseline-assessment',
                        title: 'Baseline Assessment',
                        description: 'Complete your skill assessment',
                        subtopic: 'Assessment',
                        questionCount: 1,
                        reward: 1000,
                        xp: 0,
                        completed: false,
                        progress: 0,
                        correctAnswers: 0
                    }];
                } else {
                    // Tutorial missions (empty array or tutorial-specific missions)
                    newMissions = [];
                }
            } else {
                // Normal mission generation after tutorial
                newMissions = generateDailyMissions(profile).map(mission => ({
                    ...mission,
                    completed: false,
                    progress: 0,
                    correctAnswers: 0,
                }));
            }
            
            setDailyActivity({
                date: today,
                missions: newMissions,
            });
        }

        // Weekly Reset check
        const currentWeek = getWeekNumber(now);
        const lastResetWeek = profile.lastWeekResetDate ? getWeekNumber(new Date(profile.lastWeekResetDate)) : -1;
        
        if (currentWeek !== lastResetWeek) {
            let nextLeague = profile.league;
            if (mockCompetitors.length > 0) {
                const fullList = [...mockCompetitors, { username: "You", weeklyGain: profile.weeklyAuraGain, isUser: true }]
                    .sort((a, b) => b.weeklyGain - a.weeklyGain);
                const userRank = fullList.findIndex(e => e.isUser) + 1;
                
                const leagueIdx = LEAGUES.indexOf(profile.league);
                if (userRank <= 5 && leagueIdx < LEAGUES.length - 1) {
                    nextLeague = LEAGUES[leagueIdx + 1];
                } else if (userRank >= 18 && leagueIdx > 0) {
                    nextLeague = LEAGUES[leagueIdx - 1];
                }
            }

            setProfile(prev => ({
                ...prev,
                weeklyAuraGain: 0,
                lastWeekResetDate: now.toISOString(),
                league: nextLeague
            }));

            // Generate new competitors for the new week
            setMockCompetitors(generateCompetitors(nextLeague));
        } else if (mockCompetitors.length === 0) {
            setMockCompetitors(generateCompetitors(profile.league));
        }
    }, [dailyActivity.date, profile.lastStreakDate, user, mockCompetitors, profile.league, profile.weeklyAuraGain]);

    // Side effect to sync view state when mission data is missing
    useEffect(() => {
        if (currentView === View.MISSION) {
            const activeMission = dailyActivity.missions.find(m => m.id === activeMissionId);
            if (!activeMission || !activeMission.questions) {
                setCurrentView(View.DASHBOARD);
            }
        }
    }, [currentView, activeMissionId, dailyActivity.missions]);

    // Preload questions for all missions when dashboard loads
    useEffect(() => {
        if (currentView !== View.DASHBOARD || !user) return;

        const preloadMissions = async () => {
            const missionsNeedingQuestions = dailyActivity.missions.filter(
                m => !m.completed && (!m.questions || m.questions.length === 0)
            );

            if (missionsNeedingQuestions.length === 0) return;

            // Preload questions for each mission in parallel
            const preloadPromises = missionsNeedingQuestions.map(async (mission) => {
                const subtopicLevel = profile.stats[mission.subtopic]?.level || 'Easy';
                const difficulty = getDifficultyForLevel(subtopicLevel);
                const generatedQuestions = await Promise.all(
                    Array(mission.questionCount).fill(0).map(() => generateSatQuestion(mission.subtopic, difficulty))
                );
                return {
                    missionId: mission.id,
                    questions: generatedQuestions.map(q => ({ ...q, subtopic: mission.subtopic }))
                };
            });

            const results = await Promise.all(preloadPromises);

            setDailyActivity(prev => ({
                ...prev,
                missions: prev.missions.map(m => {
                    const preloaded = results.find(r => r.missionId === m.id);
                    if (preloaded && (!m.questions || m.questions.length === 0)) {
                        return { ...m, questions: preloaded.questions };
                    }
                    return m;
                })
            }));
        };

        preloadMissions();
    }, [currentView, user, dailyActivity.missions.length]);

    const updateProfile = (subtopic: string, isCorrect: boolean) => {
        setProfile(prev => {
            const newStats = { ...prev.stats };
            const current = newStats[subtopic];
            if (isCorrect) {
                current.correct += 1;
            } else {
                current.incorrect += 1;
            }
            return { ...prev, stats: newStats };
        });
    };

    const awardAura = (amount: number) => {
        setAuraPoints(prev => prev + amount);
        setProfile(prev => ({
            ...prev,
            weeklyAuraGain: prev.weeklyAuraGain + amount
        }));
    };

    const handleMissionAnswer = (missionId: string, isCorrect: boolean, forceEarlyEnd: boolean = false, loseAllRewards: boolean = false) => {
        const mission = dailyActivity.missions.find(m => m.id === missionId);
        if (!mission) return;

        if (!forceEarlyEnd) {
            updateProfile(mission.subtopic, isCorrect);
            if (!isCorrect && mission.questions) {
                const incorrectQuestion = mission.questions[mission.progress];
                addToReviewQueue(incorrectQuestion);
            }
        }

        // Streak implementation: progress resets to 0 on incorrect answer unless Double Jeopardy saves it (handled by forceEarlyEnd/loseAllRewards flag)
        let newProgress = mission.progress;
        if (forceEarlyEnd) {
            // Early end typically means we've finished or bailed with Double Jeopardy
            // Keep current progress as it is.
        } else {
            if (isCorrect) {
                newProgress = mission.progress + 1;
            } else {
                newProgress = 0; // STREAK BROKEN: Reset to beginning
            }
        }

        const newCorrectAnswers = (!forceEarlyEnd && isCorrect) ? mission.correctAnswers + 1 : mission.correctAnswers;
        const isNowComplete = !loseAllRewards && newProgress >= mission.questionCount;
        
        if (isNowComplete && !mission.completed) {
            const today = new Date().toISOString().split('T')[0];
            
            if (profile.lastStreakDate !== today) {
                const newStreak = profile.dailyStreak + 1;
                setProfile(prev => ({
                    ...prev,
                    dailyStreak: newStreak,
                    lastStreakDate: today
                }));
                setStreakToShow(newStreak);
            }

            if (!loseAllRewards) {
                const finalReward = mission.reward;
                const finalXp = mission.xp;
                
                awardAura(finalReward);
                addXpToActiveCreature(finalXp);
            }
        }

        setDailyActivity(prev => ({
            ...prev,
            missions: prev.missions.map(m =>
                m.id === missionId ? { 
                    ...m, 
                    progress: newProgress,
                    correctAnswers: newCorrectAnswers,
                    completed: isNowComplete || m.completed,
                } : m
            )
        }));
    };

    const addXpToActiveCreature = (xp: number) => {
        if (activeCreatureId === null) return;
        setCreatures(prev => prev.map(c => {
            if (c.id === activeCreatureId) {
                const newXp = c.xp + xp;
                const creatureData = INITIAL_CREATURES.find(ic => ic.id === c.creatureId);
                const maxStage = creatureData?.maxEvolutionStage || 3;
                const evolveLevel1 = creatureData?.evolveLevel1;
                const evolveLevel2 = creatureData?.evolveLevel2;

                // Calculate new level from XP (level = floor(xp / XP_PER_LEVEL), min 5)
                const XP_PER_LEVEL = 10;
                const MIN_LEVEL = 5;
                const MAX_LEVEL = 100;
                const newLevel = Math.min(MAX_LEVEL, Math.max(MIN_LEVEL, Math.floor(newXp / XP_PER_LEVEL) + MIN_LEVEL));

                let newStage = c.evolutionStage;
                // Only evolve if the creature has that evolution stage available and reached the level
                if (c.evolutionStage === 1 && maxStage >= 2 && evolveLevel1 && newLevel >= evolveLevel1) {
                    newStage = 2;
                }
                if (newStage === 2 && maxStage >= 3 && evolveLevel2 && newLevel >= evolveLevel2) {
                    newStage = 3;
                }
                return { ...c, xp: newXp, level: newLevel, evolutionStage: newStage as 1|2|3 };
            }
            return c;
        }));
    };
    
    const addToReviewQueue = (question: Question) => {
         setReviewQueue(prev => {
            if (prev.some(q => q.question === question.question)) return prev;
            return [...prev, question];
        });
    };

    const startMission = async (mission: MissionInstance) => {
        if (mission.questions && mission.questions.length > 0) {
             setActiveMissionId(mission.id);
             setCurrentView(View.MISSION);
             return;
        }
        setPreparingMissionId(mission.id);
        const subtopicLevel = profile.stats[mission.subtopic]?.level || 'Easy';
        const difficulty = getDifficultyForLevel(subtopicLevel);
        const generatedQuestions = await Promise.all(
            Array(mission.questionCount).fill(0).map(() => generateSatQuestion(mission.subtopic, difficulty))
        );
        setDailyActivity(prev => ({
            ...prev,
            missions: prev.missions.map(m =>
                m.id === mission.id ? { ...m, questions: generatedQuestions.map(q => ({...q, subtopic: mission.subtopic})) } : m
            )
        }));
        setPreparingMissionId(null);
        setActiveMissionId(mission.id);
        setCurrentView(View.MISSION);
    };

    const handleLogout = async () => {
        await AuthService.logout();
        setUser(null);
        setCurrentView(View.DASHBOARD);
    };

    const handleUpdateUser = (updates: Partial<User>) => {
        if (user) {
            setUser({ ...user, ...updates });
        }
    };

    const renderView = () => {
        const activeMission = dailyActivity.missions.find(m => m.id === activeMissionId);
        switch (currentView) {
            case View.DASHBOARD:
                return <Dashboard
                            user={user!}
                            auraPoints={auraPoints}
                            dailyStreak={profile.dailyStreak}
                            creatures={creatures}
                            activeCreatureId={activeCreatureId}
                            setActiveCreatureId={setActiveCreatureId}
                            startMission={startMission}
                            dailyMissions={dailyActivity.missions}
                            preparingMissionId={preparingMissionId}
                            reviewQueueCount={reviewQueue.length}
                            onOpenReview={() => setCurrentView(View.REVIEW)}
                            onOpenShop={() => setCurrentView(View.SHOP)}
                            onUpdateUser={handleUpdateUser}
                            onLogout={handleLogout}
                            tutorialState={tutorialState}
                        />;
            case View.MISSION:
                if (!activeMission || !activeMission.questions) { return null; }
                return <MissionView 
                            mission={activeMission}
                            onAnswer={handleMissionAnswer}
                            onExit={() => { setActiveMissionId(null); setCurrentView(View.DASHBOARD); }}
                            inventory={profile.inventory}
                            consumePowerUp={(type) => setProfile(p => ({...p, inventory: {...p.inventory, [type]: Math.max(0, (p.inventory[type] || 0) - 1)}}))}
                        />;
            case View.REVIEW:
                return <ReviewView 
                            questions={reviewQueue}
                            onAnswer={(q, correct) => {
                                if (correct) {
                                    setReviewQueue(prev => prev.filter(x => x.question !== q.question));
                                    awardAura(15);
                                    addXpToActiveCreature(5);
                                }
                            }}
                            onExit={() => setCurrentView(View.DASHBOARD)}
                        />;
            case View.SHOP:
                return <ShopView 
                            auraPoints={auraPoints}
                            inventory={profile.inventory}
                            onBuy={(type, cost) => {
                                if (auraPoints >= cost) {
                                    setAuraPoints(p => p - cost);
                                    setProfile(p => ({...p, inventory: {...p.inventory, [type]: (p.inventory[type] || 0) + 1}}));
                                }
                            }}
                            onExit={() => setCurrentView(View.DASHBOARD)}
                        />;
            case View.PROGRESS:
                return <ProgressView
                            profile={profile}
                            setAuraPoints={setAuraPoints}
                            updateProfile={updateProfile}
                            levelUpSubtopic={levelUpSubtopic}
                            consumePowerUp={(type) => setProfile(p => ({...p, inventory: {...p.inventory, [type]: Math.max(0, (p.inventory[type] || 0) - 1)}}))}
                            addToReviewQueue={addToReviewQueue}
                            awardAura={awardAura}
                        />;
            case View.LEADERBOARD:
                return <LeaderboardView 
                            weeklyGain={profile.weeklyAuraGain} 
                            league={profile.league} 
                            competitors={mockCompetitors}
                        />;
            case View.SUMMON:
                return <SummonView
                            auraPoints={auraPoints}
                            setAuraPoints={setAuraPoints}
                            userCreatures={creatures}
                            addCreature={(id, customData) => {
                                setCreatures(p => [...p, {
                                    id: Date.now() + Math.random(),
                                    creatureId: id,
                                    xp: 50,  // Start with 50 XP (level 5)
                                    level: 5,  // Starting level
                                    evolutionStage: 1,
                                    ...customData
                                }]);
                            }}
                        />;
            case View.BESTIARY:
                return <BestiaryView
                    userCreatures={creatures}
                    onToggleFavorite={(instanceId) => {
                        setCreatures(prev => prev.map(c =>
                            c.id === instanceId ? { ...c, isFavorite: !c.isFavorite } : c
                        ));
                    }}
                />;
            default:
                return null;
        }
    };

    const levelUpSubtopic = (subtopic: string, nextLevel: SkillLevel) => {
        setProfile(prev => {
            const newStats = { ...prev.stats };
            newStats[subtopic] = { ...newStats[subtopic], level: nextLevel };
            return { ...prev, stats: newStats };
        });
    };

    // Tutorial handlers
    const handleTutorialNext = () => {
        const { currentPhase } = tutorialState;

        switch (currentPhase) {
            case 'welcome':
                setTutorialState(prev => ({ ...prev, currentPhase: 'first-mission' }));
                break;
            case 'first-mission':
                setTutorialState(prev => ({ ...prev, currentPhase: 'first-summon' }));
                setCurrentView(View.SUMMON);
                break;
            case 'first-summon':
                // After starter selected, go to guardian bond
                setCurrentView(View.DASHBOARD);
                setTimeout(() => {
                    setTutorialState(prev => ({ ...prev, currentPhase: 'second-mission' }));
                }, 1000);
                break;
            case 'second-mission':
                setTutorialState(prev => ({ ...prev, currentPhase: 'second-summon' }));
                setCurrentView(View.SUMMON);
                break;
            case 'second-summon':
                setTutorialState(prev => ({ ...prev, currentPhase: 'baseline-intro' }));
                setCurrentView(View.DASHBOARD);
                break;
            case 'baseline-intro':
                setTutorialState(prev => ({ ...prev, currentPhase: 'baseline-test' }));
                break;
            default:
                break;
        }
    };

    const handleStarterSelect = (starterId: number) => {
        // Add starter to creatures with free aura (give 500 aura first)
        setAuraPoints(prev => prev + 500);

        // Add the starter
        const newCreatureId = Date.now();
        setCreatures(prev => [...prev, {
            id: newCreatureId,
            creatureId: starterId,
            xp: 50,
            level: 5,
            evolutionStage: 1,
        }]);

        // Set as active creature
        setActiveCreatureId(newCreatureId);

        // Update tutorial state and move to next phase
        setTutorialState(prev => ({
            ...prev,
            starterPokemonId: starterId,
            currentPhase: 'second-mission'
        }));

        // Navigate back to dashboard
        setCurrentView(View.DASHBOARD);
    };

    const handleBaselineComplete = (answers: { subtopic: string; isCorrect: boolean }[]) => {
        const results = processBaselineResults(answers);
        setBaselineResults(results);

        // Award 1000 Aura
        setAuraPoints(prev => prev + 1000);

        // Update skill levels in profile
        const newStats = baselineResultsToStats(results);
        setProfile(prev => ({
            ...prev,
            stats: { ...prev.stats, ...newStats }
        }));

        // Mark baseline as completed
        setTutorialState(prev => ({
            ...prev,
            baselineCompleted: true,
            currentPhase: 'post-baseline'
        }));
    };

    const handleUnlockComplete = () => {
        // Show feature tour or complete tutorial
        setTutorialState(prev => ({
            ...prev,
            currentPhase: 'complete',
            isComplete: true
        }));
        setBaselineResults(null);
    };

    // Tutorial rendering logic
    const renderTutorial = () => {
        const { currentPhase } = tutorialState;

        switch (currentPhase) {
            case 'welcome':
                return (
                    <PikachuGuide
                        message={TUTORIAL_DIALOGUE.welcome.greeting}
                        onNext={handleTutorialNext}
                        buttonText={TUTORIAL_DIALOGUE.welcome.button}
                    />
                );

            case 'first-mission':
                return (
                    <PikachuGuide
                        message={TUTORIAL_DIALOGUE.firstMission.intro}
                        onNext={handleTutorialNext}
                        position="top"
                    />
                );

            case 'first-summon':
                return (
                    <StarterSelection onSelect={handleStarterSelect} />
                );

            case 'second-mission':
                return (
                    <PikachuGuide
                        message={TUTORIAL_DIALOGUE.secondMission.intro}
                        onNext={handleTutorialNext}
                        position="top"
                    />
                );

            case 'second-summon':
                if (currentView === View.SUMMON) {
                    return (
                        <PikachuGuide
                            message={TUTORIAL_DIALOGUE.secondSummon.intro}
                            onNext={handleTutorialNext}
                            position="top"
                            showPikachu={false}
                        />
                    );
                }
                return null;

            case 'baseline-intro':
                return (
                    <PikachuGuide
                        message={`${TUTORIAL_DIALOGUE.baselineIntro.intro}\n\n${TUTORIAL_DIALOGUE.baselineIntro.explanation}\n\n${TUTORIAL_DIALOGUE.baselineIntro.reward}`}
                        onNext={handleTutorialNext}
                    />
                );

            case 'baseline-test':
                return (
                    <BaselineTest
                        onComplete={handleBaselineComplete}
                        onSaveAndExit={(progress) => {
                            setTutorialState(prev => ({
                                ...prev,
                                baselineProgress: progress
                            }));
                            setCurrentView(View.DASHBOARD);
                        }}
                        savedProgress={tutorialState.baselineProgress}
                    />
                );

            case 'post-baseline':
                if (baselineResults) {
                    return (
                        <>
                            <BaselineResults
                                results={baselineResults}
                                onContinue={() => setBaselineResults(null)}
                            />
                        </>
                    );
                } else {
                    return (
                        <UnlockAnimation
                            features={['Progress', 'Shop', 'Training', 'Leaderboard']}
                            onComplete={handleUnlockComplete}
                        />
                    );
                }

            default:
                return null;
        }
    };

    // Show loading while checking session
    if (isCheckingSession) {
        return (
            <div className="min-h-screen w-full flex items-center justify-center bg-background">
                <div className="text-center space-y-4">
                    <div className="w-16 h-16 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto"></div>
                    <p className="text-sm text-text-dim">Loading...</p>
                </div>
            </div>
        );
    }

    if (!user) {
        return <LoginView onLogin={setUser} />;
    }

    return (
        <div className="min-h-screen w-full bg-background text-text-main font-sans text-sm flex flex-col lg:flex-row">
            <BottomNavBar
                currentView={currentView}
                setCurrentView={setCurrentView}
                user={user}
                tutorialState={tutorialState}
            />
            <main className="flex-grow p-4 pb-24 lg:pb-8 lg:p-8 lg:ml-64 w-full max-w-7xl mx-auto transition-all duration-300">
                {renderView()}
            </main>
            {streakToShow !== null && (
                <StreakPopup
                    streak={streakToShow}
                    onClose={() => setStreakToShow(null)}
                />
            )}
            {/* Tutorial overlay */}
            {!tutorialState.isComplete && renderTutorial()}
        </div>
    );
};

export default App;
