import { describe, it, expect, beforeEach, vi, afterEach } from 'vitest'
import { render, screen, fireEvent, waitFor, act } from '../test/utils'
import { mockEquipment, mockCategories, mockFormulas, mockClientInfo } from '../test/utils'
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

describe('QuoteBuilder - Auto-save Draft', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    vi.useFakeTimers()
    window.localStorage.clear()
  })

  afterEach(() => {
    vi.useRealTimers()
  })

  it('does not show draft restore banner when no draft exists', () => {
    render(<QuoteBuilder />)

    expect(screen.queryByText('Draft Available')).not.toBeInTheDocument()
  })

  it('shows draft restore banner when valid draft exists', () => {
    // Create a valid draft (less than 24 hours old)
    const draftDate = new Date(Date.now() - 1000 * 60 * 60) // 1 hour ago
    const mockDraft = {
      id: 'current-draft',
      clientInfo: { ...mockClientInfo },
      selectedItems: [],
      lastSaved: draftDate.toISOString(),
      autoSaved: true
    }

    window.localStorage.getItem = vi.fn().mockReturnValue(JSON.stringify(mockDraft))

    render(<QuoteBuilder />)

    expect(screen.getByText('Draft Available')).toBeInTheDocument()
    expect(screen.getByText('You have an unsaved quote draft. Would you like to restore it?')).toBeInTheDocument()
    expect(screen.getByText('Restore')).toBeInTheDocument()
    expect(screen.getByText('Discard')).toBeInTheDocument()
  })

  it('does not show draft restore banner for old drafts', () => {
    // Create an old draft (more than 24 hours old)
    const oldDraftDate = new Date(Date.now() - 1000 * 60 * 60 * 25) // 25 hours ago
    const mockDraft = {
      id: 'current-draft',
      clientInfo: { ...mockClientInfo },
      selectedItems: [],
      lastSaved: oldDraftDate.toISOString(),
      autoSaved: true
    }

    window.localStorage.getItem = vi.fn().mockReturnValue(JSON.stringify(mockDraft))

    render(<QuoteBuilder />)

    expect(screen.queryByText('Draft Available')).not.toBeInTheDocument()
  })

  it('restores draft when restore button is clicked', () => {
    const mockDraft = {
      id: 'current-draft',
      clientInfo: { ...mockClientInfo },
      selectedItems: [],
      lastSaved: new Date().toISOString(),
      autoSaved: true
    }

    window.localStorage.getItem = vi.fn().mockReturnValue(JSON.stringify(mockDraft))

    render(<QuoteBuilder />)

    const restoreButton = screen.getByText('Restore')
    fireEvent.click(restoreButton)

    // Client info should be restored
    expect(screen.getByDisplayValue('Test Company')).toBeInTheDocument()
    expect(screen.getByDisplayValue('john@test.com')).toBeInTheDocument()

    // Banner should disappear
    expect(screen.queryByText('Draft Available')).not.toBeInTheDocument()
  })

  it('discards draft when discard button is clicked', () => {
    const mockDraft = {
      id: 'current-draft',
      clientInfo: { ...mockClientInfo },
      selectedItems: [],
      lastSaved: new Date().toISOString(),
      autoSaved: true
    }

    window.localStorage.getItem = vi.fn().mockReturnValue(JSON.stringify(mockDraft))

    render(<QuoteBuilder />)

    const discardButton = screen.getByText('Discard')
    fireEvent.click(discardButton)

    // Banner should disappear
    expect(screen.queryByText('Draft Available')).not.toBeInTheDocument()

    // localStorage should be cleared
    expect(localStorage.removeItem).toHaveBeenCalledWith('fire-quotes-draft')
  })

  it('auto-saves draft after changes with debounce', async () => {
    render(<QuoteBuilder />)

    // Make a change to client info
    const companyInput = screen.getByPlaceholderText('Company Name')
    fireEvent.change(companyInput, { target: { value: 'New Company' } })

    // Fast-forward time to trigger auto-save
    act(() => {
      vi.advanceTimersByTime(2000)
    })

    await waitFor(() => {
      expect(localStorage.setItem).toHaveBeenCalledWith(
        'fire-quotes-draft',
        expect.stringContaining('New Company')
      )
    })
  })

  it('shows save status indicators', async () => {
    render(<QuoteBuilder />)

    // Make a change
    const companyInput = screen.getByPlaceholderText('Company Name')
    fireEvent.change(companyInput, { target: { value: 'Test' } })

    // Fast-forward to trigger saving
    act(() => {
      vi.advanceTimersByTime(2000)
    })

    // Should show "Saving..." then "Draft saved"
    await waitFor(() => {
      expect(screen.getByText('Draft saved')).toBeInTheDocument()
    })
  })

  it('clears draft when New Quote button is clicked', () => {
    // Start with some data
    render(<QuoteBuilder />)

    const companyInput = screen.getByPlaceholderText('Company Name')
    fireEvent.change(companyInput, { target: { value: 'Test Company' } })

    // Click New Quote
    const newQuoteButton = screen.getByText('New Quote')
    fireEvent.click(newQuoteButton)

    // Form should be cleared
    expect(screen.getByPlaceholderText('Company Name')).toHaveValue('')

    // localStorage should be cleared
    expect(localStorage.removeItem).toHaveBeenCalledWith('fire-quotes-draft')
  })

  it('clears draft after successful export', () => {
    render(<QuoteBuilder />)

    // Add some items to the quote first
    const equipment = screen.getByText('Fire Indicator Panel')
    fireEvent.click(equipment)

    // Fill in required client info
    fireEvent.change(screen.getByPlaceholderText('Company Name'), {
      target: { value: 'Test Company' }
    })

    // Export should be available now
    const exportButton = screen.getByText('Export PDF')
    fireEvent.click(exportButton)

    // Draft should be cleared after export
    expect(localStorage.removeItem).toHaveBeenCalledWith('fire-quotes-draft')
  })

  it('does not auto-save empty forms', async () => {
    render(<QuoteBuilder />)

    // Fast-forward time
    act(() => {
      vi.advanceTimersByTime(2000)
    })

    // Should not have saved anything
    expect(localStorage.setItem).not.toHaveBeenCalledWith(
      'fire-quotes-draft',
      expect.any(String)
    )
  })

  it('handles localStorage errors gracefully', async () => {
    // Mock localStorage to throw an error
    window.localStorage.setItem = vi.fn().mockImplementation(() => {
      throw new Error('Storage quota exceeded')
    })

    const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {})

    render(<QuoteBuilder />)

    // Make a change
    const companyInput = screen.getByPlaceholderText('Company Name')
    fireEvent.change(companyInput, { target: { value: 'Test' } })

    // Fast-forward time
    act(() => {
      vi.advanceTimersByTime(2000)
    })

    // Should have logged the error
    await waitFor(() => {
      expect(consoleSpy).toHaveBeenCalledWith('Failed to save draft:', expect.any(Error))
    })

    consoleSpy.mockRestore()
  })
})