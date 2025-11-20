import React from 'react'
import { TabButton } from './TabButton'
import './Topbar.css'

interface TopbarProps {
    activeTab?: number
    onTabChange?: (tabIndex: number) => void
}

export const Topbar: React.FC<TopbarProps> = ({
    activeTab = 0,
    onTabChange = () => {},
}) => {
    const tabs = ['Tab 1', 'Tab 2', 'Tab 3', 'Tab 4']

    return (
        <div className='topbar'>
            <div className='topbar-content'>
                <div className='topbar-tabs'>
                    {tabs.map((tab, index) => (
                        <TabButton
                            key={index}
                            label={tab}
                            isActive={activeTab === index}
                            onClick={() => onTabChange(index)}
                        />
                    ))}
                </div>
            </div>
        </div>
    )
}
