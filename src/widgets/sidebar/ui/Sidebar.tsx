import React, { useState, useEffect } from 'react'
import { SidebarSection } from './SidebarSection'
import './Sidebar.css'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '@/features/auth/hooks/useAuth'
import {
    Avatar,
    Button,
    ListItemIcon,
    Menu,
    MenuItem,
    Tooltip,
} from '@mui/material'
import LogoutIcon from '@mui/icons-material/Logout'
import LocalOfferIcon from '@mui/icons-material/LocalOffer'
import AccountCircleIcon from '@mui/icons-material/AccountCircle'

interface SidebarProps {
    activeTextId?: number
    activeLinguisticId?: number
    onTextClick?: (textId: number, textTitle: string) => void
    onEditorClick?: () => void
    refreshKey?: number
    onTextDeleted?: (textId: number) => void
    collapsed?: boolean
}

// YANGI: TaggedText interfeysi
interface TaggedText {
    id: number
    analysis_type: number
    user: number
    language: number
    title: string
    file: string | null
    text: string
    metadata: Record<string, unknown> // any -> unknown
}

// YANGI: API response formati
interface TaggedTextsResponse {
    count: number
    next: string | null
    previous: string | null
    results: TaggedText[]
}

export const Sidebar: React.FC<SidebarProps> = ({
    activeTextId,
    activeLinguisticId,
    onTextClick = () => {},
    onEditorClick = () => {},
    refreshKey = 0,
    onTextDeleted = () => {},
    collapsed = false,
}) => {
    const [userTexts, setUserTexts] = useState<TaggedText[]>([])
    const [textsLoading, setTextsLoading] = useState(true)
    const [pendingDelete, setPendingDelete] = useState<{
        id: number
        title: string
    } | null>(null)
    const [editingTextId, setEditingTextId] = useState<number | null>(null)
    const [editingValue, setEditingValue] = useState<string>('')
    const [isRenaming, setIsRenaming] = useState<boolean>(false)
    const [accountMenuAnchor, setAccountMenuAnchor] =
        useState<null | HTMLElement>(null)
    const { logout, user } = useAuth()
    const navigate = useNavigate()

    // YANGI: To'g'ri API dan foydalanish
    useEffect(() => {
        const loadUserTexts = async () => {
            try {
                setTextsLoading(true)

                // API dan textlarni olish
                const authToken = getAuthToken()
                if (!authToken) {
                    setUserTexts([])
                    return
                }

                const response = await fetch(
                    `${import.meta.env.VITE_API_BASE_URL}/tagged_texts/`,
                    {
                        headers: {
                            Authorization: `Bearer ${authToken}`,
                            Accept: 'application/json',
                        },
                    }
                )

                if (response.ok) {
                    const data: TaggedTextsResponse = await response.json()
                    const sortedTexts = [...data.results].sort(
                        (a, b) => b.id - a.id
                    )
                    setUserTexts(sortedTexts)
                } else {
                    console.error('Failed to load user texts')
                    setUserTexts([])
                }
            } catch (error) {
                console.error('Failed to load user texts:', error)
                setUserTexts([])
            } finally {
                setTextsLoading(false)
            }
        }

        loadUserTexts()
    }, [refreshKey])

    // YANGI: Auth token olish funksiyasi
    const getAuthToken = (): string => {
        try {
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
                    if (finalToken.startsWith('Bearer ')) {
                        finalToken = finalToken.substring(7)
                    }
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

    const handleTextDelete = (textId: number) => {
        const targetText = userTexts.find((text) => text.id === textId)
        setPendingDelete({
            id: textId,
            title: targetText?.title || 'this text',
        })
    }

    const confirmDeleteText = async () => {
        if (!pendingDelete) return

        const authToken = getAuthToken()
        if (!authToken) {
            console.error('Authentication required for deleting text')
            setPendingDelete(null)
            return
        }

        try {
            const response = await fetch(
                `${import.meta.env.VITE_API_BASE_URL}/tagged_texts/${pendingDelete.id}/`,
                {
                    method: 'DELETE',
                    headers: {
                        Authorization: `Bearer ${authToken}`,
                        Accept: 'application/json',
                    },
                }
            )

            if (!response.ok && response.status !== 204) {
                throw new Error('Failed to delete text')
            }

            setUserTexts((prev) =>
                prev.filter((textItem) => textItem.id !== pendingDelete.id)
            )

            if (activeTextId === pendingDelete.id) {
                onTextDeleted(pendingDelete.id)
            }
            if (editingTextId === pendingDelete.id) {
                setEditingTextId(null)
                setEditingValue('')
            }
        } catch (error) {
            console.error('Failed to delete text:', error)
        } finally {
            setPendingDelete(null)
        }
    }

    const handleCancelDelete = () => {
        setPendingDelete(null)
    }

    const activeUserTextId = activeTextId ? activeTextId.toString() : ''

    const filteredUserTexts = userTexts.filter((text) => {
        const matchesLinguistic = activeLinguisticId
            ? text.analysis_type === activeLinguisticId
            : true
        return matchesLinguistic
    })

    const accountLabel =
        [user?.first_name, user?.last_name].filter(Boolean).join(' ') ||
        user?.email ||
        'Account'
    const accountInitials = [user?.first_name, user?.last_name]
        .filter(Boolean)
        .map((name) => (name ? name.charAt(0).toUpperCase() : ''))
        .join('')

    const handleStartEdit = (textId: number, currentTitle: string) => {
        setEditingTextId(textId)
        setEditingValue(currentTitle)
    }

    const handleEditChange = (value: string) => {
        setEditingValue(value)
    }

    const handleCancelEdit = () => {
        setEditingTextId(null)
        setEditingValue('')
    }

    const handleSubmitEdit = async () => {
        if (!editingTextId) return
        const trimmedTitle = editingValue.trim()
        if (!trimmedTitle || isRenaming) return

        const authToken = getAuthToken()
        if (!authToken) {
            return
        }

        const targetText = userTexts.find((text) => text.id === editingTextId)
        if (!targetText) return

        try {
            setIsRenaming(true)
            const response = await fetch(
                `${import.meta.env.VITE_API_BASE_URL}/tagged_texts/${editingTextId}/`,
                {
                    method: 'PUT',
                    headers: {
                        Authorization: `Bearer ${authToken}`,
                        Accept: 'application/json',
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({
                        title: trimmedTitle,
                        text: targetText.text || '',
                        file: targetText.file,
                        language: targetText.language,
                        analysis_type: targetText.analysis_type,
                    }),
                }
            )

            if (!response.ok) {
                throw new Error('Failed to rename text')
            }

            setUserTexts((prev) =>
                prev.map((textItem) =>
                    textItem.id === editingTextId
                        ? { ...textItem, title: trimmedTitle }
                        : textItem
                )
            )
            handleCancelEdit()
        } catch (error) {
            console.error('Failed to rename text:', error)
        } finally {
            setIsRenaming(false)
        }
    }

    const handleAccountMenuOpen = (event: React.MouseEvent<HTMLElement>) => {
        setAccountMenuAnchor(event.currentTarget)
    }

    const handleAccountMenuClose = () => {
        setAccountMenuAnchor(null)
    }

    const handleAccountAction = (action: 'logout' | 'tags') => {
        if (action === 'logout') {
            logout()
            navigate('/login')
            window.location.reload()
        } else if (action === 'tags') {
            navigate('/tags')
        }
        handleAccountMenuClose()
    }

    return (
        <div className={`sidebar ${collapsed ? 'collapsed' : ''}`}>
            <div className='sidebar-header'>
                <h2 className='sidebar-title'>Annotation Tool</h2>
                <button className='new-chat-button' onClick={onEditorClick}>
                    + New Text
                </button>
            </div>

            <div className='sidebar-content'>
                {/* User Texts bo'limi */}
                <SidebarSection
                    title='Your Texts'
                    items={filteredUserTexts.map((text) => ({
                        id: text.id.toString(),
                        text: text.title,
                        textId: text.id,
                    }))}
                    activeItem={activeUserTextId}
                    activeMatchBy='id'
                    onTextClick={onTextClick}
                    showDelete={true}
                    isLoading={textsLoading}
                    onTextDelete={handleTextDelete}
                    onTextEditStart={handleStartEdit}
                    onTextEditChange={handleEditChange}
                    onTextEditSubmit={handleSubmitEdit}
                    onTextEditCancel={handleCancelEdit}
                    editingTextId={editingTextId}
                    editingTextValue={editingValue}
                />
            </div>

            <div className='sidebar-footer'>
                <Tooltip title='Account options' placement='top'>
                    <Button
                        id='account-menu-button'
                        className='account-menu-button'
                        onClick={handleAccountMenuOpen}
                        startIcon={
                            <Avatar className='account-menu-avatar'>
                                {accountInitials ? (
                                    accountInitials
                                ) : (
                                    <AccountCircleIcon fontSize='small' />
                                )}
                            </Avatar>
                        }
                    >
                        {accountLabel}
                    </Button>
                </Tooltip>
                <Menu
                    anchorEl={accountMenuAnchor}
                    id='account-menu'
                    open={Boolean(accountMenuAnchor)}
                    onClose={handleAccountMenuClose}
                    onClick={handleAccountMenuClose}
                    transformOrigin={{ horizontal: 'right', vertical: 'top' }}
                    anchorOrigin={{ horizontal: 'right', vertical: 'bottom' }}
                    PaperProps={{
                        className: 'sidebar-account-menu',
                        elevation: 0,
                    }}
                    MenuListProps={{
                        'aria-labelledby': 'account-menu-button',
                        className: 'sidebar-account-menu-list',
                    }}
                >
                    <MenuItem
                        className='sidebar-account-menu-item'
                        onClick={() => handleAccountAction('tags')}
                    >
                        <ListItemIcon className='sidebar-account-menu-icon'>
                            <LocalOfferIcon fontSize='small' />
                        </ListItemIcon>
                        Tags
                    </MenuItem>
                    <MenuItem
                        className='sidebar-account-menu-item logout'
                        onClick={() => handleAccountAction('logout')}
                    >
                        <ListItemIcon className='sidebar-account-menu-icon'>
                            <LogoutIcon fontSize='small' />
                        </ListItemIcon>
                        Logout
                    </MenuItem>
                </Menu>
            </div>

            {pendingDelete && (
                <div className='sidebar-modal-overlay'>
                    <div className='sidebar-modal'>
                        <h3>Delete annotated text?</h3>
                        <p>
                            Are you sure you want to remove "
                            <strong>{pendingDelete.title}</strong>" from your
                            texts?
                        </p>
                        <div className='sidebar-modal-actions'>
                            <button
                                className='modal-button cancel'
                                onClick={handleCancelDelete}
                            >
                                Cancel
                            </button>
                            <button
                                className='modal-button delete'
                                onClick={confirmDeleteText}
                            >
                                Delete
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    )
}
