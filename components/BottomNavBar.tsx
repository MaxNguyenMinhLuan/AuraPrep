
import React from 'react';
import { View, User, TutorialState } from '../types';
import SwordsIcon from './icons/SwordsIcon';
import SparklesIcon from './icons/SparklesIcon';
import BookOpenIcon from './icons/BookOpenIcon';
import ChartBarIcon from './icons/ChartBarIcon';
import CrownIcon from './icons/CrownIcon';

interface BottomNavBarProps {
    currentView: View;
    setCurrentView: (view: View) => void;
    user: User | null;
    tutorialState?: TutorialState;
}

const NavItem: React.FC<{
    id?: string;  // ID for tutorial targeting
    label: string;
    icon: React.ReactNode;
    isActive: boolean;
    onClick: () => void;
    isLocked?: boolean;
    lockMessage?: string;
}> = ({ id, label, icon, isActive, onClick, isLocked, lockMessage }) => {
    return (
        <button
            id={id}
            onClick={isLocked ? undefined : onClick}
            className={`flex lg:flex-row flex-col items-center justify-center lg:justify-start lg:gap-4 lg:px-6 lg:py-4 w-full transition-premium group relative touch-target touch-none press-effect ${
                isLocked
                    ? 'text-text-dark/40 cursor-not-allowed opacity-50'
                    : isActive
                        ? 'text-highlight'
                        : 'text-text-dim hover:text-text-main active:text-text-main'
            }`}
            title={isLocked ? (lockMessage || 'Complete more missions to unlock') : undefined}
        >
            <div className={`transition-premium ${isActive ? 'scale-125 md:scale-110 lg:scale-100 drop-shadow-sm' : 'scale-110 lg:scale-100 group-hover:scale-125 lg:group-hover:scale-100 group-active:scale-125'}`}>
                {icon}
            </div>
            {/* Labels hidden on mobile, shown on tablet (md) and desktop (lg) */}
            <span className={`hidden md:block text-xs md:text-[10px] lg:text-sm font-medium truncate mt-1 md:mt-0 transition-premium ${isActive ? 'opacity-100' : 'opacity-80 group-hover:opacity-100'}`}>{label}</span>
            {isLocked && <span className="text-base md:text-lg absolute -top-1 -right-1 md:top-2 md:right-2 lg:relative lg:ml-auto">🔒</span>}
            {!isLocked && isActive && <div className="hidden lg:block ml-auto w-2 h-2 rounded-full bg-highlight shadow-glow-highlight animate-subtlePulse"></div>}
            {/* Active indicator line for mobile */}
            {!isLocked && isActive && <div className="lg:hidden absolute -bottom-0 left-1/2 -translate-x-1/2 w-6 h-1 rounded-full bg-highlight shadow-glow-highlight"></div>}
        </button>
    );
};

const BottomNavBar: React.FC<BottomNavBarProps> = ({ currentView, setCurrentView, user, tutorialState }) => {
    // Determine what features are unlocked based on new tutorial state
    const progressUnlocked = tutorialState?.progressUnlocked ?? true;
    const trainingUnlocked = tutorialState?.trainingUnlocked ?? true;
    const shopUnlocked = tutorialState?.shopUnlocked ?? true;
    const leaderboardUnlocked = tutorialState?.leaderboardUnlocked ?? true;

    // Legacy fallback
    const isBaselineComplete = tutorialState?.baselineCompleted ?? true;

    // Calculate remaining questions for unlock messages
    const questionsAnswered = tutorialState?.totalQuestionsAnswered ?? 0;
    const progressQuestionsRemaining = Math.max(0, 60 - questionsAnswered);
    const leaderboardQuestionsRemaining = Math.max(0, 120 - questionsAnswered);

    return (
        <>
            {/* Desktop Sidebar (Visible on lg+) */}
            <nav className="hidden lg:flex fixed left-0 top-0 h-full w-64 bg-surface/95 backdrop-blur-sm border-r border-secondary/30 flex-col items-start z-20 shadow-card">
                <div className="p-6 w-full border-b border-secondary/20 mb-4">
                    <h1 className="font-serif text-xl text-highlight font-bold tracking-tight animate-fadeIn">AuraPrep</h1>
                    <p className="text-xs text-text-dim animate-fadeIn" style={{ animationDelay: '0.1s' }}>Summoner's Academy</p>
                </div>

                <div className="flex flex-col w-full gap-1 overflow-y-auto">
                    <NavItem
                        id="nav-mission"
                        label="Mission"
                        icon={<SwordsIcon />}
                        isActive={currentView === View.DASHBOARD || currentView === View.MISSION}
                        onClick={() => setCurrentView(View.DASHBOARD)}
                    />
                    <NavItem
                        id="nav-progress"
                        label="Progress"
                        icon={<ChartBarIcon />}
                        isActive={currentView === View.PROGRESS}
                        onClick={() => setCurrentView(View.PROGRESS)}
                        isLocked={!progressUnlocked && !isBaselineComplete}
                        lockMessage={progressQuestionsRemaining > 0 ? `Answer ${progressQuestionsRemaining} more questions to unlock` : undefined}
                    />
                    <NavItem
                        id="nav-leaderboard"
                        label="Leader Board"
                        icon={<CrownIcon />}
                        isActive={currentView === View.LEADERBOARD}
                        onClick={() => setCurrentView(View.LEADERBOARD)}
                        isLocked={!leaderboardUnlocked && !isBaselineComplete}
                        lockMessage={leaderboardQuestionsRemaining > 0 ? `Answer ${leaderboardQuestionsRemaining} more questions to unlock` : undefined}
                    />
                    <NavItem
                        id="nav-summon"
                        label="Summon"
                        icon={<SparklesIcon />}
                        isActive={currentView === View.SUMMON}
                        onClick={() => setCurrentView(View.SUMMON)}
                    />
                    <NavItem
                        id="nav-bestiary"
                        label="Bestiary"
                        icon={<BookOpenIcon />}
                        isActive={currentView === View.BESTIARY}
                        onClick={() => setCurrentView(View.BESTIARY)}
                    />
                </div>

                <div className="mt-auto p-4 w-full border-t border-secondary/20 bg-background/30">
                    {user && (
                        <div className="flex items-center gap-3 mb-2 px-2">
                            {user.photoUrl && <img src={user.photoUrl} alt={user.name} className="w-8 h-8 rounded-full border border-secondary" />}
                            <div className="flex-1 overflow-hidden">
                                <p className="text-xs font-bold truncate">{user.name}</p>
                                <p className="text-[10px] text-text-dim truncate">{user.email}</p>
                            </div>
                        </div>
                    )}
                    <p className="text-[8px] text-text-dark text-center mt-3 opacity-50 uppercase tracking-tighter">AuraPrep v1.1.0-Auth</p>
                </div>
            </nav>

            {/* Mobile & Tablet Bottom Bar (Hidden on lg+) */}
            <nav className="lg:hidden fixed bottom-0 left-0 right-0 h-16 md:h-20 glass border-t border-secondary/30 flex items-center justify-around z-20 pb-safe shadow-[0_-4px_20px_rgba(0,0,0,0.08)]">
                <NavItem
                    id="nav-mission-mobile"
                    label="Mission"
                    icon={<SwordsIcon />}
                    isActive={currentView === View.DASHBOARD || currentView === View.MISSION}
                    onClick={() => setCurrentView(View.DASHBOARD)}
                />
                <NavItem
                    id="nav-summon-mobile"
                    label="Summon"
                    icon={<SparklesIcon />}
                    isActive={currentView === View.SUMMON}
                    onClick={() => setCurrentView(View.SUMMON)}
                />
                <NavItem
                    id="nav-bestiary-mobile"
                    label="Bestiary"
                    icon={<BookOpenIcon />}
                    isActive={currentView === View.BESTIARY}
                    onClick={() => setCurrentView(View.BESTIARY)}
                />
                <NavItem
                    id="nav-progress-mobile"
                    label="Progress"
                    icon={<ChartBarIcon />}
                    isActive={currentView === View.PROGRESS}
                    onClick={() => setCurrentView(View.PROGRESS)}
                    isLocked={!progressUnlocked && !isBaselineComplete}
                />
                <NavItem
                    id="nav-leaderboard-mobile"
                    label="Ranks"
                    icon={<CrownIcon />}
                    isActive={currentView === View.LEADERBOARD}
                    onClick={() => setCurrentView(View.LEADERBOARD)}
                    isLocked={!leaderboardUnlocked && !isBaselineComplete}
                />
            </nav>
        </>
    );
};

export default BottomNavBar;
