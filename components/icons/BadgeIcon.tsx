
import React from 'react';

const BadgeIcon: React.FC = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2} shapeRendering="crispEdges">
        {/* Central Shield */}
        <path strokeLinecap="round" strokeLinejoin="round" d="M12 21l-5-2.5V7l5-2.5 5 2.5v11.5L12 21z" />
        
        {/* Left Wing Feathers */}
        <path strokeLinecap="round" strokeLinejoin="round" d="M7 8L2 7M7 11L1 11M7 14L2 15" />
        
        {/* Right Wing Feathers */}
        <path strokeLinecap="round" strokeLinejoin="round" d="M17 8L22 7M17 11L23 11M17 14L22 15" />
        
        {/* Internal Shield Detail */}
        <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v4" />
    </svg>
);

export default BadgeIcon;
