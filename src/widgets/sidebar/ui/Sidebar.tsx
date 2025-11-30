import React, { useState, useEffect } from 'react'
import { SidebarSection } from './SidebarSection'
import './Sidebar.css'
import { LogoutButton } from '@/features/auth/components/LogoutButton'
import {
    linguisticsApi,
    LinguisticsData,
    Language,
} from '@/shared/api/linguistics/linguisticsApi'

interface SidebarProps {
    activeItem?: string
    onItemClick?: (itemText: string, languageId?: number) => void
    onEditorClick?: () => void
    onCloseLanguage?: () => void
    activeTab?: number
}

export const Sidebar: React.FC<SidebarProps> = ({
    activeItem = '',
    onItemClick = () => {},
    onEditorClick = () => {},
    onCloseLanguage = () => {},
    activeTab = 0,
}) => {
    const [linguistics, setLinguistics] = useState<LinguisticsData[]>([])
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        const loadData = async () => {
            try {
                setLoading(true)
                const data = await linguisticsApi.getLinguistics()
                setLinguistics(data)
            } catch (error) {
                console.error('Failed to load linguistics:', error)
            } finally {
                setLoading(false)
            }
        }

        loadData()
    }, [])

    const currentLinguistic = linguistics[activeTab]

    const getLanguagesFromTags = (): Language[] => {
        if (!currentLinguistic) return []

        if (
            currentLinguistic.languages &&
            currentLinguistic.languages.length > 0
        ) {
            return currentLinguistic.languages
        }

        const uniqueLanguages: Language[] = []
        const languageMap = new Map<number, Language>()

        currentLinguistic.tags.forEach((tag) => {
            if (!languageMap.has(tag.language.id)) {
                languageMap.set(tag.language.id, tag.language)
                uniqueLanguages.push(tag.language)
            }
        })

        return uniqueLanguages
    }

    const languages = getLanguagesFromTags()
    const languageItems = languages.map((lang) => ({
        id: lang.id.toString(),
        text: lang.name,
        languageId: lang.id, // YANGI: languageId qo'shildi
    }))

    const sectionTitle = currentLinguistic?.name || 'Loading...'

    return (
        <div className='sidebar'>
            <div className='sidebar-header'>
                <h2 className='sidebar-title'>Annotation Tool</h2>
                <button className='new-chat-button' onClick={onEditorClick}>
                    Editor
                </button>
            </div>

            <div className='sidebar-content'>
                {loading ? (
                    <div className='loading'>Loading languages...</div>
                ) : (
                    <SidebarSection
                        title={sectionTitle}
                        items={languageItems}
                        activeItem={activeItem}
                        onItemClick={onItemClick}
                        showDelete={!!activeItem}
                        onCloseLanguage={onCloseLanguage}
                    />
                )}
            </div>

            <div className='sidebar-footer'>
                <LogoutButton />
            </div>
        </div>
    )
}
