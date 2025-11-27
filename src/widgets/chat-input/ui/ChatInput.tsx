import React, { useState, useRef, useEffect, useCallback } from 'react'
import './ChatInput.css'
import FullscreenIcon from '@mui/icons-material/Fullscreen'
import FullscreenExitIcon from '@mui/icons-material/FullscreenExit'
import SearchIcon from '@mui/icons-material/Search'
import { useEditor } from '@/features/editor/hooks/useEditor'
import { Tag } from '@/shared/api/linguistics/linguisticsApi'
import { Alert, Snackbar } from '@mui/material'

interface ChatInputProps {
    onSendMessage?: (message: string) => void
    taggedTextId?: number
    languageId?: number
}

export const ChatInput: React.FC<ChatInputProps> = ({
    onSendMessage = () => {},
    taggedTextId = 1,
    languageId = 1,
}) => {
    const [isFullscreen, setIsFullscreen] = useState<boolean>(false)
    const [showTagMenu, setShowTagMenu] = useState(false)
    const [menuPosition, setMenuPosition] = useState({ x: 0, y: 0 })
    const [selectedRange, setSelectedRange] = useState<Range | null>(null)
    const [hasContent, setHasContent] = useState(false)
    const [notification, setNotification] = useState<{
        open: boolean
        message: string
        severity: 'success' | 'error'
    }>({
        open: false,
        message: '',
        severity: 'success',
    })
    const [isSaving, setIsSaving] = useState(false)
    const [searchTerm, setSearchTerm] = useState('')
    const [currentSelection, setCurrentSelection] = useState<string>('')
    const [firstTagColor, setFirstTagColor] = useState<string>('#e3f2fd') // Birinchi teg rangi
    const [currentAnnotatedElement, setCurrentAnnotatedElement] =
        useState<HTMLElement | null>(null)

    const editorRef = useRef<HTMLDivElement>(null)
    const tagMenuRef = useRef<HTMLDivElement>(null)
    const { tags, handleTextSelect, addAnnotation, loadTags, clearSelection } =
        useEditor()

    // Show notification
    const showNotification = (
        message: string,
        severity: 'success' | 'error' = 'success'
    ) => {
        setNotification({
            open: true,
            message,
            severity,
        })
    }

    // Content bor-yo'qligini tekshirish
    const checkContent = useCallback(() => {
        if (editorRef.current) {
            const hasText = editorRef.current.innerText.trim().length > 0
            setHasContent(hasText)
        }
    }, [])

    // Teglarni yuklash
    useEffect(() => {
        loadTags()
    }, [loadTags])

    // Search bo'yicha filterlangan teglar
    const filteredTags = tags.filter(
        (tag) =>
            tag.name_tag?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            tag.abbreviation?.toLowerCase().includes(searchTerm.toLowerCase())
    )

    // Matn tanlanganida
    const handleTextSelection = useCallback(() => {
        const selection = window.getSelection()
        if (!selection || selection.toString().length === 0) {
            return
        }

        const selectedText = selection.toString().trim()
        if (
            selectedText.length > 0 &&
            editorRef.current?.contains(selection.anchorNode)
        ) {
            const range = selection.getRangeAt(0)
            setSelectedRange(range.cloneRange())
            setCurrentSelection(selectedText)

            // Tanlangan matnning pozitsiyasini hisoblash
            const preSelectionRange = range.cloneRange()
            preSelectionRange.selectNodeContents(editorRef.current!)
            preSelectionRange.setEnd(range.startContainer, range.startOffset)
            const start = preSelectionRange.toString().length
            const end = start + selectedText.length

            handleTextSelect(selectedText, start, end)

            // Menu pozitsiyasini o'rnatish
            const rect = range.getBoundingClientRect()
            const viewportWidth = window.innerWidth
            const menuWidth = 280

            let menuX = rect.right + window.scrollX
            if (menuX + menuWidth > viewportWidth) {
                menuX = rect.left + window.scrollX - menuWidth
            }

            setMenuPosition({
                x: menuX,
                y: rect.bottom + window.scrollY + 10,
            })
            setShowTagMenu(true)
            setSearchTerm('')
            setFirstTagColor('#e3f2fd') // Yangi tanlashda rangni reset qilish
            setCurrentAnnotatedElement(null)
        }
    }, [handleTextSelect])

    // Context menu (o'ng klik) uchun
    const handleContextMenu = (e: React.MouseEvent) => {
        e.preventDefault()
        handleTextSelection()
    }

    // Teg tanlanganida
    const handleTagSelect = async (tag: Tag) => {
        if (!taggedTextId) return

        const success = await addAnnotation(taggedTextId, tag.id)
        if (success) {
            await formatSelectedText(tag)
            // Menu OCHIQ QOLADI, faqat selection tozalanadi
            window.getSelection()?.removeAllRanges()
            clearSelection()

            // Cursor ni formatlangan elementning OXIRIGA qo'yamiz
            if (currentAnnotatedElement) {
                const newRange = document.createRange()
                const lastChild = currentAnnotatedElement.lastChild

                if (lastChild && lastChild.nodeType === Node.TEXT_NODE) {
                    newRange.setStart(
                        lastChild,
                        lastChild.textContent?.length || 0
                    )
                    newRange.setEnd(
                        lastChild,
                        lastChild.textContent?.length || 0
                    )
                } else {
                    newRange.setStart(
                        currentAnnotatedElement,
                        currentAnnotatedElement.childNodes.length
                    )
                    newRange.setEnd(
                        currentAnnotatedElement,
                        currentAnnotatedElement.childNodes.length
                    )
                }

                newRange.collapse(true)

                const newSelection = window.getSelection()
                newSelection?.removeAllRanges()
                newSelection?.addRange(newRange)
            }

            // Focus ni editorga qaytarish
            editorRef.current?.focus()
        } else {
            console.error('Failed to add annotation')
        }
    }

    // Tanlangan matnni formatlash - YANGILANDI (rang saqlanadi)
    const formatSelectedText = async (tag: Tag): Promise<void> => {
        if (!selectedRange) return

        const selectedText = selectedRange.toString()
        if (selectedText.trim().length === 0) return

        return new Promise((resolve) => {
            // Tanlangan elementni tekshirish (agar oldin formatlangan bo'lsa)
            let targetElement = selectedRange.startContainer

            // Agar tanlangan qism allaqachon formatlangan bo'lsa
            if (
                targetElement.nodeType === Node.TEXT_NODE &&
                targetElement.parentElement?.classList.contains(
                    'annotated-text'
                )
            ) {
                targetElement = targetElement.parentElement
            }

            if (
                targetElement.nodeType === Node.ELEMENT_NODE &&
                (targetElement as Element).classList?.contains('annotated-text')
            ) {
                // Mavjud formatlangan elementga yangi teg qo'shamiz
                const existingElement = targetElement as HTMLElement

                // Yangi formatlangan matn
                const currentText = existingElement.textContent || ''
                const newFormattedText = `${currentText}/${
                    tag.abbreviation || 'TAG'
                }`

                existingElement.textContent = newFormattedText

                // RANG O'ZGARMASLIGI: Faqat birinchi teg rangi saqlanadi
                // existingElement.style.backgroundColor = firstTagColor // Birinchi teg rangi saqlanadi

                // Yangi tag ma'lumotlarini qo'shamiz
                if (tag.id) {
                    existingElement.dataset.tagIds =
                        (existingElement.dataset.tagIds || '') + `,${tag.id}`
                }
                if (tag.name_tag) {
                    existingElement.dataset.tagNames =
                        (existingElement.dataset.tagNames || '') +
                        `,${tag.name_tag}`
                }
                if (tag.abbreviation) {
                    existingElement.dataset.tagAbbrs =
                        (existingElement.dataset.tagAbbrs || '') +
                        `,${tag.abbreviation}`
                }

                // Yangi title
                const existingTitle = existingElement.title.split(')')[0]
                existingElement.title = `${existingTitle}, ${
                    tag.name_tag || 'Tag'
                } (${tag.abbreviation || 'N/A'})`

                setCurrentAnnotatedElement(existingElement)
            } else {
                // Yangi formatlangan element yaratish
                const span = document.createElement('span')
                span.className = 'annotated-text'

                // BIRINCHI TEG RANGI: Faqat birinchi teg rangi o'rnatiladi
                let backgroundColor = firstTagColor
                if (backgroundColor === '#e3f2fd') {
                    // Agar hali rang o'rnatilmagan bo'lsa, yangi teg rangini o'rnatamiz
                    backgroundColor = tag.color || '#e3f2fd'
                    setFirstTagColor(backgroundColor) // Birinchi teg rangi saqlanadi
                }
                span.style.backgroundColor = backgroundColor

                span.style.color = '#000'
                span.style.padding = '2px 6px'
                span.style.borderRadius = '4px'
                span.style.margin = '0 2px'
                span.style.display = 'inline-block'
                span.style.fontSize = 'inherit'
                span.style.fontWeight = '600'
                span.style.cursor = 'pointer'

                // Tag ma'lumotlarini saqlash
                if (tag.id) {
                    span.dataset.tagIds = tag.id.toString()
                }
                if (tag.name_tag) {
                    span.dataset.tagNames = tag.name_tag
                }
                if (tag.abbreviation) {
                    span.dataset.tagAbbrs = tag.abbreviation
                }

                span.title = `${tag.name_tag || 'Tag'} (${
                    tag.abbreviation || 'N/A'
                })`

                // Formatlangan matn
                const words = selectedText
                    .split(/\s+/)
                    .filter((word) => word.length > 0)
                let formattedText: string

                if (words.length > 1) {
                    formattedText = `${words.join('+')}/${
                        tag.abbreviation || 'TAG'
                    }`
                } else {
                    formattedText = `${selectedText.trim()}/${
                        tag.abbreviation || 'TAG'
                    }`
                }

                span.textContent = formattedText

                // Tanlangan matnni yangi element bilan almashtirish
                selectedRange.deleteContents()
                selectedRange.insertNode(span)

                setCurrentAnnotatedElement(span)
            }

            checkContent()
            resolve()
        })
    }

    // Tashqariga klik qilinganda menyuni yopish
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (
                showTagMenu &&
                tagMenuRef.current &&
                !tagMenuRef.current.contains(event.target as Node) &&
                !editorRef.current?.contains(event.target as Node)
            ) {
                // FAQAT tashqariga click qilganda yopiladi
                setShowTagMenu(false)
                clearSelection()
                setSearchTerm('')
                setFirstTagColor('#e3f2fd')
                setCurrentAnnotatedElement(null)
            }
        }

        document.addEventListener('mousedown', handleClickOutside)
        return () => {
            document.removeEventListener('mousedown', handleClickOutside)
        }
    }, [showTagMenu, clearSelection])

    // Escape bosilganda menyuni yopish
    useEffect(() => {
        const handleEscape = (event: KeyboardEvent) => {
            if (event.key === 'Escape' && showTagMenu) {
                setShowTagMenu(false)
                clearSelection()
                setSearchTerm('')
                setFirstTagColor('#e3f2fd')
                setCurrentAnnotatedElement(null)
            }
        }

        document.addEventListener('keydown', handleEscape)
        return () => {
            document.removeEventListener('keydown', handleEscape)
        }
    }, [showTagMenu, clearSelection])

    // Shortcut lar (Ctrl+Space)
    useEffect(() => {
        const handleKeyDown = (event: KeyboardEvent) => {
            if (event.ctrlKey && event.key === ' ') {
                event.preventDefault()
                handleTextSelection()
            }
        }

        document.addEventListener('keydown', handleKeyDown)
        return () => {
            document.removeEventListener('keydown', handleKeyDown)
        }
    }, [handleTextSelection])

    const handleSend = async (): Promise<void> => {
        if (!editorRef.current?.innerHTML.trim() || isSaving) return

        setIsSaving(true)
        try {
            const success = await sendToBackend(editorRef.current.innerHTML)

            if (success) {
                showNotification('Text successfully saved to backend!')
                onSendMessage(editorRef.current.innerHTML)
            } else {
                showNotification('Failed to save text to backend', 'error')
            }
        } catch (error) {
            console.error('Error sending to backend:', error)
            showNotification('Error saving text to backend', 'error')
        } finally {
            setIsSaving(false)
        }
    }

    const getUserId = (): number | null => {
        try {
            // 1. LocalStorage dan user ma'lumotlarini tekshirish
            const userData = localStorage.getItem('user_data')
            if (userData) {
                const user = JSON.parse(userData)
                if (user.id) return user.id
                if (user.user_id) return user.user_id
            }

            // 2. Alohida user_id saqlangan bo'lsa
            const userId = localStorage.getItem('user_id')
            if (userId) return parseInt(userId)

            // 3. Token dan olish
            const token = getAuthToken()
            if (token) {
                try {
                    const payload = JSON.parse(atob(token.split('.')[1]))
                    return payload.user_id || payload.sub || null
                } catch (e) {
                    console.warn('Token decode error:', e)
                }
            }

            return null
        } catch (error) {
            console.error('Error getting user ID:', error)
            return null
        }
    }

    const sendToBackend = async (htmlContent: string): Promise<boolean> => {
        try {
            const authToken = getAuthToken()
            if (!authToken) {
                showNotification(
                    'Authentication required. Please login.',
                    'error'
                )
                return false
            }

            const userId = getUserId()
            if (!userId) {
                showNotification(
                    'User information not found. Please login again.',
                    'error'
                )
                return false
            }

            // HTML ni plain text ga o'zgartirish
            const tempDiv = document.createElement('div')
            tempDiv.innerHTML = htmlContent
            const plainText = tempDiv.textContent || tempDiv.innerText || ''

            // Title ni yasash
            const words = plainText
                .trim()
                .split(/\s+/)
                .filter((word) => word.length > 0)
            let title = 'New Text'

            if (words.length > 0) {
                title = words.slice(0, 3).join(' ')
                if (words.length > 3) {
                    title += '...'
                }
            }

            const requestData = {
                user: userId,
                language: languageId,
                title: title,
                text: plainText,
                metadata: {
                    created_at: new Date().toISOString(),
                    character_count: plainText.length,
                    word_count: words.length,
                    source: 'web_editor',
                },
            }

            console.log('Sending data to backend:', requestData)

            const response = await fetch('/api/tagged_texts/', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    Accept: 'application/json',
                    Authorization: `Bearer ${authToken}`,
                },
                body: JSON.stringify(requestData),
            })

            if (response.ok) {
                const result = await response.json()
                console.log('Text saved successfully:', result)
                showNotification('Text saved successfully!')
                return true
            } else {
                const errorText = await response.text()
                console.error('Backend error response:', errorText)
                showNotification('Failed to save text', 'error')
                return false
            }
        } catch (error) {
            console.error('Backend error:', error)
            showNotification('Error saving text', 'error')
            return false
        }
    }

    const getAuthToken = (): string => {
        const tokenFromStorage =
            localStorage.getItem('auth_token') ||
            localStorage.getItem('access_token') ||
            localStorage.getItem('token')

        let finalToken = tokenFromStorage || ''
        if (finalToken.startsWith('Bearer ')) {
            finalToken = finalToken.substring(7)
        }

        return finalToken
    }

    const handleKeyPress = (e: React.KeyboardEvent<HTMLDivElement>): void => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault()
            handleSend()
        }
    }

    const handleInput = () => {
        checkContent()
    }

    // const toggleFullscreen = (): void => {
    //     if (!isFullscreen) {
    //         if (editorRef.current) {
    //             editorRef.current.requestFullscreen().catch((err) => {
    //                 console.error('Error attempting to enable fullscreen:', err)
    //             })
    //         }
    //     } else {
    //         if (document.fullscreenElement) {
    //             document.exitFullscreen()
    //         }
    //     }
    //     setIsFullscreen(!isFullscreen)
    // }

    const handleFullscreenChange = (): void => {
        setIsFullscreen(!!document.fullscreenElement)
    }

    useEffect(() => {
        document.addEventListener('fullscreenchange', handleFullscreenChange)
        return () => {
            document.removeEventListener(
                'fullscreenchange',
                handleFullscreenChange
            )
        }
    }, [])

    const handleCloseNotification = () => {
        setNotification((prev) => ({ ...prev, open: false }))
    }

    return (
        <div
            className={`chat-input-container ${
                isFullscreen ? 'fullscreen' : ''
            }`}
        >
            <div className='chat-input-wrapper'>
                <div
                    ref={editorRef}
                    className='chat-input-editor'
                    contentEditable
                    onMouseUp={handleTextSelection}
                    onContextMenu={handleContextMenu}
                    onKeyPress={handleKeyPress}
                    onInput={handleInput}
                />

                {/* Teglar menyusi */}
                {showTagMenu && (
                    <div
                        ref={tagMenuRef}
                        className='tag-menu'
                        style={{
                            position: 'fixed',
                            left: menuPosition.x,
                            top: menuPosition.y,
                            background: 'white',
                            border: '1px solid #ddd',
                            borderRadius: '8px',
                            padding: '8px',
                            boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
                            zIndex: 1000,
                            minWidth: '280px',
                            maxHeight: '400px',
                            overflowY: 'auto',
                        }}
                    >
                        {/* Search qismi */}
                        <div
                            style={{
                                position: 'relative',
                                marginBottom: '8px',
                            }}
                        >
                            <SearchIcon
                                style={{
                                    position: 'absolute',
                                    left: '8px',
                                    top: '50%',
                                    transform: 'translateY(-50%)',
                                    color: '#666',
                                    fontSize: '16px',
                                }}
                            />
                            <input
                                type='text'
                                placeholder='Tag nomi yoki qisqartmasi...'
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                style={{
                                    width: '100%',
                                    padding: '8px 8px 8px 32px',
                                    border: '1px solid #ddd',
                                    borderRadius: '4px',
                                    fontSize: '12px',
                                    outline: 'none',
                                }}
                                autoFocus
                            />
                        </div>

                        <div
                            style={{
                                padding: '4px 8px',
                                fontSize: '12px',
                                color: '#666',
                                borderBottom: '1px solid #eee',
                                marginBottom: '8px',
                            }}
                        >
                            {currentSelection
                                ? `Tag: "${currentSelection}"`
                                : "Yana teg qo'shing"}
                        </div>

                        <div className='tags-list'>
                            {filteredTags.length > 0 ? (
                                filteredTags.map((tag: Tag, index) => (
                                    <button
                                        key={tag.id || index}
                                        onClick={() => handleTagSelect(tag)}
                                        style={{
                                            display: 'flex',
                                            alignItems: 'center',
                                            width: '100%',
                                            padding: '8px',
                                            margin: '2px 0',
                                            background: tag.color || '#f5f5f5',
                                            border: 'none',
                                            borderRadius: '4px',
                                            cursor: 'pointer',
                                            textAlign: 'left',
                                            fontSize: '12px',
                                        }}
                                    >
                                        <div
                                            style={{
                                                width: '12px',
                                                height: '12px',
                                                borderRadius: '2px',
                                                backgroundColor:
                                                    tag.color || '#ccc',
                                                marginRight: '8px',
                                            }}
                                        ></div>
                                        <div>
                                            <div style={{ fontWeight: 'bold' }}>
                                                {tag.name_tag ||
                                                    `Tag ${index + 1}`}
                                            </div>
                                            <div
                                                style={{
                                                    fontSize: '10px',
                                                    color: '#666',
                                                }}
                                            >
                                                {tag.abbreviation || 'N/A'}
                                            </div>
                                        </div>
                                    </button>
                                ))
                            ) : (
                                <div
                                    style={{
                                        padding: '8px',
                                        textAlign: 'center',
                                        color: '#666',
                                        fontSize: '12px',
                                    }}
                                >
                                    Teg topilmadi
                                </div>
                            )}
                        </div>

                        {/* ESC hint */}
                        <div
                            style={{
                                padding: '8px',
                                textAlign: 'center',
                                color: '#999',
                                fontSize: '10px',
                                borderTop: '1px solid #eee',
                                marginTop: '8px',
                            }}
                        >
                            ESC bosib yoping
                        </div>
                    </div>
                )}

                <div className='chat-input-actions'>
                    <button
                        className='save-button'
                        onClick={handleSend}
                        disabled={!hasContent || isSaving}
                    >
                        {isSaving ? 'Saving...' : 'Save'}
                    </button>
                    <button
                        className='fullscreen-button'
                        title={
                            isFullscreen
                                ? 'Exit fullscreen'
                                : 'Enter fullscreen'
                        }
                    >
                        {isFullscreen ? (
                            <FullscreenExitIcon />
                        ) : (
                            <FullscreenIcon />
                        )}
                    </button>
                </div>
            </div>

            <Snackbar
                open={notification.open}
                autoHideDuration={4000}
                onClose={handleCloseNotification}
                anchorOrigin={{ vertical: 'top', horizontal: 'right' }}
            >
                <Alert
                    onClose={handleCloseNotification}
                    severity={notification.severity}
                    variant='filled'
                >
                    {notification.message}
                </Alert>
            </Snackbar>
        </div>
    )
}
