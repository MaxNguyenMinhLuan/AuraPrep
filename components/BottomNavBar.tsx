
import React from 'react';
import { View, User, TutorialState } from '../types';
import SwordsIcon from './icons/SwordsIcon';
import SparklesIcon from './icons/SparklesIcon';
import BookOpenIcon from './icons/BookOpenIcon';
import ChartBarIcon from './icons/ChartBarIcon';
import CrownIcon from './icons/CrownIcon';
import SunIcon from './icons/SunIcon';
import MoonIcon from './icons/MoonIcon';
import LockIcon from './icons/LockIcon';

interface BottomNavBarProps {
    currentView: View;
    setCurrentView: (view: View) => void;
    user: User | null;
    tutorialState?: TutorialState;
    onOpenProfile: () => void;
    theme: 'light' | 'dark';
    onToggleTheme: () => void;
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
            {isLocked && <LockIcon className="w-4 h-4 text-text-dark/40 absolute -top-1 -right-1 md:top-2 md:right-2 lg:relative lg:ml-auto" />}
            {!isLocked && isActive && <div className="hidden lg:block ml-auto w-2 h-2 rounded-full bg-highlight shadow-glow-highlight animate-subtlePulse"></div>}
            {/* Active indicator line for mobile */}
            {!isLocked && isActive && <div className="lg:hidden absolute -bottom-0 left-1/2 -translate-x-1/2 w-6 h-1 rounded-full bg-highlight shadow-glow-highlight"></div>}
        </button>
    );
};

const BottomNavBar: React.FC<BottomNavBarProps> = ({ currentView, setCurrentView, user, tutorialState, onOpenProfile, theme, onToggleTheme }) => {
    const [imageError, setImageError] = React.useState(false);
    React.useEffect(() => {
        setImageError(false);
    }, [user?.photoUrl]);

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
            <nav className="hidden lg:flex fixed left-0 top-0 h-full w-64 bg-surface border-r border-secondary/30 flex-col items-start z-20 shadow-card">
                <div className="p-6 w-full border-b border-secondary/20 mb-4 flex items-center justify-center">
                    <h1 className="font-sans text-2xl bg-gradient-to-tr from-[#c084fc] via-[#fcd34d] to-[#22d3ee] bg-clip-text text-transparent font-bold tracking-tighter animate-fadeIn text-center dark:drop-shadow-[0_0_12px_rgba(192,132,252,0.7)]">
                        AuraPrep
                    </h1>
                </div>

                <div className="flex flex-col w-full gap-1 overflow-y-auto">
                    <NavItem
                        id="nav-mission"
                        label="Missions"
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
                        label="Collection"
                        icon={<BookOpenIcon />}
                        isActive={currentView === View.BESTIARY}
                        onClick={() => setCurrentView(View.BESTIARY)}
                    />
                </div>

                {/* Theme Toggle Button */}
                <div className="w-full px-6 py-3 border-t border-secondary/20 flex items-center justify-between mt-auto">
                    <span className="text-[10px] uppercase font-bold text-text-dim tracking-wider">Dark Mode</span>
                    <button
                        onClick={onToggleTheme}
                        className={`w-10 h-6 flex items-center rounded-full p-0.5 cursor-pointer transition-colors duration-300 focus:outline-none ${
                            theme === 'dark' ? 'bg-indigo-600 justify-end' : 'bg-slate-300 justify-start'
                        }`}
                        title="Toggle Light/Dark Theme"
                    >
                        <div
                            className={`bg-white w-5 h-5 rounded-full shadow-md transform duration-300 flex items-center justify-center`}
                        >
                            {theme === 'dark' ? (
                                <MoonIcon className="w-3.5 h-3.5 text-indigo-600" />
                            ) : (
                                <SunIcon className="w-3.5 h-3.5 text-amber-500" />
                            )}
                        </div>
                    </button>
                </div>

                <div 
                    onClick={onOpenProfile}
                    className="p-4 w-full border-t border-secondary/20 bg-background/30 hover:bg-secondary/15 active:bg-secondary/15 cursor-pointer transition-premium flex flex-col gap-2"
                >
                    {user && (
                        <div className="flex items-center gap-3 px-2">
                            {user.photoUrl && !imageError ? (
                                <img 
                                    src={user.photoUrl} 
                                    alt={user.name} 
                                    className="w-8 h-8 rounded-full border border-secondary object-cover" 
                                    onError={() => setImageError(true)}
                                />
                            ) : (
                                <div className="w-8 h-8 rounded-full bg-gradient-to-br from-primary/30 to-highlight/30 flex items-center justify-center font-bold text-primary border border-secondary text-xs uppercase select-none">
                                    {user.name ? user.name.split(' ').map(n => n[0]).join('').slice(0, 2) : 'S'}
                                </div>
                            )}
                            <div className="flex-1 overflow-hidden text-left">
                                <p className="text-xs font-bold truncate">{user.name}</p>
                                <p className="text-[10px] text-text-dim truncate">{user.email}</p>
                            </div>
                        </div>
                    )}
                    <p className="text-[8px] text-text-dark text-center mt-3 opacity-50 uppercase tracking-tighter">AuraPrep v1.1.0-Auth</p>
                </div>
            </nav>

            {/* Mobile & Tablet Bottom Bar (Hidden on lg+) */}
            <nav className="lg:hidden fixed bottom-0 left-0 right-0 h-16 md:h-20 bg-surface border-t border-secondary/30 flex items-center justify-around z-50 pb-safe shadow-[0_-4px_20px_rgba(0,0,0,0.08)]">
                <NavItem
                    id="nav-mission-mobile"
                    label="Missions"
                    icon={<SwordsIcon />}
                    isActive={currentView === View.DASHBOARD || currentView === View.MISSION}
                    onClick={() => setCurrentView(View.DASHBOARD)}
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
                    label="Leader Board"
                    icon={<CrownIcon />}
                    isActive={currentView === View.LEADERBOARD}
                    onClick={() => setCurrentView(View.LEADERBOARD)}
                    isLocked={!leaderboardUnlocked && !isBaselineComplete}
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
                    label="Collection"
                    icon={<BookOpenIcon />}
                    isActive={currentView === View.BESTIARY}
                    onClick={() => setCurrentView(View.BESTIARY)}
                />
            </nav>
        </>
    );
};

export default BottomNavBar;
