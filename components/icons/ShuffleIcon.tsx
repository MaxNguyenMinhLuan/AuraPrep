import React from 'react';

interface ShuffleIconProps {
    className?: string;
}

const ShuffleIcon: React.FC<ShuffleIconProps> = ({ className = "w-6 h-6" }) => (
    <svg xmlns="http://www.w3.org/2000/svg" className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2} shapeRendering="crispEdges">
        <path strokeLinecap="round" strokeLinejoin="round" d="M16 3h5v5 M4 20L21 3 M21 16v5h-5 M4 4l5 5M15 15l6 6" />
    </svg>
);

export default ShuffleIcon;
