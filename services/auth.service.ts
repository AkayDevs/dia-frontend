import { API_URL, API_VERSION, AUTH_TOKEN_KEY } from '@/lib/constants';
import { BaseResponse } from '@/types/base';
import {
    TokenResponse,
    UserResponse,
    UserWithStatsResponse,
    RegisterRequest,
    LoginRequest,
    PasswordResetRequest,
} from '@/types/auth';

class AuthService {
    private baseUrl = `${API_URL}${API_VERSION}/auth`;
    private userUrl = `${API_URL}${API_VERSION}/users`;

    // Helper method for common fetch options
    private getHeaders(includeAuth: boolean = false, isFormData: boolean = false): HeadersInit {
        const headers: HeadersInit = {
            'Accept': 'application/json',
        };

        if (!isFormData) {
            headers['Content-Type'] = 'application/json';
        }

        if (includeAuth) {
            const token = localStorage.getItem(AUTH_TOKEN_KEY);
            if (token) {
                headers['Authorization'] = `Bearer ${token}`;
            }
        }

        return headers;
    }

    // Helper method to handle errors
    private async handleResponse<T>(response: Response): Promise<T> {
        if (!response.ok) {
            const error = await response.json();
            throw new Error(error.detail || error.message || 'An error occurred');
        }
        return response.json();
    }

    async register(data: RegisterRequest): Promise<UserResponse> {
        const response = await fetch(`${this.baseUrl}/register`, {
            method: 'POST',
            headers: this.getHeaders(),
            credentials: 'include',
            body: JSON.stringify(data),
        });

        return this.handleResponse<UserResponse>(response);
    }

    async login(data: LoginRequest): Promise<TokenResponse> {
        const formData = new URLSearchParams({
            username: data.email,
            password: data.password,
        });

        const response = await fetch(`${this.baseUrl}/login`, {
            method: 'POST',
            headers: this.getHeaders(false, true),
            credentials: 'include',
            body: formData,
        });

        return this.handleResponse<TokenResponse>(response);
    }

    async refreshToken(refreshToken: string): Promise<TokenResponse> {
        const response = await fetch(`${this.baseUrl}/refresh-token`, {
            method: 'POST',
            headers: this.getHeaders(),
            credentials: 'include',
            body: JSON.stringify({ refresh_token: refreshToken }),
        });

        return this.handleResponse<TokenResponse>(response);
    }

    async getCurrentUser(): Promise<UserWithStatsResponse> {
        const response = await fetch(`${this.userUrl}/me`, {
            headers: this.getHeaders(true),
            credentials: 'include',
        });

        return this.handleResponse<UserWithStatsResponse>(response);
    }

    async requestPasswordReset(email: string): Promise<BaseResponse> {
        const response = await fetch(`${this.baseUrl}/password-recovery/${email}`, {
            method: 'POST',
            headers: this.getHeaders(),
            credentials: 'include',
        });

        return this.handleResponse<BaseResponse>(response);
    }

    async resetPassword(data: PasswordResetRequest): Promise<BaseResponse> {
        const response = await fetch(`${this.baseUrl}/reset-password`, {
            method: 'POST',
            headers: this.getHeaders(),
            credentials: 'include',
            body: JSON.stringify(data),
        });

        return this.handleResponse<BaseResponse>(response);
    }

    async verifyEmail(token: string): Promise<BaseResponse> {
        const response = await fetch(`${this.baseUrl}/verify/${token}`, {
            method: 'POST',
            headers: this.getHeaders(),
            credentials: 'include',
        });

        return this.handleResponse<BaseResponse>(response);
    }

    async logout(): Promise<BaseResponse> {
        const response = await fetch(`${this.baseUrl}/logout`, {
            method: 'POST',
            headers: this.getHeaders(true),
            credentials: 'include',
        });

        return this.handleResponse<BaseResponse>(response);
    }
}

export const authService = new AuthService(); 