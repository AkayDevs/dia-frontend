/**
 * Base response interface for API endpoints that return a message
 */
export interface BaseResponse {
    msg: string;
}

/**
 * Base interface for paginated responses
 */
export interface PaginatedResponse<T> {
    items: T[];
    total: number;
    page: number;
    size: number;
    pages: number;
}

/**
 * Base interface for API error responses
 */
export interface ApiError {
    detail: string | Array<{ msg: string; loc: string[] }>;
    status_code?: number;
    message?: string;
} 