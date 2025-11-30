import React from 'react'
import { SidebarItem } from './SidebarItem'

interface SidebarItemType {
    id: string
    text: string
    languageId?: number
}

interface SidebarSectionProps {
    title: string
    items: SidebarItemType[]
    activeItem: string
    onItemClick: (itemText: string, languageId?: number) => void
    showDelete?: boolean
    onCloseLanguage?: () => void
}

export const SidebarSection: React.FC<SidebarSectionProps> = ({
    title,
    items,
    activeItem,
    onItemClick,
    showDelete = false,
    onCloseLanguage = () => {},
}) => {
    return (
        <div className='sidebar-section'>
            <h3 className='sidebar-section-title'>{title}</h3>
            <ul className='sidebar-list'>
                {items.map((item) => (
                    <SidebarItem
                        key={item.id}
                        text={item.text}
                        isActive={activeItem === item.text}
                        onClick={() => onItemClick(item.text, item.languageId)}
                        showDelete={showDelete && activeItem === item.text}
                        onDelete={onCloseLanguage}
                        languageId={item.languageId}
                    />
                ))}
            </ul>
        </div>
    )
}
