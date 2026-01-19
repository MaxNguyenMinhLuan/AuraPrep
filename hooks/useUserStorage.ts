import { useState, useEffect, Dispatch, SetStateAction, useCallback } from 'react';

/**
 * A localStorage hook that prefixes keys with the user's UID to ensure
 * each user has their own isolated data storage.
 */
function useUserStorage<T>(
    userId: string | null,
    key: string,
    initialValue: T | (() => T)
): [T, Dispatch<SetStateAction<T>>, () => void] {
    // Build the user-specific key
    const storageKey = userId ? `user_${userId}_${key}` : null;

    const getInitialValue = useCallback((): T => {
        return typeof initialValue === 'function'
            ? (initialValue as () => T)()
            : initialValue;
    }, []);

    const [storedValue, setStoredValue] = useState<T>(() => {
        if (!storageKey) {
            return getInitialValue();
        }
        try {
            const item = window.localStorage.getItem(storageKey);
            if (item) {
                return JSON.parse(item);
            }
            // Check for legacy data without user prefix and migrate
            const legacyItem = window.localStorage.getItem(key);
            if (legacyItem) {
                const parsedLegacy = JSON.parse(legacyItem);
                // Migrate legacy data to user-specific key
                window.localStorage.setItem(storageKey, legacyItem);
                // Remove legacy key to prevent confusion
                window.localStorage.removeItem(key);
                return parsedLegacy;
            }
            return getInitialValue();
        } catch (error) {
            console.error(`Error reading ${storageKey} from localStorage:`, error);
            return getInitialValue();
        }
    });

    // Reset to initial value when user changes
    useEffect(() => {
        if (!storageKey) {
            setStoredValue(getInitialValue());
            return;
        }
        try {
            const item = window.localStorage.getItem(storageKey);
            if (item) {
                setStoredValue(JSON.parse(item));
            } else {
                setStoredValue(getInitialValue());
            }
        } catch (error) {
            console.error(`Error reading ${storageKey} from localStorage:`, error);
            setStoredValue(getInitialValue());
        }
    }, [storageKey]);

    // Save to localStorage whenever value changes
    useEffect(() => {
        if (!storageKey) return;
        try {
            window.localStorage.setItem(storageKey, JSON.stringify(storedValue));
        } catch (error) {
            console.error(`Error writing ${storageKey} to localStorage:`, error);
        }
    }, [storageKey, storedValue]);

    // Clear function to remove user-specific data
    const clearStorage = useCallback(() => {
        if (storageKey) {
            window.localStorage.removeItem(storageKey);
        }
        setStoredValue(getInitialValue());
    }, [storageKey, getInitialValue]);

    return [storedValue, setStoredValue, clearStorage];
}

/**
 * Clears all user-specific data from localStorage for a given user ID.
 * This is useful when a user wants to reset their progress or for testing.
 */
export function clearAllUserData(userId: string): void {
    const prefix = `user_${userId}_`;
    const keysToRemove: string[] = [];

    for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        if (key && key.startsWith(prefix)) {
            keysToRemove.push(key);
        }
    }

    keysToRemove.forEach(key => localStorage.removeItem(key));
}

/**
 * Clears all legacy (non-user-specific) data keys from localStorage.
 */
export function clearLegacyData(): void {
    const legacyKeys = [
        'user',
        'userProfile',
        'auraPoints',
        'userCreatures',
        'activeCreatureId',
        'reviewQueue',
        'dailyActivity',
        'mockCompetitors',
        'tutorialState',
        'aura_current_user'
    ];

    legacyKeys.forEach(key => {
        if (localStorage.getItem(key)) {
            localStorage.removeItem(key);
        }
    });
}

export default useUserStorage;
