import React, { useState, useEffect } from 'react'
import { TabButton } from './TabButton'
import './TopBar.css'
import {
    linguisticsApi,
    LinguisticsData,
} from '@/shared/api/linguistics/linguisticsApi'

interface TopbarProps {
    activeTab?: number
    onTabChange?: (tabIndex: number) => void
}

export const Topbar: React.FC<TopbarProps> = ({
    activeTab = 0,
    onTabChange = () => {},
}) => {
    const [linguistics, setLinguistics] = useState<LinguisticsData[]>([])
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        const loadLinguistics = async () => {
            try {
                setLoading(true)
                const data = await linguisticsApi.getLinguistics()
                setLinguistics(data)
            } catch (error) {
                console.error('Failed to load linguistics:', error)
            } finally {
                setLoading(false)
            }
        }

        loadLinguistics()
    }, [])

    // FAQAT API dan kelgan linguistics nomlari
    const tabs = linguistics.map((ling) => ling.name)

    return (
        <div className='topbar'>
            <div className='topbar-content'>
                <div className='topbar-tabs'>
                    {loading ? (
                        <div className='loading'>Loading...</div>
                    ) : (
                        tabs.map((tab, index) => (
                            <TabButton
                                key={linguistics[index].id}
                                label={tab}
                                isActive={activeTab === index}
                                onClick={() => onTabChange(index)}
                            />
                        ))
                    )}
                </div>
            </div>
        </div>
    )
}
