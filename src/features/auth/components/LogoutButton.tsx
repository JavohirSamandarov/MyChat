import React from 'react'
import { useAuth } from '../hooks/useAuth'

export const LogoutButton: React.FC = () => {
    const { logout } = useAuth()

    const handleLogout = () => {
        logout()
    }

    return (
        <button onClick={handleLogout} className='logout-button'>
            Logout
        </button>
    )
}

export default LogoutButton
