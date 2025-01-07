import { UserResponse } from './auth';

/**
 * Request interface for updating user profile
 */
export interface UpdateProfileRequest {
    email?: string;
    name?: string;
    avatar?: string;
}

/**
 * Request interface for updating user password
 */
export interface UpdatePasswordRequest {
    current_password: string;
    new_password: string;
}

/**
 * Interface for user notification preferences
 */
export interface NotificationSettings {
    email_notifications: boolean;
    analysis_complete: boolean;
    document_shared: boolean;
    security_alerts: boolean;
}

/**
 * Interface for user list query parameters
 */
export interface UserListParams {
    skip?: number;
    limit?: number;
    search?: string;
    role?: string;
    is_active?: boolean;
    is_verified?: boolean;
}

/**
 * Interface for paginated user list response
 */
export interface UserListResponse {
    items: UserResponse[];
    total: number;
    page: number;
    size: number;
    pages: number;
} 