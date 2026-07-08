import React from 'react';

interface ScissorsIconProps {
    className?: string;
}

const ScissorsIcon: React.FC<ScissorsIconProps> = ({ className = "w-6 h-6" }) => (
    <svg xmlns="http://www.w3.org/2000/svg" className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2} shapeRendering="crispEdges">
        <circle cx="6" cy="6" r="3" />
        <circle cx="6" cy="18" r="3" />
        <path strokeLinecap="round" strokeLinejoin="round" d="M9 8l9 10 M9 16l9-10" />
    </svg>
);

export default ScissorsIcon;
