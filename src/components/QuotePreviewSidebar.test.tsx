import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { QuotePreviewSidebar } from './QuotePreviewSidebar';
import type { QuoteItem } from '../types';

// Mock the heroicons
vi.mock('@heroicons/react/24/outline', () => ({
  ChevronLeftIcon: () => <div data-testid="chevron-left" />,
  ChevronRightIcon: () => <div data-testid="chevron-right" />,
  XMarkIcon: () => <div data-testid="x-mark" />,
  ShoppingCartIcon: () => <div data-testid="shopping-cart" />
}));

const mockQuoteItems: QuoteItem[] = [
  {
    equipment: {
      id: 1,
      name: 'Fire Extinguisher',
      category: 'Fire Suppression',
      basePrice: 50,
      unit: 'each',
      description: 'Portable fire extinguisher'
    },
    quantity: 2,
    unitPrice: 75,
    totalPrice: 150
  },
  {
    equipment: {
      id: 2,
      name: 'Smoke Detector',
      category: 'Detection',
      basePrice: 30,
      unit: 'each',
      description: 'Smoke detection device'
    },
    quantity: 1,
    unitPrice: 45,
    totalPrice: 45
  }
];

describe('QuotePreviewSidebar', () => {
  const defaultProps = {
    selectedItems: mockQuoteItems,
    total: 195,
    isExpanded: true,
    isVisible: true,
    onToggle: vi.fn(),
    onRemoveItem: vi.fn(),
    onQuantityChange: vi.fn(),
    gstRate: 0.1,
    materialMarkup: 1.5
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders correctly when visible and expanded', () => {
    render(<QuotePreviewSidebar {...defaultProps} />);

    expect(screen.getByText('Quote Preview')).toBeInTheDocument();
    expect(screen.getByText('Fire Extinguisher')).toBeInTheDocument();
    expect(screen.getByText('Smoke Detector')).toBeInTheDocument();
    expect(screen.getByText('$195.00')).toBeInTheDocument();
  });

  it('shows correct item count', () => {
    render(<QuotePreviewSidebar {...defaultProps} />);

    expect(screen.getByText('3 items')).toBeInTheDocument(); // 2 + 1 = 3 total items
  });

  it('handles quantity changes', () => {
    render(<QuotePreviewSidebar {...defaultProps} />);

    const increaseButtons = screen.getAllByText('+');
    fireEvent.click(increaseButtons[0]);

    expect(defaultProps.onQuantityChange).toHaveBeenCalledWith(1, 3);
  });

  it('handles item removal', () => {
    render(<QuotePreviewSidebar {...defaultProps} />);

    const removeButtons = screen.getAllByTestId('x-mark');
    fireEvent.click(removeButtons[0]);

    expect(defaultProps.onRemoveItem).toHaveBeenCalledWith(1);
  });

  it('handles sidebar toggle', () => {
    render(<QuotePreviewSidebar {...defaultProps} />);

    const toggleButton = screen.getByRole('button');
    fireEvent.click(toggleButton);

    expect(defaultProps.onToggle).toHaveBeenCalled();
  });

  it('shows empty state when no items', () => {
    render(<QuotePreviewSidebar {...defaultProps} selectedItems={[]} />);

    expect(screen.getByText('No items selected')).toBeInTheDocument();
    expect(screen.getByText('Add equipment or bundles to see your quote')).toBeInTheDocument();
  });

  it('renders collapsed state correctly', () => {
    render(<QuotePreviewSidebar {...defaultProps} isExpanded={false} />);

    expect(screen.getByText('$195.00')).toBeInTheDocument();
    expect(screen.queryByText('Quote Preview')).not.toBeInTheDocument();
  });

  it('hides completely when not visible', () => {
    render(<QuotePreviewSidebar {...defaultProps} isVisible={false} />);

    expect(screen.queryByText('Quote Preview')).not.toBeInTheDocument();
    expect(screen.queryByText('Fire Extinguisher')).not.toBeInTheDocument();
  });

  it('calculates totals correctly', () => {
    render(<QuotePreviewSidebar {...defaultProps} />);

    // Should show subtotal and GST breakdown
    const subtotal = 195 / 1.1; // Remove GST
    const gstAmount = 195 - subtotal;

    expect(screen.getByText(`$${subtotal.toFixed(2)}`)).toBeInTheDocument();
    expect(screen.getByText(`$${gstAmount.toFixed(2)}`)).toBeInTheDocument();
  });

  it('shows correct price breakdown for items', () => {
    render(<QuotePreviewSidebar {...defaultProps} />);

    // First item: $50 base × 1.5 markup = $75 unit price, quantity 2 = $150 total
    expect(screen.getByText('$50.00 × 1.5 markup')).toBeInTheDocument();
    expect(screen.getByText('$150.00')).toBeInTheDocument();

    // Second item: $30 base × 1.5 markup = $45 unit price, quantity 1 = $45 total
    expect(screen.getByText('$30.00 × 1.5 markup')).toBeInTheDocument();
    expect(screen.getByText('$45.00')).toBeInTheDocument();
  });
});