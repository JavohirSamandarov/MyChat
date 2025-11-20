import React, { useState, useRef, useEffect } from 'react'
import './ChatInput.css'

interface ChatInputProps {
    onSendMessage?: (message: string) => void
}

export const ChatInput: React.FC<ChatInputProps> = ({
    onSendMessage = () => {},
}) => {
    const [inputValue, setInputValue] = useState<string>('')
    const [isFullscreen, setIsFullscreen] = useState<boolean>(false)
    const textareaRef = useRef<HTMLTextAreaElement>(null)

    const handleSend = (): void => {
        if (inputValue.trim()) {
            onSendMessage(inputValue.trim())
            setInputValue('')
        }
    }

    const handleKeyPress = (
        e: React.KeyboardEvent<HTMLTextAreaElement>
    ): void => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault()
            handleSend()
        }
    }

    const toggleFullscreen = (): void => {
        if (!isFullscreen) {
            // Enter fullscreen
            if (textareaRef.current) {
                textareaRef.current.requestFullscreen().catch((err) => {
                    console.error('Error attempting to enable fullscreen:', err)
                })
            }
        } else {
            // Exit fullscreen
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
                <textarea
                    ref={textareaRef}
                    className='chat-input'
                    placeholder="What's in your mind?..."
                    value={inputValue}
                    onChange={(e) => setInputValue(e.target.value)}
                    onKeyPress={handleKeyPress}
                    rows={4}
                />
                <div className='chat-input-actions'>
                    <button
                        className='send-button'
                        onClick={handleSend}
                        disabled={!inputValue.trim()}
                    >
                        <svg
                            width='20'
                            height='20'
                            viewBox='0 0 24 24'
                            fill='none'
                            xmlns='http://www.w3.org/2000/svg'
                        >
                            <path
                                d='M22 2L11 13'
                                stroke='currentColor'
                                strokeWidth='2'
                                strokeLinecap='round'
                                strokeLinejoin='round'
                            />
                            <path
                                d='M22 2L15 22L11 13L2 9L22 2Z'
                                stroke='currentColor'
                                strokeWidth='2'
                                strokeLinecap='round'
                                strokeLinejoin='round'
                            />
                        </svg>
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
                            <svg
                                width='20'
                                height='20'
                                viewBox='0 0 24 24'
                                fill='none'
                                xmlns='http://www.w3.org/2000/svg'
                            >
                                <path
                                    d='M8 3V5C8 5.55 7.55 6 7 6H5C4.45 6 4 5.55 4 5V3C4 2.45 4.45 2 5 2H7C7.55 2 8 2.45 8 3Z'
                                    fill='currentColor'
                                />
                                <path
                                    d='M20 3V5C20 5.55 19.55 6 19 6H17C16.45 6 16 5.55 16 5V3C16 2.45 16.45 2 17 2H19C19.55 2 20 2.45 20 3Z'
                                    fill='currentColor'
                                />
                                <path
                                    d='M20 19V17C20 16.45 19.55 16 19 16H17C16.45 16 16 16.45 16 17V19C16 19.55 16.45 20 17 20H19C19.55 20 20 19.55 20 19Z'
                                    fill='currentColor'
                                />
                                <path
                                    d='M8 19V17C8 16.45 7.55 16 7 16H5C4.45 16 4 16.45 4 17V19C4 19.55 4.45 20 5 20H7C7.55 20 8 19.55 8 19Z'
                                    fill='currentColor'
                                />
                            </svg>
                        ) : (
                            <svg
                                width='20'
                                height='20'
                                viewBox='0 0 24 24'
                                fill='none'
                                xmlns='http://www.w3.org/2000/svg'
                            >
                                <path
                                    d='M8 3H5C4.45 3 4 3.45 4 4V7C4 7.55 4.45 8 5 8H7C7.55 8 8 7.55 8 7V5C8 4.45 7.55 4 7 4C7.55 4 8 3.55 8 3Z'
                                    fill='currentColor'
                                />
                                <path
                                    d='M20 3H17C16.45 3 16 3.45 16 4V7C16 7.55 16.45 8 17 8H19C19.55 8 20 7.55 20 7V5C20 4.45 19.55 4 19 4C19.55 4 20 3.55 20 3Z'
                                    fill='currentColor'
                                />
                                <path
                                    d='M20 16H17C16.45 16 16 16.45 16 17V19C16 19.55 16.45 20 17 20H19C19.55 20 20 19.55 20 19V17C20 16.45 19.55 16 19 16C19.55 16 20 16.45 20 16Z'
                                    fill='currentColor'
                                />
                                <path
                                    d='M8 16H5C4.45 16 4 16.45 4 17V19C4 19.55 4.45 20 5 20H7C7.55 20 8 19.55 8 19V17C8 16.45 7.55 16 7 16C7.55 16 8 16.45 8 16Z'
                                    fill='currentColor'
                                />
                            </svg>
                        )}
                    </button>
                </div>
            </div>
        </div>
    )
}
