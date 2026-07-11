import { UserProfile, CreatureInstance } from '../types';
import { db, auth } from './firebase';
import { doc, getDoc, setDoc } from 'firebase/firestore';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5001/api';

// How long to wait for the Render backend before giving up (ms)
const BACKEND_TIMEOUT_MS = 8000;

interface GameDataSyncPayload {
  profile: UserProfile;
  creatures: CreatureInstance[];
  activeCreatureId: number | null;
  auraPoints: number;
  dailyActivity: any;
  reviewQueue: any[];
  userTeam?: number[];
  tutorialState?: any;
  lastSyncedAt?: string;
  updatedAt?: string;
}

interface EmailPreferences {
  enabled: boolean;
  morning: boolean;
  afternoon: boolean;
  evening: boolean;
}

/**
 * Helper: wraps a promise with a timeout; resolves to null on timeout.
 */
function withTimeout<T>(promise: Promise<T>, ms: number): Promise<T | null> {
  return new Promise((resolve) => {
    const timer = setTimeout(() => resolve(null), ms);
    promise
      .then((v) => { clearTimeout(timer); resolve(v); })
      .catch(() => { clearTimeout(timer); resolve(null); });
  });
}

// ─────────────────────────────────────────────────────────────
// FIRESTORE  (primary, always-on sync layer)
// ─────────────────────────────────────────────────────────────

/**
 * Write game data to Firestore.  Always awaited so callers know if it failed.
 */
export async function syncGameDataToFirestore(
  userId: string,
  payload: Omit<GameDataSyncPayload, 'lastSyncedAt'> & { updatedAt: string }
): Promise<boolean> {
  try {
    const docRef = doc(db, 'users_game_data', userId);
    await setDoc(docRef, payload, { merge: true });
    console.log('[Firestore] Game data saved ✓');
    return true;
  } catch (error) {
    console.error('[Firestore] Error saving game data:', error);
    return false;
  }
}

/**
 * Read game data from Firestore.
 */
export async function fetchGameDataFromFirestore(userId: string): Promise<any> {
  try {
    const docRef = doc(db, 'users_game_data', userId);
    const docSnap = await getDoc(docRef);
    if (docSnap.exists()) {
      return docSnap.data();
    }
  } catch (error) {
    console.error('[Firestore] Error reading game data:', error);
  }
  return null;
}

// ─────────────────────────────────────────────────────────────
// RENDER BACKEND  (secondary; may be slow/offline)
// ─────────────────────────────────────────────────────────────

/**
 * Sync to Render API with a timeout so a cold-start server
 * never blocks the UI for minutes.
 */
export async function syncGameDataToBackend(
  userProfile: UserProfile,
  creatures: CreatureInstance[],
  activeCreatureId: number | null,
  auraPoints: number,
  dailyActivity: any,
  reviewQueue: any[],
  userTeam: number[],
  tutorialState: any,
  authToken: string,
  lastSyncedAt?: string
): Promise<any> {
  const userId = auth.currentUser?.uid;
  const updatedAt = new Date().toISOString();

  const payload: GameDataSyncPayload = {
    profile: userProfile,
    creatures,
    activeCreatureId,
    auraPoints,
    dailyActivity,
    reviewQueue,
    userTeam,
    tutorialState,
    lastSyncedAt,
    updatedAt
  };

  // 1. Firestore — primary, always awaited
  if (userId) {
    await syncGameDataToFirestore(userId, {
      profile: userProfile,
      creatures,
      activeCreatureId,
      auraPoints,
      dailyActivity,
      reviewQueue,
      userTeam,
      tutorialState,
      updatedAt
    });
  }

  // 2. Render backend — secondary, with timeout
  try {
    const fetchPromise = fetch(`${API_URL}/game-data/sync`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${authToken}`
      },
      body: JSON.stringify(payload)
    });

    const response = await withTimeout(fetchPromise, BACKEND_TIMEOUT_MS);
    if (!response) {
      console.warn('[Render] Sync timed out – Firestore already saved.');
      return { gameData: { updatedAt } };
    }

    if (!response.ok) {
      if (response.status === 409) {
        const conflictData = await response.json();
        return { status: 'conflict', data: conflictData.gameData };
      }
      throw new Error(`Render sync failed: ${response.statusText}`);
    }

    const data = await response.json();
    console.log('[Render] Game data synced ✓');
    return data;
  } catch (error) {
    console.warn('[Render] Sync error (Firestore save already succeeded):', error);
    return { gameData: { updatedAt } };
  }
}

/**
 * Fetch game data from Render API backend with timeout.
 */
export async function fetchGameDataFromBackend(authToken: string): Promise<any> {
  try {
    const fetchPromise = fetch(`${API_URL}/game-data`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${authToken}`
      }
    });

    const response = await withTimeout(fetchPromise, BACKEND_TIMEOUT_MS);
    if (!response) {
      console.warn('[Render] Fetch timed out');
      return null;
    }

    if (!response.ok) {
      if (response.status === 404) return null; // new user
      throw new Error(`Render fetch failed: ${response.statusText}`);
    }

    return await response.json();
  } catch (error) {
    console.warn('[Render] Fetch error:', error);
    return null;
  }
}

// ─────────────────────────────────────────────────────────────
// UNIFIED FETCH (Firestore-first, with Render as fallback)
// ─────────────────────────────────────────────────────────────

/**
 * Unified fetch: tries Firestore first (fast & reliable), then
 * Render backend as fallback.  Always picks the newest copy by updatedAt.
 */
export async function fetchGameData(authToken: string): Promise<any> {
  const userId = auth.currentUser?.uid;

  // Run both in parallel; backend has its own timeout inside
  const [firestoreData, backendData] = await Promise.all([
    userId ? fetchGameDataFromFirestore(userId) : Promise.resolve(null),
    fetchGameDataFromBackend(authToken)
  ]);

  // Helper to normalise the Render backend response shape
  const normaliseBackend = (d: any) => {
    if (!d) return null;
    // Render wraps data under d.gameData or d.profile directly
    const g = d.gameData || d;
    if (!g.profile) return null;
    return {
      profile: g.profile,
      creatures: g.creatures,
      activeCreature: { creatureId: g.activeCreatureId },
      auraBalance: g.auraPoints ?? g.auraBalance,
      dailyActivity: g.dailyActivity,
      reviewQueue: g.reviewQueue,
      userTeam: g.userTeam,
      tutorialState: g.tutorialState,
      updatedAt: g.updatedAt
    };
  };

  const normaliseFirestore = (d: any) => {
    if (!d || !d.profile) return null;
    return {
      profile: d.profile,
      creatures: d.creatures,
      activeCreature: { creatureId: d.activeCreatureId },
      auraBalance: d.auraPoints,
      dailyActivity: d.dailyActivity,
      reviewQueue: d.reviewQueue,
      userTeam: d.userTeam,
      tutorialState: d.tutorialState,
      updatedAt: d.updatedAt
    };
  };

  const fs = normaliseFirestore(firestoreData);
  const be = normaliseBackend(backendData);

  if (fs && be) {
    const fsTime = new Date(fs.updatedAt || 0).getTime();
    const beTime = new Date(be.updatedAt || 0).getTime();
    console.log(`[Sync] Firestore: ${fs.updatedAt} | Backend: ${be.updatedAt}`);
    return fsTime >= beTime ? fs : be;
  }

  if (fs) {
    console.log('[Sync] Using Firestore data (backend unavailable)');
    return fs;
  }

  if (be) {
    console.log('[Sync] Using Render backend data (Firestore empty)');
    return be;
  }

  return null;
}

// ─────────────────────────────────────────────────────────────
// MIGRATION & OTHER HELPERS
// ─────────────────────────────────────────────────────────────

export async function updateMissionCompletion(
  completed: boolean,
  authToken: string
): Promise<any> {
  try {
    const response = await fetch(`${API_URL}/game-data/mission`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${authToken}`
      },
      body: JSON.stringify({ completed })
    });

    if (!response.ok) {
      throw new Error(`Failed to update mission: ${response.statusText}`);
    }

    return await response.json();
  } catch (error) {
    console.error('Error updating mission completion:', error);
    throw error;
  }
}

export async function updateEmailPreferences(
  preferences: Partial<EmailPreferences>,
  timezone?: string,
  authToken?: string
): Promise<any> {
  try {
    if (!authToken) throw new Error('Auth token required');

    const response = await fetch(`${API_URL}/game-data/preferences`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${authToken}`
      },
      body: JSON.stringify({
        emailNotifications: preferences,
        ...(timezone && { timezone })
      })
    });

    if (!response.ok) throw new Error(`Failed to update preferences: ${response.statusText}`);

    return await response.json();
  } catch (error) {
    console.error('Error updating preferences:', error);
    throw error;
  }
}

export async function migrateLocalStorageToBackend(
  userId: string,
  authToken: string
): Promise<boolean> {
  try {
    const userProfile = JSON.parse(localStorage.getItem(`aura_${userId}_userProfile`) || '{}');
    const creatures = JSON.parse(localStorage.getItem(`aura_${userId}_userCreatures`) || '[]');
    const activeCreatureId = JSON.parse(localStorage.getItem(`aura_${userId}_activeCreatureId`) || 'null');
    const auraPoints = JSON.parse(localStorage.getItem(`aura_${userId}_auraPoints`) || '0');
    const dailyActivity = JSON.parse(localStorage.getItem(`aura_${userId}_dailyActivity`) || '{}');
    const reviewQueue = JSON.parse(localStorage.getItem(`aura_${userId}_reviewQueue`) || '[]');
    const userTeam = JSON.parse(localStorage.getItem(`aura_${userId}_userTeam`) || '[]');
    const tutorialState = JSON.parse(localStorage.getItem(`aura_${userId}_tutorialState`) || 'null');

    if (!userProfile || Object.keys(userProfile).length === 0) {
      console.log('[Migration] No localStorage data to migrate');
      return false;
    }

    console.log('[Migration] Migrating localStorage data to cloud...');
    await syncGameDataToBackend(
      userProfile,
      creatures,
      activeCreatureId,
      auraPoints,
      dailyActivity,
      reviewQueue,
      userTeam,
      tutorialState,
      authToken
    );

    console.log('[Migration] Complete!');
    return true;
  } catch (error) {
    console.error('[Migration] Error:', error);
    return false;
  }
}
