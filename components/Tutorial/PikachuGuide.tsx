import React from 'react';

interface PikachuGuideProps {
    message: string;
    onNext?: () => void;
    buttonText?: string;
    position?: 'center' | 'bottom' | 'top';
    showPikachu?: boolean;
}

const PikachuGuide: React.FC<PikachuGuideProps> = ({
    message,
    onNext,
    buttonText = "Continue",
    position = 'center',
    showPikachu = true
}) => {
    const positionClasses = {
        center: 'items-center justify-center',
        bottom: 'items-end justify-center pb-32',
        top: 'items-start justify-center pt-20'
    };

    return (
        <div className={`fixed inset-0 z-[50] flex ${positionClasses[position]} p-4 animate-fadeIn pointer-events-none`}>
            <div className="bg-surface border-4 border-highlight rounded-xl shadow-2xl max-w-md w-full p-6 animate-reveal pointer-events-auto">
                {showPikachu && (
                    <div className="flex justify-center mb-4">
                        {/* Pikachu sprite placeholder - using emoji for now */}
                        <div className="text-6xl animate-bounce">⚡</div>
                    </div>
                )}

                <div className="bg-white border-2 border-secondary rounded-lg p-4 mb-6 relative">
                    {/* Speech bubble tail */}
                    <div className="absolute -top-3 left-1/2 -translate-x-1/2 w-0 h-0 border-l-[12px] border-l-transparent border-r-[12px] border-r-transparent border-b-[12px] border-b-white"></div>
                    <div className="absolute -top-[14px] left-1/2 -translate-x-1/2 w-0 h-0 border-l-[14px] border-l-transparent border-r-[14px] border-r-transparent border-b-[14px] border-b-secondary"></div>

                    <p className="text-text-main text-sm leading-relaxed whitespace-pre-line">
                        {message}
                    </p>
                </div>

                {onNext && (
                    <button
                        onClick={onNext}
                        className="w-full bg-highlight hover:bg-highlight/90 text-white font-bold py-3 px-6 rounded-lg border-b-4 border-yellow-800 active:border-b-2 active:translate-y-0.5 transition-all shadow-lg animate-pulse"
                    >
                        {buttonText}
                    </button>
                )}
            </div>
        </div>
    );
};

export default PikachuGuide;
