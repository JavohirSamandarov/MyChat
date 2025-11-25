import ApiClient from '../base/apiClient'
import { API_BASE_URL } from '../base/endpoints'
import { User } from '../../../features/auth/types/auth.types'

export interface UpdateUserRequest {
    first_name?: string
    last_name?: string
    email?: string
}

class UsersApi {
    private client: ApiClient

    constructor() {
        this.client = new ApiClient(API_BASE_URL)
    }

    async getUsers(): Promise<User[]> {
        return this.client.get<User[]>('/api/users/')
    }

    async getUserById(id: number): Promise<User> {
        return this.client.get<User>(`/api/users/${id}/`)
    }

    async createUser(userData: Omit<User, 'id' | 'is_active'>): Promise<User> {
        return this.client.post<User>('/api/users/', userData)
    }

    async updateUser(id: number, userData: UpdateUserRequest): Promise<User> {
        return this.client.put<User>(`/api/users/${id}/`, userData)
    }

    async partialUpdateUser(
        id: number,
        userData: Partial<UpdateUserRequest>
    ): Promise<User> {
        return this.client.patch<User>(`/api/users/${id}/`, userData)
    }

    async deleteUser(id: number): Promise<void> {
        return this.client.delete<void>(`/api/users/${id}/`)
    }
}

export const usersApi = new UsersApi()
