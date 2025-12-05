import React, { useMemo, useState } from 'react'
import {
    DataGrid,
    GridColDef,
    GridRenderCellParams,
    GridToolbar,
} from '@mui/x-data-grid'
import {
    Box,
    Chip,
    FormControl,
    InputAdornment,
    MenuItem,
    Select,
    TextField,
} from '@mui/material'
import { SelectChangeEvent } from '@mui/material/Select'
import SearchIcon from '@mui/icons-material/Search'
import './TagsDataGrid.css'

export interface TagGridRow {
    id: number
    name: string
    abbreviation: string
    description: string
    color: string
    language: string
    analysisType: string
}

interface TagsDataGridProps {
    rows: TagGridRow[]
}

const columns: GridColDef<TagGridRow>[] = [
    {
        field: 'name',
        headerName: 'Tag Name',
        flex: 1,
        minWidth: 180,
    },
    {
        field: 'abbreviation',
        headerName: 'Abbreviation',
        width: 140,
        align: 'center',
        headerAlign: 'center',
    },
    {
        field: 'analysisType',
        headerName: 'Analysis Type',
        flex: 1,
        minWidth: 180,
    },
    {
        field: 'language',
        headerName: 'Language',
        flex: 0.8,
        minWidth: 150,
    },
    {
        field: 'description',
        headerName: 'Description',
        flex: 1.6,
        minWidth: 250,
    },
    {
        field: 'color',
        headerName: 'Color',
        width: 160,
        sortable: false,
        renderCell: (params: GridRenderCellParams<TagGridRow, string>) => (
            <div className='tag-color-cell'>
                <span
                    className='tag-color-dot'
                    style={{ backgroundColor: params.value }}
                />
                <span className='tag-color-code'>{params.value}</span>
            </div>
        ),
    },
]

export const TagsDataGrid: React.FC<TagsDataGridProps> = ({ rows }) => {
    const [analysisFilter, setAnalysisFilter] = useState<string>('all')
    const [searchValue, setSearchValue] = useState<string>('')

    const analysisOptions = useMemo(() => {
        const set = new Set<string>()
        rows.forEach((row) => set.add(row.analysisType))
        return Array.from(set).sort((a, b) =>
            a.localeCompare(b, undefined, { sensitivity: 'base' })
        )
    }, [rows])

    const filteredRows = useMemo(() => {
        const normalizedSearch = searchValue.trim().toLowerCase()

        return rows.filter((row) => {
            const matchesAnalysis =
                analysisFilter === 'all' ||
                row.analysisType === analysisFilter
            const matchesSearch =
                !normalizedSearch ||
                row.name.toLowerCase().includes(normalizedSearch) ||
                row.abbreviation.toLowerCase().includes(normalizedSearch)

            return matchesAnalysis && matchesSearch
        })
    }, [rows, analysisFilter, searchValue])

    const handleAnalysisChange = (event: SelectChangeEvent<string>) => {
        setAnalysisFilter(event.target.value as string)
    }

    const handleSearchChange = (
        event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
    ) => {
        setSearchValue(event.target.value)
    }

    return (
        <div className='tags-grid-wrapper'>
            <div className='tags-grid-header'>
                <div>
                    <h1>Tags List</h1>
                    <p>
                        Filter tags by analysis type or search by name and
                        abbreviation.
                    </p>
                </div>
                <div className='tags-grid-controls'>
                    <FormControl size='small' className='tags-grid-select'>
                        <Select
                            value={analysisFilter}
                            onChange={handleAnalysisChange}
                            displayEmpty
                            renderValue={(value) =>
                                value === 'all'
                                    ? 'All analysis types'
                                    : (value as string)
                            }
                            inputProps={{ 'aria-label': 'Analysis type filter' }}
                        >
                            <MenuItem value='all'>All analysis types</MenuItem>
                            {analysisOptions.map((option) => (
                                <MenuItem key={option} value={option}>
                                    {option}
                                </MenuItem>
                            ))}
                        </Select>
                    </FormControl>
                    <TextField
                        size='small'
                        className='tags-grid-filter'
                        placeholder='Search tag name or abbreviation'
                        value={searchValue}
                        onChange={handleSearchChange}
                        InputProps={{
                            startAdornment: (
                                <InputAdornment position='start'>
                                    <SearchIcon fontSize='small' />
                                </InputAdornment>
                            ),
                        }}
                    />
                </div>
            </div>

            <Box className='tags-grid-table'>
                <DataGrid
                    rows={filteredRows}
                    columns={columns}
                    disableRowSelectionOnClick
                    initialState={{
                        pagination: {
                            paginationModel: {
                                pageSize: 10,
                            },
                        },
                    }}
                    pageSizeOptions={[10, 20, 30, 50]}
                    slots={{
                        toolbar: GridToolbar,
                        noRowsOverlay: () => (
                            <div className='tags-grid-empty'>
                                <Chip
                                    label='No tags found'
                                    color='default'
                                    variant='outlined'
                                />
                            </div>
                        ),
                    }}
                    slotProps={{
                        toolbar: {
                            showQuickFilter: true,
                            quickFilterProps: { debounceMs: 300 },
                        },
                    }}
                />
            </Box>
        </div>
    )
}
