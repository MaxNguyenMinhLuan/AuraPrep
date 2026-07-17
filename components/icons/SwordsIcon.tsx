import React from 'react';

interface SwordsIconProps {
    className?: string;
}

const SwordsIcon: React.FC<SwordsIconProps> = ({ className = "h-6 w-6" }) => (
    <svg xmlns="http://www.w3.org/2000/svg" className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2} shapeRendering="crispEdges">
        <path strokeLinecap="round" strokeLinejoin="round" d="M 3,21 21,3 M 15,3 21,3 21,9" />
        <path strokeLinecap="round" strokeLinejoin="round" d="M 3,3 21,21 M 3,15 3,21 9,21" />
    </svg>
);

export default SwordsIcon;