import React from 'react';

interface FireIconProps {
    className?: string;
}

const FireIcon: React.FC<FireIconProps> = ({ className = "h-4 w-4 inline-block align-middle" }) => (
    <svg 
        xmlns="http://www.w3.org/2000/svg" 
        className={className} 
        viewBox="0 0 24 24" 
        fill="currentColor"
    >
        <defs>
            <linearGradient id="fireGradient" x1="0%" y1="100%" x2="0%" y2="0%">
                <stop offset="0%" stopColor="#ef4444" /> {/* red-500 */}
                <stop offset="40%" stopColor="#f97316" /> {/* orange-500 */}
                <stop offset="100%" stopColor="#fbbf24" /> {/* amber-400 */}
            </linearGradient>
        </defs>
        {/* Outer Flame */}
        <path 
            fill="url(#fireGradient)"
            d="M8.5 14.5A2.5 2.5 0 0 0 11 12c0-1.38-.5-2-1-3-1.072-2.143-.224-4.054 2-6 .5 2.5 2 4.9 4 6.5 2 1.6 3 3.5 3 5.5a7 7 0 1 1-14 0c0-1.153.433-2.294 1-3a2.5 2.5 0 0 0 2.5 2.5z" 
        />
        {/* Inner Flame (Yellow Core) */}
        <path 
            fill="#fef08a" 
            opacity={0.85}
            d="M12 17c.8 0 1.5-.7 1.5-1.5 0-.8-.3-1.2-.6-1.8-.6-1.2-.1-2.4 1.1-3.6.3 1.5 1.2 3 2 4 .6.6.9 1.2.9 2a3.5 3.5 0 1 1-7 0c0-.7.2-1.4.5-1.8.3-.3.8-.5 1.1-.3.3.2.5.5.5.8 0 .8.2 1.4.5 1.6.3.3.7.5 1 .5z" 
        />
    </svg>
);

export default FireIcon;
