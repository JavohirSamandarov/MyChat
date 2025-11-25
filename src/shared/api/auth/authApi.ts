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
    changePassword(arg0: { old_password: string; new_password: string }) {
        throw new Error('Method not implemented.')
    }
    private client: ApiClient

    constructor() {
        console.log('AuthApi initialized with URL:', API_BASE_URL)
        this.client = new ApiClient(API_BASE_URL)
    }

    async login(credentials: LoginRequest): Promise<LoginResponse> {
        console.log('Login request to:', '/auth/token/')
        return this.client.post<LoginResponse>('/auth/token/', credentials)
    }

    async register(userData: RegisterRequest): Promise<RegisterResponse> {
        console.log('Register request to:', '/auth/register/')
        return this.client.post<RegisterResponse>('/auth/register/', userData)
    }

    async getProfile(): Promise<User> {
        return this.client.get<User>('/users/me/')
    }

    async logout(): Promise<void> {
        localStorage.removeItem('access_token')
        localStorage.removeItem('refresh_token')
    }
}

export const authApi = new AuthApi()
