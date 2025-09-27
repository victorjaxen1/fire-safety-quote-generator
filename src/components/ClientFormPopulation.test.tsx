import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import QuoteBuilder from './QuoteBuilder';

// Mock localStorage
const mockLocalStorage = {
  getItem: vi.fn(),
  setItem: vi.fn(),
  removeItem: vi.fn(),
  clear: vi.fn(),
};

Object.defineProperty(window, 'localStorage', {
  value: mockLocalStorage,
});

// Mock the export utilities
vi.mock('../utils/exportUtils', () => ({
  exportToPDF: vi.fn(),
  exportToExcel: vi.fn(),
  exportToCSV: vi.fn(),
  generateQuoteNumber: vi.fn(() => 'QT-20231201-001')
}));

// Mock heroicons
vi.mock('@heroicons/react/24/outline', () => ({
  ChevronLeftIcon: () => <div data-testid="chevron-left" />,
  ChevronRightIcon: () => <div data-testid="chevron-right" />,
  XMarkIcon: () => <div data-testid="x-mark" />,
  ShoppingCartIcon: () => <div data-testid="shopping-cart" />
}));

describe('Client Form Population', () => {
  beforeEach(() => {
    vi.clearAllMocks();

    // Mock saved clients with tracking metadata
    const mockSavedClients = [
      {
        id: 'client-1',
        name: 'Test Company Ltd',
        abn: '12345678901',
        address: '123 Test Street',
        suburb: 'Sydney',
        state: 'NSW',
        postcode: '2000',
        contactPerson: 'John Smith',
        email: 'john@testcompany.com',
        phone: '0412345678',
        lastUsed: new Date('2023-12-01'),
        useCount: 5
      },
      {
        id: 'client-2',
        name: 'ABC Fire Safety',
        abn: '98765432109',
        address: '456 Safety Blvd',
        suburb: 'Melbourne',
        state: 'VIC',
        postcode: '3000',
        contactPerson: 'Jane Doe',
        email: 'jane@abcfire.com',
        phone: '0487654321',
        lastUsed: new Date('2023-11-15'),
        useCount: 3
      }
    ];

    mockLocalStorage.getItem.mockImplementation((key) => {
      if (key === 'fire-quotes-clients') {
        return JSON.stringify(mockSavedClients);
      }
      return null;
    });
  });

  it('should populate all client form fields when clicking a saved client', async () => {
    render(<QuoteBuilder />);

    // Open client suggestions
    const showClientsButton = screen.getByText(/Recent Clients/);
    fireEvent.click(showClientsButton);

    // Click on the first saved client
    const testClientButton = screen.getByText('Test Company Ltd');
    fireEvent.click(testClientButton);

    // Verify all form fields are populated
    expect(screen.getByDisplayValue('Test Company Ltd')).toBeInTheDocument();
    expect(screen.getByDisplayValue('12345678901')).toBeInTheDocument();
    expect(screen.getByDisplayValue('123 Test Street')).toBeInTheDocument();
    expect(screen.getByDisplayValue('Sydney')).toBeInTheDocument();
    expect(screen.getByDisplayValue('NSW')).toBeInTheDocument();
    expect(screen.getByDisplayValue('2000')).toBeInTheDocument();
    expect(screen.getByDisplayValue('John Smith')).toBeInTheDocument();
    expect(screen.getByDisplayValue('john@testcompany.com')).toBeInTheDocument();
    expect(screen.getByDisplayValue('0412345678')).toBeInTheDocument();
  });

  it('should close client suggestions after selecting a client', async () => {
    render(<QuoteBuilder />);

    // Open client suggestions
    const showClientsButton = screen.getByText(/Recent Clients/);
    fireEvent.click(showClientsButton);

    // Verify suggestions are visible
    expect(screen.getByText('Test Company Ltd')).toBeInTheDocument();

    // Click on a client
    const testClientButton = screen.getByText('Test Company Ltd');
    fireEvent.click(testClientButton);

    // Verify suggestions are closed (client name should not be visible as a button anymore)
    expect(screen.queryByRole('button', { name: /Test Company Ltd/ })).not.toBeInTheDocument();
  });

  it('should handle clients with missing optional fields gracefully', async () => {
    // Mock a client with missing ABN
    const clientWithMissingABN = [{
      id: 'client-3',
      name: 'No ABN Company',
      address: '789 Another Street',
      suburb: 'Brisbane',
      state: 'QLD',
      postcode: '4000',
      contactPerson: 'Bob Jones',
      email: 'bob@noabn.com',
      phone: '0423456789',
      lastUsed: new Date('2023-12-01'),
      useCount: 1
    }];

    mockLocalStorage.getItem.mockImplementation((key) => {
      if (key === 'fire-quotes-clients') {
        return JSON.stringify(clientWithMissingABN);
      }
      return null;
    });

    render(<QuoteBuilder />);

    // Open client suggestions
    const showClientsButton = screen.getByText(/Recent Clients/);
    fireEvent.click(showClientsButton);

    // Click on the client without ABN
    const clientButton = screen.getByText('No ABN Company');
    fireEvent.click(clientButton);

    // Verify form is populated with empty string for missing ABN
    expect(screen.getByDisplayValue('No ABN Company')).toBeInTheDocument();
    expect(screen.getByDisplayValue('789 Another Street')).toBeInTheDocument();
    expect(screen.getByDisplayValue('Brisbane')).toBeInTheDocument();

    // ABN field should be empty
    const abnInput = screen.getByPlaceholderText('ABN (optional)');
    expect(abnInput).toHaveValue('');
  });

  it('should update use count when client is selected', async () => {
    render(<QuoteBuilder />);

    // Open client suggestions and select a client
    const showClientsButton = screen.getByText(/Recent Clients/);
    fireEvent.click(showClientsButton);

    const testClientButton = screen.getByText('Test Company Ltd');
    fireEvent.click(testClientButton);

    // Verify localStorage.setItem was called to save updated client data
    expect(mockLocalStorage.setItem).toHaveBeenCalledWith(
      'fire-quotes-clients',
      expect.stringContaining('Test Company Ltd')
    );
  });
});