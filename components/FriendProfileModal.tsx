import React, { useEffect, useState } from 'react';
import { PublicProfile } from '../types';
import { INITIAL_CREATURES } from '../constants';
import { PixelCreature } from './CreatureCard';
import FireIcon from './icons/FireIcon';
import AuraIcon from './icons/AuraIcon';
import { subscribeToPublicProfile } from '../services/friendsService';

interface FriendProfileModalProps {
    friend: PublicProfile;
    onClose: () => void;
}

// How stale statsSyncedAt has to be before the weekly-gain figure gets an
// "as of" note. Team/streak don't need this: team goes stale silently but
// harmlessly, and streak is self-correcting via deriveDisplayStreak.
const STALE_AFTER_DAYS = 3;

function daysSince(iso: string | undefined): number | null {
    if (!iso) return null;
    const then = new Date(iso).getTime();
    if (isNaN(then)) return null;
    return Math.floor((Date.now() - then) / (1000 * 60 * 60 * 24));
}

const FriendProfileModal: React.FC<FriendProfileModalProps> = ({ friend: initialFriend, onClose }) => {
    // Seed from the initial snapshot passed in (avoids a loading flash on
    // open), then hand off to a live listener so team/streak/aura update
    // in place for as long as this modal stays open — a friend making
    // changes elsewhere no longer requires closing and reopening this
    // modal to see them.
    const [friend, setFriend] = useState(initialFriend);

    useEffect(() => {
        setFriend(initialFriend);
        const unsubscribe = subscribeToPublicProfile(initialFriend.uid, updated => {
            if (updated) setFriend(updated);
        });
        return unsubscribe;
    }, [initialFriend.uid]);

    const staleDays = daysSince(friend.statsSyncedAt);
    const isStale = staleDays !== null && staleDays >= STALE_AFTER_DAYS;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fadeIn">
            <div className="bg-surface w-full max-w-md rounded-2xl shadow-2xl border-2 border-secondary overflow-hidden animate-reveal max-h-[85vh] flex flex-col">
                <div className="bg-primary p-6 text-center relative shrink-0">
                    <button
                        onClick={onClose}
                        className="absolute top-4 right-4 text-white/70 hover:text-white transition-colors"
                    >
                        ✕
                    </button>
                    <div className="w-20 h-20 bg-white rounded-full mx-auto border-4 border-highlight shadow-lg flex items-center justify-center overflow-hidden mb-2">
                        {friend.photoUrl ? (
                            <img src={friend.photoUrl} alt={friend.name} className="w-full h-full object-cover" />
                        ) : (
                            <div className="w-full h-full bg-gradient-to-br from-primary/30 to-highlight/30 flex items-center justify-center font-bold text-primary text-xl uppercase select-none">
                                {friend.name ? friend.name.split(' ').map(n => n[0]).join('').slice(0, 2) : '?'}
                            </div>
                        )}
                    </div>
                    <h2 className="text-white font-serif text-xl font-bold">{friend.name}</h2>
                </div>

                <div className="p-6 space-y-6 overflow-y-auto">
                    {!friend.statsSynced ? (
                        <div className="text-center py-4">
                            <p className="text-xs font-bold text-text-main mb-1">Stats not synced yet</p>
                            <p className="text-[10px] text-text-dim leading-relaxed">
                                {friend.name} hasn't opened AuraPrep since this feature launched, so their real streak,
                                weekly gain, and team aren't here yet — ask them to open the app once and it'll show up.
                            </p>
                        </div>
                    ) : (
                        <>
                            {/* Stat pills */}
                            <div className="flex justify-center gap-3">
                                <div className="glass px-4 py-2 rounded-lg border border-accent/30 text-xs font-bold text-accent shadow-card flex items-center gap-1.5">
                                    <FireIcon className="w-4 h-4 text-accent" />
                                    <span>{friend.streak > 0 ? `${friend.streak} day streak` : 'No streak yet'}</span>
                                </div>
                                <div className="glass px-4 py-2 rounded-lg border border-secondary/50 text-xs font-bold text-primary shadow-card flex items-center gap-1.5">
                                    <AuraIcon className="w-4 h-4 text-primary" />
                                    <span>+{friend.weeklyGain.toLocaleString()} this week</span>
                                </div>
                            </div>
                            {isStale && (
                                <p className="text-center text-[9px] text-text-dim -mt-4">
                                    Weekly gain as of {friend.name}'s last visit, {staleDays} day{staleDays === 1 ? '' : 's'} ago
                                </p>
                            )}

                            {/* Team */}
                            <div>
                                <h3 className="text-[10px] text-text-dim uppercase font-bold mb-2 tracking-widest text-center">Team ({friend.team.length} / 6)</h3>
                                <div className="grid grid-cols-3 gap-3">
                                    {Array.from({ length: 6 }).map((_, idx) => {
                                        const member = friend.team[idx];
                                        const creatureData = member ? INITIAL_CREATURES.find(c => c.id === member.creatureId) : null;

                                        if (member && creatureData) {
                                            return (
                                                <div
                                                    key={idx}
                                                    className="flex flex-col items-center justify-center bg-background border-2 border-primary/40 p-2 rounded-lg shadow-sm w-full h-[90px]"
                                                >
                                                    <PixelCreature creature={creatureData} evolutionStage={member.evolutionStage} pixelSize={2} isShiny={member.isShiny} />
                                                    <span className="text-[9px] font-bold text-text-main mt-1 line-clamp-1">
                                                        {creatureData.names[member.evolutionStage - 1] || creatureData.name}
                                                    </span>
                                                    <span className="text-[8px] bg-primary/10 text-primary px-1 rounded font-semibold mt-0.5">Lv.{member.level}</span>
                                                </div>
                                            );
                                        }

                                        return (
                                            <div
                                                key={idx}
                                                className="flex flex-col items-center justify-center bg-background border-2 border-dashed border-text-dim/20 p-2 h-[90px] rounded-lg text-text-dim/40"
                                            >
                                                <span className="text-xl font-light">?</span>
                                                <span className="text-[8px] uppercase font-bold tracking-wider">Empty</span>
                                            </div>
                                        );
                                    })}
                                </div>
                            </div>
                        </>
                    )}
                </div>
            </div>
        </div>
    );
};

export default FriendProfileModal;
