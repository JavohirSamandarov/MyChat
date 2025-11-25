import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../hooks/useAuth'

export const LoginForm: React.FC = () => {
    const { login, loading, error } = useAuth()
    const navigate = useNavigate()
    const [formData, setFormData] = useState({
        email: '',
        password: '',
    })

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        console.log('Login form submitting...') // Debug

        const result = await login(formData)
        console.log('Login result:', result) // Debug

        if (result.success) {
            navigate('/')
            window.location.reload()
            console.log('Login successful, should redirect to MainLayout') // Debug
            // Bu yerda App component qayta render bo'lishi kerak
        } else {
            console.log('Login failed:', result.error) // Debug
        }
    }

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value,
        })
    }

    return (
        <div
            className='login-form'
            style={{ maxWidth: '400px', margin: '50px auto', padding: '20px' }}
        >
            <h2>Login</h2>
            <form onSubmit={handleSubmit}>
                <div className='form-group' style={{ marginBottom: '15px' }}>
                    <label htmlFor='email'>Email:</label>
                    <input
                        type='email'
                        id='email'
                        name='email'
                        value={formData.email}
                        onChange={handleChange}
                        required
                        style={{
                            width: '100%',
                            padding: '8px',
                            marginTop: '5px',
                        }}
                    />
                </div>

                <div className='form-group' style={{ marginBottom: '15px' }}>
                    <label htmlFor='password'>Password:</label>
                    <input
                        type='password'
                        id='password'
                        name='password'
                        value={formData.password}
                        onChange={handleChange}
                        required
                        style={{
                            width: '100%',
                            padding: '8px',
                            marginTop: '5px',
                        }}
                    />
                </div>

                {error && (
                    <div
                        className='error-message'
                        style={{ color: 'red', marginBottom: '15px' }}
                    >
                        {error}
                    </div>
                )}

                <button
                    type='submit'
                    disabled={loading}
                    style={{
                        width: '100%',
                        padding: '10px',
                        backgroundColor: loading ? '#ccc' : '#007bff',
                        color: 'white',
                        border: 'none',
                        borderRadius: '4px',
                        cursor: loading ? 'not-allowed' : 'pointer',
                    }}
                >
                    {loading ? 'Logging in...' : 'Login'}
                </button>
            </form>
        </div>
    )
}

export default LoginForm
