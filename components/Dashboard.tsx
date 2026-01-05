
import React, { useState } from 'react';
import { CreatureInstance, MissionInstance, User, TutorialState } from '../types';
import { INITIAL_CREATURES } from '../constants';
import CreatureCard from './CreatureCard';
import LoadingSpinner from './icons/LoadingSpinner';
import ProfileModal from './ProfileModal';

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
    tutorialState
}) => {
    const [isProfileOpen, setIsProfileOpen] = useState(false);
    const isBaselineComplete = tutorialState?.baselineCompleted ?? true;

    const activeCreatureInstance = creatures.find(c => c.id === activeCreatureId);
    const activeCreatureData = activeCreatureInstance ? INITIAL_CREATURES.find(c => c.id === activeCreatureInstance.creatureId) : null;

    // Sort creatures: favorites first, then by id
    const sortedCreatures = [...creatures].sort((a, b) => {
        if (a.isFavorite && !b.isFavorite) return -1;
        if (!a.isFavorite && b.isFavorite) return 1;
        return a.id - b.id;
    });

    return (
        <div className="flex flex-col h-full animate-fadeIn space-y-6 lg:space-y-0 lg:grid lg:grid-cols-12 lg:gap-8 lg:h-auto">
            
            {/* Left Column (Desktop: 4/12) - Active Guardian & Stats */}
            <div className="flex flex-col gap-6 lg:col-span-4 lg:h-full">
                
                {/* Stats Header (Mobile: Top, Desktop: Top of Left Col) */}
                <div className="w-full flex justify-between items-center px-2 lg:px-0 gap-2">
                    <div className="flex gap-2">
                        <div className="bg-background/80 px-3 py-2 rounded border border-secondary text-xs font-bold text-primary shadow-sm flex items-center gap-2">
                            <span>💎</span> 
                            <span>{auraPoints}</span>
                        </div>
                        {dailyStreak > 0 && (
                            <div className="bg-background/80 px-3 py-2 rounded border border-accent/30 text-xs font-bold text-accent shadow-sm flex items-center gap-1 animate-fadeIn">
                                <span>🔥</span>
                                <span>{dailyStreak}</span>
                            </div>
                        )}
                    </div>
                    
                    <button 
                        onClick={() => setIsProfileOpen(true)}
                        className="w-10 h-10 rounded-full border-2 border-highlight bg-white overflow-hidden shadow-md hover:scale-110 transition-transform active:scale-95 flex items-center justify-center"
                    >
                        {user.photoUrl ? (
                            <img src={user.photoUrl} alt="Me" className="w-full h-full object-cover" />
                        ) : (
                            <span className="text-xl">👤</span>
                        )}
                    </button>
                </div>

                {/* Active Guardian Display */}
                <div className="flex flex-col items-center justify-center w-full bg-white lg:p-8 lg:border-2 lg:border-secondary/30 lg:rounded-lg lg:shadow-sm">
                    <h2 className="text-sm text-primary mb-4 font-bold uppercase tracking-wide">Active Guardian</h2>
                    {activeCreatureInstance && activeCreatureData ? (
                        <div className="relative transform lg:scale-125 transition-transform duration-300">
                             <CreatureCard instance={activeCreatureInstance} isLarge={true} />
                             {reviewQueueCount > 0 && (
                                 <div className="absolute -top-4 -right-4 bg-accent text-white rounded-full w-8 h-8 flex items-center justify-center text-sm font-bold animate-bounce shadow-md border-2 border-white">
                                     !
                                 </div>
                             )}
                        </div>
                    ) : (
                        <div className="text-center p-8 bg-background/50 border-2 border-text-dark w-full max-w-xs border-dashed rounded-lg">
                           <p className="text-text-dim text-xs">No active guardian.</p>
                           <p className="text-[10px] text-text-dark mt-2">Select one from your collection!</p>
                        </div>
                    )}
                </div>

                {/* Collection List */}
                <div className="w-full flex-grow lg:flex-grow-0">
                    <h3 className="text-xs text-text-dim mb-2 text-left pl-1 uppercase font-bold">Your Guardians</h3>
                    {sortedCreatures.length > 0 ? (
                        <div className="flex flex-wrap gap-2 justify-center lg:justify-start p-3 bg-background/50 border-2 border-text-dark max-h-32 lg:max-h-64 overflow-y-auto shadow-inner rounded-md scrollbar-thin">
                            {sortedCreatures.map(c => (
                                 <button key={c.id} onClick={() => setActiveCreatureId(c.id)} className={`p-1 transition-all duration-200 border-2 rounded relative ${activeCreatureId === c.id ? 'bg-highlight/20 border-highlight scale-105 shadow-md' : 'bg-surface border-transparent hover:border-secondary/50'}`}>
                                    {c.isFavorite && (
                                        <div className="absolute -top-1 -right-1 z-10 text-red-500">
                                            <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 24 24">
                                                <path d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                                            </svg>
                                        </div>
                                    )}
                                    <CreatureCard instance={c} isLarge={false} />
                                </button>
                            ))}
                        </div>
                    ) : (
                        <div className="p-4 bg-background/50 border-2 border-text-dark text-center border-dashed rounded-md">
                            <p className="text-text-dark text-xs">Visit the Summoner to get your first guardian!</p>
                        </div>
                    )}
                </div>
            </div>

            {/* Right Column (Desktop: 8/12) - Missions & Actions */}
            <div className="flex flex-col gap-6 lg:col-span-8">
                
                {/* Daily Missions */}
                <div className="w-full bg-background/50 lg:bg-white border-2 border-primary p-4 lg:p-6 space-y-4 shadow-md rounded-lg flex-grow">
                    <div className="flex justify-between items-center mb-2">
                        <h2 className="text-lg lg:text-2xl text-highlight font-serif">Daily Missions</h2>
                        <span className="text-[10px] bg-primary text-white px-2 py-1 rounded uppercase tracking-wider font-bold">Today</span>
                    </div>
                    <div className="h-px w-full bg-primary/20 mb-4"></div>
                    
                    <div className="grid grid-cols-1 gap-3">
                        {dailyMissions.map(mission => {
                            const progressPercent = (mission.progress / mission.questionCount) * 100;
                            const isPreparing = preparingMissionId === mission.id;
                            return (
                                <button 
                                    key={mission.id}
                                    onClick={() => startMission(mission)}
                                    disabled={mission.completed || isPreparing}
                                    className="w-full text-left bg-surface hover:bg-secondary/20 text-text-main font-bold p-4 shadow-sm transition-all duration-200 border-2 border-secondary hover:border-primary/50 active:translate-y-0.5 disabled:bg-background disabled:opacity-60 disabled:cursor-not-allowed disabled:border-none rounded-md group"
                                >
                                    <div className="flex justify-between items-center mb-2">
                                        <span className="text-sm flex-1 pr-2 whitespace-normal group-hover:text-primary transition-colors">{mission.description}</span>
                                        <span className="flex items-center text-xs font-bold bg-primary/10 px-2 py-1 rounded text-primary border border-primary/20">
                                            {mission.reward} 💎
                                        </span>
                                    </div>
                                    <div className="flex justify-between items-center gap-4">
                                        <div className="flex-1 h-2 bg-text-dark/10 rounded-full overflow-hidden border border-text-dark/10">
                                            <div className="bg-highlight h-full transition-all duration-500" style={{width: `${progressPercent}%`}}></div>
                                        </div>
                                         <span className="text-[10px] text-text-dim font-mono min-w-[40px] text-right">
                                            {isPreparing ? <LoadingSpinner className="h-3 w-3 inline-block" /> : (mission.completed ? 'DONE' : `${mission.progress}/${mission.questionCount}`)}
                                        </span>
                                    </div>
                                </button>
                            )
                        })}
                    </div>
                </div>

                {/* Action Buttons Row */}
                <div className="flex gap-4 w-full h-auto">
                     <button
                        onClick={isBaselineComplete ? onOpenReview : undefined}
                        disabled={!isBaselineComplete || reviewQueueCount === 0}
                        title={!isBaselineComplete ? 'Complete Baseline Test to unlock' : undefined}
                        className={`flex-1 p-4 lg:p-6 border-2 flex flex-col items-center justify-center gap-3 transition-all shadow-md rounded-lg relative ${
                            !isBaselineComplete
                                ? 'bg-background border-text-dark text-text-dark opacity-60 cursor-not-allowed border-b-4'
                                : reviewQueueCount > 0
                                    ? 'bg-surface border-accent text-accent hover:bg-accent/5 hover:border-accent/80 border-b-4 active:border-b-2 active:translate-y-0.5'
                                    : 'bg-background border-text-dark text-text-dark opacity-60 cursor-not-allowed border-b-4'
                        }`}
                    >
                        {!isBaselineComplete && <span className="absolute top-2 right-2 text-lg">🔒</span>}
                        <span className="text-3xl lg:text-4xl filter drop-shadow-sm">🏋️</span>
                        <div className="flex flex-col items-center">
                             <span className="font-bold text-sm lg:text-base uppercase tracking-tight">Training</span>
                             {isBaselineComplete && reviewQueueCount > 0 ? (
                                <span className="text-[10px] font-bold bg-accent text-white px-2 py-0.5 rounded-full mt-1 shadow-sm animate-pulse">
                                    {reviewQueueCount} Pending
                                </span>
                             ) : (
                                 <span className="text-[10px] mt-1 opacity-70">
                                     {isBaselineComplete ? 'Up to date' : 'Locked'}
                                 </span>
                             )}
                        </div>
                    </button>

                    <button
                        onClick={isBaselineComplete ? onOpenShop : undefined}
                        disabled={!isBaselineComplete}
                        title={!isBaselineComplete ? 'Complete Baseline Test to unlock' : undefined}
                        className={`flex-1 p-4 lg:p-6 border-2 flex flex-col items-center justify-center gap-3 transition-all shadow-md rounded-lg relative ${
                            !isBaselineComplete
                                ? 'bg-background border-text-dark text-text-dark opacity-60 cursor-not-allowed border-b-4'
                                : 'bg-surface border-highlight text-text-main hover:bg-highlight/5 hover:border-highlight/80 border-b-4 border-highlight active:border-b-2 active:translate-y-0.5'
                        }`}
                    >
                        {!isBaselineComplete && <span className="absolute top-2 right-2 text-lg">🔒</span>}
                        <span className="text-3xl lg:text-4xl filter drop-shadow-sm">🛒</span>
                        <div className="flex flex-col items-center">
                            <span className={`font-bold text-sm lg:text-base uppercase tracking-tight ${isBaselineComplete ? 'text-highlight' : ''}`}>
                                Shop
                            </span>
                            <span className="text-[10px] text-text-dim mt-1">
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
