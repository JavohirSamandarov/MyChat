import React from 'react'
import { ChatInput } from '../../'
import './EditorModal.css'

interface EditorModalProps {
    isOpen: boolean
    onClose: () => void
}

export const EditorModal: React.FC<EditorModalProps> = ({
    isOpen,
    onClose,
}) => {
    if (!isOpen) return null

    return (
        <div className='editor-modal-overlay' onClick={onClose}>
            <div
                className='editor-modal-content'
                onClick={(e) => e.stopPropagation()}
            >
                <div className='editor-modal-header'>
                    <h3>Editor</h3>
                    <button className='close-button' onClick={onClose}>
                        ×
                    </button>
                </div>
                <div className='editor-modal-body'>
                    <ChatInput
                        onSendMessage={(message) => {
                            console.log('Editor message:', message)
                            // Editor uchun maxsus logika
                        }}
                    />
                </div>
            </div>
        </div>
    )
}
