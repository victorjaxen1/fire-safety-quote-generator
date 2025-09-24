import { describe, it, expect, beforeEach, vi } from 'vitest'
import { render, screen, fireEvent, waitFor } from '../test/utils'
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

describe('QuoteBuilder - Client Persistence', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    window.localStorage.clear()
  })

  it('loads saved clients on mount', () => {
    const savedClients = [
      {
        ...mockClientInfo,
        id: 'client-1',
        lastUsed: new Date().toISOString(),
        useCount: 3
      },
      {
        ...mockClientInfo,
        name: 'Another Company',
        id: 'client-2',
        lastUsed: new Date().toISOString(),
        useCount: 1
      }
    ]

    window.localStorage.getItem = vi.fn().mockReturnValue(JSON.stringify(savedClients))

    render(<QuoteBuilder />)

    // Should show recent clients button with count
    expect(screen.getByText('Recent Clients (2)')).toBeInTheDocument()
  })

  it('shows recent clients when button is clicked', () => {
    const savedClients = [
      {
        ...mockClientInfo,
        id: 'client-1',
        lastUsed: new Date().toISOString(),
        useCount: 3
      }
    ]

    window.localStorage.getItem = vi.fn().mockReturnValue(JSON.stringify(savedClients))

    render(<QuoteBuilder />)

    const recentClientsButton = screen.getByText('Recent Clients (1)')
    fireEvent.click(recentClientsButton)

    // Should show the recent clients list
    expect(screen.getByText('Recent Clients')).toBeInTheDocument()
    expect(screen.getByText('Test Company')).toBeInTheDocument()
    expect(screen.getByText('Used 3 times')).toBeInTheDocument()
  })

  it('fills form when client is selected from recent list', () => {
    const savedClients = [
      {
        ...mockClientInfo,
        id: 'client-1',
        lastUsed: new Date().toISOString(),
        useCount: 1
      }
    ]

    window.localStorage.getItem = vi.fn().mockReturnValue(JSON.stringify(savedClients))

    render(<QuoteBuilder />)

    // Open recent clients
    const recentClientsButton = screen.getByText('Recent Clients (1)')
    fireEvent.click(recentClientsButton)

    // Click on the client
    const clientButton = screen.getByText('Test Company')
    fireEvent.click(clientButton)

    // Form should be filled
    expect(screen.getByDisplayValue('Test Company')).toBeInTheDocument()
    expect(screen.getByDisplayValue('john@test.com')).toBeInTheDocument()
    expect(screen.getByDisplayValue('John Doe')).toBeInTheDocument()

    // Recent clients list should be hidden
    expect(screen.queryByText('Recent Clients')).not.toBeInTheDocument()
  })

  it('shows live suggestions while typing company name', async () => {
    const savedClients = [
      {
        ...mockClientInfo,
        id: 'client-1',
        lastUsed: new Date().toISOString(),
        useCount: 1
      },
      {
        ...mockClientInfo,
        name: 'Test Corporation',
        id: 'client-2',
        lastUsed: new Date().toISOString(),
        useCount: 2
      }
    ]

    window.localStorage.getItem = vi.fn().mockReturnValue(JSON.stringify(savedClients))

    render(<QuoteBuilder />)

    const companyInput = screen.getByPlaceholderText('Company Name')

    // Type "test" to trigger suggestions
    fireEvent.change(companyInput, { target: { value: 'test' } })

    await waitFor(() => {
      // Should show both matching clients
      expect(screen.getByText('Test Company')).toBeInTheDocument()
      expect(screen.getByText('Test Corporation')).toBeInTheDocument()
    })
  })

  it('sorts suggestions by usage count', async () => {
    const savedClients = [
      {
        ...mockClientInfo,
        name: 'Test Company A',
        id: 'client-1',
        lastUsed: new Date().toISOString(),
        useCount: 1
      },
      {
        ...mockClientInfo,
        name: 'Test Company B',
        id: 'client-2',
        lastUsed: new Date().toISOString(),
        useCount: 5
      }
    ]

    window.localStorage.getItem = vi.fn().mockReturnValue(JSON.stringify(savedClients))

    render(<QuoteBuilder />)

    const companyInput = screen.getByPlaceholderText('Company Name')
    fireEvent.change(companyInput, { target: { value: 'test' } })

    await waitFor(() => {
      const suggestions = screen.getAllByText(/Test Company/)
      // Company B (used 5 times) should appear before Company A (used 1 time)
      expect(suggestions[0]).toHaveTextContent('Test Company B')
      expect(suggestions[1]).toHaveTextContent('Test Company A')
    })
  })

  it('fills form from live suggestion dropdown', async () => {
    const savedClients = [
      {
        ...mockClientInfo,
        id: 'client-1',
        lastUsed: new Date().toISOString(),
        useCount: 1
      }
    ]

    window.localStorage.getItem = vi.fn().mockReturnValue(JSON.stringify(savedClients))

    render(<QuoteBuilder />)

    const companyInput = screen.getByPlaceholderText('Company Name')
    fireEvent.change(companyInput, { target: { value: 'test' } })

    // Wait for suggestions to appear
    await waitFor(() => {
      expect(screen.getByText('Test Company')).toBeInTheDocument()
    })

    // Click on the suggestion
    fireEvent.click(screen.getByText('Test Company'))

    // Form should be filled and suggestions hidden
    expect(screen.getByDisplayValue('Test Company')).toBeInTheDocument()
    expect(screen.getByDisplayValue('john@test.com')).toBeInTheDocument()
  })

  it('saves client when quote is exported', () => {
    render(<QuoteBuilder />)

    // Fill in client info
    fireEvent.change(screen.getByPlaceholderText('Company Name'), {
      target: { value: 'New Client' }
    })
    fireEvent.change(screen.getByPlaceholderText('Email'), {
      target: { value: 'new@client.com' }
    })

    // Add an item to enable export
    fireEvent.click(screen.getByText('Fire Indicator Panel'))

    // Export the quote
    fireEvent.click(screen.getByText('Export PDF'))

    // Should have saved the client
    expect(localStorage.setItem).toHaveBeenCalledWith(
      'fire-quotes-clients',
      expect.stringContaining('New Client')
    )
  })

  it('updates existing client usage when used again', () => {
    const existingClient = {
      ...mockClientInfo,
      id: 'client-1',
      lastUsed: new Date(Date.now() - 1000 * 60 * 60).toISOString(), // 1 hour ago
      useCount: 2
    }

    window.localStorage.getItem = vi.fn().mockReturnValue(JSON.stringify([existingClient]))

    render(<QuoteBuilder />)

    // Fill in the same client name
    fireEvent.change(screen.getByPlaceholderText('Company Name'), {
      target: { value: 'Test Company' }
    })

    // Add item and export
    fireEvent.click(screen.getByText('Fire Indicator Panel'))
    fireEvent.click(screen.getByText('Export PDF'))

    // Should have updated the existing client with increased count
    const savedCall = (localStorage.setItem as any).mock.calls.find(
      (call: any) => call[0] === 'fire-quotes-clients'
    )
    const savedData = JSON.parse(savedCall[1])
    expect(savedData[0].useCount).toBe(3)
    expect(new Date(savedData[0].lastUsed).getTime()).toBeGreaterThan(Date.now() - 1000)
  })

  it('limits saved clients to 100', () => {
    // Create 101 clients
    const manyClients = Array.from({ length: 101 }, (_, i) => ({
      ...mockClientInfo,
      name: `Client ${i}`,
      id: `client-${i}`,
      lastUsed: new Date().toISOString(),
      useCount: 1
    }))

    window.localStorage.getItem = vi.fn().mockReturnValue(JSON.stringify(manyClients))

    render(<QuoteBuilder />)

    // Add a new client
    fireEvent.change(screen.getByPlaceholderText('Company Name'), {
      target: { value: 'New Client' }
    })

    fireEvent.click(screen.getByText('Fire Indicator Panel'))
    fireEvent.click(screen.getByText('Export PDF'))

    // Should have saved only 100 clients (newest + 99 existing)
    const savedCall = (localStorage.setItem as any).mock.calls.find(
      (call: any) => call[0] === 'fire-quotes-clients'
    )
    const savedData = JSON.parse(savedCall[1])
    expect(savedData).toHaveLength(100)
    expect(savedData[0].name).toBe('New Client')
  })

  it('handles malformed client data gracefully', () => {
    // Mock malformed data
    window.localStorage.getItem = vi.fn().mockReturnValue('invalid json')

    const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {})

    render(<QuoteBuilder />)

    // Should not crash and should log error
    expect(screen.getByPlaceholderText('Company Name')).toBeInTheDocument()
    expect(consoleSpy).toHaveBeenCalledWith('Failed to load saved clients:', expect.any(Error))

    consoleSpy.mockRestore()
  })
})