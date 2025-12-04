import React from 'react'
import DeleteOutlinedIcon from '@mui/icons-material/DeleteOutlined'

interface SidebarItemProps {
    text: string
    isActive: boolean
    onClick: () => void
    showDelete: boolean
    onDelete?: () => void
    textId?: number
}

export const SidebarItem: React.FC<SidebarItemProps> = ({
    text,
    isActive,
    onClick,
    showDelete,
    onDelete = () => {},
    textId,
}) => {
    const handleDeleteClick = (e: React.MouseEvent) => {
        e.stopPropagation()
        onDelete()
    }

    const isTextItem = !!textId

    const renderActionButton = () => {
        if (isTextItem) {
            return (
                <button
                    className='sidebar-item-action delete'
                    onClick={handleDeleteClick}
                    title='Delete text'
                >
                    <DeleteOutlinedIcon fontSize='small' />
                </button>
            )
        }

        if (showDelete) {
            return (
                <button
                    className='sidebar-item-action close'
                    onClick={handleDeleteClick}
                    title='Close'
                >
                    ×
                </button>
            )
        }

        return null
    }

    return (
        <li
            className={`sidebar-item ${isActive ? 'active' : ''} ${
                isTextItem ? 'text-item' : ''
            }`}
            onClick={onClick}
        >
            {isTextItem && <span className='sidebar-item-icon'>dY",</span>}
            <span className='sidebar-item-text'>{text}</span>
            {renderActionButton()}
        </li>
    )
}
