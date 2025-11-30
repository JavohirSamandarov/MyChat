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
    // YANGI: Analysis type state - faqat 1 dan boshlansin
    const [selectedAnalysisType, setSelectedAnalysisType] = useState<number>(1)
    const [tagStats, setTagStats] = useState<
        Record<string, { count: number; color: string }>
    >({})

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

    const handleTabChange = (tabIndex: number) => {
        console.log('Tab changed to:', tabIndex)
        setActiveTab(tabIndex)
        setSidebarActiveItem('')
        setShowChatInput(true)
        setShowContentMenu(false)
        setActiveLanguage('')
        setSelectedLanguageId(null)
        // YANGI: Tab o'zgarganda analysis type ni 1 ga qaytaramiz
        setSelectedAnalysisType(1)

        const linguisticId = linguistics[tabIndex]?.id
        if (linguisticId) {
            navigate(`/linguistics/${linguisticId}`)
        }
    }

    const handleSidebarItemClick = (itemText: string, languageId?: number) => {
        console.log(
            'Sidebar item clicked:',
            itemText,
            'Language ID:',
            languageId
        )
        setSidebarActiveItem(itemText)
        setShowChatInput(false)
        setShowContentMenu(true)
        setActiveLanguage(itemText)
        setSelectedLanguageId(languageId || null)

        navigate(`/tags?language=${encodeURIComponent(itemText)}`)
    }

    const handleCloseLanguage = () => {
        setShowChatInput(true)
        setShowContentMenu(false)
        setSidebarActiveItem('')
        setActiveLanguage('')
        setSelectedLanguageId(null)
        navigate('/')
    }

    const handleEditorClick = () => {
        setShowChatInput(true)
        setShowContentMenu(false)
        navigate('/editor')
    }

    // YANGI: languageId ni ChatInput ga uzatish
    const getCurrentTags = (): Tag[] => {
        const currentLinguistic = linguistics[activeTab]
        if (!currentLinguistic) {
            console.log('No current linguistic for tab:', activeTab)
            return []
        }

        if (activeLanguage) {
            const filteredTags = currentLinguistic.tags.filter(
                (tag) => tag.language.name === activeLanguage
            )
            console.log('Filtered tags:', filteredTags)
            return filteredTags
        }

        console.log('All tags:', currentLinguistic.tags)
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

        console.log('Rendering content for language:', activeLanguage)

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
            <Sidebar
                activeItem={sidebarActiveItem}
                onItemClick={handleSidebarItemClick}
                onEditorClick={handleEditorClick}
                onCloseLanguage={handleCloseLanguage}
                activeTab={activeTab}
            />

            <div className='main-content'>
                {/* YANGI: Faqat mavjud prop larni uzatamiz */}
                <Topbar
                    activeTab={activeTab}
                    onTabChange={handleTabChange}
                    // onAnalysisTypeSelect va selectedAnalysisType ni OLIB TASHLAYMIZ
                />

                <div className='content-area'>
                    {showContentMenu && (
                        <div className='content-menu'>
                            {renderLanguageContent()}
                        </div>
                    )}

                    {showChatInput && (
                        <div className='main-content-wrapper'>
                            {/* 80% ChatInput */}
                            <div className='chat-input-section'>
                                {/* YANGI: analysisType ni ChatInput ga uzatish */}
                                <ChatInput
                                    onSendMessage={(message) =>
                                        console.log(message)
                                    }
                                    languageId={selectedLanguageId || undefined}
                                    analysisType={selectedAnalysisType}
                                    onStatisticsUpdate={(stats) => {
                                        setTagStats(stats)
                                    }}
                                />
                            </div>

                            {/* 20% Statistics */}
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
