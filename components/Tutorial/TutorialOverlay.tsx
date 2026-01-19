import React from 'react';

interface TutorialOverlayProps {
    targetId?: string;  // ID of element to spotlight (currently unused - no overlay)
    onClick?: () => void;
    children?: React.ReactNode;
}

const TutorialOverlay: React.FC<TutorialOverlayProps> = ({ targetId, onClick, children }) => {
    return (
        <div className="fixed inset-0 z-[50] pointer-events-none">
            {/* Just render children without any overlay or blocking */}
            <div className="relative z-10 pointer-events-auto">
                {children}
            </div>
        </div>
    );
};

export default TutorialOverlay;
