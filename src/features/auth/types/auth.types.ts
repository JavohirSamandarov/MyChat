export interface LoginRequest {
    email: string
    password: string
}

export interface LoginResponse {
    access: string
    refresh: string
}

export interface RegisterRequest {
    email: string
    password: string
    first_name: string
    last_name: string
}

export interface RegisterResponse {
    id: number
    email: string
    first_name: string
    last_name: string
}

export interface RefreshTokenRequest {
    refresh: string
}

export interface RefreshTokenResponse {
    access: string
}

export interface ForgotPasswordRequest {
    email: string
}

export interface ResetPasswordRequest {
    token: string
    password: string
}

export interface ChangePasswordRequest {
    old_password: string
    new_password: string
}

export interface User {
    id: number
    email: string
    first_name: string | null
    last_name: string | null
    is_active: boolean
    role: string
    created_at: string
    updated_at: string
    is_staff: boolean
}
