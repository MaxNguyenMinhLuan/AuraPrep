import React, { useEffect, useState } from 'react';

interface TutorialOverlayProps {
    targetId?: string;  // ID of element to spotlight
    onClick?: () => void;
    children?: React.ReactNode;
}

const TutorialOverlay: React.FC<TutorialOverlayProps> = ({ targetId, onClick, children }) => {
    const [targetRect, setTargetRect] = useState<DOMRect | null>(null);

    useEffect(() => {
        if (targetId) {
            const element = document.getElementById(targetId);
            if (element) {
                const rect = element.getBoundingClientRect();
                setTargetRect(rect);

                // Update on window resize
                const handleResize = () => {
                    const newRect = element.getBoundingClientRect();
                    setTargetRect(newRect);
                };
                window.addEventListener('resize', handleResize);
                return () => window.removeEventListener('resize', handleResize);
            }
        }
    }, [targetId]);

    return (
        <div
            className="fixed inset-0 z-50 pointer-events-none"
            onClick={onClick}
        >
            {/* Dark overlay with spotlight cutout */}
            <svg className="absolute inset-0 w-full h-full pointer-events-auto">
                <defs>
                    <mask id="spotlight-mask">
                        <rect x="0" y="0" width="100%" height="100%" fill="white" />
                        {targetRect && (
                            <rect
                                x={targetRect.x - 8}
                                y={targetRect.y - 8}
                                width={targetRect.width + 16}
                                height={targetRect.height + 16}
                                rx="12"
                                fill="black"
                            />
                        )}
                    </mask>
                </defs>
                <rect
                    x="0"
                    y="0"
                    width="100%"
                    height="100%"
                    fill="rgba(0, 0, 0, 0.7)"
                    mask="url(#spotlight-mask)"
                />
            </svg>

            {/* Pulsing glow effect on target */}
            {targetRect && (
                <div
                    className="absolute animate-pulse"
                    style={{
                        left: targetRect.x - 12,
                        top: targetRect.y - 12,
                        width: targetRect.width + 24,
                        height: targetRect.height + 24,
                        boxShadow: '0 0 0 4px rgba(202, 138, 4, 0.5), 0 0 20px rgba(202, 138, 4, 0.3)',
                        borderRadius: '12px',
                        pointerEvents: 'none'
                    }}
                />
            )}

            {/* Children content */}
            <div className="relative z-10 pointer-events-auto">
                {children}
            </div>
        </div>
    );
};

export default TutorialOverlay;
