import { UserProfile, CreatureInstance } from '../types';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

interface GameDataSyncPayload {
  profile: UserProfile;
  creatures: CreatureInstance[];
  activeCreatureId: number | null;
  auraPoints: number;
  dailyActivity: any;
  reviewQueue: any[];
}

interface EmailPreferences {
  enabled: boolean;
  morning: boolean;
  afternoon: boolean;
  evening: boolean;
}

/**
 * Sync game data from localStorage to MongoDB backend
 * Called on first login or periodically to keep data in sync
 */
export async function syncGameDataToBackend(
  userProfile: UserProfile,
  creatures: CreatureInstance[],
  activeCreatureId: number | null,
  auraPoints: number,
  dailyActivity: any,
  reviewQueue: any[],
  authToken: string
): Promise<any> {
  try {
    const payload: GameDataSyncPayload = {
      profile: userProfile,
      creatures,
      activeCreatureId,
      auraPoints,
      dailyActivity,
      reviewQueue
    };

    const response = await fetch(`${API_URL}/game-data/sync`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${authToken}`
      },
      body: JSON.stringify(payload)
    });

    if (!response.ok) {
      throw new Error(`Failed to sync game data: ${response.statusText}`);
    }

    const data = await response.json();
    console.log('Game data synced successfully:', data);
    return data;
  } catch (error) {
    console.error('Error syncing game data:', error);
    throw error;
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
    console.error('Error fetching game data:', error);
    throw error;
  }
}

/**
 * Update mission completion status
 * Called when user completes a daily mission
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
 * Called from settings page
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
 * Automatically called on first app load with authenticated user
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

    // Only migrate if we have data
    if (!userProfile || Object.keys(userProfile).length === 0) {
      console.log('No localStorage data to migrate');
      return false;
    }

    console.log('Migrating localStorage data to backend...');
    await syncGameDataToBackend(
      userProfile,
      creatures,
      activeCreatureId,
      auraPoints,
      dailyActivity,
      reviewQueue,
      authToken
    );

    console.log('Migration complete!');
    return true;
  } catch (error) {
    console.error('Error during migration:', error);
    return false;
  }
}
