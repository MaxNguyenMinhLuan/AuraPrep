import React from 'react';

interface AuraIconProps {
    className?: string;
}

const AuraIcon: React.FC<AuraIconProps> = ({ className = "h-4 w-4 inline-block align-middle" }) => (
    <svg xmlns="http://www.w3.org/2000/svg" className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2} shapeRendering="crispEdges">
        <path strokeLinecap="round" strokeLinejoin="round" d="M12 3 L4 11 L12 19 L20 11 Z M12 7 L8 11 L12 15 L16 11 Z" />
    </svg>
);

export default AuraIcon;
