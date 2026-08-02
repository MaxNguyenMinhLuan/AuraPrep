
import React, { useState, useMemo, useRef, useEffect } from 'react';
import { INITIAL_CREATURES } from '../constants';
import { PixelCreature } from './CreatureCard';
import { Rarity, LeagueType, User, PublicProfile } from '../types';
import UserPlusIcon from './icons/UserPlusIcon';
import AuraIcon from './icons/AuraIcon';
import CrownIcon from './icons/CrownIcon';
import SecondPlaceIcon from './icons/SecondPlaceIcon';
import ThirdPlaceIcon from './icons/ThirdPlaceIcon';
import SwordsIcon from './icons/SwordsIcon';
import HandshakeIcon from './icons/HandshakeIcon';
import AddFriendModal from './AddFriendModal';
import FriendProfileModal from './FriendProfileModal';
import { getLeagueCompetitors, getFriendUids, subscribeToFriendsList, lookupPublicProfile } from '../services/friendsService';

interface LeaderboardEntry {
    id: string;
    rank: number;
    username: string;
    weeklyGain: number;
    guardianId: number;
    evolutionStage: 1 | 2 | 3;
    isUser?: boolean;
}

// Mock competitors have no real evolution data — a fixed mid-stage keeps
// their podium/list icons decorative without implying anything real.
const MOCK_EVOLUTION_STAGE = 2;

type LeaderboardTab = 'league' | 'friends';

// How many non-self slots the League tab tries to fill. Real users (same
// league, ranked by weekly gain) are used first; mock competitors only
// fill whatever's left over once real users run out.
const LEAGUE_POOL_SIZE = 19;

interface LeaderboardViewProps {
    user: User;
    username: string;
    weeklyGain: number;
    league: LeagueType;
    competitors: any[];
    activeGuardianId?: number;
    activeGuardianEvolutionStage?: 1 | 2 | 3;
    pendingFriendRequestCount?: number;
    onFriendRequestsChanged?: () => void;
}

const LeaderboardView: React.FC<LeaderboardViewProps> = ({ user, username, weeklyGain, league, competitors, activeGuardianId = 1, activeGuardianEvolutionStage = 1, pendingFriendRequestCount = 0, onFriendRequestsChanged = () => {} }) => {
    const [activeTab, setActiveTab] = useState<LeaderboardTab>('league');
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const [isAddFriendOpen, setIsAddFriendOpen] = useState(false);
    const [lastAction, setLastAction] = useState<string | null>(null);
    const [userVisibility, setUserVisibility] = useState<'visible' | 'above' | 'below'>('visible');

    const [realCompetitors, setRealCompetitors] = useState<PublicProfile[]>([]);
    const [friendProfiles, setFriendProfiles] = useState<PublicProfile[]>([]);
    const [isLoadingFriends, setIsLoadingFriends] = useState(true);
    const [selectedFriend, setSelectedFriend] = useState<PublicProfile | null>(null);

    const userRowRef = useRef<HTMLDivElement>(null);
    const listContainerRef = useRef<HTMLDivElement>(null);

    // League tab: real users in this league (ranked by weekly gain) first,
    // mock competitors only fill whatever slots are left over.
    useEffect(() => {
        let cancelled = false;
        getLeagueCompetitors(league, user.uid, LEAGUE_POOL_SIZE).then(real => {
            if (!cancelled) setRealCompetitors(real);
        });
        return () => { cancelled = true; };
    }, [league, user.uid]);

    // Bumped whenever friend membership itself changes (add/accept/remove),
    // so the uid list — and therefore the live subscription below, which is
    // keyed to a fixed uid set — gets re-derived. Field-level changes to an
    // existing friend's stats don't need this; the subscription already
    // picks those up on its own.
    const [friendsVersion, setFriendsVersion] = useState(0);

    // Friends tab: fetch the current friend uid list, then hold a live
    // onSnapshot subscription open across all of them for as long as the tab
    // stays active — team/streak/aura update in place the moment a friend's
    // own client syncs, instead of only refreshing when this tab is
    // switched away from and back to.
    useEffect(() => {
        if (activeTab !== 'friends') return;
        let cancelled = false;
        let unsubscribeProfiles: (() => void) | null = null;
        setIsLoadingFriends(true);
        (async () => {
            const uids = await getFriendUids(user.uid);
            if (cancelled) return;
            unsubscribeProfiles = subscribeToFriendsList(uids, profiles => {
                if (cancelled) return;
                setFriendProfiles(profiles);
                setIsLoadingFriends(false);
            });
        })();
        return () => {
            cancelled = true;
            unsubscribeProfiles?.();
        };
    }, [user.uid, activeTab, friendsVersion]);

    const handleFriendsChanged = () => {
        setFriendsVersion(v => v + 1);
        onFriendRequestsChanged();
    };

    const leagueEntries = useMemo<LeaderboardEntry[]>(() => {
        const realEntries: LeaderboardEntry[] = realCompetitors.map(p => ({
            id: p.uid, rank: 0, username: p.name, weeklyGain: p.weeklyGain, guardianId: p.guardianId, evolutionStage: p.guardianEvolutionStage
        }));
        const remainingSlots = Math.max(0, LEAGUE_POOL_SIZE - realEntries.length);
        const mockEntries: LeaderboardEntry[] = competitors.slice(0, remainingSlots).map((c, idx) => ({
            id: `mock-${idx}-${c.username}`, rank: 0, username: c.username, weeklyGain: c.weeklyGain, guardianId: c.guardianId, evolutionStage: MOCK_EVOLUTION_STAGE
        }));
        const selfEntry: LeaderboardEntry = { id: user.uid, rank: 0, username, weeklyGain, guardianId: activeGuardianId, evolutionStage: activeGuardianEvolutionStage, isUser: true };

        return [...realEntries, ...mockEntries, selfEntry]
            .sort((a, b) => b.weeklyGain - a.weeklyGain)
            .slice(0, 20)
            .map((entry, idx) => ({ ...entry, rank: idx + 1 }));
    }, [realCompetitors, competitors, username, weeklyGain, activeGuardianId, activeGuardianEvolutionStage, user.uid]);

    const friendsEntries = useMemo<LeaderboardEntry[]>(() => {
        const friendEntries: LeaderboardEntry[] = friendProfiles.map(p => ({
            id: p.uid, rank: 0, username: p.name, weeklyGain: p.weeklyGain, guardianId: p.guardianId, evolutionStage: p.guardianEvolutionStage
        }));
        const selfEntry: LeaderboardEntry = { id: user.uid, rank: 0, username, weeklyGain, guardianId: activeGuardianId, evolutionStage: activeGuardianEvolutionStage, isUser: true };

        return [...friendEntries, selfEntry]
            .sort((a, b) => b.weeklyGain - a.weeklyGain)
            .map((entry, idx) => ({ ...entry, rank: idx + 1 }));
    }, [friendProfiles, username, weeklyGain, activeGuardianId, activeGuardianEvolutionStage, user.uid]);

    const isLeagueTab = activeTab === 'league';
    const allEntries = isLeagueTab ? leagueEntries : friendsEntries;
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

        // Promotion/demotion tinting only makes sense for the ranked League
        // pool — the Friends tab is just for comparison, nobody moves.
        if (isLeagueTab) {
            if (rank <= 5) color = "bg-success/5 border-success/40";
            else if (rank >= 18) color = "bg-accent/5 border-accent/40";
        }

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

    // FriendProfileModal takes over freshness itself via a live listener
    // once opened, so this only needs to seed an initial snapshot — self
    // and friend cases no longer need different freshness guarantees here.
    const openFriendProfile = async (entryId: string) => {
        const cached = entryId !== user.uid ? friendProfiles.find(p => p.uid === entryId) : undefined;
        const profile = cached ?? await lookupPublicProfile(entryId);
        if (profile) setSelectedFriend(profile);
    };

    return (
        <div className="animate-fadeIn max-w-4xl mx-auto pb-32 relative">
            <div className="text-center mb-6 md:mb-8">
                <div className="flex flex-col items-center gap-2">
                    <span className="text-[9px] md:text-[10px] bg-primary text-white px-3 py-0.5 rounded-full font-bold uppercase tracking-widest shadow-button animate-subtlePulse">
                        {isLeagueTab ? `${league} League` : 'Just For Fun'}
                    </span>
                    <h1 className="font-sans text-lg md:text-xl lg:text-3xl bg-highlight text-text-light px-4 md:px-6 py-2 inline-block rounded-xl shadow-card uppercase tracking-tight animate-slideDown">
                        {isLeagueTab ? 'Leaderboard' : 'Friends'}
                    </h1>
                </div>
                {isLeagueTab ? (
                    <>
                        <p className="text-text-dim mt-2 text-[10px] md:text-xs">League Pool: 20 Scholars</p>
                        <p className="text-[9px] md:text-[10px] text-primary font-bold mt-1 uppercase tracking-widest animate-subtlePulse">Resets Monday Morning</p>
                    </>
                ) : (
                    <p className="text-text-dim mt-2 text-[10px] md:text-xs">See who's ahead — no ranks won or lost here</p>
                )}

                {/* Tab Switcher */}
                <div className="flex justify-center gap-2 mt-4">
                    <button
                        onClick={() => setActiveTab('league')}
                        className={`text-[9px] md:text-[10px] font-bold uppercase tracking-widest px-4 py-1.5 rounded-full transition-all ${isLeagueTab ? 'bg-primary text-white shadow-button' : 'bg-surface text-text-dim border-2 border-secondary/40 hover:border-primary/40'}`}
                    >
                        League
                    </button>
                    <button
                        onClick={() => setActiveTab('friends')}
                        className={`text-[9px] md:text-[10px] font-bold uppercase tracking-widest px-4 py-1.5 rounded-full transition-all flex items-center gap-1.5 ${!isLeagueTab ? 'bg-primary text-white shadow-button' : 'bg-surface text-text-dim border-2 border-secondary/40 hover:border-primary/40'}`}
                    >
                        Friends
                        {friendProfiles.length > 0 && (
                            <span className={`text-[8px] px-1.5 rounded-full ${!isLeagueTab ? 'bg-white/20' : 'bg-secondary/30'}`}>{friendProfiles.length}</span>
                        )}
                    </button>
                </div>
            </div>

            {!isLeagueTab && !isLoadingFriends && friendProfiles.length === 0 ? (
                /* Friends empty state */
                <div className="mx-2 mt-10 p-6 bg-surface border-2 border-dashed border-secondary/40 rounded-xl text-center animate-scaleIn">
                    <UserPlusIcon className="h-8 w-8 text-text-dim mx-auto mb-3" />
                    <p className="text-xs font-bold text-text-main mb-1">No friends yet</p>
                    <p className="text-[10px] text-text-dim mb-4">Add a friend by Academy ID to see how you stack up.</p>
                    <button
                        onClick={() => setIsAddFriendOpen(true)}
                        className="bg-highlight text-white text-[10px] font-bold uppercase tracking-widest px-5 py-2.5 rounded-xl border-b-4 border-yellow-800 hover:brightness-110 transition-all active:translate-y-1 active:border-b-0"
                    >
                        Add Friend
                    </button>
                </div>
            ) : (
                <>
                    {/* Podium Section */}
                    <div className="flex flex-wrap justify-center items-end gap-2 md:gap-4 mb-8 md:mb-10 mt-12 md:mt-16 lg:mt-24 px-2 md:px-4">
                        {top3.map((entry) => {
                            const displayRank = entry.rank;
                            const order = displayRank === 1 ? 'order-2' : (displayRank === 2 ? 'order-1' : 'order-3');
                            const scale = displayRank === 1 ? 'md:scale-110 lg:scale-110' : 'scale-90';
                            const height = displayRank === 1 ? 'h-32 md:h-40 lg:h-56' : (displayRank === 2 ? 'h-24 md:h-32 lg:h-40' : 'h-20 md:h-24 lg:h-32');
                            const isClickable = !isLeagueTab;
                            return (
                                <div
                                    key={entry.id}
                                    onClick={isClickable ? () => openFriendProfile(entry.id) : undefined}
                                    className={`${order} flex flex-col items-center ${displayRank === 1 ? '-mt-6 md:-mt-8' : ''} ${isClickable ? 'cursor-pointer hover:scale-105 transition-transform' : ''}`}
                                >
                                    <div className={`mb-2 md:mb-4 transform ${scale} ${displayRank === 1 ? 'animate-bounce' : ''}`}>
                                        <PixelCreature
                                            creature={INITIAL_CREATURES.find(c => c.id === entry.guardianId) || INITIAL_CREATURES[0]}
                                            evolutionStage={entry.evolutionStage}
                                            pixelSize={displayRank === 1 ? 4 : 3}
                                        />
                                    </div>
                                    <div className={`w-24 md:w-28 lg:w-40 ${height} border-t-4 ${getPodiumColor(displayRank)} flex flex-col items-center pt-3 md:pt-4 rounded-t-xl shadow-lg relative ${displayRank === 1 ? 'z-10' : ''} ${entry.isUser ? 'ring-2 ring-highlight ring-inset bg-highlight/5' : ''}`}>
                                        {displayRank === 1 && (
                                            <span className="absolute -top-8 md:-top-10 flex items-center justify-center bg-white dark:bg-slate-800 rounded-full p-1.5 shadow-md border-2 border-secondary/20">
                                                <CrownIcon className="w-5 h-5 md:w-6 md:h-6 text-yellow-500" />
                                            </span>
                                        )}
                                        <p className="font-bold text-[9px] md:text-[10px] lg:text-xs truncate w-full px-2 text-center tracking-tighter mt-1">
                                            {entry.username} {entry.isUser ? '(You)' : ''}
                                        </p>
                                        <p className="text-[8px] md:text-[9px] lg:text-[10px] font-bold opacity-80 mt-1 flex items-center justify-center gap-0.5">+{entry.weeklyGain} <AuraIcon className="w-2.5 h-2.5" /></p>
                                    </div>
                                </div>
                            );
                        })}
                    </div>

                    {/* Tracking Bubble for off-screen user */}
                    {userVisibility !== 'visible' && (
                        <div className={`fixed left-0 right-0 flex justify-center z-[60] pointer-events-none ${userVisibility === 'above' ? 'top-[calc(env(safe-area-inset-top)+76px)]' : 'bottom-[calc(env(safe-area-inset-bottom)+100px)]'}`}>
                            <button
                                onClick={scrollToUser}
                                className="pointer-events-auto bg-highlight text-white text-[10px] font-bold px-5 py-2.5 rounded-full shadow-2xl border-2 border-white flex items-center gap-2 animate-bounce transition-all duration-300 hover:scale-105 active:scale-95"
                            >
                                {userVisibility === 'above' ? '▲' : '▼'} YOU
                            </button>
                        </div>
                    )}

                    {/* Scrollable List Container */}
                    <div ref={listContainerRef} className="bg-surface border-2 border-secondary/30 rounded-xl shadow-card overflow-hidden mx-2 animate-scaleIn">
                        <div className="glass px-6 py-3 border-b-2 border-secondary/20 flex justify-between text-[10px] font-bold text-primary uppercase tracking-widest">
                            <span>Rank / Seeker</span>
                            <span>Weekly Gain</span>
                        </div>
                        <div className="divide-y divide-secondary/10">
                            {allEntries.map((entry) => {
                                const isClickable = !isLeagueTab;
                                return (
                                <div
                                    key={entry.id}
                                    ref={entry.isUser ? userRowRef : null}
                                    onClick={isClickable ? () => openFriendProfile(entry.id) : undefined}
                                    className={getRowClass(entry.rank, !!entry.isUser) + (isClickable ? ' cursor-pointer hover:brightness-95' : '')}
                                >
                                    <div className="flex items-center gap-4">
                                        <span className={`w-6 text-sm font-black ${isLeagueTab ? (entry.rank <= 5 ? 'text-success' : (entry.rank >= 18 ? 'text-accent' : 'text-text-dark')) : 'text-text-dark'}`}>
                                            {entry.rank}
                                        </span>
                                        <div className="w-8 h-8 flex items-center justify-center grayscale group-hover:grayscale-0 transition-all opacity-60">
                                            <PixelCreature
                                                creature={INITIAL_CREATURES.find(c => c.id === entry.guardianId) || INITIAL_CREATURES[0]}
                                                evolutionStage={entry.evolutionStage}
                                                pixelSize={2}
                                            />
                                        </div>
                                        <div className="flex flex-col">
                                            <p className={`text-[10px] font-bold ${entry.isUser ? 'text-highlight' : 'text-text-main'} uppercase tracking-tighter`}>
                                                {entry.username} {entry.isUser ? '(You)' : ''}
                                            </p>
                                            {isLeagueTab && (
                                                <div className="flex gap-1.5 items-center">
                                                    {entry.rank <= 5 && <span className="text-[7px] bg-success text-white px-1 rounded-sm font-bold">PROMOTING</span>}
                                                    {entry.rank >= 18 && <span className="text-[7px] bg-accent text-white px-1 rounded-sm font-bold">DEMOTING</span>}
                                                    {entry.rank > 5 && entry.rank < 18 && <span className="text-[7px] bg-text-dark text-white px-1 rounded-sm font-bold">STAYING</span>}
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                    <div className="text-right">
                                        <span className={`font-mono text-sm font-bold flex items-center justify-end gap-1 ${entry.isUser ? 'text-highlight' : 'text-primary'}`}>
                                            +{entry.weeklyGain.toLocaleString()} <AuraIcon className="w-3.5 h-3.5" />
                                        </span>
                                    </div>
                                </div>
                                );
                            })}
                        </div>
                    </div>

                    {/* Legend / Info Cards — only meaningful for the ranked League pool */}
                    {isLeagueTab && (
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
                    )}
                </>
            )}

            {/* Notification Toast */}
            {lastAction && (
                <div className="fixed bottom-24 left-1/2 -translate-x-1/2 bg-surface border-2 border-highlight px-6 py-3 rounded-full shadow-2xl z-50 animate-bounce">
                    <p className="text-[10px] font-bold text-highlight uppercase tracking-widest">{lastAction}</p>
                </div>
            )}

            {/* Social / PvP Buttons */}
            <div className="fixed bottom-[calc(env(safe-area-inset-bottom)+96px)] right-6 lg:bottom-10 lg:right-10 flex flex-col items-end gap-3 z-30">
                <div className={`flex flex-col items-end gap-3 transition-all duration-300 transform ${isMenuOpen ? 'translate-y-0 opacity-100 scale-100' : 'translate-y-10 opacity-0 scale-50 pointer-events-none'}`}>
                    <button
                        onClick={() => handleAction("Coming Soon!")}
                        className="bg-accent text-white px-4 py-2 rounded-full flex items-center gap-3 shadow-xl cursor-not-allowed border-2 border-accent-dark/50 relative"
                    >
                        <span className="text-[10px] font-bold uppercase tracking-widest">Random PvP</span>
                        <SwordsIcon className="w-4 h-4 text-white" />
                        <span className="absolute -top-2 -right-2 bg-highlight text-[7px] text-white px-1.5 py-0.5 rounded-full font-bold shadow-md">SOON</span>
                    </button>
                    <button
                        onClick={() => handleAction("Coming Soon!")}
                        className="bg-primary text-white px-4 py-2 rounded-full flex items-center gap-3 shadow-xl cursor-not-allowed border-2 border-primary/50 relative"
                    >
                        <span className="text-[10px] font-bold uppercase tracking-widest">Friend PvP</span>
                        <HandshakeIcon className="w-4 h-4 text-white" />
                        <span className="absolute -top-2 -right-2 bg-highlight text-[7px] text-white px-1.5 py-0.5 rounded-full font-bold shadow-md">SOON</span>
                    </button>
                    <button
                        onClick={() => { setIsMenuOpen(false); setIsAddFriendOpen(true); }}
                        className="bg-surface text-text-main px-4 py-2 rounded-full flex items-center gap-3 shadow-xl border-2 border-secondary/50 hover:brightness-105 active:scale-95 transition-all relative"
                    >
                        <span className="text-[10px] font-bold uppercase tracking-widest">Add Friend</span>
                        <UserPlusIcon className="h-5 w-5" />
                        {pendingFriendRequestCount > 0 && (
                            <span className="absolute -top-2 -right-2 bg-highlight text-[9px] text-white min-w-[18px] h-[18px] px-1 rounded-full font-bold shadow-md flex items-center justify-center">
                                {pendingFriendRequestCount}
                            </span>
                        )}
                    </button>
                </div>

                <button
                    onClick={() => setIsMenuOpen(!isMenuOpen)}
                    className={`relative w-14 h-14 rounded-full bg-highlight flex items-center justify-center shadow-[0_0_20px_rgba(202,138,4,0.4)] border-2 border-yellow-800 transition-all duration-300 hover:scale-110 active:scale-95 group ${isMenuOpen ? 'rotate-45 bg-accent border-accent-dark' : 'rotate-0'}`}
                >
                    <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M12 4v16m8-8H4" />
                    </svg>
                    {!isMenuOpen && pendingFriendRequestCount > 0 && (
                        <span className="absolute -top-1 -right-1 bg-accent text-[9px] text-white min-w-[18px] h-[18px] px-1 rounded-full font-bold shadow-md flex items-center justify-center border-2 border-white">
                            {pendingFriendRequestCount}
                        </span>
                    )}
                </button>
            </div>

            {isAddFriendOpen && (
                <AddFriendModal
                    user={user}
                    onClose={() => setIsAddFriendOpen(false)}
                    onRequestsChanged={handleFriendsChanged}
                />
            )}

            {selectedFriend && (
                <FriendProfileModal
                    friend={selectedFriend}
                    onClose={() => setSelectedFriend(null)}
                />
            )}
        </div>
    );
};

export default LeaderboardView;
