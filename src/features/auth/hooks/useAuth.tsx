import { useState, useEffect, useCallback } from 'react'
import { LoginRequest, RegisterRequest, User } from '../types/auth.types'
import { authApi } from '@/shared/api/auth/authApi'

interface ApiError {
    response?: {
        data?: {
            message?: string
            detail?: string
            email?: string[]
            password?: string[]
        }
    }
}

export const useAuth = () => {
    const [user, setUser] = useState<User | null>(null)
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState<string | null>(null)
    const [isAuthenticated, setIsAuthenticated] = useState(false)

    const loadUserProfile = useCallback(async () => {
        try {
            const userData = await authApi.getProfile()
            setUser(userData)
            setIsAuthenticated(true)
        } catch (err) {
            console.error('Failed to load user profile:', err)
            setUser(null)
            setIsAuthenticated(false)
        } finally {
            setLoading(false)
        }
    }, [])

    useEffect(() => {
        const token = localStorage.getItem('access_token')
        if (token) {
            loadUserProfile()
        } else {
            setLoading(false)
            setIsAuthenticated(false)
            setUser(null)
        }
    }, [loadUserProfile])

    const login = async (credentials: LoginRequest) => {
        setLoading(true)
        setError(null)

        try {
            const response = await authApi.login(credentials)
            localStorage.setItem('access_token', response.access)
            localStorage.setItem('refresh_token', response.refresh)

            const userData = await authApi.getProfile()
            setUser(userData)
            setIsAuthenticated(true) // <- BU MUHIM!

            return { success: true }
        } catch (err: unknown) {
            const error = err as ApiError
            const errorMessage = error.response?.data?.detail || 'Login failed'
            setError(errorMessage)
            setIsAuthenticated(false)
            return { success: false, error: errorMessage }
        } finally {
            setLoading(false)
        }
    }

    const register = async (userData: RegisterRequest) => {
        setLoading(true)
        setError(null)

        try {
            const response = await authApi.register(userData)
            return { success: true, data: response }
        } catch (err: unknown) {
            const error = err as ApiError

            let errorMessage = 'Registration failed'
            if (error.response?.data?.email) {
                errorMessage = `Email: ${error.response.data.email.join(', ')}`
            } else if (error.response?.data?.password) {
                errorMessage = `Password: ${error.response.data.password.join(
                    ', '
                )}`
            } else if (error.response?.data?.detail) {
                errorMessage = error.response.data.detail
            }

            setError(errorMessage)
            return { success: false, error: errorMessage }
        } finally {
            setLoading(false)
        }
    }

    const logout = () => {
        authApi.logout()
        setUser(null)
        setIsAuthenticated(false)
        setError(null)
    }

    const changePassword = async (oldPassword: string, newPassword: string) => {
        try {
            await authApi.changePassword({
                old_password: oldPassword,
                new_password: newPassword,
            })
            return { success: true }
        } catch (err: unknown) {
            const error = err as ApiError
            const errorMessage =
                error.response?.data?.detail || 'Password change failed'
            return { success: false, error: errorMessage }
        }
    }

    return {
        user,
        loading,
        error,
        login,
        register,
        logout,
        changePassword,
        isAuthenticated,
    }
}
