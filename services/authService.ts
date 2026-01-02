import { User } from '../types';
import type { CredentialResponse } from '../types/google.d';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

// Storage keys
const ACCESS_TOKEN_KEY = 'aura_access_token';
const REFRESH_TOKEN_KEY = 'aura_refresh_token';
const CURRENT_USER_KEY = 'aura_current_user';

// Get Google Client ID
const GOOGLE_CLIENT_ID = import.meta.env.VITE_GOOGLE_CLIENT_ID as string;

interface AuthResponse {
    user: {
        id: string;
        email: string;
        name: string;
        photoUrl: string | null;
    };
    accessToken: string;
    refreshToken: string;
    expiresIn: number;
    isNewUser?: boolean;
}

interface ApiResponse<T> {
    success: boolean;
    data?: T;
    message?: string;
    error?: {
        code: string;
        message: string;
        details?: unknown;
    };
}

class AuthServiceClass {
    private refreshPromise: Promise<boolean> | null = null;

    /**
     * Returns the Google Client ID for use in components
     */
    getClientId(): string {
        return GOOGLE_CLIENT_ID;
    }

    /**
     * Checks if Google Identity Services is loaded
     */
    isGsiLoaded(): boolean {
        return typeof window !== 'undefined' && !!window.google?.accounts?.id;
    }

    /**
     * Initializes Google Identity Services
     */
    initialize(callback: (response: CredentialResponse) => void): void {
        if (!this.isGsiLoaded()) {
            console.error('Google Identity Services not loaded');
            return;
        }

        if (!GOOGLE_CLIENT_ID) {
            console.error('Google Client ID not configured');
            return;
        }

        window.google.accounts.id.initialize({
            client_id: GOOGLE_CLIENT_ID,
            callback: callback,
            auto_select: false,
            cancel_on_tap_outside: true,
        });
    }

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
    }

    /**
     * Shows the One Tap prompt
     */
    prompt(): void {
        if (!this.isGsiLoaded()) {
            return;
        }
        window.google.accounts.id.prompt();
    }

    // ============ API Methods ============

    /**
     * Register with email/password
     */
    async register(email: string, password: string, name: string): Promise<{ user: User; isNewUser: boolean }> {
        const response = await fetch(`${API_BASE_URL}/auth/register`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email, password, name })
        });

        const result: ApiResponse<AuthResponse> = await response.json();

        if (!result.success || !result.data) {
            throw new Error(result.error?.message || 'Registration failed');
        }

        this.storeTokens(result.data);
        return {
            user: this.mapApiUserToUser(result.data.user),
            isNewUser: true
        };
    }

    /**
     * Login with email/password
     */
    async login(email: string, password: string): Promise<{ user: User; isNewUser: boolean }> {
        const response = await fetch(`${API_BASE_URL}/auth/login`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email, password })
        });

        const result: ApiResponse<AuthResponse> = await response.json();

        if (!result.success || !result.data) {
            throw new Error(result.error?.message || 'Login failed');
        }

        this.storeTokens(result.data);
        return {
            user: this.mapApiUserToUser(result.data.user),
            isNewUser: false
        };
    }

    /**
     * Handle Google credential response - send to backend for verification
     */
    async handleCredentialResponse(response: CredentialResponse): Promise<{ user: User; isNewUser: boolean }> {
        const apiResponse = await fetch(`${API_BASE_URL}/auth/google`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ credential: response.credential })
        });

        const result: ApiResponse<AuthResponse> = await apiResponse.json();

        if (!result.success || !result.data) {
            throw new Error(result.error?.message || 'Google authentication failed');
        }

        this.storeTokens(result.data);
        return {
            user: this.mapApiUserToUser(result.data.user),
            isNewUser: result.data.isNewUser || false
        };
    }

    /**
     * Get current session - validates token with backend
     */
    async getCurrentSession(): Promise<User | null> {
        const accessToken = localStorage.getItem(ACCESS_TOKEN_KEY);

        if (!accessToken) {
            return null;
        }

        try {
            const response = await this.authenticatedFetch(`${API_BASE_URL}/auth/me`);
            const result: ApiResponse<{ user: AuthResponse['user'] }> = await response.json();

            if (result.success && result.data) {
                const user = this.mapApiUserToUser(result.data.user);
                localStorage.setItem(CURRENT_USER_KEY, JSON.stringify(user));
                return user;
            }

            // Token invalid, try refresh
            const refreshed = await this.refreshToken();
            if (refreshed) {
                return this.getCurrentSession();
            }

            this.clearTokens();
            return null;
        } catch {
            // Network error - check if we have a cached user
            const cached = localStorage.getItem(CURRENT_USER_KEY);
            if (cached) {
                try {
                    return JSON.parse(cached);
                } catch {
                    return null;
                }
            }
            return null;
        }
    }

    /**
     * Refresh access token
     */
    async refreshToken(): Promise<boolean> {
        // Prevent multiple simultaneous refresh attempts
        if (this.refreshPromise) {
            return this.refreshPromise;
        }

        this.refreshPromise = this.doRefreshToken();
        const result = await this.refreshPromise;
        this.refreshPromise = null;
        return result;
    }

    private async doRefreshToken(): Promise<boolean> {
        const refreshToken = localStorage.getItem(REFRESH_TOKEN_KEY);

        if (!refreshToken) {
            return false;
        }

        try {
            const response = await fetch(`${API_BASE_URL}/auth/refresh`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ refreshToken })
            });

            const result: ApiResponse<{ accessToken: string; refreshToken: string; expiresIn: number }> = await response.json();

            if (result.success && result.data) {
                localStorage.setItem(ACCESS_TOKEN_KEY, result.data.accessToken);
                localStorage.setItem(REFRESH_TOKEN_KEY, result.data.refreshToken);
                return true;
            }

            return false;
        } catch {
            return false;
        }
    }

    /**
     * Logout - revoke tokens on backend
     */
    async logout(): Promise<void> {
        try {
            await this.authenticatedFetch(`${API_BASE_URL}/auth/logout`, {
                method: 'POST',
                body: JSON.stringify({})
            });
        } catch {
            // Continue logout even if API call fails
        }

        this.clearTokens();

        // Disable Google auto-select
        if (this.isGsiLoaded()) {
            window.google.accounts.id.disableAutoSelect();
        }
    }

    /**
     * Make authenticated API request with automatic token refresh
     */
    async authenticatedFetch(url: string, options: RequestInit = {}): Promise<Response> {
        let accessToken = localStorage.getItem(ACCESS_TOKEN_KEY);

        const makeRequest = () => fetch(url, {
            ...options,
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${accessToken}`,
                ...options.headers
            }
        });

        let response = await makeRequest();

        // If 401, try refreshing token
        if (response.status === 401) {
            const refreshed = await this.refreshToken();
            if (refreshed) {
                accessToken = localStorage.getItem(ACCESS_TOKEN_KEY);
                response = await makeRequest();
            }
        }

        return response;
    }

    /**
     * Get current access token
     */
    getAccessToken(): string | null {
        return localStorage.getItem(ACCESS_TOKEN_KEY);
    }

    /**
     * Check if user is logged in (has tokens)
     */
    isLoggedIn(): boolean {
        return !!localStorage.getItem(ACCESS_TOKEN_KEY);
    }

    // ============ Helper Methods ============

    private storeTokens(data: AuthResponse): void {
        localStorage.setItem(ACCESS_TOKEN_KEY, data.accessToken);
        localStorage.setItem(REFRESH_TOKEN_KEY, data.refreshToken);
        const user = this.mapApiUserToUser(data.user);
        localStorage.setItem(CURRENT_USER_KEY, JSON.stringify(user));
    }

    private clearTokens(): void {
        localStorage.removeItem(ACCESS_TOKEN_KEY);
        localStorage.removeItem(REFRESH_TOKEN_KEY);
        localStorage.removeItem(CURRENT_USER_KEY);
    }

    private mapApiUserToUser(apiUser: AuthResponse['user']): User {
        return {
            uid: apiUser.id,
            email: apiUser.email,
            name: apiUser.name,
            photoUrl: apiUser.photoUrl || undefined
        };
    }
}

export const AuthService = new AuthServiceClass();
