import React, { useEffect, useRef } from 'react'
import DeleteOutlinedIcon from '@mui/icons-material/DeleteOutlined'
import EditOutlinedIcon from '@mui/icons-material/EditOutlined'
import CheckOutlinedIcon from '@mui/icons-material/CheckOutlined'
import CloseOutlinedIcon from '@mui/icons-material/CloseOutlined'

interface SidebarItemProps {
    text: string
    isActive: boolean
    onClick: () => void
    showDelete: boolean
    onDelete?: () => void
    textId?: number
    showEdit?: boolean
    onEdit?: () => void
    isEditing?: boolean
    editValue?: string
    onEditChange?: (value: string) => void
    onEditSubmit?: () => void
    onEditCancel?: () => void
}

export const SidebarItem: React.FC<SidebarItemProps> = ({
    text,
    isActive,
    onClick,
    showDelete,
    onDelete = () => {},
    textId,
    showEdit = false,
    onEdit = () => {},
    isEditing = false,
    editValue = '',
    onEditChange = () => {},
    onEditSubmit = () => {},
    onEditCancel = () => {},
}) => {
    const inputRef = useRef<HTMLInputElement | null>(null)

    useEffect(() => {
        if (isEditing && inputRef.current) {
            inputRef.current.focus()
            inputRef.current.select()
        }
    }, [isEditing])

    const handleDeleteClick = (e: React.MouseEvent) => {
        e.stopPropagation()
        onDelete()
    }

    const handleEditClick = (e: React.MouseEvent) => {
        e.stopPropagation()
        onEdit()
    }

    const handleSubmitClick = (e: React.MouseEvent) => {
        e.stopPropagation()
        onEditSubmit()
    }

    const handleCancelClick = (e: React.MouseEvent) => {
        e.stopPropagation()
        onEditCancel()
    }

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        onEditChange(e.target.value)
    }

    const handleInputKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
        if (e.key === 'Enter') {
            e.preventDefault()
            onEditSubmit()
        } else if (e.key === 'Escape') {
            e.preventDefault()
            onEditCancel()
        }
    }

    const isTextItem = !!textId

    return (
        <li
            className={`sidebar-item ${isActive ? 'active' : ''} ${
                isTextItem ? 'text-item' : ''
            } ${isEditing ? 'editing' : ''}`}
            onClick={onClick}
        >
            <div className='sidebar-item-content'>
                {isEditing ? (
                    <input
                        ref={inputRef}
                        className='sidebar-item-input'
                        value={editValue}
                        onChange={handleInputChange}
                        onKeyDown={handleInputKeyDown}
                        onClick={(e) => e.stopPropagation()}
                    />
                ) : (
                    <span className='sidebar-item-text'>{text}</span>
                )}
            </div>

            <div className='sidebar-item-actions'>
                {isEditing ? (
                    <>
                        <button
                            className='sidebar-item-action confirm'
                            onClick={handleSubmitClick}
                            title='Save title'
                        >
                            <CheckOutlinedIcon fontSize='small' />
                        </button>
                        <button
                            className='sidebar-item-action close'
                            onClick={handleCancelClick}
                            title='Cancel editing'
                        >
                            <CloseOutlinedIcon fontSize='small' />
                        </button>
                    </>
                ) : (
                    <>
                        {showEdit && (
                            <button
                                className='sidebar-item-action edit'
                                onClick={handleEditClick}
                                title='Rename text'
                            >
                                <EditOutlinedIcon fontSize='small' />
                            </button>
                        )}
                        {(isTextItem || showDelete) && (
                            <button
                                className='sidebar-item-action delete'
                                onClick={handleDeleteClick}
                                title={isTextItem ? 'Delete text' : 'Close'}
                            >
                                <DeleteOutlinedIcon fontSize='small' />
                            </button>
                        )}
                    </>
                )}
            </div>
        </li>
    )
}
