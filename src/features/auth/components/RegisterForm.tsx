import React, { useState } from 'react'
import { useAuth } from '../hooks/useAuth'

export const RegisterForm: React.FC = () => {
    const { register, loading, error } = useAuth()
    const [formData, setFormData] = useState({
        email: '',
        password: '',
        first_name: '',
        last_name: '',
        confirmPassword: '',
    })
    const [message, setMessage] = useState('')

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setMessage('')

        if (formData.password !== formData.confirmPassword) {
            setMessage('Passwords do not match!')
            return
        }

        if (formData.password.length < 6) {
            setMessage('Password must be at least 6 characters long')
            return
        }

        const result = await register({
            email: formData.email,
            password: formData.password,
            first_name: formData.first_name,
            last_name: formData.last_name,
        })

        if (result.success) {
            setMessage('Registration successful! You can now login.')
            // Formni tozalash
            setFormData({
                email: '',
                password: '',
                first_name: '',
                last_name: '',
                confirmPassword: '',
            })
        } else {
            setMessage(result.error || 'Registration failed')
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
            <h2>Register New User</h2>
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
                        }}
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
                        }}
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
                        minLength={6}
                        style={{
                            width: '100%',
                            padding: '8px',
                            marginTop: '5px',
                        }}
                    />
                </div>

                <div className='form-group' style={{ marginBottom: '15px' }}>
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

                {message && (
                    <div
                        className='message'
                        style={{
                            color: message.includes('successful')
                                ? 'green'
                                : 'red',
                            marginBottom: '15px',
                            padding: '10px',
                            backgroundColor: message.includes('successful')
                                ? '#d4edda'
                                : '#f8d7da',
                            borderRadius: '4px',
                        }}
                    >
                        {message}
                    </div>
                )}

                <button
                    type='submit'
                    disabled={loading}
                    style={{
                        width: '100%',
                        padding: '10px',
                        backgroundColor: loading ? '#ccc' : '#28a745',
                        color: 'white',
                        border: 'none',
                        borderRadius: '4px',
                        cursor: loading ? 'not-allowed' : 'pointer',
                    }}
                >
                    {loading ? 'Registering...' : 'Register'}
                </button>
            </form>
        </div>
    )
}

export default RegisterForm
