import React from 'react';

interface LockIconProps {
    className?: string;
}

const LockIcon: React.FC<LockIconProps> = ({ className = "h-4 w-4" }) => (
    <svg xmlns="http://www.w3.org/2000/svg" className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2} shapeRendering="crispEdges">
        <rect x="5" y="11" width="14" height="10" rx="2" />
        <path strokeLinecap="round" strokeLinejoin="round" d="M8 11V7a4 4 0 018 0v4" />
    </svg>
);

export default LockIcon;
