import { API_URL, API_VERSION } from '@/lib/constants';
import { BaseResponse } from '@/types/base';
import { UserResponse, UserWithStatsResponse } from '@/types/auth';
import {
    UpdateProfileRequest,
    UpdatePasswordRequest,
    NotificationSettings,
    UserListParams,
    UserListResponse,
} from '@/types/user';

class UserService {
    private baseUrl = `${API_URL}${API_VERSION}/users`;

    // Helper method for common fetch options
    private getHeaders(isFormData: boolean = false): HeadersInit {
        const headers: HeadersInit = {
            'Accept': 'application/json',
        };

        if (!isFormData) {
            headers['Content-Type'] = 'application/json';
        }

        const token = localStorage.getItem('access_token');
        if (token) {
            headers['Authorization'] = `Bearer ${token}`;
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

    /**
     * Get current user's profile
     */
    async getProfile(): Promise<UserResponse> {
        const response = await fetch(`${this.baseUrl}/me`, {
            headers: this.getHeaders(),
            credentials: 'include',
        });

        return this.handleResponse<UserResponse>(response);
    }

    /**
     * Get current user's profile with statistics
     */
    async getProfileStats(): Promise<UserWithStatsResponse> {
        const response = await fetch(`${this.baseUrl}/me/stats`, {
            headers: this.getHeaders(),
            credentials: 'include',
        });

        return this.handleResponse<UserWithStatsResponse>(response);
    }

    /**
     * Update current user's profile
     */
    async updateProfile(data: UpdateProfileRequest): Promise<UserResponse> {
        const response = await fetch(`${this.baseUrl}/me`, {
            method: 'PUT',
            headers: this.getHeaders(),
            credentials: 'include',
            body: JSON.stringify(data),
        });

        return this.handleResponse<UserResponse>(response);
    }

    /**
     * Update user's password
     */
    async updatePassword(data: UpdatePasswordRequest): Promise<BaseResponse> {
        const response = await fetch(`${this.baseUrl}/me/password`, {
            method: 'PUT',
            headers: this.getHeaders(),
            credentials: 'include',
            body: JSON.stringify(data),
        });

        return this.handleResponse<BaseResponse>(response);
    }

    /**
     * Upload user avatar
     */
    async uploadAvatar(file: File): Promise<UserResponse> {
        const formData = new FormData();
        formData.append('avatar', file);

        const response = await fetch(`${this.baseUrl}/me/avatar`, {
            method: 'POST',
            headers: this.getHeaders(true),
            credentials: 'include',
            body: formData,
        });

        return this.handleResponse<UserResponse>(response);
    }

    /**
     * Get user notification settings
     */
    async getNotificationSettings(): Promise<NotificationSettings> {
        const response = await fetch(`${this.baseUrl}/me/notifications`, {
            headers: this.getHeaders(),
            credentials: 'include',
        });

        return this.handleResponse<NotificationSettings>(response);
    }

    /**
     * Update user notification settings
     */
    async updateNotificationSettings(settings: NotificationSettings): Promise<NotificationSettings> {
        const response = await fetch(`${this.baseUrl}/me/notifications`, {
            method: 'PUT',
            headers: this.getHeaders(),
            credentials: 'include',
            body: JSON.stringify(settings),
        });

        return this.handleResponse<NotificationSettings>(response);
    }

    /**
     * Delete current user's account
     */
    async deleteAccount(): Promise<BaseResponse> {
        const response = await fetch(`${this.baseUrl}/me`, {
            method: 'DELETE',
            headers: this.getHeaders(),
            credentials: 'include',
        });

        return this.handleResponse<BaseResponse>(response);
    }

    /**
     * Get list of users (admin only)
     */
    async getUsers(params: UserListParams = {}): Promise<UserListResponse> {
        const queryParams = new URLSearchParams();

        if (params.skip !== undefined) queryParams.append('skip', params.skip.toString());
        if (params.limit !== undefined) queryParams.append('limit', params.limit.toString());
        if (params.search) queryParams.append('search', params.search);
        if (params.role) queryParams.append('role', params.role);
        if (params.is_active !== undefined) queryParams.append('is_active', params.is_active.toString());
        if (params.is_verified !== undefined) queryParams.append('is_verified', params.is_verified.toString());

        const response = await fetch(`${this.baseUrl}?${queryParams.toString()}`, {
            headers: this.getHeaders(),
            credentials: 'include',
        });

        return this.handleResponse<UserListResponse>(response);
    }

    /**
     * Get user by ID (admin only)
     */
    async getUserById(userId: string): Promise<UserResponse> {
        const response = await fetch(`${this.baseUrl}/${userId}`, {
            headers: this.getHeaders(),
            credentials: 'include',
        });

        return this.handleResponse<UserResponse>(response);
    }

    /**
     * Update user by ID (admin only)
     */
    async updateUser(userId: string, data: UpdateProfileRequest): Promise<UserResponse> {
        const response = await fetch(`${this.baseUrl}/${userId}`, {
            method: 'PUT',
            headers: this.getHeaders(),
            credentials: 'include',
            body: JSON.stringify(data),
        });

        return this.handleResponse<UserResponse>(response);
    }
}

export const userService = new UserService(); 