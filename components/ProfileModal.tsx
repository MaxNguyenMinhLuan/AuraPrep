import React, { useState, useEffect } from 'react';
import { User } from '../types';

interface ProfileModalProps {
    user: User;
    onClose: () => void;
    onUpdateUser: (updates: Partial<User>) => void;
    onLogout: () => void;
}

const PROFANITY_REGEX = /\b(fuck|shit|bitch|asshole|cunt|dick|pussy|whore|slut|fag|nigger|nigga|retard)\b/i;

const containsProfanity = (text: string): boolean => {
    if (!text) return false;
    return PROFANITY_REGEX.test(text);
};

const ProfileModal: React.FC<ProfileModalProps> = ({ user, onClose, onUpdateUser, onLogout }) => {
    const [name, setName] = useState(user.name);
    const [photoUrl] = useState(user.photoUrl);
    const [isCopied, setIsCopied] = useState(false);
    const [modalImageError, setModalImageError] = useState(false);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        setModalImageError(false);
    }, [photoUrl]);

    const handleCopyId = () => {
        navigator.clipboard.writeText(user.uid);
        setIsCopied(true);
        setTimeout(() => setIsCopied(false), 2000);
    };

    const handleSave = () => {
        if (containsProfanity(name)) {
            setError("Name contains inappropriate language.");
            return;
        }
        setError(null);
        onUpdateUser({ name });
        onClose();
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fadeIn">
            <div className="bg-surface w-full max-w-md rounded-2xl shadow-2xl border-2 border-secondary overflow-hidden animate-reveal">
                <div className="bg-primary p-6 text-center relative">
                    <button 
                        onClick={onClose}
                        className="absolute top-4 right-4 text-white/70 hover:text-white transition-colors"
                    >
                        ✕
                    </button>
                    <div className="w-24 h-24 bg-white rounded-full mx-auto border-4 border-highlight shadow-lg flex items-center justify-center overflow-hidden mb-2">
                        {photoUrl && !modalImageError ? (
                            <img 
                                src={photoUrl} 
                                alt="Profile" 
                                className="w-full h-full object-cover" 
                                onError={() => setModalImageError(true)}
                            />
                        ) : (
                            <div className="w-full h-full bg-gradient-to-br from-primary/30 to-highlight/30 flex items-center justify-center font-bold text-primary text-xl uppercase select-none">
                                {name ? name.split(' ').map(n => n[0]).join('').slice(0, 2) : 'S'}
                            </div>
                        )}
                    </div>
                    <h2 className="text-white font-serif text-xl font-bold">Seeker Profile</h2>
                </div>

                <div className="p-6 space-y-6">
                    {/* User ID Section */}
                    <div className="bg-background/50 p-3 rounded-lg border border-secondary/50">
                        <p className="text-[10px] text-text-dim uppercase font-bold mb-1 tracking-widest">Academy ID</p>
                        <div className="flex items-center justify-between gap-2">
                            <code className="text-[10px] text-primary truncate bg-white px-2 py-1 rounded border border-secondary flex-1">
                                {user.uid}
                            </code>
                            <button 
                                onClick={handleCopyId}
                                className={`text-[10px] font-bold px-3 py-1 rounded transition-colors ${isCopied ? 'bg-success text-white' : 'bg-secondary text-primary hover:bg-secondary-hover'}`}
                            >
                                {isCopied ? 'COPIED!' : 'COPY'}
                            </button>
                        </div>
                    </div>

                    {/* Inputs */}
                    <div className="space-y-4">
                        <div>
                            <label className="block text-[10px] text-text-dim uppercase font-bold mb-1 tracking-widest">Display Name</label>
                            <input 
                                type="text" 
                                value={name}
                                onChange={(e) => { setName(e.target.value); setError(null); }}
                                className={`w-full bg-background border-2 rounded-lg px-4 py-2 text-sm outline-none transition-colors ${error ? 'border-accent focus:border-accent shadow-[0_0_10px_rgba(220,38,38,0.2)]' : 'border-secondary/30 focus:border-primary'}`}
                                placeholder="Enter seeker name..."
                            />
                            {error && <p className="text-accent text-xs font-bold mt-1 animate-shake">{error}</p>}
                        </div>
                    </div>

                    {/* Actions */}
                    <div className="pt-2 space-y-3">
                        <button 
                            onClick={handleSave}
                            className="w-full bg-highlight text-white font-bold py-3 rounded-xl border-b-4 border-yellow-800 hover:brightness-110 transition-all active:translate-y-1 active:border-b-0"
                        >
                            SAVE
                        </button>
                        <button 
                            onClick={onLogout}
                            className="w-full bg-background text-accent font-bold py-3 rounded-xl border-2 border-accent/20 hover:bg-accent/5 transition-colors"
                        >
                            LOGOUT
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ProfileModal;
