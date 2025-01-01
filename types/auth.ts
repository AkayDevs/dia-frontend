export interface User {
    id: string;
    name: string;
    email: string;
    avatar?: string;
    role: 'user' | 'admin';
    createdAt: string;
}

export interface AuthState {
    user: User | null;
    isLoading: boolean;
    error: string | null;
}

export interface LoginCredentials {
    email: string;
    password: string;
} 