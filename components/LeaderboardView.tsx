
import React, { useState, useMemo, useRef, useEffect } from 'react';
import { INITIAL_CREATURES } from '../constants';
import { PixelCreature } from './CreatureCard';
import { Rarity, LeagueType } from '../types';
import UserPlusIcon from './icons/UserPlusIcon';

interface LeaderboardEntry {
    rank: number;
    username: string;
    weeklyGain: number;
    guardianId: number;
    isUser?: boolean;
}

interface LeaderboardViewProps {
    weeklyGain: number;
    league: LeagueType;
    competitors: any[];
}

const LeaderboardView: React.FC<LeaderboardViewProps> = ({ weeklyGain, league, competitors }) => {
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const [lastAction, setLastAction] = useState<string | null>(null);
    const [userVisibility, setUserVisibility] = useState<'visible' | 'above' | 'below'>('visible');
    
    const userRowRef = useRef<HTMLDivElement>(null);
    const listContainerRef = useRef<HTMLDivElement>(null);

    const allEntries = useMemo(() => {
        // Ensure pool of exactly 20 entries
        const sorted = [...competitors, { 
            username: "Seeker", 
            weeklyGain: weeklyGain, 
            guardianId: 1, 
            isUser: true 
        }].sort((a, b) => b.weeklyGain - a.weeklyGain)
          .map((entry, idx) => ({ ...entry, rank: idx + 1 }));
        
        return sorted.slice(0, 20);
    }, [competitors, weeklyGain]);

    const top3 = allEntries.slice(0, 3);

    // Intersection Observer to track if the user row is visible in the viewport
    useEffect(() => {
        const observer = new IntersectionObserver(
            ([entry]) => {
                if (entry.isIntersecting) {
                    setUserVisibility('visible');
                } else {
                    const rect = entry.boundingClientRect;
                    const rootRect = entry.rootBounds;
                    if (rootRect) {
                        if (rect.top < rootRect.top) {
                            setUserVisibility('above');
                        } else {
                            setUserVisibility('below');
                        }
                    } else {
                        // Fallback for when rootBounds is null (sometimes in specific overflow scenarios)
                        const viewportHeight = window.innerHeight;
                        if (rect.top < 0) setUserVisibility('above');
                        else if (rect.bottom > viewportHeight) setUserVisibility('below');
                    }
                }
            },
            { threshold: 0.1 }
        );

        if (userRowRef.current) {
            observer.observe(userRowRef.current);
        }

        return () => observer.disconnect();
    }, [allEntries]);

    const getPodiumColor = (rank: number) => {
        if (rank === 1) return 'border-yellow-400 bg-yellow-50 text-yellow-700';
        if (rank === 2) return 'border-gray-300 bg-gray-50 text-gray-600';
        return 'border-orange-300 bg-orange-50 text-orange-700';
    };

    const getRowClass = (rank: number, isUser: boolean) => {
        const base = "px-6 py-4 flex items-center justify-between transition-all border-l-4 ";
        let color = "bg-surface border-secondary/10";
        
        // Custom ranking colors: Top 5 green, last 3 red
        if (rank <= 5) color = "bg-success/5 border-success/40"; 
        else if (rank >= 18) color = "bg-accent/5 border-accent/40"; 
        
        const highlight = isUser ? " ring-2 ring-highlight ring-inset shadow-md z-10" : "";
        return base + color + highlight;
    };

    const handleAction = (action: string) => {
        setLastAction(action);
        setIsMenuOpen(false);
        setTimeout(() => setLastAction(null), 3000);
    };

    const scrollToUser = () => {
        userRowRef.current?.scrollIntoView({ behavior: 'smooth', block: 'center' });
    };

    return (
        <div className="animate-fadeIn max-w-4xl mx-auto pb-32 relative">
            <div className="text-center mb-6 md:mb-8">
                <div className="flex flex-col items-center gap-2">
                    <span className="text-[9px] md:text-[10px] bg-primary text-white px-3 py-0.5 rounded-full font-bold uppercase tracking-widest shadow-button animate-subtlePulse">
                        {league} League
                    </span>
                    <h1 className="font-sans text-lg md:text-xl lg:text-3xl bg-highlight text-text-light px-4 md:px-6 py-2 inline-block rounded-xl shadow-card uppercase tracking-tight animate-slideDown">
                        Leaderboard
                    </h1>
                </div>
                <p className="text-text-dim mt-2 text-[10px] md:text-xs">League Pool: 20 Scholars</p>
                <p className="text-[9px] md:text-[10px] text-primary font-bold mt-1 uppercase tracking-widest animate-subtlePulse">Resets Monday Morning</p>
            </div>

            {/* Podium Section */}
            <div className="flex flex-wrap justify-center items-end gap-2 md:gap-4 mb-8 md:mb-10 mt-12 md:mt-16 lg:mt-24 px-2 md:px-4">
                {top3.map((entry) => {
                    const displayRank = entry.rank;
                    const order = displayRank === 1 ? 'order-2' : (displayRank === 2 ? 'order-1' : 'order-3');
                    const scale = displayRank === 1 ? 'md:scale-110 lg:scale-110' : 'scale-90';
                    const height = displayRank === 1 ? 'h-32 md:h-40 lg:h-56' : (displayRank === 2 ? 'h-24 md:h-32 lg:h-40' : 'h-20 md:h-24 lg:h-32');
                    const emoji = displayRank === 1 ? '👑' : (displayRank === 2 ? '🥈' : '🥉');

                    return (
                        <div key={entry.username} className={`${order} flex flex-col items-center ${displayRank === 1 ? '-mt-6 md:-mt-8' : ''}`}>
                            <div className={`mb-2 md:mb-4 transform ${scale} ${displayRank === 1 ? 'animate-bounce' : ''}`}>
                                <PixelCreature
                                    creature={INITIAL_CREATURES.find(c => c.id === entry.guardianId) || INITIAL_CREATURES[0]}
                                    evolutionStage={displayRank === 1 ? 3 : 2}
                                    pixelSize={displayRank === 1 ? 4 : 3}
                                />
                            </div>
                            <div className={`w-24 md:w-28 lg:w-40 ${height} border-t-4 ${getPodiumColor(displayRank)} flex flex-col items-center pt-3 md:pt-4 rounded-t-xl shadow-lg relative ${displayRank === 1 ? 'z-10' : ''} ${entry.isUser ? 'ring-2 ring-highlight ring-inset bg-highlight/5' : ''}`}>
                                <span className="absolute -top-8 md:-top-10 text-xl md:text-2xl lg:text-4xl">{emoji}</span>
                                <p className="font-bold text-[9px] md:text-[10px] lg:text-xs truncate w-full px-2 text-center tracking-tighter">
                                    {entry.username} {entry.isUser ? '(You)' : ''}
                                </p>
                                <p className="text-[8px] md:text-[9px] lg:text-[10px] font-bold opacity-80 mt-1">+{entry.weeklyGain} 💎</p>
                            </div>
                        </div>
                    );
                })}
            </div>

            {/* Tracking Bubble for off-screen user */}
            {userVisibility !== 'visible' && (
                <button 
                    onClick={scrollToUser}
                    className={`fixed left-1/2 -translate-x-1/2 z-[60] bg-highlight text-white text-[10px] font-bold px-5 py-2.5 rounded-full shadow-2xl border-2 border-white flex items-center gap-2 animate-bounce transition-all duration-300 hover:scale-105 active:scale-95 ${userVisibility === 'above' ? 'top-20' : 'bottom-24'}`}
                >
                    {userVisibility === 'above' ? '▲' : '▼'} YOU
                </button>
            )}

            {/* Scrollable List Container */}
            <div ref={listContainerRef} className="bg-surface border-2 border-secondary/30 rounded-xl shadow-card overflow-hidden mx-2 animate-scaleIn">
                <div className="glass px-6 py-3 border-b-2 border-secondary/20 flex justify-between text-[10px] font-bold text-primary uppercase tracking-widest">
                    <span>Rank / Seeker</span>
                    <span>Weekly Gain</span>
                </div>
                <div className="divide-y divide-secondary/10">
                    {allEntries.map((entry) => (
                        <div 
                            key={entry.username}
                            ref={entry.isUser ? userRowRef : null}
                            className={getRowClass(entry.rank, !!entry.isUser)}
                        >
                            <div className="flex items-center gap-4">
                                <span className={`w-6 text-sm font-black ${entry.rank <= 5 ? 'text-success' : (entry.rank >= 18 ? 'text-accent' : 'text-text-dark')}`}>
                                    {entry.rank}
                                </span>
                                <div className="w-8 h-8 flex items-center justify-center grayscale group-hover:grayscale-0 transition-all opacity-60">
                                    <PixelCreature 
                                        creature={INITIAL_CREATURES.find(c => c.id === entry.guardianId) || INITIAL_CREATURES[0]} 
                                        evolutionStage={1} 
                                        pixelSize={2} 
                                    />
                                </div>
                                <div className="flex flex-col">
                                    <p className={`text-[10px] font-bold ${entry.isUser ? 'text-highlight' : 'text-text-main'} uppercase tracking-tighter`}>
                                        {entry.username} {entry.isUser ? '(You)' : ''}
                                    </p>
                                    <div className="flex gap-1.5 items-center">
                                        {entry.rank <= 5 && <span className="text-[7px] bg-success text-white px-1 rounded-sm font-bold">PROMOTING</span>}
                                        {entry.rank >= 18 && <span className="text-[7px] bg-accent text-white px-1 rounded-sm font-bold">DEMOTING</span>}
                                        {entry.rank > 5 && entry.rank < 18 && <span className="text-[7px] bg-text-dark text-white px-1 rounded-sm font-bold">STAYING</span>}
                                    </div>
                                </div>
                            </div>
                            <div className="text-right">
                                <span className={`font-mono text-sm font-bold ${entry.isUser ? 'text-highlight' : 'text-primary'}`}>
                                    +{entry.weeklyGain.toLocaleString()} 💎
                                </span>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
            
            {/* Legend / Info Cards */}
            <div className="mt-4 md:mt-6 grid grid-cols-2 gap-2 md:gap-4 mx-2">
                <div className="p-3 md:p-4 bg-success/10 border-2 border-success/30 rounded-xl shadow-card text-center hover-lift transition-premium">
                    <p className="text-[9px] md:text-[10px] font-bold text-success uppercase tracking-tight mb-1">Promotion Zone</p>
                    <p className="text-[7px] md:text-[8px] text-text-dim uppercase tracking-tighter leading-tight">Top 5 advance to the next league</p>
                </div>
                <div className="p-3 md:p-4 bg-accent/10 border-2 border-accent/30 rounded-xl shadow-card text-center hover-lift transition-premium">
                    <p className="text-[9px] md:text-[10px] font-bold text-accent uppercase tracking-tight mb-1">Demotion Zone</p>
                    <p className="text-[7px] md:text-[8px] text-text-dim uppercase tracking-tighter leading-tight">Bottom 3 fall to lower league</p>
                </div>
            </div>

            {/* Notification Toast */}
            {lastAction && (
                <div className="fixed bottom-24 left-1/2 -translate-x-1/2 bg-surface border-2 border-highlight px-6 py-3 rounded-full shadow-2xl z-50 animate-bounce">
                    <p className="text-[10px] font-bold text-highlight uppercase tracking-widest">{lastAction}</p>
                </div>
            )}

            {/* Social / PvP Buttons */}
            <div className="fixed bottom-20 right-6 lg:bottom-10 lg:right-10 flex flex-col items-end gap-3 z-30">
                <div className={`flex flex-col items-end gap-3 transition-all duration-300 transform ${isMenuOpen ? 'translate-y-0 opacity-100 scale-100' : 'translate-y-10 opacity-0 scale-50 pointer-events-none'}`}>
                    <button
                        onClick={() => handleAction("Coming Soon!")}
                        className="bg-accent/50 text-white/80 px-4 py-2 rounded-full flex items-center gap-3 shadow-xl cursor-not-allowed border-2 border-accent-dark/50 relative"
                    >
                        <span className="text-[10px] font-bold uppercase tracking-widest">Random PvP</span>
                        <span className="text-lg">⚔️</span>
                        <span className="absolute -top-2 -right-2 bg-highlight text-[7px] text-white px-1.5 py-0.5 rounded-full font-bold shadow-md">SOON</span>
                    </button>
                    <button
                        onClick={() => handleAction("Coming Soon!")}
                        className="bg-primary/50 text-white/80 px-4 py-2 rounded-full flex items-center gap-3 shadow-xl cursor-not-allowed border-2 border-primary/50 relative"
                    >
                        <span className="text-[10px] font-bold uppercase tracking-widest">Friend PvP</span>
                        <span className="text-lg">🤝</span>
                        <span className="absolute -top-2 -right-2 bg-highlight text-[7px] text-white px-1.5 py-0.5 rounded-full font-bold shadow-md">SOON</span>
                    </button>
                    <button
                        onClick={() => handleAction("Coming Soon!")}
                        className="bg-surface/50 text-text-main/80 px-4 py-2 rounded-full flex items-center gap-3 shadow-xl border-2 border-secondary/50 cursor-not-allowed relative"
                    >
                        <span className="text-[10px] font-bold uppercase tracking-widest">Add Friend</span>
                        <UserPlusIcon className="h-5 w-5" />
                        <span className="absolute -top-2 -right-2 bg-highlight text-[7px] text-white px-1.5 py-0.5 rounded-full font-bold shadow-md">SOON</span>
                    </button>
                </div>

                <button 
                    onClick={() => setIsMenuOpen(!isMenuOpen)}
                    className={`w-14 h-14 rounded-full bg-highlight flex items-center justify-center shadow-[0_0_20px_rgba(202,138,4,0.4)] border-2 border-yellow-800 transition-all duration-300 hover:scale-110 active:scale-95 group ${isMenuOpen ? 'rotate-45 bg-accent border-accent-dark' : 'rotate-0'}`}
                >
                    <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M12 4v16m8-8H4" />
                    </svg>
                </button>
            </div>
        </div>
    );
};

export default LeaderboardView;
