import { UserProfile, CreatureInstance } from '../types';
import { db, auth } from './firebase';
import { doc, getDoc, setDoc } from 'firebase/firestore';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5001/api';

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
 * Sync game data to Firestore
 */
export async function syncGameDataToFirestore(
  userId: string,
  payload: Omit<GameDataSyncPayload, 'lastSyncedAt'> & { updatedAt: string }
): Promise<void> {
  try {
    const docRef = doc(db, 'users_game_data', userId);
    await setDoc(docRef, payload, { merge: true });
    console.log('Game data synced to Firestore successfully!');
  } catch (error) {
    console.error('Error syncing game data to Firestore:', error);
  }
}

/**
 * Fetch game data from Firestore
 */
export async function fetchGameDataFromFirestore(userId: string): Promise<any> {
  try {
    const docRef = doc(db, 'users_game_data', userId);
    const docSnap = await getDoc(docRef);
    if (docSnap.exists()) {
      return docSnap.data();
    }
  } catch (error) {
    console.error('Error fetching game data from Firestore:', error);
  }
  return null;
}

/**
 * Sync game data from localStorage to MongoDB backend and Firestore
 * Called on first login or periodically to keep data in sync
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
  try {
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

    // 1. Sync to Firestore (serverless, direct database write)
    if (userId) {
      syncGameDataToFirestore(userId, {
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

    // 2. Sync to Render API
    const response = await fetch(`${API_URL}/game-data/sync`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${authToken}`
      },
      body: JSON.stringify(payload)
    });

    if (!response.ok) {
      if (response.status === 409) {
        const conflictData = await response.json();
        return { status: 'conflict', data: conflictData.gameData };
      }
      throw new Error(`Failed to sync game data: ${response.statusText}`);
    }

    const data = await response.json();
    console.log('Game data synced to backend successfully:', data);
    return data;
  } catch (error) {
    console.error('Error syncing game data to backend:', error);
    // Return a dummy object if Firestore succeeded but backend failed
    return { success: true };
  }
}

/**
 * Fetch game data from MongoDB backend
 * Called on app startup to load saved data
 */
export async function fetchGameDataFromBackend(authToken: string): Promise<any> {
  try {
    const response = await fetch(`${API_URL}/game-data`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${authToken}`
      }
    });

    if (!response.ok) {
      if (response.status === 404) {
        // Game data doesn't exist yet (new user)
        return null;
      }
      throw new Error(`Failed to fetch game data: ${response.statusText}`);
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Error fetching game data from backend:', error);
    throw error;
  }
}

/**
 * Unified Game Data Fetch - Queries BOTH Firestore and Render, selecting the newest copy.
 */
export async function fetchGameData(authToken: string): Promise<any> {
  const userId = auth.currentUser?.uid;
  
  let backendData: any = null;
  let firestoreData: any = null;

  // Fetch in parallel
  const backendPromise = fetchGameDataFromBackend(authToken)
    .then(data => {
      backendData = data;
    })
    .catch(err => {
      console.warn('Failed to fetch from Render backend:', err);
    });

  const firestorePromise = userId 
    ? fetchGameDataFromFirestore(userId)
        .then(data => {
          firestoreData = data;
        })
        .catch(err => {
          console.warn('Failed to fetch from Firestore:', err);
        })
    : Promise.resolve();

  await Promise.allSettled([backendPromise, firestorePromise]);

  if (backendData && firestoreData) {
    const backendTime = new Date(backendData.updatedAt || backendData.gameData?.updatedAt || 0).getTime();
    const firestoreTime = new Date(firestoreData.updatedAt || 0).getTime();

    console.log(`Sync timestamps compared - Backend: ${backendTime}, Firestore: ${firestoreTime}`);

    if (firestoreTime > backendTime) {
      console.log('Using Firestore data (newer)');
      return {
        profile: firestoreData.profile,
        creatures: firestoreData.creatures,
        activeCreature: { creatureId: firestoreData.activeCreatureId },
        auraBalance: firestoreData.auraPoints,
        dailyActivity: firestoreData.dailyActivity,
        reviewQueue: firestoreData.reviewQueue,
        userTeam: firestoreData.userTeam,
        tutorialState: firestoreData.tutorialState,
        updatedAt: firestoreData.updatedAt
      };
    } else {
      console.log('Using Render Backend data (newer or equal)');
      return backendData;
    }
  }

  if (firestoreData) {
    console.log('Using Firestore data (Render was offline/empty)');
    return {
      profile: firestoreData.profile,
      creatures: firestoreData.creatures,
      activeCreature: { creatureId: firestoreData.activeCreatureId },
      auraBalance: firestoreData.auraPoints,
      dailyActivity: firestoreData.dailyActivity,
      reviewQueue: firestoreData.reviewQueue,
      userTeam: firestoreData.userTeam,
      tutorialState: firestoreData.tutorialState,
      updatedAt: firestoreData.updatedAt
    };
  }

  if (backendData) {
    console.log('Using Render Backend data (Firestore was empty)');
    return backendData;
  }

  return null;
}

/**
 * Update mission completion status
 */
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

    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Error updating mission completion:', error);
    throw error;
  }
}

/**
 * Update email notification preferences
 */
export async function updateEmailPreferences(
  preferences: Partial<EmailPreferences>,
  timezone?: string,
  authToken?: string
): Promise<any> {
  try {
    if (!authToken) {
      throw new Error('Auth token required');
    }

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

    if (!response.ok) {
      throw new Error(`Failed to update preferences: ${response.statusText}`);
    }

    const data = await response.json();
    console.log('Preferences updated:', data);
    return data;
  } catch (error) {
    console.error('Error updating preferences:', error);
    throw error;
  }
}

/**
 * One-time migration of localStorage data to MongoDB
 */
export async function migrateLocalStorageToBackend(
  userId: string,
  authToken: string
): Promise<boolean> {
  try {
    // Get all localStorage data
    const userProfile = JSON.parse(localStorage.getItem(`aura_${userId}_userProfile`) || '{}');
    const creatures = JSON.parse(localStorage.getItem(`aura_${userId}_userCreatures`) || '[]');
    const activeCreatureId = JSON.parse(localStorage.getItem(`aura_${userId}_activeCreatureId`) || 'null');
    const auraPoints = JSON.parse(localStorage.getItem(`aura_${userId}_auraPoints`) || '0');
    const dailyActivity = JSON.parse(localStorage.getItem(`aura_${userId}_dailyActivity`) || '{}');
    const reviewQueue = JSON.parse(localStorage.getItem(`aura_${userId}_reviewQueue`) || '[]');
    const userTeam = JSON.parse(localStorage.getItem(`aura_${userId}_userTeam`) || '[]');
    const tutorialState = JSON.parse(localStorage.getItem(`aura_${userId}_tutorialState`) || 'null');

    // Only migrate if we have data
    if (!userProfile || Object.keys(userProfile).length === 0) {
      console.log('No localStorage data to migrate');
      return false;
    }

    console.log('Migrating localStorage data...');
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

    console.log('Migration complete!');
    return true;
  } catch (error) {
    console.error('Error during migration:', error);
    return false;
  }
}
