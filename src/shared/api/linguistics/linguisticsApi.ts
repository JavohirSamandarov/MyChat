import ApiClient from '../base/apiClient'
import { API_BASE_URL } from '../base/endpoints'

export interface Language {
    id: number
    name: string
    abbreviation: string
    description: string
    created_at: string
    updated_at: string
}

export interface Tag {
    language: Language
    name_tag: string
    abbreviation: string
    description: string | null
    color: string
}

export interface LinguisticsData {
    id: number
    name: string
    description: string
    languages: Language[]
    tags: Tag[]
}

// API response strukturasi
export interface LinguisticsResponse {
    count: number
    next: string | null
    previous: string | null
    results: LinguisticsData[]
}

export interface SimpleTag {
    id: number
    name: string
    description?: string
}

export interface TaggedText {
    id: number
    title: string
    content: string
    tags: number[]
    created_at: string
    updated_at: string
}

class LinguisticsApi {
    private client: ApiClient

    constructor() {
        this.client = new ApiClient(API_BASE_URL)
    }

    // Linguistics - yangi struktur
    async getLinguistics(): Promise<LinguisticsData[]> {
        const response = await this.client.get<LinguisticsResponse>(
            '/linguistics/'
        )
        return response.results // Faqat results qismini qaytaramiz
    }

    async getLinguisticsById(id: number): Promise<LinguisticsData> {
        return this.client.get<LinguisticsData>(`/linguistics/${id}/`)
    }

    // Tags - eski struktur (agar kerak bo'lsa)
    async getTags(): Promise<SimpleTag[]> {
        return this.client.get<SimpleTag[]>('/tags/')
    }

    async getTagById(id: number): Promise<SimpleTag> {
        return this.client.get<SimpleTag>(`/tags/${id}/`)
    }

    // Tagged Texts
    async getTaggedTexts(): Promise<TaggedText[]> {
        return this.client.get<TaggedText[]>('/tagged_texts/')
    }

    async getTaggedTextById(id: number): Promise<TaggedText> {
        return this.client.get<TaggedText>(`/tagged_texts/${id}/`)
    }

    async createTaggedText(
        data: Omit<TaggedText, 'id' | 'created_at' | 'updated_at'>
    ): Promise<TaggedText> {
        return this.client.post<TaggedText>('/tagged_texts/', data)
    }
}

export const linguisticsApi = new LinguisticsApi()
