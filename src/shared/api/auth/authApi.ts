import ApiClient from '../base/apiClient'
import { API_BASE_URL } from '../base/endpoints'
import {
    LoginRequest,
    LoginResponse,
    RegisterRequest,
    RegisterResponse,
    User,
} from '../../../features/auth/types/auth.types'

class AuthApi {
    private client: ApiClient

    constructor() {
        console.log('AuthApi initialized with URL:', API_BASE_URL)
        this.client = new ApiClient(API_BASE_URL)
    }

    async login(credentials: LoginRequest): Promise<LoginResponse> {
        console.log('Login request to:', '/auth/token/')
        console.log('Login data:', credentials)
        try {
            const response = await this.client.post<LoginResponse>(
                '/auth/token/',
                credentials
            )
            console.log('Login success:', response)
            return response
        } catch (error: any) {
            console.log('Login error status:', error.response?.status)
            console.log('Login error data:', error.response?.data)
            throw error
        }
    }

    async register(userData: RegisterRequest): Promise<RegisterResponse> {
        console.log('Register request to:', '/auth/register/')
        console.log('Register data:', userData)
        try {
            const response = await this.client.post<RegisterResponse>(
                '/auth/register/',
                userData
            )
            console.log('Register success response:', response)
            return response
        } catch (error: any) {
            console.log('Register error status:', error.response?.status)
            console.log('Register error data:', error.response?.data)
            console.log('Register error message:', error.message)
            throw error
        }
    }

    async getProfile(): Promise<User> {
        console.log('Get profile request')
        try {
            const response = await this.client.get<User>('/users/me/')
            console.log('Profile success:', response)
            return response
        } catch (error: any) {
            console.log('Profile error:', error)
            throw error
        }
    }

    async logout(): Promise<void> {
        localStorage.removeItem('access_token')
        localStorage.removeItem('refresh_token')
        console.log('Logged out')
    }

    async changePassword(data: {
        old_password: string
        new_password: string
    }): Promise<void> {
        return this.client.post<void>('/auth/change-password/', data)
    }
}

export const authApi = new AuthApi()
