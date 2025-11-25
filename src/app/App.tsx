import React, { useState, useEffect } from 'react'
import { Routes, Route, Navigate, useLocation } from 'react-router-dom'
import { useAuth } from '@/features/auth/hooks/useAuth'
import { LoginForm } from '@/features/auth/components/LoginForm'
import { RegisterForm } from '@/features/auth/components/RegisterForm'
import { MainLayout } from '@/app/layouts/MainLayout'

function App() {
    const { isAuthenticated, user, loading } = useAuth() // <- loading qo'shildi
    const location = useLocation()

    // Debug uchun
    useEffect(() => {
        console.log('Auth state changed:', { isAuthenticated, user, loading })
        console.log('Current path:', location.pathname)
    }, [isAuthenticated, user, location.pathname, loading])

    // Loading bo'lsa, spinner ko'rsatamiz
    if (loading) {
        return (
            <div
                style={{
                    display: 'flex',
                    justifyContent: 'center',
                    alignItems: 'center',
                    height: '100vh',
                    fontSize: '18px',
                    color: '#666',
                }}
            >
                Loading...
            </div>
        )
    }

    return (
        <div className='App'>
            <Routes>
                {/* Asosiy sahifa */}
                <Route
                    path='/'
                    element={
                        isAuthenticated ? (
                            <MainLayout />
                        ) : (
                            <Navigate to='/login' replace />
                        )
                    }
                />

                {/* Login sahifasi */}
                <Route
                    path='/login'
                    element={
                        !isAuthenticated ? (
                            <AuthPage initialTab='login' />
                        ) : (
                            <Navigate to='/' replace />
                        )
                    }
                />

                {/* Register sahifasi */}
                <Route
                    path='/register'
                    element={
                        !isAuthenticated ? (
                            <AuthPage initialTab='register' />
                        ) : (
                            <Navigate to='/' replace />
                        )
                    }
                />
            </Routes>
        </div>
    )
}

// Alohida AuthPage komponenti
const AuthPage: React.FC<{ initialTab: 'login' | 'register' }> = ({
    initialTab,
}) => {
    const [isLogin, setIsLogin] = useState(initialTab === 'login')

    return (
        <div style={{ padding: '20px' }}>
            <div style={{ textAlign: 'center', marginBottom: '20px' }}>
                <button
                    onClick={() => setIsLogin(true)}
                    style={{
                        marginRight: '10px',
                        padding: '10px 20px',
                        backgroundColor: isLogin ? '#007bff' : '#f8f9fa',
                        color: isLogin ? 'white' : 'black',
                        border: '1px solid #ddd',
                        borderRadius: '4px',
                        cursor: 'pointer',
                    }}
                >
                    Login
                </button>
                <button
                    onClick={() => setIsLogin(false)}
                    style={{
                        padding: '10px 20px',
                        backgroundColor: !isLogin ? '#28a745' : '#f8f9fa',
                        color: !isLogin ? 'white' : 'black',
                        border: '1px solid #ddd',
                        borderRadius: '4px',
                        cursor: 'pointer',
                    }}
                >
                    Register
                </button>
            </div>

            {isLogin ? <LoginForm /> : <RegisterForm />}
        </div>
    )
}

export default App
