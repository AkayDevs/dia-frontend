import { create } from 'zustand';
import { authService } from '@/services/auth.service';
import { UserResponse, UserWithStatsResponse, LoginRequest, PasswordResetRequest, RegisterRequest } from '@/types/auth';
import { AUTH_TOKEN_KEY } from '@/lib/constants';

interface AuthState {
    isAuthenticated: boolean;
    isLoading: boolean;
    error: string | null;
    user: UserWithStatsResponse | null;
    token: string | null;
    refreshToken: string | null;
    register: (data: RegisterRequest) => Promise<void>;
    login: (credentials: LoginRequest) => Promise<void>;
    logout: () => Promise<void>;
    refreshSession: () => Promise<void>;
    requestPasswordReset: (email: string) => Promise<void>;
    resetPassword: (data: PasswordResetRequest) => Promise<void>;
    verifyEmail: (token: string) => Promise<void>;
    updateUserData: () => Promise<void>;
    clearError: () => void;
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

export const useAuthStore = create<AuthState>((set, get) => ({
    isAuthenticated: !!getStorageItem(AUTH_TOKEN_KEY),
    isLoading: false,
    error: null,
    user: null,
    token: getStorageItem(AUTH_TOKEN_KEY),
    refreshToken: getStorageItem('refresh_token'),

    register: async (data) => {
        set({ isLoading: true, error: null });
        try {
            // Register the user
            await authService.register(data);

            // After successful registration, automatically log them in
            await get().login({
                email: data.email,
                password: data.password
            });
        } catch (error) {
            set({
                error: error instanceof Error ? error.message : 'Registration failed',
                isLoading: false
            });
            throw error;
        }
    },

    clearError: () => {
        set({ error: null });
    },

    login: async (credentials) => {
        set({ isLoading: true, error: null });
        try {
            const { access_token, refresh_token } = await authService.login(credentials);

            setStorageItem(AUTH_TOKEN_KEY, access_token);
            setStorageItem('refresh_token', refresh_token);

            const userData = await authService.getCurrentUser();

            set({
                isAuthenticated: true,
                token: access_token,
                refreshToken: refresh_token,
                user: userData,
                error: null
            });
        } catch (error) {
            removeStorageItem(AUTH_TOKEN_KEY);
            removeStorageItem('refresh_token');
            set({
                isAuthenticated: false,
                token: null,
                refreshToken: null,
                user: null,
                error: error instanceof Error ? error.message : 'An error occurred during login'
            });
            throw error;
        } finally {
            set({ isLoading: false });
        }
    },

    logout: async () => {
        set({ isLoading: true });
        try {
            await authService.logout();
        } catch (error) {
            console.error('Logout error:', error);
        } finally {
            removeStorageItem(AUTH_TOKEN_KEY);
            removeStorageItem('refresh_token');
            set({
                isAuthenticated: false,
                token: null,
                refreshToken: null,
                user: null,
                error: null,
                isLoading: false
            });
        }
    },

    refreshSession: async () => {
        const refreshToken = getStorageItem('refresh_token');
        if (!refreshToken) {
            await get().logout();
            return;
        }

        try {
            const { access_token, refresh_token } = await authService.refreshToken(refreshToken);
            setStorageItem(AUTH_TOKEN_KEY, access_token);
            setStorageItem('refresh_token', refresh_token);

            set({
                token: access_token,
                refreshToken: refresh_token,
                isAuthenticated: true
            });

            // Update user data after successful token refresh
            await get().updateUserData();
        } catch (error) {
            await get().logout();
        }
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

    resetPassword: async (data) => {
        set({ isLoading: true, error: null });
        try {
            await authService.resetPassword(data);
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
    },

    updateUserData: async () => {
        try {
            const userData = await authService.getCurrentUser();
            set({ user: userData });
        } catch (error) {
            console.error('Error updating user data:', error);
            // If we can't get user data, we should probably log out
            await get().logout();
        }
    }
})); 