// src/widgets/sidebar/ui/Sidebar.tsx
import React from 'react'
import { SidebarSection } from './SidebarSection'
import './Sidebar.css'

interface SidebarProps {
    activeItem?: string
    onItemClick?: (itemText: string) => void
    onEditorClick?: () => void
    onCloseLanguage?: () => void
}

export const Sidebar: React.FC<SidebarProps> = ({
    activeItem = '',
    onItemClick = () => {},
    onEditorClick = () => {},
    onCloseLanguage = () => {},
}) => {
    const conversationItems = [
        { id: '1', text: 'Uzbek tili' },
        { id: '2', text: 'Rus tili' },
    ]

    // const last7DaysItems = [
    //     { id: '9', text: 'Crypto Lending App Name' },
    //     { id: '10', text: 'Operator Grammar Types' },
    // ]

    return (
        <div className='sidebar'>
            <div className='sidebar-header'>
                <h2 className='sidebar-title'>CHAT A.I+</h2>
                <button className='new-chat-button' onClick={onEditorClick}>
                    Editor
                </button>
            </div>

            <div className='sidebar-content'>
                <SidebarSection
                    title='Tillar'
                    items={conversationItems}
                    activeItem={activeItem}
                    onItemClick={onItemClick}
                    showDelete={!!activeItem}
                    onCloseLanguage={onCloseLanguage}
                />

                {/* <SidebarSection
                    title='Last 7 Days'
                    items={last7DaysItems}
                    activeItem={activeItem}
                    onItemClick={onItemClick}
                    showDelete={!!activeItem}
                    onCloseLanguage={onCloseLanguage}
                /> */}
            </div>

            <div className='sidebar-footer'>
                <div className='profile-section'>
                    <div className='profile-avatar'>AN</div>
                    <div className='profile-info'>
                        <div className='profile-name'>Andrew Neilson</div>
                    </div>
                </div>
            </div>
        </div>
    )
}
