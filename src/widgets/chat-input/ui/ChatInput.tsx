import React, { useState, useRef, useEffect } from 'react'
import './ChatInput.css'
import SendIcon from '@mui/icons-material/Send'
import FullscreenIcon from '@mui/icons-material/Fullscreen'
import FullscreenExitIcon from '@mui/icons-material/FullscreenExit'

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
            if (textareaRef.current) {
                textareaRef.current.requestFullscreen().catch((err) => {
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
                        <SendIcon
                            fontSize='small'
                            sx={{ fontSize: '14px !important' }}
                        />
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
