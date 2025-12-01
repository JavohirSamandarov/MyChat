import React, { useState, useRef, useEffect, useCallback } from 'react'
import './ChatInput.css'
import FullscreenIcon from '@mui/icons-material/Fullscreen'
import FullscreenExitIcon from '@mui/icons-material/FullscreenExit'
import SearchIcon from '@mui/icons-material/Search'
import DeleteIcon from '@mui/icons-material/Delete'
import SaveIcon from '@mui/icons-material/Save'
import ImportExportIcon from '@mui/icons-material/ImportExport'
import DownloadIcon from '@mui/icons-material/Download'
import UploadIcon from '@mui/icons-material/Upload'
import { useEditor } from '@/features/editor/hooks/useEditor'
import { Tag } from '@/shared/api/linguistics/linguisticsApi'
import { Alert, Snackbar } from '@mui/material'

interface ChatInputProps {
    onSendMessage?: (message: string) => void
    taggedTextId?: number
    languageId?: number
    analysisType?: number
    onStatisticsUpdate?: (
        stats: Record<string, { count: number; color: string }>
    ) => void
    textId?: number
}

export const ChatInput: React.FC<ChatInputProps> = ({
    onSendMessage = () => {},
    taggedTextId = 1,
    languageId,
    analysisType = 0,
    onStatisticsUpdate,
    textId,
}) => {
    const [isFullscreen, setIsFullscreen] = useState<boolean>(false)
    const [showTagMenu, setShowTagMenu] = useState(false)
    const [showEditMenu, setShowEditMenu] = useState(false)
    const [showImportExport, setShowImportExport] = useState(false)
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
    const [selectedAnnotatedElement, setSelectedAnnotatedElement] =
        useState<HTMLElement | null>(null)

    const editorRef = useRef<HTMLDivElement>(null)
    const tagMenuRef = useRef<HTMLDivElement>(null)
    const editMenuRef = useRef<HTMLDivElement>(null)
    const importExportRef = useRef<HTMLDivElement>(null)
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

    useEffect(() => {
        const loadText = async () => {
            if (textId) {
                try {
                    console.log('Loading text with ID:', textId)

                    const authToken = getAuthToken()
                    if (!authToken) {
                        showNotification('Authentication required', 'error')
                        return
                    }

                    const response = await fetch(
                        `/api/tagged_texts/${textId}/`,
                        {
                            headers: {
                                Authorization: `Bearer ${authToken}`,
                                Accept: 'application/json',
                            },
                        }
                    )

                    if (response.ok) {
                        const textData = await response.json()
                        console.log('Text loaded:', textData)

                        // Editorga textni yuklash
                        if (editorRef.current) {
                            // Oddiy textni yuklash (HTML emas)
                            editorRef.current.textContent = textData.text
                            checkContent()
                            updateTagStatistics()

                            console.log(
                                'Text loaded successfully:',
                                textData.title
                            )
                            showNotification(
                                `"${textData.title}" loaded`,
                                'success'
                            )
                        }
                    } else {
                        throw new Error('Failed to load text')
                    }
                } catch (error) {
                    console.error('Failed to load text:', error)
                    showNotification('Failed to load text', 'error')
                }
            } else {
                // Yangi text - editorni tozalash
                if (editorRef.current) {
                    editorRef.current.innerHTML = ''
                    setHasContent(false)
                    updateTagStatistics()
                }
            }
        }

        loadText()
    }, [textId])

    // Teglarni yuklash
    useEffect(() => {
        loadTags()
    }, [loadTags])

    // Teglarni filterlash
    const filteredTags = tags
        .filter((tag) => {
            if (!languageId) return false
            return tag.language.id === languageId
        })
        .filter(
            (tag) =>
                tag.name_tag
                    ?.toLowerCase()
                    .includes(searchTerm.toLowerCase()) ||
                tag.abbreviation
                    ?.toLowerCase()
                    .includes(searchTerm.toLowerCase())
        )

    // Statistikani yangilash funksiyasi
    const updateTagStatistics = useCallback(() => {
        if (!editorRef.current) return

        const annotatedElements =
            editorRef.current.querySelectorAll('.annotated-text')
        const newStats: Record<string, { count: number; color: string }> = {}

        annotatedElements.forEach((element) => {
            const currentText = element.textContent || ''
            const parts = currentText.split('/')
            const tagAbbreviations = parts.slice(1)

            tagAbbreviations.forEach((tagAbbr) => {
                if (tagAbbr.trim()) {
                    if (!newStats[tagAbbr]) {
                        // Tag ma'lumotlarini topish
                        const tagInfo = tags.find(
                            (t) => t.abbreviation === tagAbbr
                        )
                        newStats[tagAbbr] = {
                            count: 0,
                            color: tagInfo?.color || '#e3f2fd',
                        }
                    }
                    newStats[tagAbbr].count++
                }
            })
        })

        onStatisticsUpdate?.(newStats)
    }, [onStatisticsUpdate, tags])

    // Matn tanlanganida
    const handleTextSelection = useCallback(() => {
        if (!languageId || filteredTags.length === 0) {
            console.log(
                'Language not selected or no tags available - menu blocked'
            )
            return
        }

        const selection = window.getSelection()
        if (!selection || selection.toString().length === 0) {
            return
        }

        const selectedText = selection.toString().trim()
        if (
            selectedText.length > 0 &&
            editorRef.current?.contains(selection.anchorNode)
        ) {
            let targetElement: Node | ParentNode | null = selection.anchorNode

            if (targetElement && targetElement.nodeType === Node.TEXT_NODE) {
                targetElement = targetElement.parentElement
            }

            if (
                targetElement &&
                targetElement instanceof HTMLElement &&
                targetElement.classList?.contains('annotated-text')
            ) {
                setSelectedAnnotatedElement(targetElement)
                setShowEditMenu(true)

                const range = selection.getRangeAt(0)
                const rect = range.getBoundingClientRect()
                setMenuPosition({
                    x: rect.right + window.scrollX,
                    y: rect.bottom + window.scrollY + 10,
                })
                return
            }

            const range = selection.getRangeAt(0)
            setSelectedRange(range.cloneRange())
            setCurrentSelection(selectedText)

            const preSelectionRange = range.cloneRange()
            preSelectionRange.selectNodeContents(editorRef.current!)
            preSelectionRange.setEnd(range.startContainer, range.startOffset)
            const start = preSelectionRange.toString().length
            const end = start + selectedText.length

            handleTextSelect(selectedText, start, end)

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
        }
    }, [handleTextSelect, languageId, filteredTags.length])

    // Annotated elementni o'chirish
    const handleRemoveTags = () => {
        if (!selectedAnnotatedElement) return

        const originalText = selectedAnnotatedElement.textContent || ''
        const words = originalText.split('/')[0]
        const textWithSpaces = words.replace(/\+/g, ' ')

        const textNode = document.createTextNode(textWithSpaces)
        selectedAnnotatedElement.parentNode?.replaceChild(
            textNode,
            selectedAnnotatedElement
        )

        const newRange = document.createRange()
        newRange.selectNodeContents(textNode)
        const newSelection = window.getSelection()
        newSelection?.removeAllRanges()
        newSelection?.addRange(newRange)

        setShowEditMenu(false)
        setSelectedAnnotatedElement(null)
        updateTagStatistics()
    }

    // Alohida tegni o'chirish
    const handleRemoveSpecificTag = (tagIndex: number) => {
        if (!selectedAnnotatedElement) return

        const elementToUpdate = selectedAnnotatedElement
        const parentElement = elementToUpdate.parentElement

        const currentText = elementToUpdate.textContent || ''
        const parts = currentText.split('/')
        const originalText = parts[0]
        const currentTags = parts.slice(1)

        const newTags = currentTags.filter((_, index) => index !== tagIndex)

        if (newTags.length === 0) {
            const textWithSpaces = originalText.replace(/\+/g, ' ')
            const textNode = document.createTextNode(textWithSpaces)
            parentElement?.replaceChild(textNode, elementToUpdate)

            const newRange = document.createRange()
            newRange.selectNodeContents(textNode)
            const newSelection = window.getSelection()
            newSelection?.removeAllRanges()
            newSelection?.addRange(newRange)

            setSelectedAnnotatedElement(null)
        } else {
            const newFormattedText = `${originalText}/${newTags.join('/')}`
            elementToUpdate.textContent = newFormattedText

            const firstTagAbbr = newTags[0]
            const firstTag = tags.find(
                (tag) => tag.abbreviation === firstTagAbbr
            )
            if (firstTag) {
                elementToUpdate.style.backgroundColor =
                    firstTag.color || '#e3f2fd'
            }

            const newRange = document.createRange()
            newRange.selectNodeContents(elementToUpdate)
            const newSelection = window.getSelection()
            newSelection?.removeAllRanges()
            newSelection?.addRange(newRange)

            setSelectedAnnotatedElement(elementToUpdate)
        }

        setShowEditMenu(false)
        updateTagStatistics()
    }

    // Context menu
    const handleContextMenu = (e: React.MouseEvent) => {
        if (!languageId || filteredTags.length === 0) {
            e.preventDefault()
            return
        }

        e.preventDefault()
        handleTextSelection()
    }

    // MouseUp handler
    const handleMouseUp = useCallback(
        (e: React.MouseEvent) => {
            if (e.button === 2 && languageId && filteredTags.length > 0) {
                // Right-click handling
            }
        },
        [languageId, filteredTags.length]
    )

    // Teg tanlanganida
    const handleTagSelect = async (tag: Tag) => {
        if (!taggedTextId) return

        const success = await addAnnotation(taggedTextId, tag.id)
        if (success) {
            await formatSelectedText(tag)
            window.getSelection()?.removeAllRanges()
            clearSelection()

            setTimeout(() => {
                if (editorRef.current) {
                    const range = document.createRange()
                    const selection = window.getSelection()

                    const lastChild = editorRef.current.lastChild

                    if (lastChild) {
                        if (lastChild.nodeType === Node.TEXT_NODE) {
                            range.setStart(
                                lastChild,
                                lastChild.textContent?.length || 0
                            )
                            range.setEnd(
                                lastChild,
                                lastChild.textContent?.length || 0
                            )
                        } else {
                            range.setStartAfter(lastChild)
                            range.setEndAfter(lastChild)
                        }
                    } else {
                        range.setStart(editorRef.current, 0)
                        range.setEnd(editorRef.current, 0)
                    }

                    range.collapse(true)
                    selection?.removeAllRanges()
                    selection?.addRange(range)
                }
                editorRef.current?.focus()
            }, 0)

            updateTagStatistics()
        } else {
            console.error('Failed to add annotation')
        }
    }

    // Tanlangan matnni formatlash
    const formatSelectedText = async (tag: Tag): Promise<void> => {
        if (!selectedRange) return

        const selectedText = selectedRange.toString()
        if (selectedText.trim().length === 0) return

        return new Promise((resolve) => {
            let targetElement: Node | null = selectedRange.startContainer

            if (
                targetElement.nodeType === Node.TEXT_NODE &&
                targetElement.parentElement?.classList.contains(
                    'annotated-text'
                )
            ) {
                targetElement = targetElement.parentElement
            }

            if (
                targetElement &&
                targetElement.nodeType === Node.ELEMENT_NODE &&
                (targetElement as Element).classList?.contains('annotated-text')
            ) {
                const existingElement = targetElement as HTMLElement
                const currentText = existingElement.textContent || ''
                const parts = currentText.split('/')
                const originalText = parts[0]

                const newTags = [...parts.slice(1), tag.abbreviation || 'TAG']
                const newFormattedText = `${originalText}/${newTags.join('/')}`

                existingElement.textContent = newFormattedText

                const firstTagAbbr = newTags[0]
                const firstTag = tags.find(
                    (t) => t.abbreviation === firstTagAbbr
                )
                if (firstTag) {
                    existingElement.style.backgroundColor =
                        firstTag.color || '#e3f2fd'
                }

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

                const existingTitle = existingElement.title.split(')')[0]
                existingElement.title = `${existingTitle}, ${
                    tag.name_tag || 'Tag'
                } (${tag.abbreviation || 'N/A'})`
            } else {
                const span = document.createElement('span')
                span.className = 'annotated-text'
                span.style.backgroundColor = tag.color || '#e3f2fd'
                span.style.color = '#000'
                span.style.padding = '2px 6px'
                span.style.borderRadius = '4px'
                span.style.margin = '0 2px'
                span.style.display = 'inline-block'
                span.style.fontSize = 'inherit'
                span.style.fontWeight = '600'
                span.style.cursor = 'pointer'

                if (tag.id) span.dataset.tagIds = tag.id.toString()
                if (tag.name_tag) span.dataset.tagNames = tag.name_tag
                if (tag.abbreviation) span.dataset.tagAbbrs = tag.abbreviation

                span.title = `${tag.name_tag || 'Tag'} (${
                    tag.abbreviation || 'N/A'
                })`

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
                selectedRange.deleteContents()
                selectedRange.insertNode(span)
            }

            checkContent()
            resolve()
        })
    }

    // Backspace ni handle qilish
    const handleBackspace = (e: React.KeyboardEvent<HTMLDivElement>) => {
        const selection = window.getSelection()
        if (!selection || selection.rangeCount === 0) return

        const range = selection.getRangeAt(0)
        if (!range.collapsed) return

        const currentNode = range.startContainer
        let targetElement: HTMLElement | null = null

        if (currentNode.nodeType === Node.TEXT_NODE) {
            const parentElement = currentNode.parentElement
            if (parentElement?.classList.contains('annotated-text')) {
                targetElement = parentElement
            }
        } else if (currentNode.nodeType === Node.ELEMENT_NODE) {
            const element = currentNode as HTMLElement
            if (element.classList?.contains('annotated-text')) {
                targetElement = element
            }
        }

        if (!targetElement) {
            const previousSibling = range.startContainer.previousSibling
            if (
                previousSibling &&
                (previousSibling as HTMLElement).classList?.contains(
                    'annotated-text'
                )
            ) {
                targetElement = previousSibling as HTMLElement
            }
        }

        if (targetElement) {
            e.preventDefault()

            const currentText = targetElement.textContent || ''
            const parts = currentText.split('/')

            if (parts.length === 2) {
                const originalText = parts[0]
                const textWithSpaces = originalText.replace(/\+/g, ' ')
                const textNode = document.createTextNode(textWithSpaces)
                targetElement.parentNode?.replaceChild(textNode, targetElement)

                const newRange = document.createRange()
                newRange.setStart(textNode, textWithSpaces.length)
                newRange.setEnd(textNode, textWithSpaces.length)
                newRange.collapse(true)

                const newSelection = window.getSelection()
                newSelection?.removeAllRanges()
                newSelection?.addRange(newRange)
            } else if (parts.length > 2) {
                const originalText = parts[0]
                const remainingTags = parts.slice(1, -1)
                const newFormattedText = `${originalText}/${remainingTags.join(
                    '/'
                )}`
                targetElement.textContent = newFormattedText

                if (remainingTags.length > 0) {
                    const firstTagAbbr = remainingTags[0]
                    const firstTag = tags.find(
                        (tag) => tag.abbreviation === firstTagAbbr
                    )
                    if (firstTag) {
                        targetElement.style.backgroundColor =
                            firstTag.color || '#e3f2fd'
                    }
                }

                const newRange = document.createRange()
                newRange.setStart(targetElement, 1)
                newRange.setEnd(targetElement, 1)
                newRange.collapse(false)

                const newSelection = window.getSelection()
                newSelection?.removeAllRanges()
                newSelection?.addRange(newRange)
            }
        }
        updateTagStatistics()
    }

    // KeyDown handler
    const handleKeyDown = (e: React.KeyboardEvent<HTMLDivElement>): void => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault()
            handleSend()
        }

        if (e.key === 'Backspace') {
            handleBackspace(e)
        }

        if ((e.ctrlKey || e.metaKey) && e.key === 'z') {
            e.preventDefault()
        }
    }

    // Import funksiyasi
    const handleImport = () => {
        console.log('Import functionality')
        setShowImportExport(false)
    }

    // Export funksiyasi
    const handleExport = () => {
        console.log('Export functionality')
        setShowImportExport(false)
    }

    // Send funksiyasi
    const handleSend = async (): Promise<void> => {
        if (!editorRef.current?.innerHTML.trim() || isSaving) return

        setIsSaving(true)
        try {
            const success = await sendToBackend(editorRef.current.innerHTML)
            if (success) {
                showNotification('Text successfully saved!', 'success')
                onSendMessage(editorRef.current.innerHTML)
            } else {
                showNotification('Failed to save text', 'error')
            }
        } catch (error) {
            console.error('Error sending to backend:', error)
            showNotification('Error saving text', 'error')
        } finally {
            setIsSaving(false)
        }
    }

    // Backend ga yuborish funksiyasi
    const sendToBackend = async (htmlContent: string): Promise<boolean> => {
        try {
            // Auth token ni tekshirish
            const authToken = getAuthToken()
            if (!authToken) {
                showNotification(
                    'Authentication required. Please login.',
                    'error'
                )
                return false
            }

            // User ID ni olish
            const userId = getUserId()
            if (!userId) {
                showNotification(
                    'User information not found. Please login again.',
                    'error'
                )
                return false
            }

            // Language ID tekshirish
            if (!languageId) {
                showNotification('Please select a language first.', 'error')
                return false
            }

            // HTML dan plain text olish
            const tempDiv = document.createElement('div')
            tempDiv.innerHTML = htmlContent

            // Annotated textlarni to'g'ri formatda olish
            const annotatedElements =
                tempDiv.querySelectorAll('.annotated-text')
            annotatedElements.forEach((element) => {
                const currentText = element.textContent || ''
                const parts = currentText.split('/')
                const originalText = parts[0]
                const textWithSpaces = originalText.replace(/\+/g, ' ')
                element.textContent = textWithSpaces
            })

            const plainText = tempDiv.textContent || tempDiv.innerText || ''

            // Matn bo'sh bo'lsa
            if (plainText.trim().length === 0) {
                showNotification('Text cannot be empty.', 'error')
                return false
            }

            // Title ni tayyorlash (max 50 harf)
            let title = 'New Text'
            const cleanText = plainText.trim()
            if (cleanText.length > 0) {
                title = cleanText.substring(0, 50)
                if (cleanText.length > 50) {
                    title += '...'
                }
            }

            // Metadata ni tayyorlash
            const words = cleanText
                .split(/\s+/)
                .filter((word) => word.length > 0)
            const metadata = {
                created_at: new Date().toISOString(),
                character_count: cleanText.length,
                word_count: words.length,
                source: 'web_editor',
                annotated_elements_count: annotatedElements.length,
                language_id: languageId,
                analysis_type_id: analysisType,
                user_id: userId,
                version: '1.0',
            }

            // API ga yuboriladigan ma'lumotlar
            const requestData = {
                analysis_type: analysisType,
                user: userId,
                language: languageId,
                title: title,
                // file: null,
                text: cleanText,
                metadata: JSON.stringify(metadata),
            }

            console.log('Sending data to backend:', requestData)

            // API request
            const response = await fetch('/tagged_texts/', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    Accept: 'application/json',
                    Authorization: `Bearer ${authToken}`,
                },
                body: JSON.stringify(requestData),
            })

            // Response ni tekshirish
            if (response.ok) {
                const result = await response.json()
                console.log('Text saved successfully:', result)

                // Muvaffaqiyatli saqlanganidan keyin editorni tozalash
                if (editorRef.current) {
                    editorRef.current.innerHTML = ''
                    setHasContent(false)
                    updateTagStatistics()
                }

                return true
            } else {
                // Xato handling
                const errorText = await response.text()
                console.error('Backend error response:', errorText)
                console.error('Response status:', response.status)

                let errorMessage = 'Failed to save text to server'

                try {
                    const errorJson = JSON.parse(errorText)
                    errorMessage =
                        errorJson.detail ||
                        errorJson.message ||
                        errorJson.error ||
                        errorMessage

                    // Specific error cases
                    if (response.status === 400) {
                        errorMessage = 'Invalid data: ' + errorMessage
                    } else if (response.status === 401) {
                        errorMessage =
                            'Authentication failed. Please login again.'
                    } else if (response.status === 403) {
                        errorMessage =
                            'You do not have permission to perform this action.'
                    } else if (response.status === 404) {
                        errorMessage = 'Server endpoint not found.'
                    } else if (response.status >= 500) {
                        errorMessage = 'Server error. Please try again later.'
                    }
                } catch {
                    if (errorText) {
                        errorMessage = errorText
                    }
                }

                showNotification(errorMessage, 'error')
                return false
            }
        } catch (error) {
            // Network yoki boshqa xatolar
            console.error('Network error:', error)

            let errorMessage =
                'Network error. Please check your connection and try again.'

            if (error instanceof TypeError) {
                errorMessage =
                    'Network request failed. Please check your internet connection.'
            } else if (error instanceof SyntaxError) {
                errorMessage = 'Invalid server response.'
            }

            showNotification(errorMessage, 'error')
            return false
        }
    }

    // Helper funksiyalar
    const getUserId = (): number | null => {
        try {
            // LocalStorage dan user_data ni tekshirish
            const userData = localStorage.getItem('user_data')
            if (userData) {
                const user = JSON.parse(userData)
                if (user.id && !isNaN(user.id)) return parseInt(user.id)
                if (user.user_id && !isNaN(user.user_id))
                    return parseInt(user.user_id)
            }

            // Alohida user_id ni tekshirish
            const userId = localStorage.getItem('user_id')
            if (userId && !isNaN(parseInt(userId))) {
                return parseInt(userId)
            }

            // Token dan olish
            const token = getAuthToken()
            if (token) {
                try {
                    const payload = JSON.parse(atob(token.split('.')[1]))
                    if (payload.user_id && !isNaN(payload.user_id))
                        return parseInt(payload.user_id)
                    if (payload.sub && !isNaN(payload.sub))
                        return parseInt(payload.sub)
                    if (payload.id && !isNaN(payload.id))
                        return parseInt(payload.id)
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

    const getAuthToken = (): string => {
        try {
            // Turli xil localStorage key larini tekshirish
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
                    // "Bearer " prefix ni olib tashlash
                    if (finalToken.startsWith('Bearer ')) {
                        finalToken = finalToken.substring(7)
                    }
                    // Token bo'sh bo'lmasligini tekshirish
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

    // Tashqariga klik qilinganda menyuni yopish
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (
                showTagMenu &&
                tagMenuRef.current &&
                !tagMenuRef.current.contains(event.target as Node)
            ) {
                setShowTagMenu(false)
            }
            if (
                showEditMenu &&
                editMenuRef.current &&
                !editMenuRef.current.contains(event.target as Node)
            ) {
                setShowEditMenu(false)
            }
            if (
                showImportExport &&
                importExportRef.current &&
                !importExportRef.current.contains(event.target as Node)
            ) {
                setShowImportExport(false)
            }
        }

        document.addEventListener('mousedown', handleClickOutside)
        return () => {
            document.removeEventListener('mousedown', handleClickOutside)
        }
    }, [showTagMenu, showEditMenu, showImportExport])

    // Escape bosilganda menyuni yopish
    useEffect(() => {
        const handleEscape = (event: KeyboardEvent) => {
            if (event.key === 'Escape') {
                if (showTagMenu) setShowTagMenu(false)
                if (showEditMenu) setShowEditMenu(false)
                if (showImportExport) setShowImportExport(false)
            }
        }

        document.addEventListener('keydown', handleEscape)
        return () => {
            document.removeEventListener('keydown', handleEscape)
        }
    }, [showTagMenu, showEditMenu, showImportExport])

    // Shortcut lar
    useEffect(() => {
        const handleKeyDown = (event: KeyboardEvent) => {
            if (
                event.ctrlKey &&
                event.key === ' ' &&
                languageId &&
                filteredTags.length > 0
            ) {
                event.preventDefault()
                handleTextSelection()
            }

            if ((event.ctrlKey || event.metaKey) && event.key === 'z') {
                event.preventDefault()
            }
        }

        document.addEventListener('keydown', handleKeyDown)
        return () => {
            document.removeEventListener('keydown', handleKeyDown)
        }
    }, [handleTextSelection, languageId, filteredTags.length])

    // Paste handler
    const handlePaste = (e: React.ClipboardEvent<HTMLDivElement>) => {
        e.preventDefault()
        const text = e.clipboardData.getData('text/plain')
        document.execCommand('insertText', false, text)
        updateTagStatistics()
    }

    // Drop handler
    const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
        e.preventDefault()
        const files = e.dataTransfer.files
        if (files.length > 0) {
            const fileName = files[0].name
            document.execCommand('insertText', false, `[File: ${fileName}]`)
        } else {
            const text = e.dataTransfer.getData('text/plain')
            document.execCommand('insertText', false, text)
        }
        updateTagStatistics()
    }

    // Input o'zgarganda
    const handleInput = () => {
        checkContent()
        updateTagStatistics()
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

    const handleCloseNotification = () => {
        setNotification((prev) => ({ ...prev, open: false }))
    }

    // Annotated elementdagi teglarni olish
    const getCurrentTags = (): {
        abbreviation: string
        name: string
        color: string
        index: number
    }[] => {
        if (!selectedAnnotatedElement) return []

        const currentText = selectedAnnotatedElement.textContent || ''
        const parts = currentText.split('/')
        const tagAbbreviations = parts.slice(1)

        return tagAbbreviations.map((abbr, index) => {
            const tag = tags.find((t) => t.abbreviation === abbr)
            return {
                abbreviation: abbr,
                name: tag?.name_tag || 'Unknown Tag',
                color: tag?.color || '#e3f2fd',
                index: index,
            }
        })
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
                    onMouseUp={handleMouseUp}
                    onContextMenu={handleContextMenu}
                    onKeyDown={handleKeyDown}
                    onInput={handleInput}
                    onPaste={handlePaste}
                    onDrop={handleDrop}
                />

                {/* Teglar menyusi */}
                {showTagMenu && (
                    <div
                        ref={tagMenuRef}
                        className='tag-menu'
                        style={{
                            left: menuPosition.x,
                            top: menuPosition.y,
                        }}
                    >
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
                                <>
                                    <div
                                        style={{
                                            padding: '4px 8px',
                                            fontSize: '12px',
                                            color: '#666',
                                            borderBottom: '1px solid #eee',
                                            marginBottom: '8px',
                                        }}
                                    >
                                        Teglar: {filteredTags.length} ta
                                    </div>
                                    {filteredTags.map((tag: Tag, index) => (
                                        <button
                                            key={tag.id || index}
                                            onClick={() => handleTagSelect(tag)}
                                            style={{
                                                display: 'flex',
                                                alignItems: 'center',
                                                width: '100%',
                                                padding: '8px',
                                                margin: '2px 0',
                                                background:
                                                    tag.color || '#f5f5f5',
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
                                            />
                                            <div>
                                                <div
                                                    style={{
                                                        fontWeight: 'bold',
                                                    }}
                                                >
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
                                    ))}
                                </>
                            ) : (
                                <div
                                    style={{
                                        padding: '8px',
                                        textAlign: 'center',
                                        color: '#666',
                                        fontSize: '12px',
                                    }}
                                >
                                    {languageId
                                        ? 'Ushbu tilda teglar topilmadi'
                                        : 'Iltimos, avval til tanlang'}
                                </div>
                            )}
                        </div>

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

                {/* Edit menyusi */}
                {showEditMenu && selectedAnnotatedElement && (
                    <div
                        ref={editMenuRef}
                        className='tag-menu'
                        style={{
                            left: menuPosition.x,
                            top: menuPosition.y,
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
                            Teglarni boshqarish
                        </div>

                        {getCurrentTags().map((tag) => (
                            <button
                                key={tag.index}
                                onClick={() =>
                                    handleRemoveSpecificTag(tag.index)
                                }
                                style={{
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'space-between',
                                    width: '100%',
                                    padding: '8px',
                                    margin: '2px 0',
                                    background: tag.color,
                                    border: 'none',
                                    borderRadius: '4px',
                                    cursor: 'pointer',
                                    textAlign: 'left',
                                    fontSize: '12px',
                                }}
                            >
                                <div
                                    style={{
                                        display: 'flex',
                                        alignItems: 'center',
                                    }}
                                >
                                    <div
                                        style={{
                                            width: '12px',
                                            height: '12px',
                                            borderRadius: '2px',
                                            backgroundColor: tag.color,
                                            marginRight: '8px',
                                        }}
                                    />
                                    <div>
                                        <div style={{ fontWeight: 'bold' }}>
                                            {tag.name}
                                        </div>
                                        <div
                                            style={{
                                                fontSize: '10px',
                                                color: '#666',
                                            }}
                                        >
                                            {tag.abbreviation}
                                        </div>
                                    </div>
                                </div>
                                <DeleteIcon
                                    style={{
                                        fontSize: '16px',
                                        color: '#ff4444',
                                    }}
                                />
                            </button>
                        ))}

                        <button
                            onClick={handleRemoveTags}
                            style={{
                                display: 'flex',
                                alignItems: 'center',
                                width: '100%',
                                padding: '8px',
                                margin: '8px 0 2px 0',
                                background: '#ffebee',
                                border: 'none',
                                borderRadius: '4px',
                                cursor: 'pointer',
                                textAlign: 'left',
                                fontSize: '12px',
                            }}
                        >
                            <DeleteIcon
                                style={{
                                    fontSize: '16px',
                                    marginRight: '8px',
                                    color: '#ff4444',
                                }}
                            />
                            Barcha teglarni o'chirish
                        </button>

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

                {/* Import/Export menyusi */}
                {showImportExport && (
                    <div ref={importExportRef} className='import-export-menu'>
                        <button
                            onClick={handleImport}
                            className='import-button'
                        >
                            <UploadIcon style={{ fontSize: '18px' }} />
                            Import
                        </button>
                        <button
                            onClick={handleExport}
                            className='export-button'
                        >
                            <DownloadIcon style={{ fontSize: '18px' }} />
                            Export
                        </button>
                    </div>
                )}

                <div className='chat-input-actions'>
                    <div className='left-actions'>
                        <button
                            className='save-button'
                            onClick={handleSend}
                            disabled={!hasContent || isSaving}
                        >
                            <SaveIcon />
                            {isSaving ? 'Saving...' : 'Save'}
                        </button>

                        <button
                            className='import-export-button'
                            onClick={() =>
                                setShowImportExport(!showImportExport)
                            }
                        >
                            <ImportExportIcon />
                            Import/Export
                        </button>
                    </div>

                    <div className='right-actions'>
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
