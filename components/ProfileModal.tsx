
import React, { useState } from 'react';
import { User } from '../types';

interface ProfileModalProps {
    user: User;
    onClose: () => void;
    onUpdateUser: (updates: Partial<User>) => void;
    onLogout: () => void;
}

const PREMADE_AVATARS = [
    { id: 'aura', url: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Aura' },
    { id: 'seeker', url: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Seeker' },
    { id: 'sage', url: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Sage' },
    { id: 'guardian', url: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Guardian' },
    { id: 'scholar', url: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Scholar' },
    { id: 'wizard', url: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Wizard' },
];

const ProfileModal: React.FC<ProfileModalProps> = ({ user, onClose, onUpdateUser, onLogout }) => {
    const [name, setName] = useState(user.name);
    const [photoUrl, setPhotoUrl] = useState(user.photoUrl || PREMADE_AVATARS[0].url);
    const [isCopied, setIsCopied] = useState(false);

    const handleCopyId = () => {
        navigator.clipboard.writeText(user.uid);
        setIsCopied(true);
        setTimeout(() => setIsCopied(false), 2000);
    };

    const handleSave = () => {
        onUpdateUser({ name, photoUrl });
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
                        {photoUrl ? (
                            <img src={photoUrl} alt="Profile" className="w-full h-full object-cover" />
                        ) : (
                            <span className="text-4xl">👤</span>
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
                                onChange={(e) => setName(e.target.value)}
                                className="w-full bg-background border-2 border-secondary/30 rounded-lg px-4 py-2 text-sm focus:border-primary outline-none transition-colors"
                                placeholder="Enter seeker name..."
                            />
                        </div>

                        {/* Avatar Grid Selection */}
                        <div>
                            <label className="block text-[10px] text-text-dim uppercase font-bold mb-2 tracking-widest">Choose Avatar</label>
                            <div className="grid grid-cols-6 gap-2 bg-background/50 p-3 rounded-xl border border-secondary/30">
                                {PREMADE_AVATARS.map((avatar) => (
                                    <button
                                        key={avatar.id}
                                        onClick={() => setPhotoUrl(avatar.url)}
                                        className={`relative w-full aspect-square rounded-full border-2 transition-all hover:scale-110 active:scale-95 overflow-hidden ${photoUrl === avatar.url ? 'border-highlight bg-highlight/10 shadow-sm' : 'border-transparent bg-white grayscale-[50%] hover:grayscale-0'}`}
                                    >
                                        <img src={avatar.url} alt={avatar.id} className="w-full h-full object-cover" />
                                        {photoUrl === avatar.url && (
                                            <div className="absolute inset-0 bg-highlight/5 flex items-center justify-center">
                                                <div className="bg-highlight text-white text-[8px] rounded-full px-1">✓</div>
                                            </div>
                                        )}
                                    </button>
                                ))}
                            </div>
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
