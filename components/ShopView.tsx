import React, { useState } from 'react';
import { POWER_UPS } from '../constants';
import { PowerUpType } from '../types';
import AuraIcon from './icons/AuraIcon';
import ScissorsIcon from './icons/ScissorsIcon';
import EyeIcon from './icons/EyeIcon';
import ShuffleIcon from './icons/ShuffleIcon';
import ShieldIcon from './icons/ShieldIcon';
import TargetIcon from './icons/TargetIcon';

interface ShopViewProps {
    auraPoints: number;
    inventory: { [key in PowerUpType]?: number };
    onBuy: (type: PowerUpType, cost: number) => void;
    onExit: () => void;
}

const getPowerUpColorClass = (id: PowerUpType) => {
    switch (id) {
        case 'ELIMINATE': return 'text-orange-500 dark:text-orange-400';
        case 'HINT': return 'text-indigo-500 dark:text-indigo-400';
        case 'SKIP': return 'text-cyan-500 dark:text-cyan-400';
        case 'SECOND_CHANCE': return 'text-emerald-500 dark:text-emerald-400';
        case 'DOUBLE_JEOPARDY': return 'text-rose-500 dark:text-rose-400';
        default: return 'text-primary dark:text-indigo-400';
    }
};

const renderPowerUpIcon = (id: PowerUpType, className = "w-6 h-6") => {
    const colorClass = getPowerUpColorClass(id);
    const fullClass = `${className} ${colorClass}`;
    switch (id) {
        case 'ELIMINATE': return <ScissorsIcon className={fullClass} />;
        case 'HINT': return <EyeIcon className={fullClass} />;
        case 'SKIP': return <ShuffleIcon className={fullClass} />;
        case 'SECOND_CHANCE': return <ShieldIcon className={fullClass} />;
        case 'DOUBLE_JEOPARDY': return <TargetIcon className={fullClass} />;
        default: return null;
    }
};

const ShopView: React.FC<ShopViewProps> = ({ auraPoints, inventory, onBuy, onExit }) => {
    const [confirmItem, setConfirmItem] = useState<{ id: PowerUpType; name: string; cost: number; icon: string } | null>(null);

    const handleConfirmBuy = () => {
        if (!confirmItem) return;
        onBuy(confirmItem.id, confirmItem.cost);
        setConfirmItem(null);
    };

    return (
        <div className="flex flex-col h-full animate-fadeIn relative">
            {/* Purchase Confirmation Modal */}
            {confirmItem && (
                <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
                    <div className="bg-surface border-4 border-highlight p-6 max-w-sm w-full shadow-card-hover animate-scaleIn text-center rounded-xl">
                        <div className="mb-4 animate-bounce flex items-center justify-center">
                            {renderPowerUpIcon(confirmItem.id, "w-16 h-16")}
                        </div>
                        <h2 className="text-xl font-bold text-text-main mb-2">Confirm Purchase</h2>
                        <p className="text-sm text-text-dim mb-6 flex items-center justify-center gap-1.5 flex-wrap">
                            Buy <span className="font-bold text-highlight">{confirmItem.name}</span> for{' '}
                            <span className="font-bold text-highlight flex items-center gap-1">{confirmItem.cost} Aura <AuraIcon className="w-4 h-4 text-highlight" /></span>?
                        </p>

                        <div className="flex gap-3">
                            <button
                                onClick={() => setConfirmItem(null)}
                                className="flex-1 bg-secondary text-primary font-bold py-2.5 border-b-4 border-secondary-hover hover:brightness-105 rounded-xl shadow-card press-effect transition-premium text-xs md:text-sm"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={handleConfirmBuy}
                                className="flex-1 bg-highlight text-white font-bold py-2.5 border-b-4 border-yellow-800 hover:brightness-110 rounded-xl shadow-card press-effect transition-premium text-xs md:text-sm"
                            >
                                Buy Item
                            </button>
                        </div>
                    </div>
                </div>
            )}

            <div className="flex flex-col md:flex-row justify-between items-center mb-4 md:mb-6 gap-3 md:gap-4">
                <div className="text-center md:text-left w-full md:w-auto flex flex-col md:flex-row md:items-center">
                    <div className="flex items-center justify-center md:justify-start">
                        <button onClick={onExit} className="text-text-dim hover:text-highlight mr-4 p-2 -ml-2 touch-target press-effect transition-premium">&larr; Back</button>
                        <h1 className="font-sans text-base md:text-lg bg-highlight text-text-light px-3 md:px-4 py-2 inline-block rounded-lg shadow-card">Item Shop</h1>
                    </div>
                    <p className="text-text-dim text-[10px] md:text-xs mt-1.5 md:mt-0 md:ml-4 whitespace-nowrap">Stock up for Boss Fights</p>
                </div>

                <div className="glass px-4 md:px-6 py-2 rounded-full border-2 border-secondary/30 text-center font-bold text-primary shadow-card text-sm md:text-base hover-lift flex items-center gap-1.5 justify-center">
                    <AuraIcon className="animate-gentleBounce text-primary w-4 h-4" />
                    <span>{auraPoints.toLocaleString()} Aura</span>
                </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3 md:gap-4 overflow-y-auto pb-4 scroll-smooth scrollbar-hide">
                {POWER_UPS.map((powerup, index) => {
                    const canAfford = auraPoints >= powerup.cost;
                    const quantity = inventory[powerup.id] || 0;

                    return (
                        <div
                            key={powerup.id}
                            className="bg-surface border-2 border-secondary/30 p-3 md:p-4 flex flex-col justify-between shadow-card hover:shadow-card-hover rounded-xl hover:border-highlight/50 active:border-highlight/50 transition-premium animate-fadeInScale"
                            style={{ animationDelay: `${index * 0.05}s` }}
                        >
                            <div className="flex items-start gap-3 md:gap-4 mb-3 md:mb-4">
                                <div className="bg-background/50 w-12 h-12 md:w-14 md:h-14 flex-shrink-0 flex items-center justify-center rounded-full border border-secondary/30 shadow-inner-soft">
                                    {renderPowerUpIcon(powerup.id, "w-6 h-6")}
                                </div>
                                <div className="text-left">
                                    <h3 className="font-bold text-text-main text-base md:text-lg">{powerup.name}</h3>
                                    <p className="text-[10px] md:text-xs text-text-dim leading-snug mt-1 min-h-[2em] md:min-h-[2.5em]">{powerup.description}</p>
                                </div>
                            </div>

                            <div className="flex items-center justify-between border-t border-secondary/20 pt-2 md:pt-3 mt-auto">
                                <p className="text-[10px] md:text-xs text-primary font-bold bg-primary/10 px-2.5 py-1 rounded-full">Owned: {quantity}</p>
                                <button
                                    onClick={() => setConfirmItem({ id: powerup.id, name: powerup.name, cost: powerup.cost, icon: powerup.icon })}
                                    disabled={!canAfford}
                                    className={`px-3 md:px-4 py-2 rounded-xl font-bold text-xs md:text-sm border-b-4 active:border-b-0 active:translate-y-1 transition-premium touch-target press-effect flex items-center gap-1.5 ${
                                        canAfford
                                        ? 'bg-highlight text-white border-highlight/70 hover:bg-highlight/90 active:bg-highlight/90 shadow-button hover:shadow-glow-highlight'
                                        : 'bg-text-dark/30 text-text-dark border-text-dark/50 cursor-not-allowed'
                                    }`}
                                >
                                    <span>{powerup.cost}</span>
                                    <AuraIcon className={`w-3.5 h-3.5 ${canAfford ? 'text-white' : 'text-text-dark'}`} />
                                </button>
                            </div>
                        </div>
                    );
                })}
            </div>
        </div>
    );
};

export default ShopView;