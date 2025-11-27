import React, { useState, useRef, useEffect, useCallback } from 'react'
import './ChatInput.css'
import FullscreenIcon from '@mui/icons-material/Fullscreen'
import FullscreenExitIcon from '@mui/icons-material/FullscreenExit'
import { useEditor } from '@/features/editor/hooks/useEditor'
import { Tag } from '@/shared/api/linguistics/linguisticsApi'

interface ChatInputProps {
    onSendMessage?: (message: string) => void
    taggedTextId?: number
}

export const ChatInput: React.FC<ChatInputProps> = ({
    onSendMessage = () => {},
    taggedTextId = 1,
}) => {
    const [isFullscreen, setIsFullscreen] = useState<boolean>(false)
    const [showTagMenu, setShowTagMenu] = useState(false)
    const [menuPosition, setMenuPosition] = useState({ x: 0, y: 0 })
    const [selectedRange, setSelectedRange] = useState<Range | null>(null)
    const [hasContent, setHasContent] = useState(false)

    const editorRef = useRef<HTMLDivElement>(null)
    const {
        selectedText,
        tags,
        handleTextSelect,
        addAnnotation,
        loadTags,
        clearSelection,
    } = useEditor()

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

    // Matn tanlanganida
    const handleTextSelection = useCallback(() => {
        const selection = window.getSelection()
        if (!selection || selection.toString().length === 0) {
            clearSelection()
            setShowTagMenu(false)
            return
        }

        const selectedText = selection.toString().trim()
        if (
            selectedText.length > 0 &&
            editorRef.current?.contains(selection.anchorNode)
        ) {
            const range = selection.getRangeAt(0)
            setSelectedRange(range.cloneRange())

            // Tanlangan matnning pozitsiyasini hisoblash
            const preSelectionRange = range.cloneRange()
            preSelectionRange.selectNodeContents(editorRef.current!)
            preSelectionRange.setEnd(range.startContainer, range.startOffset)
            const start = preSelectionRange.toString().length
            const end = start + selectedText.length

            handleTextSelect(selectedText, start, end)

            // Menu pozitsiyasini o'rnatish - SO'Z TAMOM BO'LGAN JOYDAN
            const rect = range.getBoundingClientRect()

            // O'ng tomondan chiqarish, lekin ekran chegarasidan chiqib ketmasligi uchun
            const viewportWidth = window.innerWidth
            const menuWidth = 250 // Taxminiy menu kengligi

            let menuX = rect.right + window.scrollX
            // Agar menu ekran chegarasidan chiqib ketsa, chap tomonga o'tkazamiz
            if (menuX + menuWidth > viewportWidth) {
                menuX = rect.left + window.scrollX - menuWidth
            }

            setMenuPosition({
                x: menuX,
                y: rect.bottom + window.scrollY + 10, // 10px pastroqda
            })
            setShowTagMenu(true)
        }
    }, [handleTextSelect, clearSelection])

    // Context menu (o'ng klik) uchun
    const handleContextMenu = (e: React.MouseEvent) => {
        e.preventDefault()
        handleTextSelection()
    }

    // Teg tanlanganida
    const handleTagSelect = async (tag: Tag) => {
        if (!taggedTextId || !selectedRange) return

        console.log('Selected tag:', tag)

        const success = await addAnnotation(taggedTextId, tag.id)
        if (success) {
            formatSelectedText(tag, selectedRange)
            setShowTagMenu(false)
            clearSelection()
        }
    }

    // Tanlangan matnni formatlash
    const formatSelectedText = (tag: Tag, range: Range) => {
        const selectedText = range.toString()

        if (selectedText.trim().length === 0) return

        // Yangi formatlangan element yaratish
        const span = document.createElement('span')
        span.className = 'annotated-text'
        span.style.backgroundColor = tag.color || '#e3f2fd' // Rangni yoqamiz
        span.style.color = '#000'
        span.style.padding = '2px 6px'
        span.style.borderRadius = '4px'
        span.style.margin = '0 2px'
        span.style.display = 'inline-block'
        span.style.fontSize = 'inherit'
        span.style.fontWeight = '600'

        // Tag ma'lumotlarini tekshirish
        if (tag.id) {
            span.dataset.tagId = tag.id.toString()
        }
        if (tag.name_tag) {
            span.dataset.tagName = tag.name_tag
        }
        if (tag.abbreviation) {
            span.dataset.tagAbbr = tag.abbreviation
        }

        span.title = `${tag.name_tag || 'Tag'} (${tag.abbreviation || 'N/A'})`

        // Formatlangan matn: agar bir nechta so'z bo'lsa orasiga + qo'yamiz
        const words = selectedText
            .split(/\s+/)
            .filter((word) => word.length > 0)
        let formattedText: string

        if (words.length > 1) {
            // Bir nechta so'z: asdhad+sjdkhdf/Teg
            formattedText = `${words.join('+')}/${tag.abbreviation || 'TAG'}`
        } else {
            // Bitta so'z: asdhad/Teg
            formattedText = `${selectedText.trim()}/${
                tag.abbreviation || 'TAG'
            }`
        }

        span.textContent = formattedText

        // Tanlangan matnni yangi element bilan almashtirish
        range.deleteContents()
        range.insertNode(span)

        // Teg qo'yilgandan keyin keyingi qatorga o'tish
        const br = document.createElement('br')
        span.parentNode?.insertBefore(br, span.nextSibling)

        // Selectionni tozalash
        window.getSelection()?.removeAllRanges()

        // Content yangilanganligini tekshirish
        checkContent()
    }

    // Tashqariga klik qilinganda menyuni yopish
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (
                showTagMenu &&
                !(event.target as Element).closest('.tag-menu')
            ) {
                setShowTagMenu(false)
                clearSelection()
            }
        }

        document.addEventListener('mousedown', handleClickOutside)
        return () => {
            document.removeEventListener('mousedown', handleClickOutside)
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

    const handleSend = (): void => {
        if (editorRef.current?.innerText.trim()) {
            onSendMessage(editorRef.current.innerHTML)
            // Editorni tozalash
            if (editorRef.current) {
                editorRef.current.innerHTML = ''
                setHasContent(false)
            }
        }
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

    const toggleFullscreen = (): void => {
        if (!isFullscreen) {
            if (editorRef.current) {
                editorRef.current.requestFullscreen().catch((err) => {
                    console.error('Error attempting to enable fullscreen:', err)
                })
            }
        } else {
            if (document.fullscreenElement) {
                document.exitFullscreen()
            }
        }
        setIsFullscreen(!isFullscreen)
    }

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

    return (
        <div
            className={`chat-input-container ${
                isFullscreen ? 'fullscreen' : ''
            }`}
        >
            <div className='chat-input-wrapper'>
                {/* ContentEditable editor */}
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
                {showTagMenu && selectedText && (
                    <div
                        className='tag-menu'
                        style={{
                            position: 'fixed', // Fixed position ishlatamiz
                            left: menuPosition.x,
                            top: menuPosition.y,
                            background: 'white',
                            border: '1px solid #ddd',
                            borderRadius: '8px',
                            padding: '8px',
                            boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
                            zIndex: 1000,
                            minWidth: '200px',
                            maxHeight: '300px',
                            overflowY: 'auto',
                        }}
                    >
                        <div
                            style={{
                                padding: '4px 8px',
                                fontSize: '12px',
                                color: '#666',
                                borderBottom: '1px solid #eee',
                                marginBottom: '8px',
                            }}
                        >
                            Tag: "{selectedText}"
                        </div>
                        <div className='tags-list'>
                            {tags.map((tag: Tag, index) => (
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
                                            {tag.name_tag || `Tag ${index + 1}`}
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
                            ))}
                        </div>
                    </div>
                )}

                <div className='chat-input-actions'>
                    <button
                        className='save-button'
                        onClick={handleSend}
                        disabled={!hasContent}
                    >
                        Save
                    </button>
                    <button
                        className='fullscreen-button'
                        onClick={toggleFullscreen}
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
        </div>
    )
}
