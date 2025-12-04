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
    activeTextId?: number
    activeLinguisticId?: number
    onItemClick?: (itemText: string, languageId?: number) => void
    onTextClick?: (textId: number, textTitle: string) => void
    onEditorClick?: () => void
    onCloseLanguage?: () => void
    activeTab?: number
    refreshKey?: number
    onTextDeleted?: (textId: number) => void
    collapsed?: boolean
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
    metadata: Record<string, unknown> // any -> unknown
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
    activeTextId,
    activeLinguisticId,
    onItemClick = () => {},
    onTextClick = () => {},
    onEditorClick = () => {},
    onCloseLanguage = () => {},
    activeTab = 0,
    refreshKey = 0,
    onTextDeleted = () => {},
    collapsed = false,
}) => {
    const [linguistics, setLinguistics] = useState<LinguisticsData[]>([])
    const [userTexts, setUserTexts] = useState<TaggedText[]>([])
    const [loading, setLoading] = useState(true)
    const [textsLoading, setTextsLoading] = useState(true)
    const [defaultLanguageId, setDefaultLanguageId] = useState<string>('')
    const [pendingDelete, setPendingDelete] = useState<{
        id: number
        title: string
    } | null>(null)

    useEffect(() => {
        const loadData = async () => {
            try {
                setLoading(true)
                const data = await linguisticsApi.getLinguistics()
                setLinguistics(data)

                // Birinchi tilni topish va active qilish
                if (data.length > 0) {
                    const firstLinguistic = data[0]
                    const languages =
                        getLanguagesFromFirstLinguistic(firstLinguistic)
                    if (languages.length > 0) {
                        const firstLanguage = languages[0]
                        setDefaultLanguageId(firstLanguage.id.toString())
                        // Parent componentga birinchi tilni active qilish uchun signal yuborish
                        if (onItemClick) {
                            onItemClick(firstLanguage.name, firstLanguage.id)
                        }
                    }
                }
            } catch (error) {
                console.error('Failed to load linguistics:', error)
            } finally {
                setLoading(false)
            }
        }

        loadData()
    }, [])

    // Birinchi linguistic ma'lumotlaridan tillarni olish
    const getLanguagesFromFirstLinguistic = (
        linguistic: LinguisticsData
    ): Language[] => {
        if (!linguistic) return []

        if (linguistic.languages && linguistic.languages.length > 0) {
            return linguistic.languages
        }

        const uniqueLanguages: Language[] = []
        const languageMap = new Map<number, Language>()

        linguistic.tags.forEach((tag) => {
            if (!languageMap.has(tag.language.id)) {
                languageMap.set(tag.language.id, tag.language)
                uniqueLanguages.push(tag.language)
            }
        })

        return uniqueLanguages
    }

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

                const response = await fetch(
                    `${import.meta.env.VITE_API_BASE_URL}/tagged_texts/`,
                    {
                        headers: {
                            Authorization: `Bearer ${authToken}`,
                            Accept: 'application/json',
                        },
                    }
                )

                if (response.ok) {
                    const data: TaggedTextsResponse = await response.json()
                    const sortedTexts = [...data.results].sort(
                        (a, b) => b.id - a.id
                    )
                    setUserTexts(sortedTexts)
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
    }, [refreshKey])

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

    const handleTextDelete = (textId: number) => {
        const targetText = userTexts.find((text) => text.id === textId)
        setPendingDelete({
            id: textId,
            title: targetText?.title || 'this text',
        })
    }

    const confirmDeleteText = async () => {
        if (!pendingDelete) return

        const authToken = getAuthToken()
        if (!authToken) {
            console.error('Authentication required for deleting text')
            setPendingDelete(null)
            return
        }

        try {
            const response = await fetch(
                `${import.meta.env.VITE_API_BASE_URL}/tagged_texts/${pendingDelete.id}/`,
                {
                    method: 'DELETE',
                    headers: {
                        Authorization: `Bearer ${authToken}`,
                        Accept: 'application/json',
                    },
                }
            )

            if (!response.ok && response.status !== 204) {
                throw new Error('Failed to delete text')
            }

            setUserTexts((prev) =>
                prev.filter((textItem) => textItem.id !== pendingDelete.id)
            )

            if (activeTextId === pendingDelete.id) {
                onTextDeleted(pendingDelete.id)
            }
        } catch (error) {
            console.error('Failed to delete text:', error)
        } finally {
            setPendingDelete(null)
        }
    }

    const handleCancelDelete = () => {
        setPendingDelete(null)
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

    // Agar activeItem bo'sh bo'lsa va hech qanday text tanlanmagan bo'lsa, joriy tabdagi birinchi tilni active qilish
    const fallbackLanguageId =
        languages.length > 0 ? languages[0].id.toString() : defaultLanguageId
    const shouldUseFallback =
        !activeItem && !activeTextId && !!fallbackLanguageId
    const activeLanguageItem = shouldUseFallback
        ? fallbackLanguageId
        : activeItem
    const activeUserTextId = activeTextId ? activeTextId.toString() : ''

    const filteredUserTexts = userTexts.filter((text) => {
        const matchesLinguistic = activeLinguisticId
            ? text.analysis_type === activeLinguisticId
            : true
        const matchesLanguage =
            activeLanguageItem && activeLanguageItem.trim().length > 0
                ? text.language.toString() === activeLanguageItem
                : true
        return matchesLinguistic && matchesLanguage
    })

    const sectionTitle = currentLinguistic?.name || 'Loading...'

    return (
        <div className={`sidebar ${collapsed ? 'collapsed' : ''}`}>
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
                        activeItem={activeLanguageItem}
                        activeMatchBy='id'
                        onItemClick={onItemClick}
                        showDelete={!!activeLanguageItem}
                        onCloseLanguage={onCloseLanguage}
                    />
                )}
                {/* User Texts bo'limi */}
                <SidebarSection
                    title='Your Texts'
                    items={filteredUserTexts.map((text) => ({
                        id: text.id.toString(),
                        text: text.title,
                        textId: text.id,
                    }))}
                    activeItem={activeUserTextId}
                    activeMatchBy='id'
                    onTextClick={onTextClick}
                    showDelete={true}
                    isLoading={textsLoading}
                    onTextDelete={handleTextDelete}
                />
            </div>

            <div className='sidebar-footer'>
                <LogoutButton />
            </div>

            {pendingDelete && (
                <div className='sidebar-modal-overlay'>
                    <div className='sidebar-modal'>
                        <h3>Delete annotated text?</h3>
                        <p>
                            Are you sure you want to remove "
                            <strong>{pendingDelete.title}</strong>" from your
                            texts?
                        </p>
                        <div className='sidebar-modal-actions'>
                            <button
                                className='modal-button cancel'
                                onClick={handleCancelDelete}
                            >
                                Cancel
                            </button>
                            <button
                                className='modal-button delete'
                                onClick={confirmDeleteText}
                            >
                                Delete
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    )
}
