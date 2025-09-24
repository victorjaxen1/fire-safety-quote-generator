import { describe, it, expect, beforeEach, vi } from 'vitest'
import { render, screen, fireEvent, waitFor } from '../test/utils'
import { mockEquipment, mockCategories, mockFormulas } from '../test/utils'
import QuoteBuilder from './QuoteBuilder'

// Mock the data imports
vi.mock('../data/equipment.json', () => ({
  default: mockEquipment
}))

vi.mock('../data/categories.json', () => ({
  default: mockCategories
}))

vi.mock('../data/formulas.json', () => ({
  default: mockFormulas
}))

// Mock export utils to avoid PDF/Excel generation in tests
vi.mock('../utils/exportUtils', () => ({
  exportToPDF: vi.fn(),
  exportToExcel: vi.fn(),
  exportToCSV: vi.fn(),
  generateQuoteNumber: vi.fn(() => 'QT-20240924-001')
}))

describe('QuoteBuilder - Category Filtering', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('renders category filter dropdown with all categories', () => {
    render(<QuoteBuilder />)

    const categorySelect = screen.getByDisplayValue(/All Categories/)
    expect(categorySelect).toBeInTheDocument()

    // Check that categories are in the dropdown
    fireEvent.click(categorySelect)
    expect(screen.getByText('Control Panels (1 items)')).toBeInTheDocument()
    expect(screen.getByText('Detection Devices (1 items)')).toBeInTheDocument()
    expect(screen.getByText('Manual Devices (1 items)')).toBeInTheDocument()
  })

  it('filters equipment by selected category', () => {
    render(<QuoteBuilder />)

    // Initially all equipment should be visible
    expect(screen.getByText('Fire Indicator Panel')).toBeInTheDocument()
    expect(screen.getByText('Smoke Detectors')).toBeInTheDocument()
    expect(screen.getByText('Manual Call Points')).toBeInTheDocument()

    // Select Control Panels category
    const categorySelect = screen.getByDisplayValue(/All Categories/)
    fireEvent.change(categorySelect, { target: { value: 'Control Panels' } })

    // Only Control Panels equipment should be visible
    expect(screen.getByText('Fire Indicator Panel')).toBeInTheDocument()
    expect(screen.queryByText('Smoke Detectors')).not.toBeInTheDocument()
    expect(screen.queryByText('Manual Call Points')).not.toBeInTheDocument()
  })

  it('combines category filtering with text search', () => {
    render(<QuoteBuilder />)

    // Search for "detector"
    const searchInput = screen.getByPlaceholderText('Search equipment...')
    fireEvent.change(searchInput, { target: { value: 'detector' } })

    // Only Smoke Detectors should be visible
    expect(screen.queryByText('Fire Indicator Panel')).not.toBeInTheDocument()
    expect(screen.getByText('Smoke Detectors')).toBeInTheDocument()
    expect(screen.queryByText('Manual Call Points')).not.toBeInTheDocument()

    // Now filter by Control Panels category
    const categorySelect = screen.getByDisplayValue(/All Categories/)
    fireEvent.change(categorySelect, { target: { value: 'Control Panels' } })

    // Should show no results (no control panels match "detector")
    expect(screen.getByText('No equipment found matching your criteria.')).toBeInTheDocument()
  })

  it('shows clear filters button when no results found', () => {
    render(<QuoteBuilder />)

    // Search for something that doesn't exist
    const searchInput = screen.getByPlaceholderText('Search equipment...')
    fireEvent.change(searchInput, { target: { value: 'nonexistent' } })

    expect(screen.getByText('No equipment found matching your criteria.')).toBeInTheDocument()
    expect(screen.getByText('Clear filters')).toBeInTheDocument()

    // Click clear filters
    fireEvent.click(screen.getByText('Clear filters'))

    // All equipment should be visible again
    expect(screen.getByText('Fire Indicator Panel')).toBeInTheDocument()
    expect(screen.getByText('Smoke Detectors')).toBeInTheDocument()
    expect(screen.getByText('Manual Call Points')).toBeInTheDocument()
  })
})