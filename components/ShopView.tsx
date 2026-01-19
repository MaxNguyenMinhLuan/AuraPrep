import React from 'react';
import { POWER_UPS } from '../constants';
import { PowerUpType } from '../types';

interface ShopViewProps {
    auraPoints: number;
    inventory: { [key in PowerUpType]?: number };
    onBuy: (type: PowerUpType, cost: number) => void;
    onExit: () => void;
}

const ShopView: React.FC<ShopViewProps> = ({ auraPoints, inventory, onBuy, onExit }) => {
    return (
        <div className="flex flex-col h-full animate-fadeIn">
            <div className="flex flex-col md:flex-row justify-between items-center mb-4 md:mb-6 gap-3 md:gap-4">
                <div className="text-center md:text-left w-full md:w-auto">
                     <button onClick={onExit} className="md:hidden text-text-dim hover:text-highlight float-left mr-4 p-2 -ml-2 touch-target press-effect transition-premium">&larr; Back</button>
                    <h1 className="font-serif text-xl md:text-2xl lg:text-3xl text-highlight leading-tight animate-slideDown">Item Shop</h1>
                    <p className="text-text-dim text-[10px] md:text-xs mt-1">Stock up for Boss Fights</p>
                </div>

                <div className="glass px-4 md:px-6 py-2 rounded-full border-2 border-secondary/30 text-center font-bold text-primary shadow-card text-sm md:text-base hover-lift">
                    <span className="animate-gentleBounce inline-block">💎</span> {auraPoints.toLocaleString()} Aura
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
                                <div className="text-2xl md:text-3xl bg-background/50 w-12 h-12 md:w-14 md:h-14 flex-shrink-0 flex items-center justify-center rounded-full border border-secondary/30 shadow-inner-soft">
                                    {powerup.icon}
                                </div>
                                <div className="text-left">
                                    <h3 className="font-bold text-text-main text-base md:text-lg">{powerup.name}</h3>
                                    <p className="text-[10px] md:text-xs text-text-dim leading-snug mt-1 min-h-[2em] md:min-h-[2.5em]">{powerup.description}</p>
                                </div>
                            </div>

                            <div className="flex items-center justify-between border-t border-secondary/20 pt-2 md:pt-3 mt-auto">
                                <p className="text-[10px] md:text-xs text-primary font-bold bg-primary/10 px-2.5 py-1 rounded-full">Owned: {quantity}</p>
                                <button
                                    onClick={() => onBuy(powerup.id, powerup.cost)}
                                    disabled={!canAfford}
                                    className={`px-3 md:px-4 py-2 rounded-xl font-bold text-xs md:text-sm border-b-4 active:border-b-0 active:translate-y-1 transition-premium touch-target press-effect ${
                                        canAfford
                                        ? 'bg-highlight text-white border-highlight/70 hover:bg-highlight/90 active:bg-highlight/90 shadow-button hover:shadow-glow-highlight'
                                        : 'bg-text-dark/30 text-text-dark border-text-dark/50 cursor-not-allowed'
                                    }`}
                                >
                                    {powerup.cost} 💎
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