
import React, { useState } from 'react';
import { CreatureInstance, MissionInstance, User, TutorialState } from '../types';
import { INITIAL_CREATURES } from '../constants';
import CreatureCard from './CreatureCard';
import LoadingSpinner from './icons/LoadingSpinner';
import ProfileModal from './ProfileModal';
import { getQuestionsUntilNextUnlock, PROGRESS_UNLOCK_QUESTIONS, LEADERBOARD_UNLOCK_QUESTIONS } from '../utils/tutorialSteps';

interface DashboardProps {
    user: User;
    auraPoints: number;
    dailyStreak: number;
    creatures: CreatureInstance[];
    activeCreatureId: number | null;
    setActiveCreatureId: (id: number | null) => void;
    startMission: (mission: MissionInstance) => void;
    dailyMissions: MissionInstance[];
    preparingMissionId: string | null;
    reviewQueueCount: number;
    onOpenReview: () => void;
    onOpenShop: () => void;
    onUpdateUser: (updates: Partial<User>) => void;
    onLogout: () => void;
    tutorialState?: TutorialState;
    onResumeBaseline?: () => void;
    onStartWelcomeMission?: () => void;
}

const Dashboard: React.FC<DashboardProps> = ({
    user,
    auraPoints,
    dailyStreak,
    creatures,
    activeCreatureId,
    setActiveCreatureId,
    startMission,
    dailyMissions,
    preparingMissionId,
    reviewQueueCount,
    onOpenReview,
    onOpenShop,
    onUpdateUser,
    onLogout,
    tutorialState,
    onResumeBaseline,
    onStartWelcomeMission
}) => {
    const [isProfileOpen, setIsProfileOpen] = useState(false);
    const isBaselineComplete = tutorialState?.baselineCompleted ?? true;

    // Calculate unlock progress
    const questionsAnswered = tutorialState?.totalQuestionsAnswered ?? 0;
    const progressUnlocked = tutorialState?.progressUnlocked ?? true;
    const leaderboardUnlocked = tutorialState?.leaderboardUnlocked ?? true;
    const unlockInfo = getQuestionsUntilNextUnlock(questionsAnswered, progressUnlocked, leaderboardUnlocked);

    const activeCreatureInstance = creatures.find(c => c.id === activeCreatureId);
    const activeCreatureData = activeCreatureInstance ? INITIAL_CREATURES.find(c => c.id === activeCreatureInstance.creatureId) : null;

    // Sort creatures: favorites first, then by id
    const sortedCreatures = [...creatures].sort((a, b) => {
        if (a.isFavorite && !b.isFavorite) return -1;
        if (!a.isFavorite && b.isFavorite) return 1;
        return a.id - b.id;
    });

    return (
        <div className="flex flex-col h-full animate-fadeIn space-y-4 md:space-y-6 lg:space-y-0 md:grid md:grid-cols-2 lg:grid-cols-12 md:gap-6 lg:gap-8 lg:h-auto">

            {/* Left Column (Tablet: 1/2, Desktop: 4/12) - Active Guardian & Stats */}
            <div className="flex flex-col gap-4 md:gap-6 md:col-span-1 lg:col-span-4 lg:h-full">
                
                {/* Stats Header (Mobile: Top, Desktop: Top of Left Col) */}
                <div className="w-full flex justify-between items-center px-2 md:px-0 gap-2">
                    <div className="flex gap-2">
                        <div className="glass px-3 py-2 md:px-4 md:py-2.5 rounded-lg border border-secondary/50 text-xs md:text-sm font-bold text-primary shadow-card flex items-center gap-2 touch-target hover-lift">
                            <span className="animate-gentleBounce">💎</span>
                            <span>{auraPoints.toLocaleString()}</span>
                        </div>
                        {dailyStreak > 0 && (
                            <div className="glass px-3 py-2 md:px-4 md:py-2.5 rounded-lg border border-accent/30 text-xs md:text-sm font-bold text-accent shadow-card flex items-center gap-1 animate-popIn touch-target hover-lift">
                                <span className="animate-subtlePulse">🔥</span>
                                <span>{dailyStreak}</span>
                            </div>
                        )}
                    </div>

                    <button
                        onClick={() => setIsProfileOpen(true)}
                        className="w-11 h-11 md:w-12 md:h-12 rounded-full border-2 border-highlight bg-white overflow-hidden shadow-card hover:shadow-card-hover hover:scale-105 transition-premium active:scale-95 flex items-center justify-center touch-target press-effect"
                    >
                        {user.photoUrl ? (
                            <img src={user.photoUrl} alt="Me" className="w-full h-full object-cover" />
                        ) : (
                            <span className="text-xl md:text-2xl">👤</span>
                        )}
                    </button>
                </div>

                {/* Active Guardian Display */}
                <div className="flex flex-col items-center justify-center w-full bg-white lg:p-8 lg:border-2 lg:border-secondary/30 lg:rounded-xl lg:shadow-card gradient-subtle">
                    <h2 className="text-sm text-primary mb-4 font-bold uppercase tracking-wide animate-fadeIn">Active Guardian</h2>
                    {activeCreatureInstance && activeCreatureData ? (
                        <div className="relative transform lg:scale-125 transition-premium hover:scale-[1.02] lg:hover:scale-[1.28]">
                             <CreatureCard instance={activeCreatureInstance} isLarge={true} />
                             {reviewQueueCount > 0 && (
                                 <div className="absolute -top-4 -right-4 bg-accent text-white rounded-full w-8 h-8 flex items-center justify-center text-sm font-bold animate-gentleBounce shadow-glow-success border-2 border-white">
                                     !
                                 </div>
                             )}
                        </div>
                    ) : (
                        <div className="text-center p-8 bg-background/50 border-2 border-text-dark w-full max-w-xs border-dashed rounded-xl animate-subtlePulse">
                           <p className="text-text-dim text-xs">No active guardian.</p>
                           <p className="text-[10px] text-text-dark mt-2">Select one from your collection!</p>
                        </div>
                    )}
                </div>

                {/* Collection List */}
                <div className="w-full flex-grow lg:flex-grow-0">
                    <h3 className="text-xs text-text-dim mb-2 text-left pl-1 uppercase font-bold">Your Guardians</h3>
                    {sortedCreatures.length > 0 ? (
                        <div className="flex flex-wrap gap-2 justify-center lg:justify-start p-3 bg-background/50 border-2 border-secondary/30 max-h-32 lg:max-h-64 overflow-y-auto shadow-inner-soft rounded-lg scrollbar-thin scrollbar-hide">
                            {sortedCreatures.map((c, index) => (
                                 <button
                                    key={c.id}
                                    onClick={() => setActiveCreatureId(c.id)}
                                    className={`p-1 transition-premium border-2 rounded-lg relative press-effect animate-fadeInScale ${activeCreatureId === c.id ? 'bg-highlight/20 border-highlight scale-105 shadow-card' : 'bg-surface border-transparent hover:border-secondary/50 hover:shadow-card'}`}
                                    style={{ animationDelay: `${index * 0.03}s` }}
                                 >
                                    {c.isFavorite && (
                                        <div className="absolute -top-1 -right-1 z-10 text-red-500 animate-popIn">
                                            <svg className="w-3 h-3 drop-shadow-sm" fill="currentColor" viewBox="0 0 24 24">
                                                <path d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                                            </svg>
                                        </div>
                                    )}
                                    <CreatureCard instance={c} isLarge={false} />
                                </button>
                            ))}
                        </div>
                    ) : (
                        <div className="p-4 bg-background/50 border-2 border-text-dark text-center border-dashed rounded-lg animate-subtlePulse">
                            <p className="text-text-dark text-xs">Visit the Summoner to get your first guardian!</p>
                        </div>
                    )}
                </div>
            </div>

            {/* Right Column (Tablet: 1/2, Desktop: 8/12) - Missions & Actions */}
            <div className="flex flex-col gap-4 md:gap-6 md:col-span-1 lg:col-span-8">
                
                {/* Daily Missions */}
                <div className="w-full bg-background/50 md:bg-white border-2 border-primary/80 p-4 md:p-5 lg:p-6 space-y-4 shadow-card rounded-xl flex-grow animate-scaleIn">
                    <div className="flex justify-between items-center mb-2">
                        <h2 className="text-base md:text-lg lg:text-2xl text-highlight font-serif">Daily Missions</h2>
                        <span className="text-[10px] md:text-xs bg-primary text-white px-2.5 py-1 rounded-full uppercase tracking-wider font-bold shadow-button animate-subtlePulse">Today</span>
                    </div>
                    <div className="h-px w-full bg-gradient-to-r from-transparent via-primary/30 to-transparent mb-4"></div>

                    <div className="grid grid-cols-1 gap-3 md:gap-4">
                        {dailyMissions.map(mission => {
                            // Special handling for welcome mission (stealth diagnostic)
                            const isWelcomeMission = mission.id === 'welcome-mission';
                            // Legacy: baseline assessment mission
                            const isBaselineMission = mission.id === 'baseline-assessment';
                            const baselineProgress = tutorialState?.baselineProgress;
                            const baselineTotalQuestions = 27; // 9 subtopics * 3 difficulties

                            let progressPercent: number;
                            let progressText: string;
                            let handleClick: () => void;

                            if (isWelcomeMission) {
                                // Welcome Mission - stealth diagnostic
                                progressPercent = 0;
                                progressText = `0/${mission.questionCount}`;
                                handleClick = () => onStartWelcomeMission?.();
                            } else if (isBaselineMission) {
                                // Legacy baseline mission
                                const currentProgress = baselineProgress?.currentIndex || 0;
                                progressPercent = (currentProgress / baselineTotalQuestions) * 100;
                                progressText = currentProgress > 0
                                    ? `${currentProgress}/${baselineTotalQuestions} (Resume)`
                                    : `0/${baselineTotalQuestions}`;
                                handleClick = () => onResumeBaseline?.();
                            } else {
                                progressPercent = (mission.progress / mission.questionCount) * 100;
                                progressText = mission.completed ? 'DONE' : `${mission.progress}/${mission.questionCount}`;
                                handleClick = () => startMission(mission);
                            }

                            const isPreparing = preparingMissionId === mission.id;
                            return (
                                <button
                                    key={mission.id}
                                    onClick={handleClick}
                                    disabled={mission.completed || isPreparing}
                                    className={`w-full text-left bg-surface hover:bg-secondary/10 text-text-main font-bold p-4 shadow-card hover:shadow-card-hover transition-premium border-2 hover:border-primary/50 active:translate-y-0.5 disabled:bg-background disabled:opacity-60 disabled:cursor-not-allowed disabled:border-none rounded-xl group press-effect ${
                                        isWelcomeMission
                                            ? 'border-highlight animate-glowPulse'
                                            : isBaselineMission && baselineProgress?.currentIndex
                                                ? 'border-highlight animate-glowPulse'
                                                : 'border-secondary/50'
                                    }`}
                                >
                                    <div className="flex justify-between items-center mb-2">
                                        <span className="text-sm flex-1 pr-2 whitespace-normal group-hover:text-primary transition-premium">
                                            {isWelcomeMission ? '🌟 ' : ''}
                                            {isBaselineMission && baselineProgress?.currentIndex ? '📋 ' : ''}
                                            {mission.description}
                                            {isBaselineMission && baselineProgress?.currentIndex ? ' (In Progress)' : ''}
                                        </span>
                                        <span className="flex items-center text-xs font-bold bg-primary/10 px-2.5 py-1 rounded-full text-primary border border-primary/20 shadow-button">
                                            {mission.reward} 💎
                                        </span>
                                    </div>
                                    <div className="flex justify-between items-center gap-4">
                                        <div className="flex-1 h-2.5 bg-text-dark/10 rounded-full overflow-hidden border border-text-dark/10 shadow-inner-soft">
                                            <div className="bg-gradient-to-r from-highlight to-yellow-500 h-full transition-all duration-500 rounded-full" style={{width: `${progressPercent}%`}}></div>
                                        </div>
                                         <span className="text-[10px] text-text-dim font-mono min-w-[40px] text-right">
                                            {isPreparing ? <LoadingSpinner className="h-3 w-3 inline-block" /> : progressText}
                                        </span>
                                    </div>
                                </button>
                            )
                        })}
                    </div>

                    {/* Unlock Progress Indicator */}
                    {unlockInfo && (
                        <div className="mt-4 p-3 bg-primary/5 border border-primary/20 rounded-lg animate-fadeIn">
                            <div className="flex items-center justify-between mb-2">
                                <span className="text-xs font-bold text-primary">
                                    🔓 Next Unlock: {unlockInfo.feature}
                                </span>
                                <span className="text-[10px] text-text-dim">
                                    {questionsAnswered}/{unlockInfo.feature === 'Progress' ? PROGRESS_UNLOCK_QUESTIONS : LEADERBOARD_UNLOCK_QUESTIONS}
                                </span>
                            </div>
                            <div className="h-2 bg-text-dark/10 rounded-full overflow-hidden">
                                <div
                                    className="h-full bg-gradient-to-r from-primary to-highlight transition-all duration-500 rounded-full"
                                    style={{
                                        width: `${(questionsAnswered / (unlockInfo.feature === 'Progress' ? PROGRESS_UNLOCK_QUESTIONS : LEADERBOARD_UNLOCK_QUESTIONS)) * 100}%`
                                    }}
                                />
                            </div>
                            <p className="text-[10px] text-text-dim mt-1">
                                {unlockInfo.remaining} more questions to unlock!
                            </p>
                        </div>
                    )}
                </div>

                {/* Action Buttons Row */}
                <div className="flex gap-3 md:gap-4 w-full h-auto">
                     <button
                        onClick={isBaselineComplete ? onOpenReview : undefined}
                        disabled={!isBaselineComplete || reviewQueueCount === 0}
                        title={!isBaselineComplete ? 'Complete Welcome Mission to unlock' : undefined}
                        className={`flex-1 p-4 md:p-5 lg:p-6 border-2 flex flex-col items-center justify-center gap-2 md:gap-3 transition-premium shadow-card hover:shadow-card-hover rounded-xl relative touch-target press-effect ${
                            !isBaselineComplete
                                ? 'bg-background border-text-dark text-text-dark opacity-60 cursor-not-allowed border-b-4'
                                : reviewQueueCount > 0
                                    ? 'bg-surface border-accent text-accent hover:bg-accent/5 border-b-4 active:border-b-2 active:translate-y-0.5'
                                    : 'bg-background border-text-dark text-text-dark opacity-60 cursor-not-allowed border-b-4'
                        }`}
                    >
                        {!isBaselineComplete && <span className="absolute top-2 right-2 text-base md:text-lg">🔒</span>}
                        <span className="text-2xl md:text-3xl lg:text-4xl filter drop-shadow-sm">🏋️</span>
                        <div className="flex flex-col items-center">
                             <span className="font-bold text-xs md:text-sm lg:text-base uppercase tracking-tight">Training</span>
                             {isBaselineComplete && reviewQueueCount > 0 ? (
                                <span className="text-[9px] md:text-[10px] font-bold bg-accent text-white px-2.5 py-0.5 rounded-full mt-1 shadow-button animate-subtlePulse">
                                    {reviewQueueCount} Pending
                                </span>
                             ) : (
                                 <span className="text-[9px] md:text-[10px] mt-1 opacity-70">
                                     {isBaselineComplete ? 'Up to date' : 'Locked'}
                                 </span>
                             )}
                        </div>
                    </button>

                    <button
                        onClick={isBaselineComplete ? onOpenShop : undefined}
                        disabled={!isBaselineComplete}
                        title={!isBaselineComplete ? 'Complete Welcome Mission to unlock' : undefined}
                        className={`flex-1 p-4 md:p-5 lg:p-6 border-2 flex flex-col items-center justify-center gap-2 md:gap-3 transition-premium shadow-card hover:shadow-card-hover rounded-xl relative touch-target press-effect ${
                            !isBaselineComplete
                                ? 'bg-background border-text-dark text-text-dark opacity-60 cursor-not-allowed border-b-4'
                                : 'bg-surface border-highlight text-text-main hover:bg-highlight/5 border-b-4 border-highlight active:border-b-2 active:translate-y-0.5'
                        }`}
                    >
                        {!isBaselineComplete && <span className="absolute top-2 right-2 text-base md:text-lg">🔒</span>}
                        <span className="text-2xl md:text-3xl lg:text-4xl filter drop-shadow-sm">🛒</span>
                        <div className="flex flex-col items-center">
                            <span className={`font-bold text-xs md:text-sm lg:text-base uppercase tracking-tight ${isBaselineComplete ? 'text-highlight' : ''}`}>
                                Shop
                            </span>
                            <span className="text-[9px] md:text-[10px] text-text-dim mt-1">
                                {isBaselineComplete ? 'Power-ups' : 'Locked'}
                            </span>
                        </div>
                    </button>
                </div>
                
                <div className="w-full text-center mt-2 lg:text-right">
                    <a 
                        href="https://docs.google.com/forms/d/e/1FAIpQLSfckG54GtgeCllkk1rz6yyYs9huDXhuwP8-ZoPkwsf5yHX5ew/viewform?usp=header" 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="text-xs text-text-dim hover:text-highlight transition-colors underline decoration-dotted underline-offset-4"
                    >
                        Give Feedback or Suggest a Feature
                    </a>
                </div>
            </div>

            {/* Profile Modal */}
            {isProfileOpen && (
                <ProfileModal 
                    user={user} 
                    onClose={() => setIsProfileOpen(false)} 
                    onUpdateUser={onUpdateUser}
                    onLogout={onLogout}
                />
            )}
        </div>
    );
};

export default Dashboard;
