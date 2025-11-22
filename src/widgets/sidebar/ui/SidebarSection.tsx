// src/widgets/sidebar/ui/SidebarSection.tsx
import React from 'react'
import { SidebarItem } from './SidebarItem'

interface SidebarItemType {
    id: string
    text: string
}

interface SidebarSectionProps {
    title: string
    items: SidebarItemType[]
    activeItem: string
    onItemClick: (itemText: string) => void
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
                        onClick={() => onItemClick(item.text)}
                        showDelete={showDelete && activeItem === item.text}
                        onDelete={onCloseLanguage}
                    />
                ))}
            </ul>
        </div>
    )
}
