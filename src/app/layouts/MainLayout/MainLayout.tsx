import { ChatInput, Sidebar, Topbar } from '@/widgets'
import './MainLayout.css'
import React, { useState, useEffect, useCallback, useMemo } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import {
    linguisticsApi,
    LinguisticsData,
    Tag,
    Language,
} from '@/shared/api/linguistics/linguisticsApi'
import { TagStatistics } from '@/widgets/tagstatistics'
import ChevronLeftIcon from '@mui/icons-material/ChevronLeft'
import ChevronRightIcon from '@mui/icons-material/ChevronRight'
import { TagsDataGrid, TagGridRow } from '@/features/tags/components/TagsDataGrid'

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

const getDefaultLanguageForLinguistic = (
    linguistic?: LinguisticsData
): Language | undefined => {
    const languages = getLanguagesForLinguistic(linguistic)
    if (!languages.length) {
        return undefined
    }

    const uzbekLanguage = languages.find((lang) =>
        lang.name.toLowerCase().includes("o'zbek")
    )

    return uzbekLanguage || languages[0]
}

const MainLayout: React.FC = () => {
    const [activeTab, setActiveTab] = useState<number>(0)
    const [activeLanguage, setActiveLanguage] = useState<string>('')
    const [linguistics, setLinguistics] = useState<LinguisticsData[]>([])
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
    const [isSidebarCollapsed, setIsSidebarCollapsed] = useState<boolean>(false)
    const [isStatsCollapsed, setIsStatsCollapsed] = useState<boolean>(false)

    const navigate = useNavigate()
    const location = useLocation()
    const isTagsRoute = location.pathname.startsWith('/tags')

    const applyLanguageState = useCallback((language?: Language | null) => {
        if (!language) {
            setActiveLanguage('')
            setSelectedLanguageId(null)
            return
        }

        setActiveLanguage(language.name)
        setSelectedLanguageId(language.id)
    }, [])

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


    useEffect(() => {
        const loadData = async () => {
            try {
                const data = await linguisticsApi.getLinguistics()
                setLinguistics(data)
                if (data.length > 0) {
                    setSelectedAnalysisType(data[0].id)
                    const defaultLanguage =
                        getDefaultLanguageForLinguistic(data[0])
                    applyLanguageState(defaultLanguage)
                } else {
                    setSelectedAnalysisType(DEFAULT_ANALYSIS_TYPE)
                    applyLanguageState(null)
                }
            } catch (error) {
                console.error('Failed to load linguistics:', error)
            }
        }

        loadData()
    }, [applyLanguageState])


    const handleTextItemClick = async (textId: number, textTitle: string) => {
        // Text ID ni saqlash
        setTextId(textId)
        setSelectedLanguageId(null) // Avval tozalash

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
                        setActiveLanguage(matchedLanguage.name)
                    } else {
                        setActiveLanguage('')
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
        setTextId(undefined) // YANGI: Text ID ni ham tozalash
        const nextAnalysisId =
            linguistics[tabIndex]?.id || DEFAULT_ANALYSIS_TYPE
        setSelectedAnalysisType(nextAnalysisId)

        const defaultLanguage = getDefaultLanguageForLinguistic(
            linguistics[tabIndex]
        )
        applyLanguageState(defaultLanguage)

        const linguisticId = linguistics[tabIndex]?.id
        if (linguisticId) {
            navigate(`/linguistics/${linguisticId}`)
        }
    }

    const handleAnalysisTypeSelect = (typeId: number) => {
        setSelectedAnalysisType(typeId)
    }

    const handleEditorClick = () => {
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
            setTagStats({})
        }
        setSidebarRefreshKey((prev) => prev + 1)
    }

    // YANGI: Save qilinganda sidebar ni yangilash funksiyasi
    const handleSendMessage = (message: string) => {
        console.log('Message sent, refreshing sidebar...', message)
        // Bu yerda Sidebar ni yangilash kerak
        // Agar Sidebar komponenti ichida useEffect qilsa, uni trigger qilish uchun
        // refreshTrigger prop'ini o'zgartirishimiz kerak
    }

    const tagGridRows = useMemo<TagGridRow[]>(() => {
        return linguistics.flatMap((linguistic) =>
            linguistic.tags.map((tag) => ({
                id: tag.id,
                name: tag.name_tag,
                abbreviation: tag.abbreviation,
                description: tag.description || 'No description',
                color: tag.color,
                language: tag.language.name,
                analysisType: linguistic.name,
            }))
        )
    }, [linguistics])

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

    const resetToDefaultState = useCallback(() => {
        setActiveTab(0)
        setTextId(undefined)
        setTagStats({})
        const defaultLanguage = getDefaultLanguageForLinguistic(
            linguistics[0]
        )
        applyLanguageState(defaultLanguage)
        navigate('/')
    }, [applyLanguageState, linguistics, navigate])

    const handleTextSaved = (
        savedText: {
            id: number
            title: string
            language: number
        },
        context: { isUpdate: boolean } = { isUpdate: false }
    ) => {
        setSidebarRefreshKey((prev) => prev + 1)

        if (savedText.language && !context.isUpdate) {
            setSelectedLanguageId(savedText.language)
            const matchedLanguage = findLanguageById(savedText.language)
            if (matchedLanguage) {
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
                activeTextId={textId}
                activeLinguisticId={linguistics[activeTab]?.id}
                onTextClick={handleTextItemClick} // YANGI: Text click handler
                onEditorClick={handleEditorClick}
                refreshKey={sidebarRefreshKey}
                onTextDeleted={handleTextDeleted}
                collapsed={isSidebarCollapsed}
            />

            <div className='main-content'>
                {!isTagsRoute && (
                    <Topbar
                        activeTab={activeTab}
                        onTabChange={handleTabChange}
                        onAnalysisTypeSelect={handleAnalysisTypeSelect}
                        selectedAnalysisType={selectedAnalysisType}
                    />
                )}

                <div
                    className={`content-area ${
                        isTagsRoute ? 'tags-view' : ''
                    }`}
                >
                    {isTagsRoute ? (
                        <div className='tags-view-panel'>
                            <TagsDataGrid
                                rows={tagGridRows}
                            />
                        </div>
                    ) : (
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
