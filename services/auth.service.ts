import { API_URL, API_VERSION } from '@/lib/constants';

export interface AuthResponse {
    access_token: string;
    token_type: string;
}

export interface UserResponse {
    id: string;
    email: string;
    name: string;
    is_active: boolean;
    is_superuser: boolean;
}

export interface RegisterData {
    email: string;
    password: string;
    name: string;
    confirm_password: string;
    avatar?: string;
}

export interface LoginData {
    email: string;
    password: string;
}

class AuthService {
    private baseUrl = `${API_URL}${API_VERSION}/auth`;

    async register(data: RegisterData): Promise<UserResponse> {
        const response = await fetch(`${this.baseUrl}/register`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Accept': 'application/json',
            },
            credentials: 'include',
            body: JSON.stringify(data),
        });

        if (!response.ok) {
            const error = await response.json();
            this.handleError(error, response.status);
        }

        return response.json();
    }

    async login(data: LoginData): Promise<AuthResponse> {
        const response = await fetch(`${this.baseUrl}/login`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded',
                'Accept': 'application/json',
            },
            credentials: 'include',
            body: new URLSearchParams({
                username: data.email,
                password: data.password,
            }),
        });

        if (!response.ok) {
            const error = await response.json();
            this.handleError(error, response.status);
        }

        return response.json();
    }

    async getCurrentUser(token: string): Promise<UserResponse> {
        const response = await fetch(`${API_URL}${API_VERSION}/users/me`, {
            headers: {
                'Authorization': `Bearer ${token}`,
                'Accept': 'application/json',
            },
            credentials: 'include',
        });

        if (!response.ok) {
            const error = await response.json();
            this.handleError(error, response.status);
        }

        return response.json();
    }

    async requestPasswordReset(email: string): Promise<{ msg: string }> {
        const response = await fetch(`${this.baseUrl}/password-recovery/${email}`, {
            method: 'POST',
            headers: {
                'Accept': 'application/json',
            },
            credentials: 'include',
        });

        if (!response.ok) {
            const error = await response.json();
            this.handleError(error, response.status);
        }

        return response.json();
    }

    async resetPassword(token: string, newPassword: string): Promise<{ msg: string }> {
        const response = await fetch(`${this.baseUrl}/reset-password`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Accept': 'application/json',
            },
            credentials: 'include',
            body: JSON.stringify({
                token,
                new_password: newPassword,
            }),
        });

        if (!response.ok) {
            const error = await response.json();
            this.handleError(error, response.status);
        }

        return response.json();
    }

    async verifyEmail(token: string): Promise<{ msg: string }> {
        const response = await fetch(`${this.baseUrl}/verify/${token}`, {
            method: 'POST',
            headers: {
                'Accept': 'application/json',
            },
            credentials: 'include',
        });

        if (!response.ok) {
            const error = await response.json();
            this.handleError(error, response.status);
        }

        return response.json();
    }

    private handleError(error: any, status: number): never {
        if (status === 400) {
            if (error.detail) {
                if (typeof error.detail === 'string') {
                    throw new Error(error.detail);
                } else if (Array.isArray(error.detail)) {
                    const errors = error.detail.map((err: any) => err.msg).join(', ');
                    throw new Error(errors);
                }
            }
        }
        throw new Error(error.message || 'Authentication failed');
    }
}

export const authService = new AuthService(); 