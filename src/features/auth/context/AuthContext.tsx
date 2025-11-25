import React, {
    createContext,
    useContext,
    useState,
    useEffect,
    ReactNode,
} from 'react'
import { authApi } from '@/shared/api/auth/authApi'
import { User, LoginRequest, RegisterRequest } from '../types/auth.types'

interface AuthContextType {
    user: User | null
    loading: boolean
    error: string | null
    login: (
        credentials: LoginRequest
    ) => Promise<{ success: boolean; error?: string }>
    register: (
        userData: RegisterRequest
    ) => Promise<{ success: boolean; error?: string }>
    logout: () => void
    isAuthenticated: boolean
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export const AuthProvider: React.FC<{ children: ReactNode }> = ({
    children,
}) => {
    const [user, setUser] = useState<User | null>(null)
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState<string | null>(null)

    const loadUserProfile = async () => {
        try {
            const userData = await authApi.getProfile()
            setUser(userData)
        } catch (err) {
            setUser(null)
        }
    }

    useEffect(() => {
        const token = localStorage.getItem('access_token')
        if (token) {
            loadUserProfile()
        }
    }, [])

    const login = async (credentials: LoginRequest) => {
        setLoading(true)
        setError(null)

        try {
            const response = await authApi.login(credentials)
            localStorage.setItem('access_token', response.access)
            localStorage.setItem('refresh_token', response.refresh)

            const userData = await authApi.getProfile()
            setUser(userData)

            return { success: true }
        } catch (err: any) {
            const errorMessage = err.response?.data?.detail || 'Login failed'
            setError(errorMessage)
            return { success: false, error: errorMessage }
        } finally {
            setLoading(false)
        }
    }

    const register = async (userData: RegisterRequest) => {
        setLoading(true)
        setError(null)

        try {
            await authApi.register(userData)
            return { success: true }
        } catch (err: any) {
            const errorMessage =
                err.response?.data?.detail || 'Registration failed'
            setError(errorMessage)
            return { success: false, error: errorMessage }
        } finally {
            setLoading(false)
        }
    }

    const logout = () => {
        authApi.logout()
        setUser(null)
        setError(null)
    }

    const value = {
        user,
        loading,
        error,
        login,
        register,
        logout,
        isAuthenticated: !!user,
    }

    return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export const useAuth = () => {
    const context = useContext(AuthContext)
    if (context === undefined) {
        throw new Error('useAuth must be used within an AuthProvider')
    }
    return context
}
