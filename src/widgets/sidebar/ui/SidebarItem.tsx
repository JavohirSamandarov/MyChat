import React from 'react'

interface SidebarItemProps {
    text: string
    isActive: boolean
    onClick: () => void
    showDelete: boolean
    onDelete?: () => void
    languageId?: number
}

export const SidebarItem: React.FC<SidebarItemProps> = ({
    text,
    isActive,
    onClick,
    showDelete,
    onDelete = () => {},
    languageId,
}) => {
    const handleDeleteClick = (e: React.MouseEvent) => {
        e.stopPropagation()
        onDelete()
    }

    return (
        <li
            className={`sidebar-item ${isActive ? 'active' : ''}`}
            onClick={onClick}
        >
            <span className='sidebar-item-text'>{text}</span>
            {showDelete && (
                <button
                    className='sidebar-item-delete'
                    onClick={handleDeleteClick}
                >
                    <svg
                        width='16'
                        height='16'
                        viewBox='0 0 24 24'
                        fill='none'
                        xmlns='http://www.w3.org/2000/svg'
                    >
                        <path
                            d='M18 6L6 18'
                            stroke='currentColor'
                            strokeWidth='2'
                            strokeLinecap='round'
                            strokeLinejoin='round'
                        />
                        <path
                            d='M6 6L18 18'
                            stroke='currentColor'
                            strokeWidth='2'
                            strokeLinecap='round'
                            strokeLinejoin='round'
                        />
                    </svg>
                </button>
            )}
        </li>
    )
}
