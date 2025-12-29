
import React from 'react';
import { View, User } from '../types';
import SwordsIcon from './icons/SwordsIcon';
import SparklesIcon from './icons/SparklesIcon';
import BookOpenIcon from './icons/BookOpenIcon';
import ChartBarIcon from './icons/ChartBarIcon';
import CrownIcon from './icons/CrownIcon';

interface BottomNavBarProps {
    currentView: View;
    setCurrentView: (view: View) => void;
    user: User | null;
}

const NavItem: React.FC<{
    label: string;
    icon: React.ReactNode;
    isActive: boolean;
    onClick: () => void;
}> = ({ label, icon, isActive, onClick }) => {
    return (
        <button
            onClick={onClick}
            className={`flex lg:flex-row flex-col items-center justify-center lg:justify-start lg:gap-4 lg:px-6 lg:py-4 w-full transition-colors duration-200 group ${isActive ? 'text-highlight' : 'text-text-dim hover:text-text-main'}`}
        >
            <div className={`transition-transform duration-200 ${isActive ? 'scale-125 lg:scale-100' : 'scale-110 lg:scale-100 group-hover:scale-125 lg:group-hover:scale-100'}`}>
                {icon}
            </div>
            {/* Labels hidden on mobile to prevent cramping, shown only on desktop sidebar */}
            <span className="hidden lg:block text-sm font-medium truncate">{label}</span>
            {isActive && <div className="hidden lg:block ml-auto w-1.5 h-1.5 rounded-full bg-highlight"></div>}
        </button>
    );
};

const BottomNavBar: React.FC<BottomNavBarProps> = ({ currentView, setCurrentView, user }) => {
    return (
        <>
            {/* Desktop Sidebar (Visible on lg+) */}
            <nav className="hidden lg:flex fixed left-0 top-0 h-full w-64 bg-surface border-r border-secondary/50 flex-col items-start z-20 shadow-xl">
                <div className="p-6 w-full border-b border-secondary/20 mb-4">
                    <h1 className="font-serif text-xl text-highlight font-bold tracking-tight">AuraPrep</h1>
                    <p className="text-xs text-text-dim">Summoner's Academy</p>
                </div>
                
                <div className="flex flex-col w-full gap-1 overflow-y-auto">
                    <NavItem 
                        label="Mission"
                        icon={<SwordsIcon />}
                        isActive={currentView === View.DASHBOARD || currentView === View.MISSION}
                        onClick={() => setCurrentView(View.DASHBOARD)}
                    />
                    <NavItem 
                        label="Progress"
                        icon={<ChartBarIcon />}
                        isActive={currentView === View.PROGRESS}
                        onClick={() => setCurrentView(View.PROGRESS)}
                    />
                    <NavItem 
                        label="Leader Board"
                        icon={<CrownIcon />}
                        isActive={currentView === View.LEADERBOARD}
                        onClick={() => setCurrentView(View.LEADERBOARD)}
                    />
                    <NavItem 
                        label="Summon"
                        icon={<SparklesIcon />}
                        isActive={currentView === View.SUMMON}
                        onClick={() => setCurrentView(View.SUMMON)}
                    />
                    <NavItem 
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

            {/* Mobile Bottom Bar (Hidden on lg+) */}
            <nav className="lg:hidden fixed bottom-0 left-0 right-0 h-16 bg-background/95 backdrop-blur-sm border-t border-secondary/50 flex items-center justify-around z-20 pb-safe shadow-[0_-4px_10px_rgba(0,0,0,0.05)]">
                <NavItem 
                    label="Mission"
                    icon={<SwordsIcon />}
                    isActive={currentView === View.DASHBOARD || currentView === View.MISSION}
                    onClick={() => setCurrentView(View.DASHBOARD)}
                />
                <NavItem 
                    label="Progress"
                    icon={<ChartBarIcon />}
                    isActive={currentView === View.PROGRESS}
                    onClick={() => setCurrentView(View.PROGRESS)}
                />
                <NavItem 
                    label="Leader Board"
                    icon={<CrownIcon />}
                    isActive={currentView === View.LEADERBOARD}
                    onClick={() => setCurrentView(View.LEADERBOARD)}
                />
                <NavItem 
                    label="Summon"
                    icon={<SparklesIcon />}
                    isActive={currentView === View.SUMMON}
                    onClick={() => setCurrentView(View.SUMMON)}
                />
                <NavItem 
                    label="Bestiary"
                    icon={<BookOpenIcon />}
                    isActive={currentView === View.BESTIARY}
                    onClick={() => setCurrentView(View.BESTIARY)}
                />
            </nav>
        </>
    );
};

export default BottomNavBar;
