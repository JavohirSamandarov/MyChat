import React, { useState } from 'react'
import { SidebarSection } from './SidebarSection'
import './Sidebar.css'

interface SidebarItem {
    id: string
    text: string
}

export const Sidebar: React.FC = () => {
    const [activeItem, setActiveItem] = useState<string>(
        'Create Chatbot GPT...'
    )

    const conversationItems: SidebarItem[] = [
        { id: '1', text: 'Clear All' },
        { id: '2', text: 'Create Host Game Environment...' },
        { id: '3', text: 'Apply To Leave For Emergency' },
        { id: '4', text: 'What Is UI UX Design?' },
        { id: '5', text: 'Create POS System' },
        { id: '6', text: 'What is UX Audit?' },
        { id: '7', text: 'Create Chatbot GPT...' },
        { id: '8', text: 'How Chat GPT Work?' },
    ]

    const last7DaysItems: SidebarItem[] = [
        { id: '9', text: 'Crypts Landing App Name' },
        { id: '10', text: 'Operator Grammar Types' },
        { id: '11', text: 'Min Scores For Binary DFA' },
    ]

    const settingsItems: SidebarItem[] = [{ id: '12', text: 'Andrew Neilson' }]

    return (
        <div className='sidebar'>
            <div className='sidebar-header'>
                <h2 className='sidebar-title'>CHAT A.1+</h2>
            </div>

            <div className='sidebar-content'>
                <SidebarSection
                    title='Your conversation'
                    items={conversationItems}
                    activeItem={activeItem}
                    onItemClick={setActiveItem}
                />

                <SidebarSection
                    title='Last 7 Days'
                    items={last7DaysItems}
                    activeItem={activeItem}
                    onItemClick={setActiveItem}
                />

                <SidebarSection
                    title='Settings'
                    items={settingsItems}
                    activeItem={activeItem}
                    onItemClick={setActiveItem}
                />
            </div>
        </div>
    )
}
