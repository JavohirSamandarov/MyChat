export const API_BASE_URL =
    import.meta.env.VITE_API_BASE_URL || 'http://localhost:5173/api'

// Auth endpoints
export const AUTH_ENDPOINTS = {
    LOGIN: '/auth/token/',
    REGISTER: '/auth/register/',
    REFRESH_TOKEN: '/auth/token/refresh/',
    FORGOT_PASSWORD: '/auth/password/forgot/',
    RESET_PASSWORD: '/auth/password/reset/',
    CHANGE_PASSWORD: '/auth/change-password/',
} as const

// Users endpoints
export const USER_ENDPOINTS = {
    USERS: '/users/',
    USER_BY_ID: (id: number) => `/users/${id}/`,
    CURRENT_USER: '/users/me/',
} as const

// Linguistics endpoints
export const LINGUISTICS_ENDPOINTS = {
    LINGUISTICS: '/linguistics/',
    LINGUISTICS_BY_ID: (id: number) => `/linguistics/${id}/`,
    TAGS: '/tags/',
    TAG_BY_ID: (id: number) => `/tags/${id}/`,
    TAGGED_TEXTS: '/tagged_texts/',
    TAGGED_TEXT_BY_ID: (id: number) => `/tagged_texts/${id}/`,
} as const
