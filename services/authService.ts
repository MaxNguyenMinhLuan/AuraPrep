
import { User } from '../types';

const USERS_DB_KEY = 'aura_academy_users';
const SESSION_KEY = 'aura_session_token';

export const AuthService = {
    /**
     * Simulates a Google OAuth flow and "backend" account management.
     */
    async handleGoogleAuth(): Promise<{ user: User; isNewUser: boolean }> {
        // Simulate network latency for the "backend" call
        await new Promise(resolve => setTimeout(resolve, 1500));

        // In a real app, this data would come from the Google ID Token
        const mockGoogleData = {
            email: "seeker@gmail.com",
            name: "Aura Seeker",
            photoUrl: "https://api.dicebear.com/7.x/avataaars/svg?seed=Aura"
        };

        // 1. Get our "database" of users
        const usersJson = localStorage.getItem(USERS_DB_KEY);
        const users: Record<string, User> = usersJson ? JSON.parse(usersJson) : {};

        let user = users[mockGoogleData.email];
        let isNewUser = false;

        if (!user) {
            // 2. SIGNUP: Create new user if they don't exist
            isNewUser = true;
            user = {
                uid: 'SKR-' + Math.random().toString(36).substr(2, 9).toUpperCase(),
                email: mockGoogleData.email,
                name: mockGoogleData.name,
                photoUrl: mockGoogleData.photoUrl
            };
            users[mockGoogleData.email] = user;
            localStorage.setItem(USERS_DB_KEY, JSON.stringify(users));
        }

        // 3. Create a mock session token
        const mockToken = btoa(JSON.stringify({ uid: user.uid, exp: Date.now() + 86400000 }));
        localStorage.setItem(SESSION_KEY, mockToken);

        return { user, isNewUser };
    },

    /**
     * Validates if there's a current "session"
     */
    getCurrentSession(): string | null {
        return localStorage.getItem(SESSION_KEY);
    },

    /**
     * Clears the current session
     */
    logout(): void {
        localStorage.removeItem(SESSION_KEY);
    }
};
