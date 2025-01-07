import { UserRole } from '@/lib/enums';

/**
 * Response interface for authentication token
 */
export interface TokenResponse {
    access_token: string;
    refresh_token: string;
    token_type: string;
}

/**
 * Base user response interface
 */
export interface UserResponse {
    id: string;
    email: string;
    name: string;
    role: UserRole;
    avatar?: string;
    is_active: boolean;
    is_verified: boolean;
    created_at: string;
    updated_at: string;
}

/**
 * Extended user response with usage statistics
 */
export interface UserWithStatsResponse extends UserResponse {
    total_documents: number;
    documents_analyzed: number;
    last_login?: string;
    storage_used: number;
}

/**
 * Request interface for user registration
 */
export interface RegisterRequest {
    email: string;
    password: string;
    confirm_password: string;
    name: string;
    avatar?: string;
}

/**
 * Request interface for user login
 */
export interface LoginRequest {
    email: string;
    password: string;
}

/**
 * Request interface for password reset
 */
export interface PasswordResetRequest {
    token: string;
    new_password: string;
}
