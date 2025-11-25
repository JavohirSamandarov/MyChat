import React from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../hooks/useAuth'

export const LogoutButton: React.FC = () => {
    const { logout } = useAuth()
    const navigate = useNavigate()

    const handleLogout = () => {
        logout()
        navigate('/login')
        // Qo'shimcha: sahifani yangilash
        window.location.reload()
    }

    return (
        <button
            onClick={handleLogout}
            className='logout-button'
            style={{
                padding: '8px 16px',
                backgroundColor: '#dc3545',
                color: 'white',
                border: 'none',
                borderRadius: '4px',
                cursor: 'pointer',
            }}
        >
            Logout
        </button>
    )
}

export default LogoutButton
