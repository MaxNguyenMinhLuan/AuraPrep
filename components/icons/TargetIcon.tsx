import React from 'react';

interface TargetIconProps {
    className?: string;
}

const TargetIcon: React.FC<TargetIconProps> = ({ className = "w-6 h-6" }) => (
    <svg xmlns="http://www.w3.org/2000/svg" className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2} shapeRendering="crispEdges">
        <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth={2} />
        <circle cx="12" cy="12" r="6" stroke="currentColor" strokeWidth={2} />
        <circle cx="12" cy="12" r="2" stroke="currentColor" strokeWidth={2} />
    </svg>
);

export default TargetIcon;
