import { ChatInput, Sidebar, Topbar } from '@/widgets'
import './MainLayout.css'
import React, { useState, useEffect, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import {
    linguisticsApi,
    LinguisticsData,
    Tag,
    Language,
} from '@/shared/api/linguistics/linguisticsApi'
import { TagStatistics } from '@/widgets/tagstatistics'
import ChevronLeftIcon from '@mui/icons-material/ChevronLeft'
import ChevronRightIcon from '@mui/icons-material/ChevronRight'

const DEFAULT_ANALYSIS_TYPE = 1

const getLanguagesForLinguistic = (
    linguistic?: LinguisticsData
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

const MainLayout: React.FC = () => {
    const [activeTab, setActiveTab] = useState<number>(0)
    const [activeLanguageId, setActiveLanguageId] = useState<string>('')
    const [showChatInput, setShowChatInput] = useState<boolean>(true)
    const [showContentMenu, setShowContentMenu] = useState<boolean>(false)
    const [activeLanguage, setActiveLanguage] = useState<string>('')
    const [linguistics, setLinguistics] = useState<LinguisticsData[]>([])
    const [loading, setLoading] = useState(true)
    const [selectedLanguageId, setSelectedLanguageId] = useState<number | null>(
        null
    )
    // YANGI: Analysis type state
    const [selectedAnalysisType, setSelectedAnalysisType] =
        useState<number>(DEFAULT_ANALYSIS_TYPE)
    const [tagStats, setTagStats] = useState<
        Record<string, { count: number; color: string }>
    >({})
    // YANGI: Text ID state
    const [textId, setTextId] = useState<number | undefined>(undefined)
    const [sidebarRefreshKey, setSidebarRefreshKey] = useState<number>(0)
    const [shouldAutoSelectLanguage, setShouldAutoSelectLanguage] =
        useState<boolean>(true)
    const [isSidebarCollapsed, setIsSidebarCollapsed] = useState<boolean>(false)
    const [isStatsCollapsed, setIsStatsCollapsed] = useState<boolean>(false)

    const navigate = useNavigate()

    const findLanguageById = useCallback(
        (languageId: number): Language | undefined => {
            for (const linguistic of linguistics) {
                const languages = getLanguagesForLinguistic(linguistic)
                const match = languages.find((lang) => lang.id === languageId)
                if (match) {
                    return match
                }
            }
            return undefined
        },
        [linguistics]
    )

    const applyDefaultLanguageForTab = useCallback(
        (tabIndex: number) => {
            const currentLinguistic = linguistics[tabIndex]
            const languages = getLanguagesForLinguistic(currentLinguistic)

            if (!languages.length) {
                setActiveLanguage('')
                setActiveLanguageId('')
                setSelectedLanguageId(null)
                setShowContentMenu(false)
                return
            }

            const firstLanguage = languages[0]
            setActiveLanguage(firstLanguage.name)
            setActiveLanguageId(firstLanguage.id.toString())
            setSelectedLanguageId(firstLanguage.id)
            setShowChatInput(false)
            setShowContentMenu(true)
            navigate(`/tags?language=${encodeURIComponent(firstLanguage.name)}`)
        },
        [linguistics, navigate]
    )

    useEffect(() => {
        const loadData = async () => {
            try {
                setLoading(true)
                const data = await linguisticsApi.getLinguistics()
                setLinguistics(data)
                if (data.length > 0) {
                    setSelectedAnalysisType(data[0].id)
                } else {
                    setSelectedAnalysisType(DEFAULT_ANALYSIS_TYPE)
                }
            } catch (error) {
                console.error('Failed to load linguistics:', error)
            } finally {
                setLoading(false)
            }
        }

        loadData()
    }, [])

    useEffect(() => {
        if (
            !shouldAutoSelectLanguage ||
            !linguistics.length ||
            !linguistics[activeTab]
        ) {
            return
        }
        applyDefaultLanguageForTab(activeTab)
        setShouldAutoSelectLanguage(false)
    }, [
        shouldAutoSelectLanguage,
        linguistics,
        activeTab,
        applyDefaultLanguageForTab,
    ])

    const handleTextItemClick = async (textId: number, textTitle: string) => {
        // Text ID ni saqlash
        setTextId(textId)
        setShowChatInput(true)
        setShowContentMenu(false)
        setSelectedLanguageId(null) // Avval tozalash
        setShouldAutoSelectLanguage(false)

        // Text ma'lumotlarini yuklash
        try {
            const authToken =
                localStorage.getItem('auth_token') ||
                localStorage.getItem('access_token')
            if (!authToken) {
                return
            }

            const response = await fetch(
                `${import.meta.env.VITE_API_BASE_URL}/tagged_texts/${textId}/`,
                {
                    headers: {
                        Authorization: `Bearer ${authToken}`,
                        Accept: 'application/json',
                    },
                }
            )

            if (response.ok) {
                const textData = await response.json()

                // Textning language_id sini olish
                if (textData.language) {
                    // Tilni avtomatik tanlash
                    setSelectedLanguageId(textData.language)
                    const matchedLanguage = findLanguageById(textData.language)
                    if (matchedLanguage) {
                        setActiveLanguageId(matchedLanguage.id.toString())
                        setActiveLanguage(matchedLanguage.name)
                    } else {
                        setActiveLanguageId(textData.language.toString())
                    }
                }
            }
        } catch (error) {
            console.error('Failed to load text language:', error)
        }

        navigate(`/editor?text=${textId}`)
    }

    const handleTabChange = (tabIndex: number) => {
        console.log('Tab changed to:', tabIndex)
        setActiveTab(tabIndex)
        setActiveLanguageId('')
        setShowChatInput(false)
        setShowContentMenu(true)
        setActiveLanguage('')
        setSelectedLanguageId(null)
        setTextId(undefined) // YANGI: Text ID ni ham tozalash
        setShouldAutoSelectLanguage(true)
        const nextAnalysisId =
            linguistics[tabIndex]?.id || DEFAULT_ANALYSIS_TYPE
        setSelectedAnalysisType(nextAnalysisId)

        const linguisticId = linguistics[tabIndex]?.id
        if (linguisticId) {
            navigate(`/linguistics/${linguisticId}`)
        }
    }

    const handleAnalysisTypeSelect = (typeId: number) => {
        setSelectedAnalysisType(typeId)
    }

    const handleSidebarItemClick = (itemText: string, languageId?: number) => {
        setShouldAutoSelectLanguage(false)
        setActiveLanguageId(languageId ? languageId.toString() : '')
        setShowChatInput(false)
        setShowContentMenu(true)
        setActiveLanguage(itemText)
        setSelectedLanguageId(languageId || null)
        setTextId(undefined) // YANGI: Text ID ni tozalash

        navigate(`/tags?language=${encodeURIComponent(itemText)}`)
    }

    const handleCloseLanguage = () => {
        setShouldAutoSelectLanguage(false)
        setShowChatInput(true)
        setShowContentMenu(false)
        setActiveLanguageId('')
        setActiveLanguage('')
        setSelectedLanguageId(null)
        setTextId(undefined) // YANGI: Text ID ni tozalash
        navigate('/')
    }

    const handleEditorClick = () => {
        setShouldAutoSelectLanguage(false)
        setShowChatInput(true)
        setShowContentMenu(false)
        setTextId(undefined) // YANGI: Text ID ni tozalash
        navigate('/editor')
    }

    const handleSidebarToggle = () => {
        setIsSidebarCollapsed((prev) => !prev)
    }

    const handleStatsToggle = () => {
        setIsStatsCollapsed((prev) => !prev)
    }

    const handleTextDeleted = (deletedId: number) => {
        if (textId === deletedId) {
            setTextId(undefined)
            setShowChatInput(true)
            setShowContentMenu(false)
            setTagStats({})
        }
        setSidebarRefreshKey((prev) => prev + 1)
        setShouldAutoSelectLanguage(false)
    }

    // YANGI: Save qilinganda sidebar ni yangilash funksiyasi
    const handleSendMessage = (message: string) => {
        console.log('Message sent, refreshing sidebar...', message)
        // Bu yerda Sidebar ni yangilash kerak
        // Agar Sidebar komponenti ichida useEffect qilsa, uni trigger qilish uchun
        // refreshTrigger prop'ini o'zgartirishimiz kerak
    }

    const getCurrentTags = (): Tag[] => {
        const currentLinguistic = linguistics[activeTab]
        if (!currentLinguistic) {
            return []
        }

        if (activeLanguage) {
            const filteredTags = currentLinguistic.tags.filter(
                (tag) => tag.language.name === activeLanguage
            )
            return filteredTags
        }
        return currentLinguistic.tags
    }

    const renderEnglishContent = () => {
        const tags = getCurrentTags()

        if (tags.length === 0) {
            return (
                <div className='language-content english-content'>
                    <h2>Universal POS tags</h2>
                    <div className='error-message'>
                        No tags found for English language
                    </div>
                </div>
            )
        }

        return (
            <div className='language-content english-content'>
                <h2>Universal POS tags</h2>
                <p>
                    These tags mark the core part-of-speech categories. To
                    distinguish additional lexical and grammatical properties of
                    words, use the universal features.
                </p>

                <div className='pos-table-container'>
                    <table className='pos-table'>
                        <thead>
                            <tr>
                                <th>Tag</th>
                                <th>Abbreviation</th>
                                <th>Description</th>
                                <th>Color</th>
                            </tr>
                        </thead>
                        <tbody>
                            {tags.map((tag, index) => (
                                <tr key={index}>
                                    <td>
                                        <strong>{tag.name_tag}</strong>
                                    </td>
                                    <td>
                                        <code>{tag.abbreviation}</code>
                                    </td>
                                    <td>
                                        {tag.description || 'No description'}
                                    </td>
                                    <td>
                                        <div
                                            style={{
                                                width: '20px',
                                                height: '20px',
                                                backgroundColor: tag.color,
                                                borderRadius: '3px',
                                            }}
                                        ></div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        )
    }

    const renderUzbekContent = () => {
        const tags = getCurrentTags()

        if (tags.length === 0) {
            return (
                <div className='language-content english-content'>
                    <h2>Teg (belgilash) nomi – Ma'nosi</h2>
                    <div className='error-message'>
                        O'zbek tili uchun teglar topilmadi
                    </div>
                </div>
            )
        }

        return (
            <div className='language-content english-content'>
                <h2>Teg (belgilash) nomi – Ma'nosi</h2>
                <p>
                    Ushbu sintaktik teglar gap bo'laklarining grammatik
                    vazifalarini belgilash uchun qo'llanadi. Har bir teg gapdagi
                    ma'nodosh birlikning sintaktik rolini ko'rsatadi.
                </p>

                <div className='pos-table-container'>
                    <table className='pos-table'>
                        <thead>
                            <tr>
                                <th>Teg nomi</th>
                                <th>Qisqartmasi</th>
                                <th>Ma'nosi</th>
                                <th>Rangi</th>
                            </tr>
                        </thead>
                        <tbody>
                            {tags.map((tag, index) => (
                                <tr key={index}>
                                    <td>
                                        <strong>{tag.name_tag}</strong>
                                    </td>
                                    <td>
                                        <code>{tag.abbreviation}</code>
                                    </td>
                                    <td>
                                        {tag.description ||
                                            'Tavsif mavjud emas'}
                                    </td>
                                    <td>
                                        <div
                                            style={{
                                                width: '20px',
                                                height: '20px',
                                                backgroundColor: tag.color,
                                                borderRadius: '3px',
                                            }}
                                        ></div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        )
    }

    const renderLanguageContent = () => {
        if (loading) {
            return <div className='loading'>Loading content...</div>
        }

        switch (activeLanguage) {
            case 'Ingiliz tili':
                return renderEnglishContent()
            case "O'zbek tili":
                return renderUzbekContent()
            default:
                return (
                    <div className='language-content'>
                        <h2>{activeLanguage}</h2>
                        <div className='error-message'>
                            No content available for this language
                        </div>
                    </div>
                )
        }
    }

    const resetToDefaultState = useCallback(() => {
        setActiveTab(0)
        setActiveLanguage('')
        setActiveLanguageId('')
        setSelectedLanguageId(null)
        setTextId(undefined)
        setShowChatInput(true)
        setShowContentMenu(false)
        setShouldAutoSelectLanguage(true)
        setTagStats({})
        navigate('/')
    }, [navigate])

    const handleTextSaved = (
        savedText: {
            id: number
            title: string
            language: number
        },
        context: { isUpdate: boolean } = { isUpdate: false }
    ) => {
        setSidebarRefreshKey((prev) => prev + 1)
        setShowChatInput(true)
        setShowContentMenu(false)
        setShouldAutoSelectLanguage(false)

        if (savedText.language && !context.isUpdate) {
            setSelectedLanguageId(savedText.language)
            const matchedLanguage = findLanguageById(savedText.language)
            if (matchedLanguage) {
                setActiveLanguageId(matchedLanguage.id.toString())
                setActiveLanguage(matchedLanguage.name)
            }
        }

        if (context.isUpdate) {
            resetToDefaultState()
        } else {
            setTextId(undefined)
        }
    }

    return (
        <div
            className={`main-layout ${
                isSidebarCollapsed ? 'sidebar-collapsed' : ''
            }`}
        >
            <button
                className={`sidebar-collapse-toggle ${
                    isSidebarCollapsed ? 'collapsed' : ''
                }`}
                onClick={handleSidebarToggle}
                aria-label={
                    isSidebarCollapsed ? 'Show sidebar' : 'Hide sidebar'
                }
            >
                {isSidebarCollapsed ? <ChevronRightIcon /> : <ChevronLeftIcon />}
            </button>

            {/* YANGI: Sidebar'ga onTextClick prop'ini qo'shdik */}
            <Sidebar
                activeItem={activeLanguageId}
                activeTextId={textId}
                activeLinguisticId={linguistics[activeTab]?.id}
                onItemClick={handleSidebarItemClick}
                onTextClick={handleTextItemClick} // YANGI: Text click handler
                onEditorClick={handleEditorClick}
                onCloseLanguage={handleCloseLanguage}
                activeTab={activeTab}
                refreshKey={sidebarRefreshKey}
                onTextDeleted={handleTextDeleted}
                collapsed={isSidebarCollapsed}
            />

            <div className='main-content'>
                <Topbar
                    activeTab={activeTab}
                    onTabChange={handleTabChange}
                    onAnalysisTypeSelect={handleAnalysisTypeSelect}
                    selectedAnalysisType={selectedAnalysisType}
                />

                <div className='content-area'>
                    {showContentMenu && (
                        <div className='content-menu'>
                            {renderLanguageContent()}
                        </div>
                    )}

                    {showChatInput && (
                        <div className='main-content-wrapper'>
                            <div className='chat-input-section'>
                                {/* YANGI: textId ni ChatInput ga uzatdik */}
                                <ChatInput
                                    onSendMessage={handleSendMessage}
                                    languageId={selectedLanguageId || undefined}
                                    analysisType={selectedAnalysisType}
                                    availableTags={getCurrentTags()}
                                    onStatisticsUpdate={(stats) => {
                                        setTagStats(stats)
                                    }}
                                    textId={textId} // YANGI: Text ID ni uzatish
                                    onTextSaved={handleTextSaved}
                                />
                            </div>

                            <div className='statistics-shell'>
                                <button
                                    className='stats-toggle'
                                    onClick={handleStatsToggle}
                                    aria-label='Toggle tag statistics'
                                >
                                    TagStatistics
                                </button>
                                <div
                                    className={`statistics-wrapper ${
                                        isStatsCollapsed ? 'collapsed' : ''
                                    }`}
                                >
                                    <div className='statistics-panel'>
                                        <div className='statistics-content'>
                                            <TagStatistics stats={tagStats} />
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    )
}

export default MainLayout
