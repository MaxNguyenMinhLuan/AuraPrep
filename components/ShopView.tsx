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
            <div className="flex flex-col lg:flex-row justify-between items-center mb-6 gap-4">
                <div className="text-center lg:text-left">
                     <button onClick={onExit} className="lg:hidden text-text-dim hover:text-highlight float-left mr-4">&larr; Back</button>
                    <h1 className="font-serif text-2xl lg:text-3xl text-highlight leading-tight">Item Shop</h1>
                    <p className="text-text-dim text-xs mt-1">Stock up for Boss Fights</p>
                </div>
                
                <div className="bg-white/80 backdrop-blur px-6 py-2 rounded-full border-2 border-secondary text-center font-bold text-primary shadow-sm">
                    💎 {auraPoints} Aura
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 overflow-y-auto pb-4">
                {POWER_UPS.map((powerup) => {
                    const canAfford = auraPoints >= powerup.cost;
                    const quantity = inventory[powerup.id] || 0;
                    
                    return (
                        <div key={powerup.id} className="bg-surface border-2 border-secondary p-4 flex flex-col justify-between shadow-md rounded-lg hover:border-highlight/50 transition-colors">
                            <div className="flex items-start gap-4 mb-4">
                                <div className="text-3xl bg-background/50 w-14 h-14 flex-shrink-0 flex items-center justify-center rounded-full border border-text-dark">
                                    {powerup.icon}
                                </div>
                                <div className="text-left">
                                    <h3 className="font-bold text-text-main text-lg">{powerup.name}</h3>
                                    <p className="text-xs text-text-dim leading-snug mt-1 min-h-[2.5em]">{powerup.description}</p>
                                </div>
                            </div>
                            
                            <div className="flex items-center justify-between border-t border-secondary/20 pt-3 mt-auto">
                                <p className="text-xs text-primary font-bold bg-primary/10 px-2 py-1 rounded">Owned: {quantity}</p>
                                <button
                                    onClick={() => onBuy(powerup.id, powerup.cost)}
                                    disabled={!canAfford}
                                    className={`px-4 py-2 rounded font-bold text-sm border-b-4 active:border-b-0 active:translate-y-1 transition-all ${
                                        canAfford 
                                        ? 'bg-highlight text-white border-highlight/70 hover:bg-highlight/90' 
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