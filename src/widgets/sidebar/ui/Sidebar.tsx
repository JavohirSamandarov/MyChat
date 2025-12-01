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
    onTextClick?: (textId: number, textTitle: string) => void
    onEditorClick?: () => void
    onCloseLanguage?: () => void
    activeTab?: number
}

// YANGI: TaggedText interfeysi
interface TaggedText {
    id: number
    analysis_type: number
    user: number
    language: number
    title: string
    file: string | null
    text: string
    metadata: Record<string, any>
}

// YANGI: API response formati
interface TaggedTextsResponse {
    count: number
    next: string | null
    previous: string | null
    results: TaggedText[]
}

export const Sidebar: React.FC<SidebarProps> = ({
    activeItem = '',
    onItemClick = () => {},
    onTextClick = () => {},
    onEditorClick = () => {},
    onCloseLanguage = () => {},
    activeTab = 0,
}) => {
    const [linguistics, setLinguistics] = useState<LinguisticsData[]>([])
    const [userTexts, setUserTexts] = useState<TaggedText[]>([])
    const [loading, setLoading] = useState(true)
    const [textsLoading, setTextsLoading] = useState(true)

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

    // YANGI: To'g'ri API dan foydalanish
    useEffect(() => {
        const loadUserTexts = async () => {
            try {
                setTextsLoading(true)

                // API dan textlarni olish
                const authToken = getAuthToken()
                if (!authToken) {
                    setUserTexts([])
                    return
                }

                const response = await fetch('/api/tagged_texts/', {
                    headers: {
                        Authorization: `Bearer ${authToken}`,
                        Accept: 'application/json',
                    },
                })

                if (response.ok) {
                    const data: TaggedTextsResponse = await response.json()
                    setUserTexts(data.results)
                } else {
                    console.error('Failed to load user texts')
                    setUserTexts([])
                }
            } catch (error) {
                console.error('Failed to load user texts:', error)
                setUserTexts([])
            } finally {
                setTextsLoading(false)
            }
        }

        loadUserTexts()
    }, [])

    // YANGI: Auth token olish funksiyasi
    const getAuthToken = (): string => {
        try {
            const possibleKeys = [
                'auth_token',
                'access_token',
                'token',
                'authToken',
                'accessToken',
            ]

            for (const key of possibleKeys) {
                const token = localStorage.getItem(key)
                if (token) {
                    let finalToken = token
                    if (finalToken.startsWith('Bearer ')) {
                        finalToken = finalToken.substring(7)
                    }
                    if (finalToken.trim().length > 0) {
                        return finalToken
                    }
                }
            }
            return ''
        } catch (error) {
            console.error('Error getting auth token:', error)
            return ''
        }
    }

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
        languageId: lang.id,
    }))

    // User textlarini sidebar item formatiga o'tkazish
    const userTextItems = userTexts.map((text) => ({
        id: text.id.toString(),
        text: text.title,
        textId: text.id,
    }))

    const sectionTitle = currentLinguistic?.name || 'Loading...'

    return (
        <div className='sidebar'>
            <div className='sidebar-header'>
                <h2 className='sidebar-title'>Annotation Tool</h2>
                <button className='new-chat-button' onClick={onEditorClick}>
                    + New Text
                </button>
            </div>

            <div className='sidebar-content'>
                {loading ? (
                    <div className='loading'>Loading languages...</div>
                ) : (
                    <SidebarSection
                        title={sectionTitle}
                        items={languages.map((lang) => ({
                            id: lang.id.toString(),
                            text: lang.name,
                            languageId: lang.id,
                        }))}
                        activeItem={activeItem}
                        onItemClick={onItemClick}
                        showDelete={!!activeItem}
                        onCloseLanguage={onCloseLanguage}
                    />
                )}
                {/* User Texts bo'limi */}
                <SidebarSection
                    title='Your Texts'
                    items={userTexts.map((text) => ({
                        id: text.id.toString(),
                        text: text.title,
                        textId: text.id,
                    }))}
                    activeItem={activeItem}
                    onTextClick={onTextClick}
                    showDelete={false}
                    isLoading={textsLoading}
                />
            </div>

            <div className='sidebar-footer'>
                <LogoutButton />
            </div>
        </div>
    )
}
