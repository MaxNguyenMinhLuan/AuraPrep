import React from 'react';

interface FireIconProps {
    className?: string;
}

const FireIcon: React.FC<FireIconProps> = ({ className = "h-4 w-4 inline-block align-middle" }) => (
    <svg xmlns="http://www.w3.org/2000/svg" className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2} shapeRendering="crispEdges">
        <path strokeLinecap="round" strokeLinejoin="round" d="M12 2c0 0-4 4-4 8a4 4 0 008 0c0-4-4-8-4-8z M12 18a2 2 0 110-4 2 2 0 010 4z" />
    </svg>
);

export default FireIcon;
