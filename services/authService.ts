import { User } from '../types';
import { auth, googleProvider } from './firebase';
import {
    signInWithPopup,
    signInWithEmailAndPassword,
    createUserWithEmailAndPassword,
    signOut,
    onAuthStateChanged,
    updateProfile,
    User as FirebaseUser
} from 'firebase/auth';

// Storage key for current user
const CURRENT_USER_KEY = 'aura_current_user';

class AuthServiceClass {
    private currentUser: User | null = null;
    private authStateListeners: ((user: User | null) => void)[] = [];

    constructor() {
        // Listen for auth state changes
        onAuthStateChanged(auth, (firebaseUser) => {
            if (firebaseUser) {
                this.currentUser = this.mapFirebaseUserToUser(firebaseUser);
                localStorage.setItem(CURRENT_USER_KEY, JSON.stringify(this.currentUser));
            } else {
                this.currentUser = null;
                localStorage.removeItem(CURRENT_USER_KEY);
            }

            // Notify listeners
            this.authStateListeners.forEach(listener => listener(this.currentUser));
        });
    }

    /**
     * Subscribe to auth state changes
     */
    onAuthStateChange(callback: (user: User | null) => void): () => void {
        this.authStateListeners.push(callback);
        // Return unsubscribe function
        return () => {
            this.authStateListeners = this.authStateListeners.filter(l => l !== callback);
        };
    }

    /**
     * Sign in with Google using popup
     */
    async signInWithGoogle(): Promise<{ user: User; isNewUser: boolean }> {
        try {
            const result = await signInWithPopup(auth, googleProvider);
            const user = this.mapFirebaseUserToUser(result.user);

            // Check if this is a new user (account was just created)
            const isNewUser = result.user.metadata.creationTime === result.user.metadata.lastSignInTime;

            return { user, isNewUser };
        } catch (error: any) {
            console.error('Google sign-in error:', error);
            throw new Error(this.getErrorMessage(error.code));
        }
    }

    /**
     * Register with email/password
     */
    async register(email: string, password: string, name: string): Promise<{ user: User; isNewUser: boolean }> {
        try {
            const result = await createUserWithEmailAndPassword(auth, email, password);

            // Update the user's display name
            await updateProfile(result.user, { displayName: name });

            const user = this.mapFirebaseUserToUser(result.user);
            user.name = name; // Use the provided name since profile update is async

            return { user, isNewUser: true };
        } catch (error: any) {
            console.error('Registration error:', error);
            throw new Error(this.getErrorMessage(error.code));
        }
    }

    /**
     * Login with email/password
     */
    async login(email: string, password: string): Promise<{ user: User; isNewUser: boolean }> {
        try {
            const result = await signInWithEmailAndPassword(auth, email, password);
            const user = this.mapFirebaseUserToUser(result.user);

            return { user, isNewUser: false };
        } catch (error: any) {
            console.error('Login error:', error);
            throw new Error(this.getErrorMessage(error.code));
        }
    }

    /**
     * Get current session - check if user is logged in
     */
    async getCurrentSession(): Promise<User | null> {
        // First check if Firebase has a current user
        if (auth.currentUser) {
            return this.mapFirebaseUserToUser(auth.currentUser);
        }

        // Check localStorage for cached user (for offline support)
        const cached = localStorage.getItem(CURRENT_USER_KEY);
        if (cached) {
            try {
                return JSON.parse(cached);
            } catch {
                return null;
            }
        }

        // Wait for auth state to be determined
        return new Promise((resolve) => {
            const unsubscribe = onAuthStateChanged(auth, (firebaseUser) => {
                unsubscribe();
                if (firebaseUser) {
                    resolve(this.mapFirebaseUserToUser(firebaseUser));
                } else {
                    resolve(null);
                }
            });
        });
    }

    /**
     * Logout
     */
    async logout(): Promise<void> {
        try {
            await signOut(auth);
            localStorage.removeItem(CURRENT_USER_KEY);
        } catch (error) {
            console.error('Logout error:', error);
            // Still clear local storage even if sign out fails
            localStorage.removeItem(CURRENT_USER_KEY);
        }
    }

    /**
     * Check if user is logged in
     */
    isLoggedIn(): boolean {
        return !!auth.currentUser;
    }

    /**
     * Get current user
     */
    getCurrentUser(): User | null {
        if (auth.currentUser) {
            return this.mapFirebaseUserToUser(auth.currentUser);
        }
        return this.currentUser;
    }

    // ============ Helper Methods ============

    private mapFirebaseUserToUser(firebaseUser: FirebaseUser): User {
        return {
            uid: firebaseUser.uid,
            email: firebaseUser.email || '',
            name: firebaseUser.displayName || 'Summoner',
            photoUrl: firebaseUser.photoURL || undefined
        };
    }

    private getErrorMessage(errorCode: string): string {
        switch (errorCode) {
            case 'auth/email-already-in-use':
                return 'An account with this email already exists';
            case 'auth/invalid-email':
                return 'Invalid email address';
            case 'auth/operation-not-allowed':
                return 'This sign-in method is not enabled';
            case 'auth/weak-password':
                return 'Password should be at least 6 characters';
            case 'auth/user-disabled':
                return 'This account has been disabled';
            case 'auth/user-not-found':
                return 'No account found with this email';
            case 'auth/wrong-password':
                return 'Incorrect password';
            case 'auth/invalid-credential':
                return 'Invalid email or password';
            case 'auth/popup-closed-by-user':
                return 'Sign-in was cancelled';
            case 'auth/cancelled-popup-request':
                return 'Sign-in was cancelled';
            case 'auth/network-request-failed':
                return 'Network error. Please check your connection';
            default:
                return 'Authentication failed. Please try again';
        }
    }
}

export const AuthService = new AuthServiceClass();
