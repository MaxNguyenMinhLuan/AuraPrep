
import React, { useState, useMemo, useEffect } from 'react';
import { UserProfile, CreatureInstance, View, DailyActivity, SkillLevel, MissionInstance, Question, User, LeagueType, TutorialState } from './types';
import { SUBTOPICS, INITIAL_CREATURES, AURA_POINTS_PER_PRACTICE_STREAK, LEAGUES } from './constants';
import useLocalStorage from './hooks/useLocalStorage';
import useUserStorage, { clearLegacyData } from './hooks/useUserStorage';
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
import ProfileModal from './components/ProfileModal';
import { generateSatQuestion } from './services/questionService';
import { getDifficultyForLevel } from './utils/mastery';
import { AuthService } from './services/authService';
import SunIcon from './components/icons/SunIcon';
import MoonIcon from './components/icons/MoonIcon';
import AuraIcon from './components/icons/AuraIcon';
import FireIcon from './components/icons/FireIcon';

// Tutorial components
import PikachuGuide from './components/Tutorial/PikachuGuide';
import TutorialOverlay from './components/Tutorial/TutorialOverlay';
import StarterSelection from './components/Tutorial/StarterSelection';
import ForcedNavigation from './components/Tutorial/ForcedNavigation';
import FirstMissionQuestion from './components/Tutorial/FirstMissionQuestion';
import RewardCelebration from './components/Tutorial/RewardCelebration';
import DailyMissionsExplainer from './components/Tutorial/DailyMissionsExplainer';
import UnlockPopup from './components/Tutorial/UnlockPopup';
import UnlockAnimation from './components/Tutorial/UnlockAnimation';
import { INITIAL_TUTORIAL_STATE, TUTORIAL_DIALOGUE, STARTER_IDS, PROGRESS_UNLOCK_QUESTIONS, LEADERBOARD_UNLOCK_QUESTIONS } from './utils/tutorialSteps';

// Legacy imports - preserved for potential rollback
// import WelcomeMission from './components/Tutorial/WelcomeMission';
// import BaselineTest from './components/Tutorial/BaselineTest';
// import BaselineResults from './components/Tutorial/BaselineResults';
// import { processBaselineResults, baselineResultsToStats } from './utils/baselineScoring';
import { hasCompletedStealthPlacement, processStealthMissionAnswer } from './services/stealthMissionService';
import { migrateLocalStorageToBackend, syncGameDataToBackend } from './services/gameDataService';
import { DifficultyTier } from './types/stealthDiagnostic';

const App: React.FC = () => {
    const [user, setUser] = useLocalStorage<User | null>('user', null);
    const [currentView, setCurrentView] = useState<View>(View.DASHBOARD);
    const [isBossFightActive, setIsBossFightActive] = useState(false);
    const [isCheckingSession, setIsCheckingSession] = useState(true);
    const [baselineResults, setBaselineResults] = useState<any>(null);
    const [isProfileOpen, setIsProfileOpen] = useState(false);
    const [headerImageError, setHeaderImageError] = useState(false);
    useEffect(() => {
        setHeaderImageError(false);
    }, [user?.photoUrl]);

    // Get user ID for user-specific storage
    const handleViewChange = (newView: View) => {
        if (isBossFightActive) {
            const confirmExit = window.confirm("Are you sure you want to quit the boss fight? You will lose all your progress in this fight.");
            if (!confirmExit) return;
            setIsBossFightActive(false);
        }
        setCurrentView(newView);
    };
    const userId = user?.uid || null;

    // Initial profile factory
    const createInitialProfile = (): UserProfile => {
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
    };

    // User-specific storage - each user has their own data
    const [tutorialState, setTutorialState] = useUserStorage<TutorialState>(userId, 'tutorialState', INITIAL_TUTORIAL_STATE);
    const [profile, setProfile] = useUserStorage<UserProfile>(userId, 'userProfile', createInitialProfile);
    const [auraPoints, setAuraPoints] = useUserStorage<number>(userId, 'auraPoints', 500);
    const [creatures, setCreatures] = useUserStorage<CreatureInstance[]>(userId, 'userCreatures', []);
    const [activeCreatureId, setActiveCreatureId] = useUserStorage<number | null>(userId, 'activeCreatureId', null);
    const [userTeam, setUserTeam] = useUserStorage<number[]>(userId, 'userTeam', []);
    const [reviewQueue, setReviewQueue] = useUserStorage<Question[]>(userId, 'reviewQueue', []);
    const [dailyActivity, setDailyActivity] = useUserStorage<DailyActivity>(userId, 'dailyActivity', {
        date: '',
        missions: [],
    });
    const [mockCompetitors, setMockCompetitors] = useUserStorage<any[]>(userId, 'mockCompetitors', []);

    const [activeMissionId, setActiveMissionId] = useState<string | null>(null);
    const [preparingMissionId, setPreparingMissionId] = useState<string | null>(null);
    const [streakToShow, setStreakToShow] = useState<number | null>(null);

    const [theme, setTheme] = useState<'light' | 'dark'>(() => {
        const saved = localStorage.getItem('theme');
        if (saved === 'dark' || saved === 'light') return saved;
        return 'light';
    });

    useEffect(() => {
        if (theme === 'dark') {
            document.documentElement.classList.add('dark');
        } else {
            document.documentElement.classList.remove('dark');
        }
        localStorage.setItem('theme', theme);
    }, [theme]);

    // Check for valid session on app load
    useEffect(() => {
        const checkSession = async () => {
            try {
                const validatedUser = await AuthService.getCurrentSession();
                if (validatedUser) {
                    const isAllowed = await AuthService.isEmailAllowed(validatedUser.email);
                    if (isAllowed) {
                        setUser(validatedUser);
                    } else {
                        await AuthService.logout();
                        setUser(null);
                    }
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

    // Handle auto-login from email deep link
    useEffect(() => {
        const handleEmailAutoLogin = async () => {
            // Check if there's an auto-login token in URL
            const params = new URLSearchParams(window.location.search);
            const token = params.get('token');

            if (!token) return;

            try {
                // Verify token with backend
                const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5001/api';
                const response = await fetch(`${API_URL}/auth/verify-email-token`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ token })
                });

                if (!response.ok) {
                    console.error('Failed to verify email token');
                    // Clear the token from URL
                    window.history.replaceState({}, document.title, window.location.pathname);
                    return;
                }

                const data = await response.json();

                if (data.success && data.data.user) {
                    // Manually set user as authenticated
                    setUser(data.data.user);

                    // Store tokens in localStorage for Firebase Auth compatibility
                    localStorage.setItem('aura_current_user', JSON.stringify(data.data.user));

                    // Navigate to mission view
                    setCurrentView(View.DASHBOARD);

                    // Clean up URL
                    window.history.replaceState({}, document.title, window.location.pathname);

                    console.log('Auto-login successful from email link');
                }
            } catch (error) {
                console.error('Email auto-login error:', error);
                window.history.replaceState({}, document.title, window.location.pathname);
            }
        };

        // Only run on initial load
        if (isCheckingSession) {
            handleEmailAutoLogin();
        }
    }, [isCheckingSession]);

    // Sync game data to backend on user login
    useEffect(() => {
        if (!user || isCheckingSession) return;

        // Dev/Test account override: Unlock all features and award 100,000 Aura
        if (user.email === 'maxidea2008@gmail.com') {
            const isFullyUnlocked = tutorialState.isComplete &&
                                    tutorialState.baselineCompleted &&
                                    tutorialState.progressUnlocked &&
                                    tutorialState.trainingUnlocked &&
                                    tutorialState.shopUnlocked &&
                                    tutorialState.leaderboardUnlocked;
            if (auraPoints < 100000 || !isFullyUnlocked) {
                console.log('Test account detected: Unlocking all features and granting 100,000 Aura!');
                setAuraPoints(100000);
                setTutorialState(prev => ({
                    ...prev,
                    isComplete: true,
                    currentPhase: 'complete',
                    baselineCompleted: true,
                    progressUnlocked: true,
                    trainingUnlocked: true,
                    shopUnlocked: true,
                    leaderboardUnlocked: true,
                }));
                return;
            }
        }

        const syncData = async () => {
            try {
                const token = await AuthService.getAuthToken();
                if (!token) return;

                // Try to migrate localStorage data on first login
                const migrated = await migrateLocalStorageToBackend(user.uid, token);

                if (!migrated) {
                    // If no localStorage data to migrate, just sync current state
                    await syncGameDataToBackend(
                        profile,
                        creatures,
                        activeCreatureId,
                        auraPoints,
                        dailyActivity,
                        reviewQueue,
                        token
                    );
                }
            } catch (error) {
                console.error('Failed to sync game data:', error);
                // Continue app operation even if sync fails
            }
        };

        syncData();
    }, [user, isCheckingSession, auraPoints, tutorialState]);

    // Periodic sync every 5 minutes to keep backend up-to-date
    // Uses a ref to avoid restarting the interval on every state change
    const syncDataRef = React.useRef({ profile, creatures, activeCreatureId, auraPoints, dailyActivity, reviewQueue });
    useEffect(() => {
        syncDataRef.current = { profile, creatures, activeCreatureId, auraPoints, dailyActivity, reviewQueue };
    }, [profile, creatures, activeCreatureId, auraPoints, dailyActivity, reviewQueue]);

    useEffect(() => {
        if (!user) return;

        const interval = setInterval(async () => {
            try {
                const token = await AuthService.getAuthToken();
                if (!token) return;
                const data = syncDataRef.current;

                await syncGameDataToBackend(
                    data.profile,
                    data.creatures,
                    data.activeCreatureId,
                    data.auraPoints,
                    data.dailyActivity,
                    data.reviewQueue,
                    token
                );
            } catch (error) {
                console.error('Periodic sync failed:', error);
            }
        }, 5 * 60 * 1000); // 5 minutes

        return () => clearInterval(interval);
    }, [user]);

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

            // Tutorial: Generate missions based on current phase
            let newMissions: MissionInstance[];

            // Check if user has access to daily missions yet
            const hasDailyMissionsAccess = [
                'daily-missions-unlocked',
                'progress-unlocked',
                'progress-tour',
                'tutorial-practice',
                'training-unlocked',
                'forced-training',
                'shop-unlocked',
                'forced-shop',
                'tutorial-boss',
                'tutorial-skill-complete',
                'leaderboard-unlocked',
                'leaderboard-tour',
                'complete'
            ].includes(tutorialState.currentPhase);

            if (hasDailyMissionsAccess) {
                // User has unlocked daily missions - generate normal missions
                newMissions = generateDailyMissions(profile).map(mission => ({
                    ...mission,
                    completed: false,
                    progress: 0,
                    correctAnswers: 0,
                }));
            } else {
                // Still in early tutorial - no missions shown
                // (missions are handled by tutorial components)
                newMissions = [];
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
    }, [dailyActivity.date, profile.lastStreakDate, user, tutorialState.currentPhase]);

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

            // Wire stealth diagnostic: secretly log this answer!
            const subtopicLevel = profile.stats[mission.subtopic]?.level || 'Easy';
            const difficulty = getDifficultyForLevel(subtopicLevel);
            const difficultyTier = (difficulty === 'Extra Hard' ? 'Hard' : difficulty) as DifficultyTier;
            
            // Log to stealth diagnostic system locally
            if (user) {
                processStealthMissionAnswer(
                    user.uid,
                    mission.subtopic,
                    isCorrect,
                    30, // Default duration if not measured
                    difficultyTier
                );

                // Log to MongoDB backend asynchronously
                (async () => {
                    try {
                        const token = await AuthService.getAuthToken();
                        if (token) {
                            const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5001/api';
                            const questionText = mission.questions?.[mission.progress]?.question || '';
                            const questionId = questionText ? questionText.slice(0, 24) : 'mixed_question';
                            
                            await fetch(`${API_URL}/analytics/performance`, {
                                method: 'POST',
                                headers: {
                                    'Content-Type': 'application/json',
                                    'Authorization': `Bearer ${token}`
                                },
                                body: JSON.stringify({
                                    subtopicId: mission.subtopic,
                                    topicId: mission.subtopic.split(':')[0] || 'Mixed',
                                    questionId: questionId,
                                    isCorrect: isCorrect,
                                    difficultyLevel: difficultyTier,
                                    timeSpentSeconds: 30,
                                    userAnswered: '',
                                    correctAnswer: ''
                                })
                            });
                        }
                    } catch (error) {
                        console.error('Failed to log performance to backend:', error);
                    }
                })();
            }

            // Track question for milestone unlocks (Progress at 60, Leaderboard at 120)
            incrementQuestionsAnswered();
        }

        // Streak implementation: progress resets to 0 on incorrect answer unless Double Jeopardy saves it (handled by forceEarlyEnd/loseAllRewards flag)
        let newProgress = mission.progress;
        let shouldRegenerateQuestions = false;
        if (forceEarlyEnd) {
            // Early end typically means we've finished or bailed with Double Jeopardy
            // Keep current progress as it is.
        } else {
            if (isCorrect) {
                newProgress = mission.progress + 1;
            } else {
                newProgress = 0; // STREAK BROKEN: Reset to beginning
                shouldRegenerateQuestions = true;
            }
        }

        if (shouldRegenerateQuestions) {
            const subtopicLevel = profile.stats[mission.subtopic]?.level || 'Easy';
            const difficulty = getDifficultyForLevel(subtopicLevel);
            (async () => {
                try {
                    const generatedQuestions = await Promise.all(
                        Array(mission.questionCount).fill(0).map(() => generateSatQuestion(mission.subtopic, difficulty))
                    );
                    const newQuestions = generatedQuestions.map(q => ({ ...q, subtopic: mission.subtopic }));
                    setDailyActivity(prev => ({
                        ...prev,
                        missions: prev.missions.map(m =>
                            m.id === missionId ? { ...m, questions: newQuestions } : m
                        )
                    }));
                } catch (error) {
                    console.error("Failed to regenerate questions on streak break:", error);
                }
            })();
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
        // Clear any legacy non-user-specific data
        clearLegacyData();
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
                            onResumeBaseline={() => {
                                // Resume the baseline test - go directly to baseline-test phase (legacy)
                                setTutorialState(prev => ({
                                    ...prev,
                                    currentPhase: 'baseline-test'
                                }));
                            }}
                            onStartWelcomeMission={() => {
                                // Start the welcome mission (stealth diagnostic)
                                // The WelcomeMission component will be shown via renderTutorial
                                // This is called from the dashboard mission card
                            }}
                            onOpenProfile={() => setIsProfileOpen(true)}
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
                            setIsBossFightActive={setIsBossFightActive}
                        />;
            case View.LEADERBOARD:
                return <LeaderboardView 
                            username={user?.name || "Seeker"}
                            weeklyGain={profile.weeklyAuraGain} 
                            league={profile.league} 
                            competitors={mockCompetitors}
                            activeGuardianId={creatures.find(c => c.id === activeCreatureId)?.creatureId || 1}
                        />;
            case View.SUMMON:
                return <SummonView
                            auraPoints={auraPoints}
                            setAuraPoints={setAuraPoints}
                            userCreatures={creatures}
                            addCreature={(id, customData) => {
                                setCreatures(p => {
                                    const maxId = p.reduce((max, c) => Math.max(max, c.id), 0);
                                    const nextId = Math.max(1, Math.floor(maxId) + 1);
                                    return [...p, {
                                        id: nextId,
                                        creatureId: id,
                                        xp: 50,  // Start with 50 XP (level 5)
                                        level: 5,  // Starting level
                                        evolutionStage: 1,
                                        ...customData
                                    }];
                                });
                            }}
                            onSummonComplete={() => {
                                // During tutorial forced-summon phase, advance to next phase
                                if (tutorialState.currentPhase === 'forced-summon') {
                                    handleTutorialSummonComplete();
                                }
                            }}
                        />;
            case View.BESTIARY:
                return <BestiaryView
                    userCreatures={creatures}
                    userTeam={userTeam}
                    onToggleTeamMember={(instanceId) => {
                        setUserTeam(prev => {
                            if (prev.includes(instanceId)) {
                                return prev.filter(id => id !== instanceId);
                            } else if (prev.length < 6) {
                                return [...prev, instanceId];
                            }
                            return prev;
                        });
                    }}
                    onToggleFavorite={(instanceId) => {
                        setCreatures(prev => prev.map(c =>
                            c.id === instanceId ? { ...c, isFavorite: !c.isFavorite } : c
                        ));
                    }}
                    onRenameCreature={(instanceId, newName) => {
                        setCreatures(prev => prev.map(c =>
                            c.id === instanceId ? { ...c, customName: newName.trim() || undefined } : c
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

    // ===============================================
    // NEW TUTORIAL FLOW HANDLERS
    // ===============================================

    // Track questions answered for milestone unlocks
    const incrementQuestionsAnswered = () => {
        setTutorialState(prev => {
            const newTotal = prev.totalQuestionsAnswered + 1;

            // Check for Progress unlock at 60 questions
            if (!prev.progressUnlocked && newTotal >= PROGRESS_UNLOCK_QUESTIONS) {
                return {
                    ...prev,
                    totalQuestionsAnswered: newTotal,
                    progressUnlocked: true,
                    currentPhase: 'progress-unlocked'
                };
            }

            // Check for Leaderboard unlock at 120 questions
            if (prev.progressUnlocked && !prev.leaderboardUnlocked && newTotal >= LEADERBOARD_UNLOCK_QUESTIONS) {
                return {
                    ...prev,
                    totalQuestionsAnswered: newTotal,
                    leaderboardUnlocked: true,
                    currentPhase: 'leaderboard-unlocked'
                };
            }

            return { ...prev, totalQuestionsAnswered: newTotal };
        });
    };

    // Handle starter selection
    const handleStarterSelect = (starterId: number) => {
        // Add the starter creature
        const nextId = creatures.length > 0 ? Math.max(...creatures.map(c => c.id)) + 1 : 1;
        setCreatures(prev => [...prev, {
            id: nextId,
            creatureId: starterId,
            xp: 50,
            level: 5,
            evolutionStage: 1,
        }]);

        // Set as active creature
        setActiveCreatureId(nextId);

        // Update tutorial state - move to first easy mission
        setTutorialState(prev => ({
            ...prev,
            starterPokemonId: starterId,
            currentPhase: 'first-easy-mission'
        }));

        // Stay on dashboard to do the first question
        setCurrentView(View.DASHBOARD);
    };

    // Handle first mission completion
    const handleFirstMissionComplete = (isCorrect: boolean) => {
        // Always award 500 aura for completing first mission
        // (Even if wrong, for encouragement)
        setTutorialState(prev => ({
            ...prev,
            currentPhase: 'first-reward',
            totalQuestionsAnswered: 1
        }));
    };

    // Handle reward screen continue
    const handleFirstRewardContinue = () => {
        // Award the 500 aura
        awardAura(500);

        // Move to forced summon phase
        setTutorialState(prev => ({
            ...prev,
            currentPhase: 'forced-summon'
        }));

        // Navigate to summon view
        setCurrentView(View.SUMMON);
    };

    // Handle summon complete during tutorial
    const handleTutorialSummonComplete = () => {
        // User has summoned, now force them to bestiary
        setTutorialState(prev => ({
            ...prev,
            currentPhase: 'forced-bestiary'
        }));
        setCurrentView(View.BESTIARY);
    };

    // Handle bestiary view complete
    const handleBestiaryViewComplete = () => {
        // Now they need to choose active creature
        setTutorialState(prev => ({
            ...prev,
            currentPhase: 'choose-active-creature'
        }));
    };

    // Handle active creature selection
    const handleActiveCreatureChosen = () => {
        setTutorialState(prev => ({
            ...prev,
            hasChosenActiveCreature: true,
            currentPhase: 'explain-daily-missions'
        }));
    };

    // Handle daily missions explainer complete
    const handleDailyMissionsExplained = () => {
        // Generate daily missions and unlock the main flow
        const today = new Date().toISOString().split('T')[0];
        const newMissions = generateDailyMissions(profile).map(mission => ({
            ...mission,
            completed: false,
            progress: 0,
            correctAnswers: 0,
        }));

        setDailyActivity({
            date: today,
            missions: newMissions,
        });

        setTutorialState(prev => ({
            ...prev,
            currentPhase: 'daily-missions-unlocked'
        }));
        setCurrentView(View.DASHBOARD);
    };

    // Handle progress unlock continue
    const handleProgressUnlockContinue = () => {
        setTutorialState(prev => ({
            ...prev,
            currentPhase: 'progress-tour'
        }));
        setCurrentView(View.PROGRESS);
    };

    // Handle progress tour complete - start tutorial practice
    const handleProgressTourComplete = () => {
        setTutorialState(prev => ({
            ...prev,
            currentPhase: 'tutorial-practice'
        }));
    };

    // Handle training unlock
    const handleTrainingUnlockContinue = () => {
        setTutorialState(prev => ({
            ...prev,
            currentPhase: 'forced-training'
        }));
        setCurrentView(View.REVIEW);
    };

    // Handle training complete
    const handleTrainingComplete = () => {
        setTutorialState(prev => ({
            ...prev,
            currentPhase: 'shop-unlocked'
        }));
    };

    // Handle shop unlock continue
    const handleShopUnlockContinue = () => {
        setTutorialState(prev => ({
            ...prev,
            currentPhase: 'forced-shop'
        }));
        setCurrentView(View.SHOP);
    };

    // Handle shop purchase during tutorial
    const handleTutorialShopPurchase = () => {
        setTutorialState(prev => ({
            ...prev,
            tutorialShopPurchased: true,
            currentPhase: 'tutorial-boss'
        }));
        setCurrentView(View.PROGRESS);
    };

    // Handle tutorial boss complete
    const handleTutorialBossComplete = () => {
        setTutorialState(prev => ({
            ...prev,
            tutorialBossCompleted: true,
            currentPhase: 'tutorial-skill-complete'
        }));
    };

    // Handle tutorial skill complete - back to daily missions
    const handleTutorialSkillComplete = () => {
        setTutorialState(prev => ({
            ...prev,
            currentPhase: 'daily-missions-unlocked'
        }));
        setCurrentView(View.DASHBOARD);
    };

    // Handle leaderboard unlock continue
    const handleLeaderboardUnlockContinue = () => {
        setTutorialState(prev => ({
            ...prev,
            currentPhase: 'leaderboard-tour'
        }));
        setCurrentView(View.LEADERBOARD);
    };

    // Handle leaderboard tour complete - tutorial done!
    const handleLeaderboardTourComplete = () => {
        setTutorialState(prev => ({
            ...prev,
            currentPhase: 'complete',
            isComplete: true
        }));
        setCurrentView(View.DASHBOARD);
    };

    // Legacy handlers - preserved for potential rollback
    const handleUnlockComplete = () => {
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
            // ===============================================
            // PHASE 1: Onboarding
            // ===============================================

            case 'welcome':
                return (
                    <PikachuGuide
                        message={TUTORIAL_DIALOGUE.welcome.greeting}
                        onNext={() => setTutorialState(prev => ({ ...prev, currentPhase: 'choose-starter' }))}
                        buttonText={TUTORIAL_DIALOGUE.welcome.button}
                    />
                );

            case 'choose-starter':
                return (
                    <StarterSelection onSelect={handleStarterSelect} />
                );

            case 'first-easy-mission':
                return (
                    <FirstMissionQuestion onComplete={handleFirstMissionComplete} />
                );

            case 'first-reward':
                return (
                    <RewardCelebration
                        auraAmount={500}
                        message="Amazing work!"
                        subMessage={TUTORIAL_DIALOGUE.firstReward.explanation}
                        onContinue={handleFirstRewardContinue}
                    />
                );

            case 'forced-summon':
                // If user is not on summon view, show forced navigation
                if (currentView !== View.SUMMON) {
                    return (
                        <ForcedNavigation
                            phase="forced-summon"
                            targetId="nav-summon"
                            message={TUTORIAL_DIALOGUE.forcedSummon.intro}
                            subMessage={TUTORIAL_DIALOGUE.forcedSummon.instruction}
                            showArrow
                            arrowPosition="top"
                        />
                    );
                }
                // On summon view - show guidance overlay
                return (
                    <PikachuGuide
                        message={TUTORIAL_DIALOGUE.forcedSummon.instruction}
                        position="top"
                        showPikachu={false}
                    />
                );

            case 'forced-bestiary':
                if (currentView !== View.BESTIARY) {
                    return (
                        <ForcedNavigation
                            phase="forced-bestiary"
                            targetId="nav-bestiary"
                            message={TUTORIAL_DIALOGUE.forcedBestiary.intro}
                            showArrow
                            arrowPosition="top"
                        />
                    );
                }
                return (
                    <PikachuGuide
                        message={TUTORIAL_DIALOGUE.forcedBestiary.tapToSee}
                        onNext={handleBestiaryViewComplete}
                        buttonText="Got it!"
                        position="top"
                    />
                );

            case 'choose-active-creature':
                return (
                    <PikachuGuide
                        message={TUTORIAL_DIALOGUE.chooseActiveCreature.instruction}
                        onNext={handleActiveCreatureChosen}
                        buttonText="I've chosen!"
                        position="bottom"
                    />
                );

            case 'explain-daily-missions':
                return (
                    <DailyMissionsExplainer onComplete={handleDailyMissionsExplained} />
                );

            // ===============================================
            // PHASE 2: Daily Missions (Stealth Diagnostic)
            // ===============================================

            case 'daily-missions-unlocked':
                // No overlay - user is free to do missions
                // But show subtle progress indicator
                return null;

            // ===============================================
            // PHASE 3: Progress Tab Unlock (60 questions)
            // ===============================================

            case 'progress-unlocked':
                return (
                    <UnlockPopup
                        feature="Progress"
                        onContinue={handleProgressUnlockContinue}
                    />
                );

            case 'progress-tour':
                return (
                    <PikachuGuide
                        message={TUTORIAL_DIALOGUE.progressTour.intro + '\n\n' + TUTORIAL_DIALOGUE.progressTour.tutorialSkill}
                        onNext={handleProgressTourComplete}
                        buttonText="Start Tutorial Practice"
                        position="top"
                    />
                );

            case 'tutorial-practice':
                // Handled by ProgressView with special tutorial mode
                return null;

            case 'training-unlocked':
                return (
                    <UnlockPopup
                        feature="Training"
                        onContinue={handleTrainingUnlockContinue}
                    />
                );

            case 'forced-training':
                if (currentView !== View.REVIEW) {
                    return (
                        <ForcedNavigation
                            phase="forced-training"
                            targetId="nav-training"
                            message={TUTORIAL_DIALOGUE.forcedTraining.intro}
                            subMessage={TUTORIAL_DIALOGUE.forcedTraining.instruction}
                            showArrow
                            arrowPosition="top"
                        />
                    );
                }
                return (
                    <PikachuGuide
                        message={TUTORIAL_DIALOGUE.forcedTraining.purpose}
                        onNext={handleTrainingComplete}
                        buttonText="Continue"
                        position="top"
                    />
                );

            case 'shop-unlocked':
                return (
                    <UnlockPopup
                        feature="Shop"
                        onContinue={handleShopUnlockContinue}
                    />
                );

            case 'forced-shop':
                if (currentView !== View.SHOP) {
                    return (
                        <ForcedNavigation
                            phase="forced-shop"
                            targetId="nav-shop"
                            message={TUTORIAL_DIALOGUE.forcedShop.intro}
                            showArrow
                            arrowPosition="top"
                        />
                    );
                }
                // Shop view will handle the forced purchase
                return (
                    <PikachuGuide
                        message={TUTORIAL_DIALOGUE.forcedShop.instruction}
                        position="top"
                        showPikachu={false}
                    />
                );

            case 'tutorial-boss':
                // Handled by ProgressView
                return (
                    <PikachuGuide
                        message={TUTORIAL_DIALOGUE.tutorialBoss.intro}
                        onNext={() => {}}
                        buttonText="Let's fight!"
                        position="top"
                    />
                );

            case 'tutorial-skill-complete':
                return (
                    <PikachuGuide
                        message={TUTORIAL_DIALOGUE.tutorialSkillComplete.celebration + '\n\n' + TUTORIAL_DIALOGUE.tutorialSkillComplete.encouragement}
                        onNext={handleTutorialSkillComplete}
                        buttonText={TUTORIAL_DIALOGUE.tutorialSkillComplete.button}
                    />
                );

            // ===============================================
            // PHASE 4: Leaderboard Unlock (120 questions)
            // ===============================================

            case 'leaderboard-unlocked':
                return (
                    <UnlockPopup
                        feature="Leaderboard"
                        onContinue={handleLeaderboardUnlockContinue}
                    />
                );

            case 'leaderboard-tour':
                return (
                    <PikachuGuide
                        message={TUTORIAL_DIALOGUE.leaderboardTour.intro + '\n\n' + TUTORIAL_DIALOGUE.leaderboardTour.promotion + '\n\n' + TUTORIAL_DIALOGUE.leaderboardTour.encouragement}
                        onNext={handleLeaderboardTourComplete}
                        buttonText="Let's compete!"
                    />
                );

            // ===============================================
            // LEGACY PHASES (preserved for rollback)
            // ===============================================

            case 'first-mission':
            case 'first-summon':
            case 'second-mission':
            case 'second-summon':
            case 'welcome-mission':
            case 'baseline-intro':
            case 'baseline-test':
            case 'post-baseline':
                // Legacy phases - show unlock animation as fallback
                return (
                    <UnlockAnimation
                        features={['Progress', 'Shop', 'Training', 'Leaderboard']}
                        onComplete={handleUnlockComplete}
                    />
                );

            case 'complete':
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
        <div className="min-h-screen w-full bg-gradient-to-tr from-[#f5d0fe] via-[#fef9c3] to-[#a5f3fc] dark:from-[#311042] dark:via-[#0f172a] dark:to-[#083344] text-text-main font-sans text-sm flex flex-col lg:flex-row">
            <BottomNavBar
                currentView={currentView}
                setCurrentView={handleViewChange}
                user={user}
                tutorialState={tutorialState}
                onOpenProfile={() => setIsProfileOpen(true)}
                theme={theme}
                onToggleTheme={() => setTheme(prev => prev === 'light' ? 'dark' : 'light')}
            />
            {/* Mobile floating controls (z-30 front layer) */}
            {user && (
                <div className="lg:hidden fixed top-[calc(env(safe-area-inset-top)+12px)] left-3 right-3 z-30 flex items-center justify-between pointer-events-none">
                    {/* Left side stats (click events enabled) */}
                    <div className="flex gap-1.5 items-center pointer-events-auto">
                        <div className="glass px-3 py-1.5 rounded-lg border border-secondary/50 text-xs font-bold text-primary shadow-card flex items-center gap-1.5">
                            <AuraIcon className="w-3.5 h-3.5 animate-gentleBounce text-primary" />
                            <span>{auraPoints.toLocaleString()}</span>
                        </div>
                        {profile.dailyStreak > 0 && (
                            <div className="glass px-3 py-1.5 rounded-lg border border-accent/30 text-xs font-bold text-accent shadow-card flex items-center gap-1 animate-popIn">
                                <FireIcon className="w-4 h-4 animate-subtlePulse text-accent" />
                                <span>{profile.dailyStreak}</span>
                            </div>
                        )}
                    </div>

                    {/* Right side controls (click events enabled) */}
                    <div className="flex items-center gap-2 pointer-events-auto">
                        <button
                            onClick={() => setTheme(prev => prev === 'light' ? 'dark' : 'light')}
                            className="w-10 h-10 rounded-full border-2 border-highlight bg-white dark:bg-slate-800 shadow-card hover:scale-105 active:scale-95 transition-all flex items-center justify-center press-effect"
                            title="Toggle Light/Dark Theme"
                        >
                            {theme === 'dark' ? (
                                <MoonIcon className="w-5 h-5 text-highlight" />
                            ) : (
                                <SunIcon className="w-5 h-5 text-highlight" />
                            )}
                        </button>
                        <button
                            onClick={() => setIsProfileOpen(true)}
                            className="w-10 h-10 rounded-full border-2 border-highlight bg-white overflow-hidden shadow-card hover:scale-105 active:scale-95 transition-all flex items-center justify-center press-effect"
                        >
                            {user.photoUrl && !headerImageError ? (
                                <img 
                                    src={user.photoUrl} 
                                    alt="Settings" 
                                    className="w-full h-full object-cover" 
                                    onError={() => setHeaderImageError(true)}
                                />
                            ) : (
                                <div className="w-full h-full bg-gradient-to-br from-primary/30 to-highlight/30 flex items-center justify-center font-bold text-primary text-xs uppercase select-none">
                                    {user.name ? user.name.split(' ').map(n => n[0]).join('').slice(0, 2) : 'S'}
                                </div>
                            )}
                        </button>
                    </div>
                </div>
            )}
            <main className="flex-grow p-3 md:p-4 pt-[calc(env(safe-area-inset-top)+64px)] pb-[calc(env(safe-area-inset-bottom)+110px)] lg:pt-8 lg:pb-8 lg:p-8 lg:ml-64 w-full max-w-7xl mx-auto transition-all duration-300">
                {renderView()}
            </main>
            {streakToShow !== null && (
                <StreakPopup
                    streak={streakToShow}
                    onClose={() => setStreakToShow(null)}
                />
            )}
            {isProfileOpen && (
                <ProfileModal
                    user={user}
                    onClose={() => setIsProfileOpen(false)}
                    onUpdateUser={handleUpdateUser}
                    onLogout={handleLogout}
                />
            )}
            {/* Tutorial overlay */}
            {!tutorialState.isComplete && renderTutorial()}
        </div>
    );
};

export default App;
