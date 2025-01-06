import { API_URL, API_VERSION } from '@/lib/constants';

export interface UserProfile {
    id: number;
    email: string;
    name?: string;
    avatar_url?: string;
    is_active: boolean;
}

export interface NotificationSettings {
    email_notifications: boolean;
    analysis_complete: boolean;
    document_shared: boolean;
    security_alerts: boolean;
}

interface UpdatePasswordPayload {
    current_password: string;
    new_password: string;
}

class UserService {
    private getHeaders(token: string, contentType = 'application/json'): HeadersInit {
        return {
            'Authorization': `Bearer ${token}`,
            'Content-Type': contentType,
        };
    }

    async getProfile(): Promise<UserProfile> {
        const token = localStorage.getItem('token');
        if (!token) throw new Error('No authentication token found');

        const response = await fetch(`${API_URL}${API_VERSION}/users/me`, {
            headers: this.getHeaders(token),
        });

        if (!response.ok) {
            throw new Error('Failed to fetch user profile');
        }

        return response.json();
    }

    async updateProfile(profile: Pick<UserProfile, 'name' | 'email'>): Promise<UserProfile> {
        const token = localStorage.getItem('token');
        if (!token) throw new Error('No authentication token found');

        const response = await fetch(`${API_URL}${API_VERSION}/users/me`, {
            method: 'PUT',
            headers: this.getHeaders(token),
            body: JSON.stringify(profile),
        });

        if (!response.ok) {
            throw new Error('Failed to update profile');
        }

        return response.json();
    }

    async getNotificationSettings(): Promise<NotificationSettings> {
        const token = localStorage.getItem('token');
        if (!token) throw new Error('No authentication token found');

        const response = await fetch(`${API_URL}${API_VERSION}/users/notifications`, {
            headers: this.getHeaders(token),
        });

        if (!response.ok) {
            throw new Error('Failed to fetch notification settings');
        }

        return response.json();
    }

    async updateNotificationSettings(settings: NotificationSettings): Promise<NotificationSettings> {
        const token = localStorage.getItem('token');
        if (!token) throw new Error('No authentication token found');

        const response = await fetch(`${API_URL}${API_VERSION}/users/notifications`, {
            method: 'PUT',
            headers: this.getHeaders(token),
            body: JSON.stringify(settings),
        });

        if (!response.ok) {
            throw new Error('Failed to update notification settings');
        }

        return response.json();
    }

    async updatePassword(payload: UpdatePasswordPayload): Promise<void> {
        const token = localStorage.getItem('token');
        if (!token) throw new Error('No authentication token found');

        const response = await fetch(`${API_URL}${API_VERSION}/users/password`, {
            method: 'PUT',
            headers: this.getHeaders(token),
            body: JSON.stringify(payload),
        });

        if (!response.ok) {
            throw new Error('Failed to change password');
        }
    }

    async uploadAvatar(file: File): Promise<UserProfile> {
        const token = localStorage.getItem('token');
        if (!token) throw new Error('No authentication token found');

        const formData = new FormData();
        formData.append('avatar', file);

        const response = await fetch(`${API_URL}${API_VERSION}/users/avatar`, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${token}`,
            },
            body: formData,
        });

        if (!response.ok) {
            throw new Error('Failed to upload avatar');
        }

        return response.json();
    }

    async deleteAccount(): Promise<void> {
        const token = localStorage.getItem('token');
        if (!token) throw new Error('No authentication token found');

        const response = await fetch(`${API_URL}${API_VERSION}/users/me`, {
            method: 'DELETE',
            headers: this.getHeaders(token),
        });

        if (!response.ok) {
            throw new Error('Failed to delete account');
        }
    }
}

export const userService = new UserService(); 