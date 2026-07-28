import { User, PublicProfile, FriendRequest, FriendRequestStatus } from '../types';
import { db } from './firebase';
import {
    doc,
    getDoc,
    setDoc,
    updateDoc,
    deleteDoc,
    collection,
    query,
    where,
    getDocs,
    addDoc,
    arrayUnion
} from 'firebase/firestore';

/**
 * Keep the public directory doc (`users/{uid}`) in sync with the user's
 * current name/photo, so anyone looking them up by Academy ID sees fresh
 * info. Safe to call on every login.
 */
export async function ensurePublicProfile(user: User): Promise<void> {
    const docRef = doc(db, 'users', user.uid);
    await setDoc(docRef, {
        uid: user.uid,
        name: user.name,
        photoUrl: user.photoUrl ?? null,
        updatedAt: new Date().toISOString()
    }, { merge: true });
}

export async function lookupPublicProfile(uid: string): Promise<PublicProfile | null> {
    const docRef = doc(db, 'users', uid);
    const snap = await getDoc(docRef);
    if (!snap.exists()) return null;
    const data = snap.data();
    return { uid: snap.id, name: data.name, photoUrl: data.photoUrl ?? undefined };
}

function toFriendRequest(id: string, data: any): FriendRequest {
    return {
        id,
        fromUid: data.fromUid,
        fromName: data.fromName,
        fromPhotoUrl: data.fromPhotoUrl ?? undefined,
        toUid: data.toUid,
        status: data.status,
        createdAt: data.createdAt,
        updatedAt: data.updatedAt,
        senderAcked: !!data.senderAcked
    };
}

async function findPendingRequestBetween(uidA: string, uidB: string): Promise<FriendRequest | null> {
    // Firestore rules only let a user read requests where they're the
    // fromUid or toUid, so this needs one query per direction.
    const requestsRef = collection(db, 'friendRequests');
    const [aToB, bToA] = await Promise.all([
        getDocs(query(requestsRef, where('fromUid', '==', uidA), where('toUid', '==', uidB), where('status', '==', 'pending'))),
        getDocs(query(requestsRef, where('fromUid', '==', uidB), where('toUid', '==', uidA), where('status', '==', 'pending')))
    ]);
    const found = aToB.docs[0] ?? bToA.docs[0];
    return found ? toFriendRequest(found.id, found.data()) : null;
}

export async function isAlreadyFriend(myUid: string, otherUid: string): Promise<boolean> {
    const snap = await getDoc(doc(db, 'friends', myUid));
    if (!snap.exists()) return false;
    const list: string[] = snap.data().list || [];
    return list.includes(otherUid);
}

/**
 * Send a friend request by Academy ID (uid). Throws a user-facing Error
 * for every rejected case so the caller can show it directly.
 */
export async function sendFriendRequest(from: User, toUidRaw: string): Promise<void> {
    const toUid = toUidRaw.trim();
    if (!toUid) throw new Error('Enter an Academy ID first.');
    if (toUid === from.uid) throw new Error("You can't add yourself as a friend.");

    const targetProfile = await lookupPublicProfile(toUid);
    if (!targetProfile) throw new Error('No Academy Seeker found with that ID.');

    if (await isAlreadyFriend(from.uid, toUid)) {
        throw new Error(`You're already friends with ${targetProfile.name}.`);
    }

    const existingRequest = await findPendingRequestBetween(from.uid, toUid);
    if (existingRequest) {
        throw new Error(
            existingRequest.fromUid === from.uid
                ? 'Friend request already sent — waiting on them to accept.'
                : `${targetProfile.name} already sent you a request — check your Requests tab.`
        );
    }

    const now = new Date().toISOString();
    await addDoc(collection(db, 'friendRequests'), {
        fromUid: from.uid,
        fromName: from.name,
        fromPhotoUrl: from.photoUrl ?? null,
        toUid,
        status: 'pending' as FriendRequestStatus,
        createdAt: now,
        updatedAt: now,
        senderAcked: false
    });
}

export async function getIncomingRequests(uid: string): Promise<FriendRequest[]> {
    const q = query(collection(db, 'friendRequests'), where('toUid', '==', uid), where('status', '==', 'pending'));
    const snap = await getDocs(q);
    return snap.docs.map(d => toFriendRequest(d.id, d.data()));
}

export async function getOutgoingRequests(uid: string): Promise<FriendRequest[]> {
    const q = query(collection(db, 'friendRequests'), where('fromUid', '==', uid), where('status', '==', 'pending'));
    const snap = await getDocs(q);
    return snap.docs.map(d => toFriendRequest(d.id, d.data()));
}

async function addFriend(myUid: string, friendUid: string): Promise<void> {
    await setDoc(doc(db, 'friends', myUid), {
        list: arrayUnion(friendUid),
        updatedAt: new Date().toISOString()
    }, { merge: true });
}

export async function acceptFriendRequest(request: FriendRequest): Promise<void> {
    await addFriend(request.toUid, request.fromUid);
    await updateDoc(doc(db, 'friendRequests', request.id), {
        status: 'accepted' as FriendRequestStatus,
        updatedAt: new Date().toISOString()
    });
}

export async function rejectFriendRequest(requestId: string): Promise<void> {
    await updateDoc(doc(db, 'friendRequests', requestId), {
        status: 'rejected' as FriendRequestStatus,
        updatedAt: new Date().toISOString()
    });
}

export async function cancelFriendRequest(requestId: string): Promise<void> {
    await deleteDoc(doc(db, 'friendRequests', requestId));
}

/**
 * The recipient adds the friend to their own list the moment they accept,
 * but the sender isn't necessarily online then. Call this on app load so the
 * sender's side of the friendship gets folded in too — this app has no
 * Cloud Functions doing atomic two-sided writes, so each side self-reconciles.
 */
export async function reconcileAcceptedRequests(uid: string): Promise<void> {
    const q = query(collection(db, 'friendRequests'), where('fromUid', '==', uid), where('status', '==', 'accepted'));
    const snap = await getDocs(q);
    const unacked = snap.docs.filter(d => !d.data().senderAcked);
    for (const d of unacked) {
        const data = d.data();
        await addFriend(uid, data.toUid);
        await updateDoc(d.ref, { senderAcked: true });
    }
}

export async function getFriendsList(uid: string): Promise<PublicProfile[]> {
    const snap = await getDoc(doc(db, 'friends', uid));
    if (!snap.exists()) return [];
    const uids: string[] = snap.data().list || [];
    const profiles = await Promise.all(uids.map(lookupPublicProfile));
    return profiles.filter((p): p is PublicProfile => p !== null);
}
