import { useState, useCallback } from 'react'
import { linguisticsApi, Tag } from '@/shared/api/linguistics/linguisticsApi'

export const useEditor = () => {
    const [selectedText, setSelectedText] = useState<string>('')
    const [selectionRange, setSelectionRange] = useState<{
        start: number
        end: number
    } | null>(null)
    const [tags, setTags] = useState<Tag[]>([])
    const [loading, setLoading] = useState(false)

    // Teglarni yuklash
    const loadTags = useCallback(async () => {
        try {
            setLoading(true)
            const linguisticsData = await linguisticsApi.getLinguistics()
            const allTags = linguisticsData.flatMap((item) => item.tags)
            setTags(allTags)
        } catch (error) {
            console.error('Failed to load tags:', error)
        } finally {
            setLoading(false)
        }
    }, [])

    // Matn tanlanganida chaqiriladi
    const handleTextSelect = useCallback(
        (text: string, start: number, end: number) => {
            setSelectedText(text)
            setSelectionRange({ start, end })
        },
        []
    )

    // Teg qo'shish (mock function - API ulanmagan)
    const addAnnotation = useCallback(
        async (taggedTextId: number, tagId: number): Promise<boolean> => {
            console.log('Adding annotation:', {
                taggedTextId,
                tagId,
                selectedText,
            })
            // Hozircha API ga so'rov yubormaymiz, faqat formatlash qilamiz
            return true
        },
        [selectedText]
    )

    return {
        selectedText,
        selectionRange,
        tags,
        loading,
        handleTextSelect,
        addAnnotation,
        loadTags,
        clearSelection: () => {
            setSelectedText('')
            setSelectionRange(null)
        },
    }
}
