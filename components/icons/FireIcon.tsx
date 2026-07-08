import React from 'react';

interface FireIconProps {
    className?: string;
}

const FireIcon: React.FC<FireIconProps> = ({ className = "h-6 w-6 inline-block align-middle" }) => (
    <svg 
        xmlns="http://www.w3.org/2000/svg" 
        className={className} 
        viewBox="0 0 12 12" 
        shapeRendering="crispEdges"
        fill="currentColor"
    >
        {/* Red Pixels */}
        <g fill="#ff3b30">
            <rect x="5" y="1" width="1" height="1" />
            <rect x="4" y="2" width="2" height="1" />
            <rect x="7" y="2" width="1" height="1" />
            <rect x="3" y="3" width="1" height="1" />
            <rect x="6" y="3" width="3" height="1" />
            <rect x="2" y="4" width="1" height="1" />
            <rect x="8" y="4" width="2" height="1" />
            <rect x="1" y="5" width="2" height="1" />
            <rect x="9" y="5" width="2" height="1" />
            <rect x="1" y="6" width="1" height="1" />
            <rect x="10" y="6" width="1" height="1" />
            <rect x="0" y="7" width="2" height="1" />
            <rect x="10" y="7" width="2" height="1" />
            <rect x="0" y="8" width="1" height="1" />
            <rect x="11" y="8" width="1" height="1" />
            <rect x="0" y="9" width="2" height="1" />
            <rect x="10" y="9" width="2" height="1" />
            <rect x="1" y="10" width="3" height="1" />
            <rect x="8" y="10" width="3" height="1" />
            <rect x="3" y="11" width="6" height="1" />
        </g>
        {/* Orange Pixels */}
        <g fill="#ff9500">
            <rect x="4" y="3" width="2" height="1" />
            <rect x="3" y="4" width="1" height="1" />
            <rect x="6" y="4" width="2" height="1" />
            <rect x="3" y="5" width="1" height="1" />
            <rect x="8" y="5" width="1" height="1" />
            <rect x="2" y="6" width="2" height="1" />
            <rect x="8" y="6" width="2" height="1" />
            <rect x="2" y="7" width="3" height="1" />
            <rect x="7" y="7" width="3" height="1" />
            <rect x="1" y="8" width="10" height="1" />
            <rect x="2" y="9" width="8" height="1" />
            <rect x="4" y="10" width="4" height="1" />
        </g>
        {/* Yellow Pixels */}
        <g fill="#ffcc00">
            <rect x="4" y="4" width="2" height="1" />
            <rect x="4" y="5" width="4" height="1" />
            <rect x="4" y="6" width="4" height="1" />
            <rect x="5" y="7" width="2" height="1" />
        </g>
    </svg>
);

export default FireIcon;
