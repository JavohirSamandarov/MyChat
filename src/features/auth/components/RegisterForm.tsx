import React, { useState, useEffect } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { useAuth } from '../hooks/useAuth'

export const RegisterForm: React.FC = () => {
    const { register, loading, error } = useAuth()
    const navigate = useNavigate()
    const [formData, setFormData] = useState({
        email: '',
        password: '',
        password2: '',
        first_name: '',
        last_name: '',
        confirmPassword: '',
    })
    const [message, setMessage] = useState('')
    const [countdown, setCountdown] = useState(0)

    // Countdown timer
    useEffect(() => {
        if (countdown > 0) {
            const timer = setTimeout(() => {
                setCountdown(countdown - 1)
            }, 1000)
            return () => clearTimeout(timer)
        } else if (countdown === 0 && message.includes('successful')) {
            navigate('/login')
        }
    }, [countdown, message, navigate])

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setMessage('')
        setCountdown(0)

        // Validation
        if (formData.password !== formData.confirmPassword) {
            setMessage('Passwords do not match!')
            return
        }

        if (formData.password.length < 6) {
            setMessage('Password must be at least 6 characters long')
            return
        }

        if (!formData.email.includes('@')) {
            setMessage('Please enter a valid email address')
            return
        }

        console.log('Register attempt with:', formData)

        const result = await register({
            email: formData.email,
            password: formData.password,
            password2: formData.password,
            first_name: formData.first_name,
            last_name: formData.last_name,
        })

        console.log('Register result:', result)

        if (result.success) {
            setMessage(
                'Registration successful! Redirecting to login in 3 seconds...'
            )
            setCountdown(3)

            // Formni tozalash
            setFormData({
                email: '',
                password: '',
                password2: '',
                first_name: '',
                last_name: '',
                confirmPassword: '',
            })
        } else {
            setMessage(result.error || 'Registration failed. Please try again.')
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
            className='register-form'
            style={{ maxWidth: '400px', margin: '50px auto', padding: '20px' }}
        >
            <h2>Create Account</h2>
            <form onSubmit={handleSubmit}>
                <div className='form-group' style={{ marginBottom: '15px' }}>
                    <label htmlFor='first_name'>First Name:</label>
                    <input
                        type='text'
                        id='first_name'
                        name='first_name'
                        value={formData.first_name}
                        onChange={handleChange}
                        required
                        style={{
                            width: '100%',
                            padding: '8px',
                            marginTop: '5px',
                            border: '1px solid #ddd',
                            borderRadius: '4px',
                        }}
                        placeholder='Enter your first name'
                    />
                </div>

                <div className='form-group' style={{ marginBottom: '15px' }}>
                    <label htmlFor='last_name'>Last Name:</label>
                    <input
                        type='text'
                        id='last_name'
                        name='last_name'
                        value={formData.last_name}
                        onChange={handleChange}
                        required
                        style={{
                            width: '100%',
                            padding: '8px',
                            marginTop: '5px',
                            border: '1px solid #ddd',
                            borderRadius: '4px',
                        }}
                        placeholder='Enter your last name'
                    />
                </div>

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
                            border: '1px solid #ddd',
                            borderRadius: '4px',
                        }}
                        placeholder='Enter your email'
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
                        minLength={6}
                        style={{
                            width: '100%',
                            padding: '8px',
                            marginTop: '5px',
                            border: '1px solid #ddd',
                            borderRadius: '4px',
                        }}
                        placeholder='Enter password (min 6 characters)'
                    />
                </div>

                <div className='form-group' style={{ marginBottom: '20px' }}>
                    <label htmlFor='confirmPassword'>Confirm Password:</label>
                    <input
                        type='password'
                        id='confirmPassword'
                        name='confirmPassword'
                        value={formData.confirmPassword}
                        onChange={handleChange}
                        required
                        style={{
                            width: '100%',
                            padding: '8px',
                            marginTop: '5px',
                            border: '1px solid #ddd',
                            borderRadius: '4px',
                        }}
                        placeholder='Confirm your password'
                    />
                </div>

                {error && (
                    <div
                        className='error-message'
                        style={{
                            color: 'red',
                            marginBottom: '15px',
                            padding: '10px',
                            backgroundColor: '#f8d7da',
                            borderRadius: '4px',
                        }}
                    >
                        <strong>Error:</strong> {error}
                    </div>
                )}

                {message && (
                    <div
                        className='message'
                        style={{
                            color: message.includes('successful')
                                ? '#155724'
                                : '#721c24',
                            marginBottom: '15px',
                            padding: '10px',
                            backgroundColor: message.includes('successful')
                                ? '#d4edda'
                                : '#f8d7da',
                            borderRadius: '4px',
                            border: `1px solid ${
                                message.includes('successful')
                                    ? '#c3e6cb'
                                    : '#f5c6cb'
                            }`,
                        }}
                    >
                        {message.includes('successful') ? (
                            <div>
                                <div>✅ Registration successful!</div>
                                <div
                                    style={{
                                        marginTop: '5px',
                                        fontSize: '14px',
                                        color: '#0c5460',
                                    }}
                                >
                                    Redirecting to login in {countdown}{' '}
                                    seconds...
                                </div>
                            </div>
                        ) : (
                            message
                        )}
                    </div>
                )}

                <button
                    type='submit'
                    disabled={loading}
                    style={{
                        width: '100%',
                        padding: '12px',
                        backgroundColor: loading ? '#6c757d' : '#28a745',
                        color: 'white',
                        border: 'none',
                        borderRadius: '4px',
                        cursor: loading ? 'not-allowed' : 'pointer',
                        fontSize: '16px',
                        fontWeight: 'bold',
                    }}
                >
                    {loading ? 'Creating Account...' : 'Create Account'}
                </button>
            </form>

            <div
                style={{
                    textAlign: 'center',
                    marginTop: '20px',
                    paddingTop: '20px',
                    borderTop: '1px solid #ddd',
                }}
            >
                <p style={{ margin: 0, color: '#6c757d' }}>
                    Already have an account?{' '}
                    <Link
                        to='/login'
                        style={{
                            color: '#007bff',
                            textDecoration: 'none',
                            fontWeight: 'bold',
                        }}
                    >
                        Sign In
                    </Link>
                </p>
            </div>
        </div>
    )
}

export default RegisterForm
