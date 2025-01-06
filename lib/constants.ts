export const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';
export const API_VERSION = '/api/v1';

export const AUTH_TOKEN_KEY = 'token';

export const PASSWORD_REQUIREMENTS = {
    minLength: 8,
    requireUppercase: true,
    requireLowercase: true,
    requireNumber: true,
};

export const VALIDATION_RULES = {
    email: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
    password: new RegExp(
        `^(?=.*[a-z])(?=.*[A-Z])(?=.*\\d).{${PASSWORD_REQUIREMENTS.minLength},}$`
    ),
    fullName: {
        minLength: 2,
        maxLength: 100,
    },
}; 