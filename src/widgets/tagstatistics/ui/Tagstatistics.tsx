import React from 'react'
import './Tagstatistics.css'

interface TagStat {
    count: number
    color: string
}

interface TagStatisticsProps {
    stats: Record<string, TagStat>
}

export const TagStatistics: React.FC<TagStatisticsProps> = ({ stats }) => {
    const sortedStats = Object.entries(stats).sort(
        (a, b) => b[1].count - a[1].count
    )

    const totalTags = Object.values(stats).reduce(
        (sum, stat) => sum + stat.count,
        0
    )

    return (
        <div className='tag-statistics'>
            <div className='tag-statistics-header'>
                <h3>Teg Statistikasi</h3>
                <div className='total-tags'>Jami: {totalTags} ta</div>
            </div>

            <div className='tag-statistics-list'>
                {sortedStats.map(([abbreviation, stat]) => (
                    <div
                        key={abbreviation}
                        className='tag-stat-item'
                        style={{
                            borderLeft: `4px solid ${stat.color}`,
                        }}
                    >
                        <div className='tag-info'>
                            <div className='tag-abbreviation'>
                                {abbreviation}
                            </div>
                            <div
                                className='tag-color-indicator'
                                style={{ backgroundColor: stat.color }}
                            />
                        </div>
                        <div className='tag-count'>{stat.count}</div>
                    </div>
                ))}

                {sortedStats.length === 0 && (
                    <div className='no-tags-message'>
                        Hozircha teglar mavjud emas
                    </div>
                )}
            </div>
        </div>
    )
}
