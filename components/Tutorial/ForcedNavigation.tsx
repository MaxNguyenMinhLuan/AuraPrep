/**
 * ForcedNavigation Component
 *
 * Handles tutorial phases that require the user to take specific actions.
 * Shows spotlight on target elements and blocks interaction with other parts of the UI.
 *
 * KEY: Uses CSS pointer-events to allow clicking ONLY the target element.
 */

import React, { useEffect, useState } from 'react';
import { TutorialPhase, View } from '../../types';

interface ForcedNavigationProps {
    phase: TutorialPhase;
    targetId?: string;           // Element to spotlight (desktop ID - mobile version auto-detected)
    message: string;             // Message to display
    subMessage?: string;         // Optional secondary message
    buttonText?: string;         // Optional button text (if button needed)
    onAction?: () => void;       // Callback when action is taken
    showArrow?: boolean;         // Show pointing arrow to target
    arrowPosition?: 'top' | 'bottom' | 'left' | 'right';
}

const ForcedNavigation: React.FC<ForcedNavigationProps> = ({
    phase,
    targetId,
    message,
    subMessage,
    buttonText,
    onAction,
    showArrow = false,
    arrowPosition = 'top'
}) => {
    const [targetRect, setTargetRect] = useState<DOMRect | null>(null);
    const [activeTargetId, setActiveTargetId] = useState<string | null>(null);

    useEffect(() => {
        const updateTargetRect = () => {
            if (targetId) {
                // Try mobile ID first (for smaller screens), then desktop
                const mobileId = `${targetId}-mobile`;
                let element = document.getElementById(mobileId);
                let usedId = mobileId;

                // Check if mobile element exists AND is visible
                if (element) {
                    const rect = element.getBoundingClientRect();
                    if (rect.width === 0 || rect.height === 0) {
                        // Mobile element hidden (lg+ screen), try desktop
                        element = document.getElementById(targetId);
                        usedId = targetId;
                    }
                } else {
                    // No mobile element, use desktop
                    element = document.getElementById(targetId);
                    usedId = targetId;
                }

                if (element) {
                    const rect = element.getBoundingClientRect();
                    setTargetRect(rect);
                    setActiveTargetId(usedId);

                    // CRITICAL: Make the target element clickable above the overlay (z-index 95)
                    // Need to ensure the element AND its parent containers can display above the overlay
                    element.style.position = 'relative';
                    element.style.zIndex = '200';
                    element.style.pointerEvents = 'auto';

                    // Also need to elevate parent nav container above the overlay
                    const navParent = element.closest('nav');
                    if (navParent) {
                        (navParent as HTMLElement).style.zIndex = '150';
                    }
                }
            }
        };

        // Initial update
        updateTargetRect();

        // Update on resize/scroll
        window.addEventListener('resize', updateTargetRect);
        window.addEventListener('scroll', updateTargetRect);

        // Poll for element (in case it's not rendered yet)
        const interval = setInterval(updateTargetRect, 100);

        return () => {
            window.removeEventListener('resize', updateTargetRect);
            window.removeEventListener('scroll', updateTargetRect);
            clearInterval(interval);

            // Clean up: Reset the target element's styles for both mobile and desktop versions
            if (targetId) {
                const mobileId = `${targetId}-mobile`;
                [targetId, mobileId].forEach(id => {
                    const element = document.getElementById(id);
                    if (element) {
                        element.style.position = '';
                        element.style.zIndex = '';
                        element.style.pointerEvents = '';

                        // Reset parent nav z-index
                        const navParent = element.closest('nav');
                        if (navParent) {
                            (navParent as HTMLElement).style.zIndex = '';
                        }
                    }
                });
            }
        };
    }, [targetId]);

    // Determine if we're on desktop (sidebar) or mobile (bottom bar)
    const isDesktop = targetRect && targetRect.x < 300 && targetRect.y > 100;

    // Calculate arrow position - for desktop sidebar, arrow should point from the right
    const getArrowStyle = (): React.CSSProperties => {
        if (!targetRect || !showArrow) return {};

        const arrowSize = 30;
        const offset = 10;

        // For desktop sidebar navigation, always point from the right
        if (isDesktop) {
            return {
                left: targetRect.x + targetRect.width + offset,
                top: targetRect.y + targetRect.height / 2 - arrowSize / 2,
                transform: 'rotate(90deg)'
            };
        }

        switch (arrowPosition) {
            case 'top':
                return {
                    left: targetRect.x + targetRect.width / 2 - arrowSize / 2,
                    top: targetRect.y - offset - arrowSize,
                };
            case 'bottom':
                return {
                    left: targetRect.x + targetRect.width / 2 - arrowSize / 2,
                    top: targetRect.y + targetRect.height + offset,
                    transform: 'rotate(180deg)'
                };
            case 'left':
                return {
                    left: targetRect.x - offset - arrowSize,
                    top: targetRect.y + targetRect.height / 2 - arrowSize / 2,
                    transform: 'rotate(-90deg)'
                };
            case 'right':
                return {
                    left: targetRect.x + targetRect.width + offset,
                    top: targetRect.y + targetRect.height / 2 - arrowSize / 2,
                    transform: 'rotate(90deg)'
                };
            default:
                return {};
        }
    };

    // Calculate message box position (avoid overlapping target)
    const getMessageStyle = (): React.CSSProperties => {
        if (!targetRect) {
            return {
                top: '50%',
                left: '50%',
                transform: 'translate(-50%, -50%)'
            };
        }

        // For desktop sidebar, position message to the right of the sidebar
        if (isDesktop) {
            return {
                top: targetRect.y,
                left: targetRect.x + targetRect.width + 60,
                transform: 'translateY(-25%)'
            };
        }

        // For mobile bottom bar, position message above the target
        const screenHeight = window.innerHeight;
        const targetCenter = targetRect.y + targetRect.height / 2;

        if (targetCenter > screenHeight / 2) {
            // Target is in bottom half (mobile nav), show message above
            return {
                top: '30%',
                left: '50%',
                transform: 'translate(-50%, -50%)'
            };
        }

        return {
            top: '50%',
            left: '50%',
            transform: 'translate(-50%, -25%)'
        };
    };

    return (
        <>
            {/* Full screen blocking overlay - blocks ALL clicks except target */}
            <div
                className="fixed inset-0 z-[95] pointer-events-none"
            >
                {/* Dark overlay with spotlight cutout using CSS clip-path */}
                <div
                    className="absolute inset-0 bg-black/80 transition-all duration-300"
                    style={{
                        pointerEvents: 'auto',
                        ...( targetRect ? {
                            clipPath: `polygon(
                                0% 0%,
                                0% 100%,
                                ${targetRect.x - 12}px 100%,
                                ${targetRect.x - 12}px ${targetRect.y - 12}px,
                                ${targetRect.x + targetRect.width + 12}px ${targetRect.y - 12}px,
                                ${targetRect.x + targetRect.width + 12}px ${targetRect.y + targetRect.height + 12}px,
                                ${targetRect.x - 12}px ${targetRect.y + targetRect.height + 12}px,
                                ${targetRect.x - 12}px 100%,
                                100% 100%,
                                100% 0%
                            )`
                        } : {})
                    }}
                    onClick={(e) => e.stopPropagation()}
                />
            </div>

            {/* Pulsing glow ring around target (visual only, no blocking) */}
            {targetRect && (
                <div
                    className="fixed z-[96] pointer-events-none"
                    style={{
                        left: targetRect.x - 16,
                        top: targetRect.y - 16,
                        width: targetRect.width + 32,
                        height: targetRect.height + 32,
                    }}
                >
                    <div
                        className="w-full h-full rounded-2xl animate-pulse"
                        style={{
                            boxShadow: '0 0 0 4px rgba(202, 138, 4, 0.8), 0 0 40px 10px rgba(202, 138, 4, 0.5), 0 0 80px 20px rgba(202, 138, 4, 0.3)',
                        }}
                    />
                </div>
            )}

            {/* Pointing arrow */}
            {showArrow && targetRect && (
                <div
                    className="fixed z-[96] text-highlight pointer-events-none"
                    style={getArrowStyle()}
                >
                    <div className="animate-bounce">
                        <svg width="30" height="30" viewBox="0 0 24 24" fill="currentColor">
                            <path d="M12 2L6 8h4v6h4V8h4L12 2z" />
                        </svg>
                    </div>
                </div>
            )}

            {/* Message box - high z-index to be above overlay */}
            <div
                className="fixed z-[97] max-w-sm w-full px-4 pointer-events-none"
                style={getMessageStyle()}
            >
                <div className="bg-surface border-4 border-highlight rounded-xl shadow-2xl p-5 animate-scaleIn pointer-events-auto">
                    {/* Pikachu icon */}
                    <div className="flex justify-center mb-3">
                        <div className="text-4xl">⚡</div>
                    </div>

                    {/* Speech bubble */}
                    <div className="bg-white border-2 border-secondary rounded-lg p-4 mb-4">
                        <p className="text-text-main text-sm leading-relaxed font-medium">
                            {message}
                        </p>
                        {subMessage && (
                            <p className="text-text-dim text-xs mt-2 leading-relaxed">
                                {subMessage}
                            </p>
                        )}
                    </div>

                    {/* Action button (if provided) */}
                    {buttonText && onAction && (
                        <button
                            onClick={onAction}
                            className="w-full bg-highlight hover:brightness-110 text-white font-bold py-3 px-6 rounded-lg border-b-4 border-yellow-800 active:border-b-2 active:translate-y-0.5 transition-all shadow-lg"
                        >
                            {buttonText}
                        </button>
                    )}
                </div>
            </div>
        </>
    );
};

export default ForcedNavigation;
