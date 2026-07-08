import React from 'react';

interface HandshakeIconProps {
    className?: string;
}

const HandshakeIcon: React.FC<HandshakeIconProps> = ({ className = "h-5 w-5" }) => (
    <svg xmlns="http://www.w3.org/2000/svg" className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2} shapeRendering="crispEdges">
        <path strokeLinecap="round" strokeLinejoin="round" d="M12 11c1.5-1.5 3-1.5 4.5 0M7.5 11c1.5 1.5 3 1.5 4.5 0M4 15h16M6 9h12" />
    </svg>
);

export default HandshakeIcon;
