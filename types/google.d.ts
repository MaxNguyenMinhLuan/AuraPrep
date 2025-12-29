// Google Identity Services Type Definitions

interface CredentialResponse {
    credential: string;
    select_by: string;
    clientId?: string;
}

interface GsiButtonConfiguration {
    type: 'standard' | 'icon';
    theme?: 'outline' | 'filled_blue' | 'filled_black';
    size?: 'large' | 'medium' | 'small';
    text?: 'signin_with' | 'signup_with' | 'continue_with' | 'signin';
    shape?: 'rectangular' | 'pill' | 'circle' | 'square';
    logo_alignment?: 'left' | 'center';
    width?: number;
    locale?: string;
}

interface IdConfiguration {
    client_id: string;
    callback: (response: CredentialResponse) => void;
    auto_select?: boolean;
    login_uri?: string;
    native_callback?: (response: CredentialResponse) => void;
    cancel_on_tap_outside?: boolean;
    prompt_parent_id?: string;
    nonce?: string;
    context?: 'signin' | 'signup' | 'use';
    state_cookie_domain?: string;
    ux_mode?: 'popup' | 'redirect';
    allowed_parent_origin?: string | string[];
    itp_support?: boolean;
}

interface PromptMomentNotification {
    isDisplayMoment: () => boolean;
    isDisplayed: () => boolean;
    isNotDisplayed: () => boolean;
    getNotDisplayedReason: () => string;
    isSkippedMoment: () => boolean;
    getSkippedReason: () => string;
    isDismissedMoment: () => boolean;
    getDismissedReason: () => string;
    getMomentType: () => string;
}

interface Google {
    accounts: {
        id: {
            initialize: (config: IdConfiguration) => void;
            prompt: (momentListener?: (notification: PromptMomentNotification) => void) => void;
            renderButton: (parent: HTMLElement, options: GsiButtonConfiguration) => void;
            disableAutoSelect: () => void;
            storeCredential: (credential: { id: string; password: string }, callback?: () => void) => void;
            cancel: () => void;
            revoke: (hint: string, callback: (response: { successful: boolean; error?: string }) => void) => void;
        };
    };
}

interface DecodedGoogleToken {
    iss: string;
    azp: string;
    aud: string;
    sub: string;
    email: string;
    email_verified: boolean;
    name: string;
    picture: string;
    given_name: string;
    family_name: string;
    iat: number;
    exp: number;
    jti: string;
}

declare global {
    interface Window {
        google: Google;
    }
}

export type {
    CredentialResponse,
    GsiButtonConfiguration,
    IdConfiguration,
    PromptMomentNotification,
    DecodedGoogleToken,
    Google
};
