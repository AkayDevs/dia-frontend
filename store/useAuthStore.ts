import { create } from 'zustand';
import { AuthState, LoginCredentials, User } from '@/types/auth';

// Mock user for development
const mockUser: User = {
    id: '1',
    name: 'Alice',
    email: 'alice@example.com',
    role: 'user',
    createdAt: new Date().toISOString(),
};

interface AuthStore extends AuthState {
    login: (credentials: LoginCredentials) => Promise<void>;
    logout: () => Promise<void>;
    setUser: (user: User | null) => void;
}

export const useAuthStore = create<AuthStore>((set) => ({
    // Initialize with mock user for development
    user: mockUser,
    isLoading: false,
    error: null,

    setUser: (user) => set({ user }),

    login: async (credentials) => {
        try {
            set({ isLoading: true, error: null });

            // For development, just set the mock user
            set({ user: mockUser, isLoading: false });

            // Comment out the actual API call for now
            /*
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
            */
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

            // For development, just clear the user
            set({ user: null, isLoading: false });

            // Comment out the actual API call for now
            /*
            await fetch('/api/auth/logout', { method: 'POST' });
            set({ user: null, isLoading: false });
            */
        } catch (error) {
            set({
                error: error instanceof Error ? error.message : 'An error occurred',
                isLoading: false
            });
            throw error;
        }
    },
})); 