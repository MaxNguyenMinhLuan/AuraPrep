import React from 'react';

interface EyeIconProps {
    className?: string;
}

const EyeIcon: React.FC<EyeIconProps> = ({ className = "w-6 h-6" }) => (
    <svg xmlns="http://www.w3.org/2000/svg" className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2} shapeRendering="crispEdges">
        <path strokeLinecap="round" strokeLinejoin="round" d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
        <circle cx="12" cy="12" r="3" stroke="currentColor" strokeWidth={2} />
    </svg>
);

export default EyeIcon;
