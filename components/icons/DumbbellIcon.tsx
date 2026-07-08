import React from 'react';

interface DumbbellIconProps {
    className?: string;
}

const DumbbellIcon: React.FC<DumbbellIconProps> = ({ className = "h-6 w-6" }) => (
    <svg xmlns="http://www.w3.org/2000/svg" className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2} shapeRendering="crispEdges">
        <path strokeLinecap="round" strokeLinejoin="round" d="M6.5 6.5h3v11h-3z M14.5 6.5h3v11h-3z M9.5 12h5M3.5 9.5h3v5h-3z M17.5 9.5h3v5h-3z" />
    </svg>
);

export default DumbbellIcon;
