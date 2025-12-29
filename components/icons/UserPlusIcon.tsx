
import React from 'react';

const UserPlusIcon: React.FC<{ className?: string }> = ({ className = "h-5 w-5" }) => (
    <svg 
        xmlns="http://www.w3.org/2000/svg" 
        className={className} 
        fill="none" 
        viewBox="0 0 24 24" 
        stroke="currentColor" 
        strokeWidth={2} 
        shapeRendering="crispEdges"
    >
        {/* Person Silhouette */}
        <path strokeLinecap="round" strokeLinejoin="round" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
        {/* Plus Sign */}
        <path strokeLinecap="round" strokeLinejoin="round" d="M19 8v3m0 0v3m0-3h3m-3 0h-3" />
    </svg>
);

export default UserPlusIcon;
