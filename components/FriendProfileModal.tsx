import React from 'react';
import { PublicProfile } from '../types';
import { INITIAL_CREATURES } from '../constants';
import { PixelCreature } from './CreatureCard';
import FireIcon from './icons/FireIcon';
import AuraIcon from './icons/AuraIcon';

interface FriendProfileModalProps {
    friend: PublicProfile;
    onClose: () => void;
}

const FriendProfileModal: React.FC<FriendProfileModalProps> = ({ friend, onClose }) => {
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
                </div>
            </div>
        </div>
    );
};

export default FriendProfileModal;
