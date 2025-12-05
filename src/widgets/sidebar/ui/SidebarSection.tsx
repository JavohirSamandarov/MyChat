import React from 'react'
import { SidebarItem } from './SidebarItem'

interface SidebarItemType {
    id: string
    text: string
    languageId?: number
    textId?: number
}

interface SidebarSectionProps {
    title: string
    items: SidebarItemType[]
    activeItem: string
    activeMatchBy?: 'text' | 'id'
    onItemClick?: (itemText: string, languageId?: number) => void
    onTextClick?: (textId: number, textTitle: string) => void
    showDelete?: boolean
    onCloseLanguage?: () => void
    isLoading?: boolean
    onTextDelete?: (textId: number) => void
    onTextEditStart?: (textId: number, currentTitle: string) => void
    onTextEditChange?: (value: string) => void
    onTextEditSubmit?: () => void
    onTextEditCancel?: () => void
    editingTextId?: number | null
    editingTextValue?: string
}

export const SidebarSection: React.FC<SidebarSectionProps> = ({
    title,
    items,
    activeItem,
    activeMatchBy = 'text',
    onItemClick = () => {},
    onTextClick = () => {},
    showDelete = false,
    onCloseLanguage = () => {},
    isLoading = false,
    onTextDelete = () => {},
    onTextEditStart,
    onTextEditChange,
    onTextEditSubmit,
    onTextEditCancel,
    editingTextId = null,
    editingTextValue = '',
}) => {
    const getComparisonValue = (item: SidebarItemType) =>
        activeMatchBy === 'id' ? item.id : item.text

    return (
        <div className='sidebar-section'>
            <h3 className='sidebar-section-title'>{title}</h3>
            {isLoading ? (
                <div className='loading'>Loading texts...</div>
            ) : (
                <ul className='sidebar-list'>
                    {items.map((item) => {
                        const isCurrentItemActive =
                            activeItem !== undefined &&
                            activeItem === getComparisonValue(item)
                        const isTextItem = !!item.textId
                        const canCloseLanguage =
                            !isTextItem &&
                            showDelete &&
                            isCurrentItemActive
                        const isEditing =
                            isTextItem && editingTextId === item.textId

                        const handleItemDelete = () => {
                            if (isTextItem && item.textId) {
                                onTextDelete(item.textId)
                            } else {
                                onCloseLanguage()
                            }
                        }

                        return (
                            <SidebarItem
                                key={item.id}
                                text={item.text}
                                isActive={isCurrentItemActive}
                                onClick={() => {
                                    if (item.textId && onTextClick) {
                                        onTextClick(item.textId, item.text)
                                    } else {
                                        onItemClick(item.text, item.languageId)
                                    }
                                }}
                                showDelete={isTextItem || canCloseLanguage}
                                onDelete={handleItemDelete}
                                textId={item.textId}
                                showEdit={isTextItem}
                                onEdit={() => {
                                    if (item.textId && onTextEditStart) {
                                        onTextEditStart(item.textId, item.text)
                                    }
                                }}
                                isEditing={isEditing}
                                editValue={
                                    isEditing ? editingTextValue : item.text
                                }
                                onEditChange={(value) => {
                                    if (isEditing && onTextEditChange) {
                                        onTextEditChange(value)
                                    }
                                }}
                                onEditSubmit={() => {
                                    if (isEditing && onTextEditSubmit) {
                                        onTextEditSubmit()
                                    }
                                }}
                                onEditCancel={() => {
                                    if (isEditing && onTextEditCancel) {
                                        onTextEditCancel()
                                    }
                                }}
                            />
                        )
                    })}
                    {items.length === 0 && title === 'Your Texts' && (
                        <li className='sidebar-empty'>No saved texts yet</li>
                    )}
                </ul>
            )}
        </div>
    )
}
