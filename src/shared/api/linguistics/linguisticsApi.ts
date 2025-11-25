import ApiClient from '../base/apiClient'
import { API_BASE_URL } from '../base/endpoints'

export interface Tag {
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

export interface LinguisticsData {
    id: number
    name: string
    description: string
}

class LinguisticsApi {
    private client: ApiClient

    constructor() {
        this.client = new ApiClient(API_BASE_URL)
    }

    // Linguistics
    async getLinguistics(): Promise<LinguisticsData[]> {
        return this.client.get<LinguisticsData[]>('/api/linguistics/')
    }

    async getLinguisticsById(id: number): Promise<LinguisticsData> {
        return this.client.get<LinguisticsData>(`/api/linguistics/${id}/`)
    }

    // Tags
    async getTags(): Promise<Tag[]> {
        return this.client.get<Tag[]>('/api/tags/')
    }

    async getTagById(id: number): Promise<Tag> {
        return this.client.get<Tag>(`/api/tags/${id}/`)
    }

    // Tagged Texts
    async getTaggedTexts(): Promise<TaggedText[]> {
        return this.client.get<TaggedText[]>('/api/tagged_texts/')
    }

    async getTaggedTextById(id: number): Promise<TaggedText> {
        return this.client.get<TaggedText>(`/api/tagged_texts/${id}/`)
    }

    async createTaggedText(
        data: Omit<TaggedText, 'id' | 'created_at' | 'updated_at'>
    ): Promise<TaggedText> {
        return this.client.post<TaggedText>('/api/tagged_texts/', data)
    }
}

export const linguisticsApi = new LinguisticsApi()
