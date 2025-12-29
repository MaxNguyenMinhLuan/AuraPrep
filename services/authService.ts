import { User } from '../types';
import type { CredentialResponse, DecodedGoogleToken } from '../types/google.d';

const USERS_DB_KEY = 'aura_academy_users';
const SESSION_KEY = 'aura_session_token';
const CURRENT_USER_KEY = 'aura_current_user';

// Get the Google Client ID from environment variable
const GOOGLE_CLIENT_ID = import.meta.env.VITE_GOOGLE_CLIENT_ID as string;

/**
 * Decodes a JWT token without verification (verification happens on Google's side)
 * In production, you should verify the token on a backend server
 */
function decodeJwt(token: string): DecodedGoogleToken {
    const base64Url = token.split('.')[1];
    const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
    const jsonPayload = decodeURIComponent(
        atob(base64)
            .split('')
            .map((c) => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
            .join('')
    );
    return JSON.parse(jsonPayload);
}

export const AuthService = {
    /**
     * Returns the Google Client ID for use in components
     */
    getClientId(): string {
        return GOOGLE_CLIENT_ID;
    },

    /**
     * Checks if Google Identity Services is loaded
     */
    isGsiLoaded(): boolean {
        return typeof window !== 'undefined' && !!window.google?.accounts?.id;
    },

    /**
     * Initializes Google Identity Services
     */
    initialize(callback: (response: CredentialResponse) => void): void {
        if (!this.isGsiLoaded()) {
            console.error('Google Identity Services not loaded');
            return;
        }

        if (!GOOGLE_CLIENT_ID) {
            console.error('Google Client ID not configured. Please set VITE_GOOGLE_CLIENT_ID in your .env.local file');
            return;
        }

        window.google.accounts.id.initialize({
            client_id: GOOGLE_CLIENT_ID,
            callback: callback,
            auto_select: false,
            cancel_on_tap_outside: true,
        });
    },

    /**
     * Renders the Google Sign-In button
     */
    renderButton(element: HTMLElement): void {
        if (!this.isGsiLoaded()) {
            console.error('Google Identity Services not loaded');
            return;
        }

        window.google.accounts.id.renderButton(element, {
            type: 'standard',
            theme: 'outline',
            size: 'large',
            text: 'signin_with',
            shape: 'rectangular',
            logo_alignment: 'left',
            width: 300,
        });
    },

    /**
     * Shows the One Tap prompt
     */
    prompt(): void {
        if (!this.isGsiLoaded()) {
            return;
        }
        window.google.accounts.id.prompt();
    },

    /**
     * Processes the Google credential response and manages user account
     */
    async handleCredentialResponse(response: CredentialResponse): Promise<{ user: User; isNewUser: boolean }> {
        const decoded = decodeJwt(response.credential);

        // Get our "database" of users
        const usersJson = localStorage.getItem(USERS_DB_KEY);
        const users: Record<string, User> = usersJson ? JSON.parse(usersJson) : {};

        let user = users[decoded.email];
        let isNewUser = false;

        if (!user) {
            // Create new user if they don't exist
            isNewUser = true;
            user = {
                uid: decoded.sub, // Use Google's unique user ID
                email: decoded.email,
                name: decoded.name,
                photoUrl: decoded.picture,
            };
            users[decoded.email] = user;
            localStorage.setItem(USERS_DB_KEY, JSON.stringify(users));
        } else {
            // Update existing user with latest Google data (photo, name might change)
            user.name = decoded.name;
            user.photoUrl = decoded.picture;
            users[decoded.email] = user;
            localStorage.setItem(USERS_DB_KEY, JSON.stringify(users));
        }

        // Store the credential as session token
        localStorage.setItem(SESSION_KEY, response.credential);
        localStorage.setItem(CURRENT_USER_KEY, JSON.stringify(user));

        return { user, isNewUser };
    },

    /**
     * Validates if there's a current session and returns the user if valid
     */
    getCurrentSession(): User | null {
        const token = localStorage.getItem(SESSION_KEY);
        const userJson = localStorage.getItem(CURRENT_USER_KEY);

        if (!token || !userJson) {
            return null;
        }

        try {
            // Check if token is expired
            const decoded = decodeJwt(token);
            const now = Math.floor(Date.now() / 1000);

            if (decoded.exp < now) {
                // Token expired, clear session
                this.logout();
                return null;
            }

            return JSON.parse(userJson);
        } catch {
            // Invalid token, clear session
            this.logout();
            return null;
        }
    },

    /**
     * Clears the current session and revokes Google credential
     */
    logout(): void {
        const userJson = localStorage.getItem(CURRENT_USER_KEY);

        localStorage.removeItem(SESSION_KEY);
        localStorage.removeItem(CURRENT_USER_KEY);

        // Disable auto-select for future sign-ins
        if (this.isGsiLoaded()) {
            window.google.accounts.id.disableAutoSelect();

            // Optionally revoke the credential
            if (userJson) {
                try {
                    const user = JSON.parse(userJson);
                    window.google.accounts.id.revoke(user.email, () => {
                        console.log('Google credential revoked');
                    });
                } catch {
                    // Ignore errors during revoke
                }
            }
        }
    },

    /**
     * Legacy method for backward compatibility - now redirects to GSI flow
     * @deprecated Use the GSI button or handleCredentialResponse instead
     */
    async handleGoogleAuth(): Promise<{ user: User; isNewUser: boolean }> {
        throw new Error('Please use the Google Sign-In button for authentication');
    },
};
