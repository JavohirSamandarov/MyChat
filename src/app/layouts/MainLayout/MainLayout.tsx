import { ChatInput, Sidebar, Topbar } from '@/widgets'
import './MainLayout.css'
import React, { useState } from 'react'

const MainLayout: React.FC = () => {
    const [activeTab, setActiveTab] = useState<number>(0)
    const [sidebarActiveItem, setSidebarActiveItem] = useState<string>('')
    const [showChatInput, setShowChatInput] = useState<boolean>(true)
    const [showContentMenu, setShowContentMenu] = useState<boolean>(false)
    const [activeLanguage, setActiveLanguage] = useState<string>('')

    const handleTabChange = (tabIndex: number) => {
        setActiveTab(tabIndex)
        setSidebarActiveItem('')
        setShowChatInput(true)
        setShowContentMenu(false)
        setActiveLanguage('')
    }

    const handleSidebarItemClick = (itemText: string) => {
        setSidebarActiveItem(itemText)
        setShowChatInput(false)
        setShowContentMenu(true)
        setActiveLanguage(itemText)
    }

    const handleCloseLanguage = () => {
        setShowChatInput(true)
        setShowContentMenu(false)
        setSidebarActiveItem('')
        setActiveLanguage('')
    }

    const handleEditorClick = () => {
        setShowChatInput(true)
        setShowContentMenu(false)
    }

    const getLanguageItems = () => {
        if (activeTab === 0) {
            return [
                { id: '1', text: 'English' },
                { id: '2', text: 'Rus tili' },
            ]
        } else {
            return [
                { id: '3', text: 'Uzbek tili' },
                { id: '4', text: 'Rus tili' },
            ]
        }
    }

    // English uchun Universal POS tags jadvali
    const renderEnglishContent = () => {
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
                                <th>Open class words</th>
                                <th>Closed class words</th>
                                <th>Other</th>
                            </tr>
                        </thead>
                        <tbody>
                            <tr>
                                <td>
                                    <strong>ADJ</strong>
                                </td>
                                <td>
                                    <strong>ADP</strong>
                                </td>
                                <td>
                                    <strong>PUNCT</strong>
                                </td>
                            </tr>
                            <tr>
                                <td>
                                    <strong>ADV</strong>
                                </td>
                                <td>
                                    <strong>AUX</strong>
                                </td>
                                <td>
                                    <strong>SYM</strong>
                                </td>
                            </tr>
                            <tr>
                                <td>
                                    <strong>INTJ</strong>
                                </td>
                                <td>
                                    <strong>CCONJ</strong>
                                </td>
                                <td>
                                    <strong>X</strong>
                                </td>
                            </tr>
                            <tr>
                                <td>
                                    <strong>NOUN</strong>
                                </td>
                                <td>
                                    <strong>DET</strong>
                                </td>
                                <td></td>
                            </tr>
                            <tr>
                                <td>
                                    <strong>PROPN</strong>
                                </td>
                                <td>
                                    <strong>NUM</strong>
                                </td>
                                <td></td>
                            </tr>
                            <tr>
                                <td>
                                    <strong>VERB</strong>
                                </td>
                                <td>
                                    <strong>PART</strong>
                                </td>
                                <td></td>
                            </tr>
                            <tr>
                                <td></td>
                                <td>
                                    <strong>PRON</strong>
                                </td>
                                <td></td>
                            </tr>
                            <tr>
                                <td></td>
                                <td>
                                    <strong>SCONJ</strong>
                                </td>
                                <td></td>
                            </tr>
                        </tbody>
                    </table>
                </div>

                <div className='alphabetical-listing'>
                    <h3>Alphabetical listing</h3>
                    <ul>
                        <li>
                            <strong>ADJ</strong>: adjective
                        </li>
                        <li>
                            <strong>ADP</strong>: adposition
                        </li>
                        <li>
                            <strong>ADV</strong>: adverb
                        </li>
                        <li>
                            <strong>AUX</strong>: auxiliary
                        </li>
                        <li>
                            <strong>CCONJ</strong>: coordinating conjunction
                        </li>
                        <li>
                            <strong>DET</strong>: determiner
                        </li>
                        <li>
                            <strong>INTJ</strong>: interjection
                        </li>
                        <li>
                            <strong>NOUN</strong>: noun
                        </li>
                        <li>
                            <strong>NUM</strong>: numeral
                        </li>
                        <li>
                            <strong>PART</strong>: particle
                        </li>
                        <li>
                            <strong>PRON</strong>: pronoun
                        </li>
                        <li>
                            <strong>PROPN</strong>: proper noun
                        </li>
                        <li>
                            <strong>PUNCT</strong>: punctuation
                        </li>
                        <li>
                            <strong>SCONJ</strong>: subordinating conjunction
                        </li>
                        <li>
                            <strong>SYM</strong>: symbol
                        </li>
                        <li>
                            <strong>VERB</strong>: verb
                        </li>
                        <li>
                            <strong>X</strong>: other
                        </li>
                    </ul>
                </div>
            </div>
        )
    }

    const renderLanguageContent = () => {
        switch (activeLanguage) {
            case 'English':
                return renderEnglishContent()
            case 'Rus tili':
                return (
                    <div className='language-content english-content'>
                        <h2>Universal POS tags Ru</h2>
                    </div>
                )
            case 'Uzbek tili':
                return (
                    <div className='language-content english-content'>
                        <h2>Teg (belgilash) nomi – Ma’nosi</h2>
                        <p>
                            Ushbu sintaktik teglar gap bo‘laklarining grammatik
                            vazifalarini belgilash uchun qo‘llanadi. Har bir teg
                            gapdagi ma’nodosh birlikning sintaktik rolini
                            ko‘rsatadi.
                        </p>

                        <div className='pos-table-container'>
                            <table className='pos-table'>
                                <thead>
                                    <tr>
                                        <th>Asosiy bo‘laklar</th>
                                        <th>Ikkinchi darajali bo‘laklar</th>
                                        <th>Qo‘shimcha bo‘laklar</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    <tr>
                                        <td>
                                            <strong>EG</strong>
                                        </td>
                                        <td>
                                            <strong>QA</strong>
                                        </td>
                                        <td>
                                            <strong>UN</strong>
                                        </td>
                                    </tr>
                                    <tr>
                                        <td>
                                            <strong>OK</strong>
                                        </td>
                                        <td>
                                            <strong>SA</strong>
                                        </td>
                                        <td>
                                            <strong>KR</strong>
                                        </td>
                                    </tr>
                                    <tr>
                                        <td>
                                            <strong>FK</strong>
                                        </td>
                                        <td>
                                            <strong>IA</strong>
                                        </td>
                                        <td></td>
                                    </tr>
                                    <tr>
                                        <td></td>
                                        <td>
                                            <strong>VL</strong>
                                        </td>
                                        <td></td>
                                    </tr>
                                    <tr>
                                        <td></td>
                                        <td>
                                            <strong>VS</strong>
                                        </td>
                                        <td></td>
                                    </tr>
                                    <tr>
                                        <td></td>
                                        <td>
                                            <strong>VH</strong>
                                        </td>
                                        <td></td>
                                    </tr>
                                    <tr>
                                        <td></td>
                                        <td>
                                            <strong>OH</strong>
                                        </td>
                                        <td></td>
                                    </tr>
                                    <tr>
                                        <td></td>
                                        <td>
                                            <strong>PH</strong>
                                        </td>
                                        <td></td>
                                    </tr>
                                    <tr>
                                        <td></td>
                                        <td>
                                            <strong>SH</strong>
                                        </td>
                                        <td></td>
                                    </tr>
                                    <tr>
                                        <td></td>
                                        <td>
                                            <strong>MH</strong>
                                        </td>
                                        <td></td>
                                    </tr>
                                    <tr>
                                        <td></td>
                                        <td>
                                            <strong>DH</strong>
                                        </td>
                                        <td></td>
                                    </tr>
                                    <tr>
                                        <td></td>
                                        <td>
                                            <strong>SAH</strong>
                                        </td>
                                        <td></td>
                                    </tr>
                                </tbody>
                            </table>
                        </div>

                        <div className='alphabetical-listing'>
                            <h3>Alifbo tartibida ro‘yxat</h3>
                            <ul>
                                <li>
                                    <strong>DH</strong>: daraja-miqdor holi
                                </li>
                                <li>
                                    <strong>EG</strong>: ega
                                </li>
                                <li>
                                    <strong>FK</strong>: fe’l kesim
                                </li>
                                <li>
                                    <strong>IA</strong>: izohlovchi aniqlovchi
                                </li>
                                <li>
                                    <strong>KR</strong>: kiritma
                                </li>
                                <li>
                                    <strong>MH</strong>: maqsad holi
                                </li>
                                <li>
                                    <strong>OH</strong>: o‘rin holi
                                </li>
                                <li>
                                    <strong>OK</strong>: ot kesim
                                </li>
                                <li>
                                    <strong>PH</strong>: payt holi
                                </li>
                                <li>
                                    <strong>QA</strong>: qaratqich aniqlovchi
                                </li>
                                <li>
                                    <strong>SA</strong>: sifatlovchi aniqlovchi
                                </li>
                                <li>
                                    <strong>SAH</strong>: sabab holi
                                </li>
                                <li>
                                    <strong>SH</strong>: shart holi
                                </li>
                                <li>
                                    <strong>UN</strong>: undalma
                                </li>
                                <li>
                                    <strong>VL</strong>: vositali to‘ldiruvchi
                                </li>
                                <li>
                                    <strong>VH</strong>: vaziyat holi
                                </li>
                                <li>
                                    <strong>VS</strong>: vositasiz to‘ldiruvchi
                                </li>
                            </ul>
                        </div>
                    </div>
                )
            default:
                return null
        }
    }

    return (
        <div className='main-layout'>
            <Sidebar
                activeItem={sidebarActiveItem}
                onItemClick={handleSidebarItemClick}
                onEditorClick={handleEditorClick}
                onCloseLanguage={handleCloseLanguage}
                languageItems={getLanguageItems()}
                activeTab={activeTab}
            />

            <div className='main-content'>
                <Topbar activeTab={activeTab} onTabChange={handleTabChange} />

                <div className='content-area'>
                    {showContentMenu && (
                        <div className='content-menu'>
                            {renderLanguageContent()}
                        </div>
                    )}

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
