import React from 'react'
import { SidebarSection } from './SidebarSection'
import './Sidebar.css'

interface SidebarProps {
    activeItem?: string
    onItemClick?: (itemText: string) => void
    onEditorClick?: () => void
    onCloseLanguage?: () => void
    languageItems?: Array<{ id: string; text: string }>
    activeTab?: number
}

export const Sidebar: React.FC<SidebarProps> = ({
    activeItem = '',
    onItemClick = () => {},
    onEditorClick = () => {},
    onCloseLanguage = () => {},
    languageItems = [],
    activeTab = 0,
}) => {
    // const last7DaysItems = [
    //     // { id: '9', text: 'Crypto Lending App Name' },
    //     // { id: '10', text: 'Operator Grammar Types' },
    // ]

    const sectionTitle =
        activeTab === 0 ? 'Morfologik tahlil' : 'Sintaksis tahlil'

    return (
        <div className='sidebar'>
            <div className='sidebar-header'>
                <h2 className='sidebar-title'>Annotation Tool</h2>
                <button className='new-chat-button' onClick={onEditorClick}>
                    Editor
                </button>
            </div>

            <div className='sidebar-content'>
                <SidebarSection
                    title={sectionTitle}
                    items={languageItems}
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
