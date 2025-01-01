import { create } from 'zustand';
import { AuthState, LoginCredentials, User } from '@/types/auth';

interface AuthStore extends AuthState {
    login: (credentials: LoginCredentials) => Promise<void>;
    logout: () => Promise<void>;
    setUser: (user: User | null) => void;
}

export const useAuthStore = create<AuthStore>((set) => ({
    user: null,
    isLoading: false,
    error: null,

    setUser: (user) => set({ user }),

    login: async (credentials) => {
        try {
            set({ isLoading: true, error: null });

            // TODO: Replace with your actual API endpoint
            const response = await fetch('/api/auth/login', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(credentials),
            });

            if (!response.ok) {
                throw new Error('Invalid credentials');
            }

            const user: User = await response.json();
            set({ user, isLoading: false });
        } catch (error) {
            set({
                error: error instanceof Error ? error.message : 'An error occurred',
                isLoading: false
            });
            throw error;
        }
    },

    logout: async () => {
        try {
            set({ isLoading: true, error: null });

            // TODO: Replace with your actual API endpoint
            await fetch('/api/auth/logout', { method: 'POST' });

            set({ user: null, isLoading: false });
        } catch (error) {
            set({
                error: error instanceof Error ? error.message : 'An error occurred',
                isLoading: false
            });
            throw error;
        }
    },
})); 