import React, { useEffect, useState } from 'react';
import { User, FriendRequest, PublicProfile } from '../types';
import {
    sendFriendRequest,
    getIncomingRequests,
    getOutgoingRequests,
    acceptFriendRequest,
    rejectFriendRequest,
    cancelFriendRequest,
    getFriendsList
} from '../services/friendsService';
import UserPlusIcon from './icons/UserPlusIcon';

interface AddFriendModalProps {
    user: User;
    onClose: () => void;
    onRequestsChanged: () => void;
}

type Tab = 'add' | 'requests' | 'friends';

const Avatar: React.FC<{ name: string; photoUrl?: string; size?: string }> = ({ name, photoUrl, size = 'w-9 h-9' }) => (
    <div className={`${size} rounded-full border-2 border-secondary/50 bg-white overflow-hidden flex items-center justify-center shrink-0`}>
        {photoUrl ? (
            <img src={photoUrl} alt={name} className="w-full h-full object-cover" />
        ) : (
            <div className="w-full h-full bg-gradient-to-br from-primary/30 to-highlight/30 flex items-center justify-center font-bold text-primary text-xs uppercase select-none">
                {name ? name.split(' ').map(n => n[0]).join('').slice(0, 2) : '?'}
            </div>
        )}
    </div>
);

const AddFriendModal: React.FC<AddFriendModalProps> = ({ user, onClose, onRequestsChanged }) => {
    const [tab, setTab] = useState<Tab>('add');
    const [academyId, setAcademyId] = useState('');
    const [isSending, setIsSending] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [toast, setToast] = useState<string | null>(null);
    const [isCopied, setIsCopied] = useState(false);

    const [incoming, setIncoming] = useState<FriendRequest[]>([]);
    const [outgoing, setOutgoing] = useState<FriendRequest[]>([]);
    const [friends, setFriends] = useState<PublicProfile[]>([]);
    const [isLoadingLists, setIsLoadingLists] = useState(true);
    const [busyId, setBusyId] = useState<string | null>(null);

    const showToast = (message: string) => {
        setToast(message);
        setTimeout(() => setToast(null), 3000);
    };

    const refreshLists = async () => {
        setIsLoadingLists(true);
        try {
            const [inc, out, fr] = await Promise.all([
                getIncomingRequests(user.uid),
                getOutgoingRequests(user.uid),
                getFriendsList(user.uid)
            ]);
            setIncoming(inc);
            setOutgoing(out);
            setFriends(fr);
        } catch (e) {
            console.error('[AddFriendModal] Failed to load requests/friends:', e);
        } finally {
            setIsLoadingLists(false);
        }
    };

    useEffect(() => {
        refreshLists();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    const handleCopyId = () => {
        navigator.clipboard.writeText(user.uid);
        setIsCopied(true);
        setTimeout(() => setIsCopied(false), 2000);
    };

    const handleSend = async () => {
        setError(null);
        setIsSending(true);
        try {
            await sendFriendRequest(user, academyId);
            setAcademyId('');
            showToast('Friend request sent!');
            await refreshLists();
            onRequestsChanged();
        } catch (e: any) {
            setError(e?.message || 'Something went wrong sending that request.');
        } finally {
            setIsSending(false);
        }
    };

    const handleAccept = async (request: FriendRequest) => {
        setBusyId(request.id);
        try {
            await acceptFriendRequest(request);
            showToast(`You and ${request.fromName} are now friends!`);
            await refreshLists();
            onRequestsChanged();
        } catch (e) {
            console.error('[AddFriendModal] Accept failed:', e);
            showToast('Could not accept — try again.');
        } finally {
            setBusyId(null);
        }
    };

    const handleReject = async (request: FriendRequest) => {
        setBusyId(request.id);
        try {
            await rejectFriendRequest(request.id);
            await refreshLists();
            onRequestsChanged();
        } catch (e) {
            console.error('[AddFriendModal] Reject failed:', e);
            showToast('Could not reject — try again.');
        } finally {
            setBusyId(null);
        }
    };

    const handleCancel = async (request: FriendRequest) => {
        setBusyId(request.id);
        try {
            await cancelFriendRequest(request.id);
            await refreshLists();
        } catch (e) {
            console.error('[AddFriendModal] Cancel failed:', e);
        } finally {
            setBusyId(null);
        }
    };

    const tabs: { key: Tab; label: string; badge?: number }[] = [
        { key: 'add', label: 'Add' },
        { key: 'requests', label: 'Requests', badge: incoming.length },
        { key: 'friends', label: 'Friends', badge: friends.length || undefined }
    ];

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fadeIn">
            <div className="bg-surface w-full max-w-md rounded-2xl shadow-2xl border-2 border-secondary overflow-hidden animate-reveal max-h-[85vh] flex flex-col">
                <div className="bg-primary p-6 text-center relative shrink-0">
                    <button
                        onClick={onClose}
                        className="absolute top-4 right-4 text-white/70 hover:text-white transition-colors"
                    >
                        ✕
                    </button>
                    <div className="w-16 h-16 bg-white rounded-full mx-auto border-4 border-highlight shadow-lg flex items-center justify-center mb-2">
                        <UserPlusIcon className="h-8 w-8 text-primary" />
                    </div>
                    <h2 className="text-white font-serif text-xl font-bold">Add Friend</h2>
                </div>

                {/* Tabs */}
                <div className="flex border-b-2 border-secondary/20 shrink-0">
                    {tabs.map(t => (
                        <button
                            key={t.key}
                            onClick={() => setTab(t.key)}
                            className={`flex-1 py-3 text-[10px] font-bold uppercase tracking-widest transition-colors relative ${tab === t.key ? 'text-primary bg-primary/5 border-b-2 border-primary' : 'text-text-dim hover:text-text-main'}`}
                        >
                            {t.label}
                            {!!t.badge && (
                                <span className="ml-1.5 inline-flex items-center justify-center min-w-[16px] h-4 px-1 rounded-full bg-highlight text-white text-[9px] font-bold align-middle">
                                    {t.badge}
                                </span>
                            )}
                        </button>
                    ))}
                </div>

                <div className="p-6 space-y-6 overflow-y-auto">
                    {tab === 'add' && (
                        <>
                            <div className="bg-background/50 p-3 rounded-lg border border-secondary/50">
                                <p className="text-[10px] text-text-dim uppercase font-bold mb-1 tracking-widest">Your Academy ID</p>
                                <div className="flex items-center justify-between gap-2">
                                    <code className="text-[10px] text-primary truncate bg-white px-2 py-1 rounded border border-secondary flex-1">
                                        {user.uid}
                                    </code>
                                    <button
                                        onClick={handleCopyId}
                                        className={`text-[10px] font-bold px-3 py-1 rounded transition-colors shrink-0 ${isCopied ? 'bg-success text-white' : 'bg-secondary text-primary hover:bg-secondary-hover'}`}
                                    >
                                        {isCopied ? 'COPIED!' : 'COPY'}
                                    </button>
                                </div>
                                <p className="text-[9px] text-text-dim mt-2 leading-tight">Share this with a friend so they can add you.</p>
                            </div>

                            <div>
                                <label className="block text-[10px] text-text-dim uppercase font-bold mb-1 tracking-widest">Their Academy ID</label>
                                <input
                                    type="text"
                                    value={academyId}
                                    onChange={(e) => { setAcademyId(e.target.value); setError(null); }}
                                    className={`w-full bg-background border-2 rounded-lg px-4 py-2 text-sm outline-none transition-colors ${error ? 'border-accent focus:border-accent shadow-[0_0_10px_rgba(220,38,38,0.2)]' : 'border-secondary/30 focus:border-primary'}`}
                                    placeholder="Paste an Academy ID..."
                                />
                                {error && <p className="text-accent text-xs font-bold mt-1 animate-shake">{error}</p>}
                            </div>

                            <button
                                onClick={handleSend}
                                disabled={isSending || !academyId.trim()}
                                className="w-full bg-highlight text-white font-bold py-3 rounded-xl border-b-4 border-yellow-800 hover:brightness-110 transition-all active:translate-y-1 active:border-b-0 disabled:opacity-50 disabled:cursor-not-allowed disabled:active:translate-y-0 disabled:active:border-b-4"
                            >
                                {isSending ? 'SENDING...' : 'SEND REQUEST'}
                            </button>

                            {outgoing.length > 0 && (
                                <div>
                                    <p className="text-[10px] text-text-dim uppercase font-bold mb-2 tracking-widest">Pending — Sent by You</p>
                                    <div className="space-y-2">
                                        {outgoing.map(r => (
                                            <div key={r.id} className="flex items-center justify-between gap-2 bg-background/50 p-2 rounded-lg border border-secondary/30">
                                                <span className="text-[10px] font-bold text-text-main truncate flex-1">{r.toUid}</span>
                                                <button
                                                    onClick={() => handleCancel(r)}
                                                    disabled={busyId === r.id}
                                                    className="text-[9px] font-bold text-accent uppercase px-2 py-1 rounded hover:bg-accent/10 transition-colors disabled:opacity-50"
                                                >
                                                    Cancel
                                                </button>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}
                        </>
                    )}

                    {tab === 'requests' && (
                        isLoadingLists ? (
                            <p className="text-center text-text-dim text-xs py-6">Loading requests...</p>
                        ) : incoming.length === 0 ? (
                            <p className="text-center text-text-dim text-xs py-6">No pending requests right now.</p>
                        ) : (
                            <div className="space-y-3">
                                {incoming.map(r => (
                                    <div key={r.id} className="flex items-center gap-3 bg-background/50 p-3 rounded-lg border border-secondary/30">
                                        <Avatar name={r.fromName} photoUrl={r.fromPhotoUrl} />
                                        <span className="text-[11px] font-bold text-text-main flex-1 truncate">{r.fromName}</span>
                                        <button
                                            onClick={() => handleAccept(r)}
                                            disabled={busyId === r.id}
                                            className="w-8 h-8 rounded-full bg-success text-white flex items-center justify-center font-bold hover:brightness-110 transition-all active:scale-95 disabled:opacity-50"
                                            aria-label="Accept"
                                        >
                                            ✓
                                        </button>
                                        <button
                                            onClick={() => handleReject(r)}
                                            disabled={busyId === r.id}
                                            className="w-8 h-8 rounded-full bg-accent text-white flex items-center justify-center font-bold hover:brightness-110 transition-all active:scale-95 disabled:opacity-50"
                                            aria-label="Reject"
                                        >
                                            ✕
                                        </button>
                                    </div>
                                ))}
                            </div>
                        )
                    )}

                    {tab === 'friends' && (
                        isLoadingLists ? (
                            <p className="text-center text-text-dim text-xs py-6">Loading friends...</p>
                        ) : friends.length === 0 ? (
                            <p className="text-center text-text-dim text-xs py-6">No friends yet — add one with their Academy ID!</p>
                        ) : (
                            <div className="space-y-2">
                                {friends.map(f => (
                                    <div key={f.uid} className="flex items-center gap-3 bg-background/50 p-3 rounded-lg border border-secondary/30">
                                        <Avatar name={f.name} photoUrl={f.photoUrl} />
                                        <span className="text-[11px] font-bold text-text-main truncate">{f.name}</span>
                                    </div>
                                ))}
                            </div>
                        )
                    )}
                </div>

                {toast && (
                    <div className="absolute bottom-4 left-1/2 -translate-x-1/2 bg-surface border-2 border-highlight px-5 py-2 rounded-full shadow-2xl animate-bounce">
                        <p className="text-[10px] font-bold text-highlight uppercase tracking-widest">{toast}</p>
                    </div>
                )}
            </div>
        </div>
    );
};

export default AddFriendModal;
