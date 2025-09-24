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

vi.mock('../utils/exportUtils', () => ({
  exportToPDF: vi.fn(),
  exportToExcel: vi.fn(),
  exportToCSV: vi.fn(),
  generateQuoteNumber: vi.fn(() => 'QT-20240924-001')
}))

describe('QuoteBuilder - Favorites System', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    // Clear localStorage before each test
    window.localStorage.clear()
  })

  it('loads favorites from localStorage on mount', () => {
    // Set up localStorage with some favorites
    const mockFavorites = JSON.stringify([1, 2])
    window.localStorage.getItem = vi.fn().mockReturnValue(mockFavorites)

    render(<QuoteBuilder />)

    // Check that the favorites checkbox shows count
    expect(screen.getByText('Show favorites only (2)')).toBeInTheDocument()
  })

  it('toggles equipment as favorite', async () => {
    render(<QuoteBuilder />)

    // Find the star for Fire Indicator Panel (should be empty star ☆)
    const equipment = screen.getByText('Fire Indicator Panel').closest('div')
    const starButton = equipment?.querySelector('button[title*="favorite"]')

    expect(starButton).toBeInTheDocument()
    expect(starButton?.textContent).toBe('☆') // Empty star

    // Click to make it a favorite
    if (starButton) {
      fireEvent.click(starButton)
    }

    // Should now show filled star ★
    await waitFor(() => {
      expect(starButton?.textContent).toBe('★')
    })

    // localStorage should be updated
    expect(localStorage.setItem).toHaveBeenCalledWith(
      'fire-quotes-favorites',
      JSON.stringify([1])
    )
  })

  it('shows favorites only when checkbox is checked', async () => {
    render(<QuoteBuilder />)

    // First, add an item to favorites
    const equipment = screen.getByText('Fire Indicator Panel').closest('div')
    const starButton = equipment?.querySelector('button[title*="favorite"]')

    if (starButton) {
      fireEvent.click(starButton)
    }

    // Check the "Show favorites only" checkbox
    const favoritesCheckbox = screen.getByRole('checkbox')
    fireEvent.click(favoritesCheckbox)

    // Only favorited equipment should be visible
    await waitFor(() => {
      expect(screen.getByText('Fire Indicator Panel')).toBeInTheDocument()
      expect(screen.queryByText('Smoke Detectors')).not.toBeInTheDocument()
      expect(screen.queryByText('Manual Call Points')).not.toBeInTheDocument()
    })
  })

  it('sorts favorites to the top of the list', () => {
    // Pre-populate localStorage with favorites
    const mockFavorites = JSON.stringify([2]) // Smoke Detectors
    window.localStorage.getItem = vi.fn().mockReturnValue(mockFavorites)

    render(<QuoteBuilder />)

    // Get all equipment items in order
    const equipmentItems = screen.getAllByText(/Fire|Smoke|Manual/)

    // Smoke Detectors (favorite) should appear first
    expect(equipmentItems[0]).toHaveTextContent('Smoke Detectors')
  })

  it('persists favorites across component remounts', () => {
    // Set initial favorites
    const mockFavorites = JSON.stringify([1, 3])
    window.localStorage.getItem = vi.fn().mockReturnValue(mockFavorites)

    const { unmount } = render(<QuoteBuilder />)
    unmount()

    // Remount component
    render(<QuoteBuilder />)

    // Favorites count should be restored
    expect(screen.getByText('Show favorites only (2)')).toBeInTheDocument()
  })

  it('removes item from favorites when clicked again', async () => {
    // Start with item as favorite
    const mockFavorites = JSON.stringify([1])
    window.localStorage.getItem = vi.fn().mockReturnValue(mockFavorites)

    render(<QuoteBuilder />)

    const equipment = screen.getByText('Fire Indicator Panel').closest('div')
    const starButton = equipment?.querySelector('button[title*="favorite"]')

    expect(starButton?.textContent).toBe('★') // Should be filled

    // Click to remove from favorites
    if (starButton) {
      fireEvent.click(starButton)
    }

    // Should now show empty star
    await waitFor(() => {
      expect(starButton?.textContent).toBe('☆')
    })

    // localStorage should be updated
    expect(localStorage.setItem).toHaveBeenCalledWith(
      'fire-quotes-favorites',
      JSON.stringify([])
    )
  })

  it('updates favorites count in filter toggle', async () => {
    render(<QuoteBuilder />)

    // Initially no favorites
    expect(screen.getByText('Show favorites only (0)')).toBeInTheDocument()

    // Add a favorite
    const equipment = screen.getByText('Fire Indicator Panel').closest('div')
    const starButton = equipment?.querySelector('button[title*="favorite"]')

    if (starButton) {
      fireEvent.click(starButton)
    }

    // Count should update
    await waitFor(() => {
      expect(screen.getByText('Show favorites only (1)')).toBeInTheDocument()
    })
  })
})