import { ChatInput, Sidebar, Topbar } from '@/widgets'
import './MainLayout.css'
import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import {
    linguisticsApi,
    LinguisticsData,
    Tag,
} from '@/shared/api/linguistics/linguisticsApi'
import { TagStatistics } from '@/widgets/tagstatistics'

const MainLayout: React.FC = () => {
    const [activeTab, setActiveTab] = useState<number>(0)
    const [sidebarActiveItem, setSidebarActiveItem] = useState<string>('')
    const [showChatInput, setShowChatInput] = useState<boolean>(true)
    const [showContentMenu, setShowContentMenu] = useState<boolean>(false)
    const [activeLanguage, setActiveLanguage] = useState<string>('')
    const [linguistics, setLinguistics] = useState<LinguisticsData[]>([])
    const [loading, setLoading] = useState(true)
    const [selectedLanguageId, setSelectedLanguageId] = useState<number | null>(
        null
    )
    // YANGI: Analysis type state
    const [selectedAnalysisType, setSelectedAnalysisType] = useState<number>(1)
    const [tagStats, setTagStats] = useState<
        Record<string, { count: number; color: string }>
    >({})
    // YANGI: Text ID state
    const [textId, setTextId] = useState<number | undefined>(undefined)

    const navigate = useNavigate()

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

    const handleTextItemClick = async (textId: number, textTitle: string) => {
        // Text ID ni saqlash
        setTextId(textId)
        setSidebarActiveItem(textTitle)
        setShowChatInput(true)
        setShowContentMenu(false)
        setSelectedLanguageId(null) // Avval tozalash

        // Text ma'lumotlarini yuklash
        try {
            const authToken =
                localStorage.getItem('auth_token') ||
                localStorage.getItem('access_token')
            if (!authToken) {
                return
            }

            const response = await fetch(`/api/tagged_texts/${textId}/`, {
                headers: {
                    Authorization: `Bearer ${authToken}`,
                    Accept: 'application/json',
                },
            })

            if (response.ok) {
                const textData = await response.json()

                // Textning language_id sini olish
                if (textData.language) {
                    // Tilni avtomatik tanlash
                    setSelectedLanguageId(textData.language)

                    // O'sha tilni sidebar'dan ham aktiv qilish
                    const currentLinguistic = linguistics[activeTab]
                    if (currentLinguistic?.languages) {
                        const language = currentLinguistic.languages.find(
                            (lang) => lang.id === textData.language
                        )
                        if (language) {
                            console.log('Found language:', language.name)
                        }
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
        setSidebarActiveItem('')
        setShowChatInput(true)
        setShowContentMenu(false)
        setActiveLanguage('')
        setSelectedLanguageId(null)
        setTextId(undefined) // YANGI: Text ID ni ham tozalash
        setSelectedAnalysisType(0)

        const linguisticId = linguistics[tabIndex]?.id
        if (linguisticId) {
            navigate(`/linguistics/${linguisticId}`)
        }
    }

    const handleAnalysisTypeSelect = (typeId: number) => {
        setSelectedAnalysisType(typeId)
    }

    const handleSidebarItemClick = (itemText: string, languageId?: number) => {
        setSidebarActiveItem(itemText)
        setShowChatInput(false)
        setShowContentMenu(true)
        setActiveLanguage(itemText)
        setSelectedLanguageId(languageId || null)
        setTextId(undefined) // YANGI: Text ID ni tozalash

        navigate(`/tags?language=${encodeURIComponent(itemText)}`)
    }

    const handleCloseLanguage = () => {
        setShowChatInput(true)
        setShowContentMenu(false)
        setSidebarActiveItem('')
        setActiveLanguage('')
        setSelectedLanguageId(null)
        setTextId(undefined) // YANGI: Text ID ni tozalash
        navigate('/')
    }

    const handleEditorClick = () => {
        setShowChatInput(true)
        setShowContentMenu(false)
        setSidebarActiveItem('')
        setTextId(undefined) // YANGI: Text ID ni tozalash
        navigate('/editor')
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

    return (
        <div className='main-layout'>
            {/* YANGI: Sidebar'ga onTextClick prop'ini qo'shdik */}
            <Sidebar
                activeItem={sidebarActiveItem}
                onItemClick={handleSidebarItemClick}
                onTextClick={handleTextItemClick} // YANGI: Text click handler
                onEditorClick={handleEditorClick}
                onCloseLanguage={handleCloseLanguage}
                activeTab={activeTab}
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
                                    onStatisticsUpdate={(stats) => {
                                        setTagStats(stats)
                                    }}
                                    textId={textId} // YANGI: Text ID ni uzatish
                                />
                            </div>

                            <div className='statistics-section'>
                                <TagStatistics stats={tagStats} />
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    )
}

export default MainLayout
