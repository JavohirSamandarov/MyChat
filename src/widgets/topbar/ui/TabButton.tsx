import React from 'react'

interface TabButtonProps {
    label: string
    isActive: boolean
    onClick: () => void
}

export const TabButton: React.FC<TabButtonProps> = ({
    label,
    isActive,
    onClick,
}) => {
    return (
        <button
            className={`tab-button ${isActive ? 'active' : ''}`}
            onClick={onClick}
        >
            {label}
        </button>
    )
}
