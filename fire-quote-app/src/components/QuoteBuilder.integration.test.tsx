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

describe('QuoteBuilder - Integration Tests', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    window.localStorage.clear()
  })

  it('creates a complete quote workflow', async () => {
    render(<QuoteBuilder />)

    // 1. Fill client information
    fireEvent.change(screen.getByPlaceholderText('Company Name'), {
      target: { value: 'Integration Test Co' }
    })
    fireEvent.change(screen.getByPlaceholderText('Contact Person'), {
      target: { value: 'Jane Doe' }
    })
    fireEvent.change(screen.getByPlaceholderText('Email'), {
      target: { value: 'jane@test.com' }
    })

    // 2. Filter by category
    const categorySelect = screen.getByDisplayValue(/All Categories/)
    fireEvent.change(categorySelect, { target: { value: 'Control Panels' } })

    // Only control panel equipment should be visible
    expect(screen.getByText('Fire Indicator Panel')).toBeInTheDocument()
    expect(screen.queryByText('Smoke Detectors')).not.toBeInTheDocument()

    // 3. Add equipment to quote
    fireEvent.click(screen.getByText('Fire Indicator Panel'))

    // Should appear in quote summary
    expect(screen.getByText('Quote Summary')).toBeInTheDocument()
    expect(screen.getAllByText('Fire Indicator Panel')[1]).toBeInTheDocument() // One in equipment list, one in summary

    // 4. Update quantity
    const quantityInput = screen.getByDisplayValue('1')
    fireEvent.change(quantityInput, { target: { value: '2' } })

    // Total should update
    const expectedPrice = 2500 * 1.5 * 2 // basePrice * markup * quantity
    expect(screen.getByText(`$${expectedPrice.toFixed(2)}`)).toBeInTheDocument()

    // 5. Add item to favorites
    const starButton = screen.getAllByText('☆')[0] // First empty star
    fireEvent.click(starButton)

    expect(screen.getByText('★')).toBeInTheDocument()
    expect(screen.getByText('Show favorites only (1)')).toBeInTheDocument()

    // 6. Export quote
    const exportButton = screen.getByText('Export PDF')
    fireEvent.click(exportButton)

    // Should have called export function
    const { exportToPDF } = await import('../utils/exportUtils')
    expect(exportToPDF).toHaveBeenCalledWith(
      'QT-20240924-001',
      expect.objectContaining({
        name: 'Integration Test Co',
        contactPerson: 'Jane Doe',
        email: 'jane@test.com'
      }),
      expect.arrayContaining([
        expect.objectContaining({
          equipment: expect.objectContaining({
            name: 'Fire Indicator Panel'
          }),
          quantity: 2
        })
      ]),
      expect.any(Number), // subtotal
      expect.any(Number), // gst
      expect.any(Number)  // total
    )

    // 7. Client should be saved
    expect(localStorage.setItem).toHaveBeenCalledWith(
      'fire-quotes-clients',
      expect.stringContaining('Integration Test Co')
    )
  })

  it('handles favorites filtering with categories', () => {
    render(<QuoteBuilder />)

    // Add Fire Indicator Panel to favorites
    const firePanel = screen.getByText('Fire Indicator Panel')
    const panelContainer = firePanel.closest('div')
    const starButton = panelContainer?.querySelector('button')
    if (starButton) fireEvent.click(starButton)

    // Filter by favorites only
    const favoritesCheckbox = screen.getByRole('checkbox')
    fireEvent.click(favoritesCheckbox)

    // Only favorited item should be visible
    expect(screen.getByText('Fire Indicator Panel')).toBeInTheDocument()
    expect(screen.queryByText('Smoke Detectors')).not.toBeInTheDocument()

    // Now also filter by category that doesn't include the favorite
    const categorySelect = screen.getByDisplayValue(/All Categories/)
    fireEvent.change(categorySelect, { target: { value: 'Detection Devices' } })

    // Should show no results
    expect(screen.getByText('No equipment found matching your criteria.')).toBeInTheDocument()

    // Clear filters should restore everything
    fireEvent.click(screen.getByText('Clear filters'))

    // Should show all items again
    expect(screen.getByText('Fire Indicator Panel')).toBeInTheDocument()
    expect(screen.getByText('Smoke Detectors')).toBeInTheDocument()
    expect(screen.getByText('Manual Call Points')).toBeInTheDocument()
  })

  it('calculates quote totals correctly', () => {
    render(<QuoteBuilder />)

    // Add multiple items
    fireEvent.click(screen.getByText('Fire Indicator Panel')) // $2500 base * 1.5 = $3750
    fireEvent.click(screen.getByText('Smoke Detectors'))      // $120 base * 1.5 = $180

    // Check subtotal
    const subtotal = 3750 + 180 // $3930
    const gst = subtotal * 0.1  // $393
    const total = subtotal + gst // $4323

    expect(screen.getByText(`$${subtotal.toFixed(2)}`)).toBeInTheDocument()
    expect(screen.getByText(`$${gst.toFixed(2)}`)).toBeInTheDocument()
    expect(screen.getByText(`$${total.toFixed(2)}`)).toBeInTheDocument()
  })

  it('removes items from quote', () => {
    render(<QuoteBuilder />)

    // Add item
    fireEvent.click(screen.getByText('Fire Indicator Panel'))

    // Should be in quote summary
    expect(screen.getAllByText('Fire Indicator Panel')).toHaveLength(2)

    // Remove item using × button
    const removeButton = screen.getByText('×')
    fireEvent.click(removeButton)

    // Should be removed from summary but still in equipment list
    expect(screen.getAllByText('Fire Indicator Panel')).toHaveLength(1)
    expect(screen.queryByText('Subtotal:')).not.toBeInTheDocument()
  })
})