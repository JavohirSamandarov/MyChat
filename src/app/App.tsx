import React from 'react'
import { useAuth } from '@/features/auth/hooks/useAuth'
import { LoginForm } from '@/features/auth/components/LoginForm'
import { RegisterForm } from '@/features/auth/components/RegisterForm'
import { MainLayout } from '@/app/layouts/MainLayout'

function App() {
    const { isAuthenticated } = useAuth()
    const [isLogin, setIsLogin] = React.useState(true)

    if (isAuthenticated) {
        return <MainLayout />
    }

    return (
        <div className='App'>
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
