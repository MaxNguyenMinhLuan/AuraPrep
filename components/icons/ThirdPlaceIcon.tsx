import React from 'react';

interface ThirdPlaceIconProps {
    className?: string;
}

const ThirdPlaceIcon: React.FC<ThirdPlaceIconProps> = ({ className = "w-6 h-6" }) => (
    <svg xmlns="http://www.w3.org/2000/svg" className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2} shapeRendering="crispEdges">
        <path strokeLinecap="round" strokeLinejoin="round" d="M12 15a4.5 4.5 0 100-9 4.5 4.5 0 000 9z M8 2.5l2 4.5M16 2.5l-2 4.5" />
        <text x="10.5" y="13.5" fill="currentColor" fontSize="6.5" fontWeight="black" fontFamily="monospace">3</text>
    </svg>
);

export default ThirdPlaceIcon;
