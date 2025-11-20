export interface Message {
    id: string
    text: string
    timestamp: Date
    isUser: boolean
}

export interface ChatState {
    messages: Message[]
    isLoading: boolean
}
