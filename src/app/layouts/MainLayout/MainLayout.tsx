import { ChatInput, Sidebar, Topbar } from '@/widgets'
import './MainLayout.css'
import React, { useState } from 'react'

const MainLayout: React.FC = () => {
    const [activeTab, setActiveTab] = useState<number>(0) // 0 = Morfologik, 1 = Sintaksis
    const [sidebarActiveItem, setSidebarActiveItem] = useState<string>('')
    const [showChatInput, setShowChatInput] = useState<boolean>(true)
    const [showContentMenu, setShowContentMenu] = useState<boolean>(false)
    const [activeLanguage, setActiveLanguage] = useState<string>('')

    const handleSidebarItemClick = (itemText: string) => {
        setSidebarActiveItem(itemText)

        // Agar til bosilsa
        if (itemText === 'Uzbek tili' || itemText === 'Rus tili') {
            setShowChatInput(false) // Chat inputni yashiramiz
            setShowContentMenu(true) // Menu ni ko'rsatamiz
            setActiveLanguage(itemText) // Qaysi til active ekanligini saqlaymiz
        }
    }

    const handleCloseLanguage = () => {
        setShowChatInput(true) // Chat inputni qaytaramiz
        setShowContentMenu(false) // Menu ni yashiramiz
        setSidebarActiveItem('') // Active itemni olib tashlaymiz
        setActiveLanguage('') // Tilni tozalaymiz
    }

    const handleEditorClick = () => {
        // Editor bosilganda chat input ko'rinib turishi kerak
        setShowChatInput(true)
        setShowContentMenu(false)
    }

    return (
        <div className='main-layout'>
            <Sidebar
                activeItem={sidebarActiveItem}
                onItemClick={handleSidebarItemClick}
                onEditorClick={handleEditorClick}
                onCloseLanguage={handleCloseLanguage}
            />

            <div className='main-content'>
                <Topbar activeTab={activeTab} onTabChange={setActiveTab} />

                <div className='content-area'>
                    {/* Menu ko'rsatish kerak bo'lsa */}
                    {showContentMenu && (
                        <div className='content-menu'>
                            <h3>{activeLanguage} uchun menyu</h3>
                        </div>
                    )}

                    {/* ChatInput ko'rsatish kerak bo'lsa */}
                    {showChatInput && (
                        <div className='chat-input-wrapper'>
                            <ChatInput
                                onSendMessage={(message) =>
                                    console.log(message)
                                }
                            />
                        </div>
                    )}
                </div>
            </div>
        </div>
    )
}

export default MainLayout
