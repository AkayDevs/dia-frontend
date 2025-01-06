import { create } from 'zustand';
import { authService, UserResponse, LoginData } from '@/services/auth.service';
import { AUTH_TOKEN_KEY } from '@/lib/constants';

interface AuthState {
    isAuthenticated: boolean;
    isLoading: boolean;
    error: string | null;
    user: UserResponse | null;
    token: string | null;
    login: (credentials: LoginData) => Promise<void>;
    logout: () => void;
    requestPasswordReset: (email: string) => Promise<void>;
    resetPassword: (token: string, newPassword: string) => Promise<void>;
    verifyEmail: (token: string) => Promise<void>;
}

// Helper function to safely access localStorage
const getStorageItem = (key: string): string | null => {
    if (typeof window !== 'undefined') {
        return localStorage.getItem(key);
    }
    return null;
};

// Helper function to safely set localStorage
const setStorageItem = (key: string, value: string): void => {
    if (typeof window !== 'undefined') {
        localStorage.setItem(key, value);
    }
};

// Helper function to safely remove localStorage item
const removeStorageItem = (key: string): void => {
    if (typeof window !== 'undefined') {
        localStorage.removeItem(key);
    }
};

export const useAuthStore = create<AuthState>((set) => ({
    isAuthenticated: !!getStorageItem(AUTH_TOKEN_KEY),
    isLoading: false,
    error: null,
    user: null,
    token: getStorageItem(AUTH_TOKEN_KEY),

    login: async (credentials) => {
        set({ isLoading: true, error: null });
        try {
            const { access_token, token_type } = await authService.login(credentials);

            setStorageItem(AUTH_TOKEN_KEY, access_token);

            const userData = await authService.getCurrentUser(access_token);

            set({
                isAuthenticated: true,
                token: access_token,
                user: userData,
                error: null
            });
        } catch (error) {
            removeStorageItem(AUTH_TOKEN_KEY);
            set({
                isAuthenticated: false,
                token: null,
                user: null,
                error: error instanceof Error ? error.message : 'An error occurred during login'
            });
            throw error;
        } finally {
            set({ isLoading: false });
        }
    },

    logout: () => {
        removeStorageItem(AUTH_TOKEN_KEY);
        set({
            isAuthenticated: false,
            token: null,
            user: null,
            error: null
        });
    },

    requestPasswordReset: async (email) => {
        set({ isLoading: true, error: null });
        try {
            await authService.requestPasswordReset(email);
        } catch (error) {
            set({ error: error instanceof Error ? error.message : 'Failed to request password reset' });
            throw error;
        } finally {
            set({ isLoading: false });
        }
    },

    resetPassword: async (token, newPassword) => {
        set({ isLoading: true, error: null });
        try {
            await authService.resetPassword(token, newPassword);
        } catch (error) {
            set({ error: error instanceof Error ? error.message : 'Failed to reset password' });
            throw error;
        } finally {
            set({ isLoading: false });
        }
    },

    verifyEmail: async (token) => {
        set({ isLoading: true, error: null });
        try {
            await authService.verifyEmail(token);
        } catch (error) {
            set({ error: error instanceof Error ? error.message : 'Failed to verify email' });
            throw error;
        } finally {
            set({ isLoading: false });
        }
    }
})); 