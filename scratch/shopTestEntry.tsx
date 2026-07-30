// Dev-only harness: mounts ShopView with mock props so Buy buttons / the
// purchase confirmation modal can be tested without auth. Served at
// /shop-test.html. auraPoints is set to 180 so some items are affordable
// (ELIMINATE 100, SKIP 75, SECOND_CHANCE 50) and some are not
// (HINT 150, DOUBLE_JEOPARDY 200), exercising both button states.
import React, { useState } from 'react';
import ReactDOM from 'react-dom/client';
import ShopView from '../components/ShopView';
import { PowerUpType } from '../types';

const Harness: React.FC = () => {
    const [auraPoints, setAuraPoints] = useState(180);
    const [inventory, setInventory] = useState<{ [key in PowerUpType]?: number }>({
        ELIMINATE: 2,
        HINT: 0,
        SKIP: 3,
        SECOND_CHANCE: 1,
        DOUBLE_JEOPARDY: 0,
    });

    const handleBuy = (type: PowerUpType, cost: number) => {
        setAuraPoints(a => a - cost);
        setInventory(inv => ({ ...inv, [type]: (inv[type] || 0) + 1 }));
    };

    return (
        <div className="min-h-screen bg-background p-4">
            <ShopView
                auraPoints={auraPoints}
                inventory={inventory}
                onBuy={handleBuy}
                onExit={() => {}}
            />
        </div>
    );
};

ReactDOM.createRoot(document.getElementById('root')!).render(<Harness />);
