import React from 'react';
import { QuoteItem } from '../types';
import { ChevronLeftIcon, ChevronRightIcon, XMarkIcon, ShoppingCartIcon } from '@heroicons/react/24/outline';

interface QuotePreviewSidebarProps {
  selectedItems: QuoteItem[];
  total: number;
  isExpanded: boolean;
  isVisible: boolean;
  onToggle: () => void;
  onRemoveItem: (id: number) => void;
  onQuantityChange: (id: number, quantity: number) => void;
  gstRate: number;
  materialMarkup: number;
}

export const QuotePreviewSidebar: React.FC<QuotePreviewSidebarProps> = ({
  selectedItems,
  total,
  isExpanded,
  isVisible,
  onToggle,
  onRemoveItem,
  onQuantityChange,
  gstRate,
  materialMarkup
}) => {
  const subtotal = total / (1 + gstRate);
  const gstAmount = total - subtotal;
  const totalItems = selectedItems.reduce((sum, item) => sum + item.quantity, 0);

  if (!isVisible) return null;

  return (
    <>
      {/* Mobile Backdrop */}
      {isExpanded && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 z-40 lg:hidden"
          onClick={onToggle}
        />
      )}

      {/* Sidebar Container */}
      <div className={`
        fixed right-0 top-0 h-full bg-white shadow-xl border-l border-gray-200 z-50
        transition-all duration-300 ease-in-out
        ${isExpanded ? 'w-80 lg:w-96' : 'w-16'}
        ${!isVisible ? 'translate-x-full' : 'translate-x-0'}
      `}>

        {/* Toggle Button */}
        <button
          onClick={onToggle}
          className="absolute -left-12 top-4 bg-blue-600 text-white p-2 rounded-l-lg shadow-lg hover:bg-blue-700 transition-all duration-200 hover:shadow-xl hover:scale-105 active:scale-95"
        >
          {isExpanded ? (
            <ChevronRightIcon className="w-5 h-5" />
          ) : (
            <ChevronLeftIcon className="w-5 h-5" />
          )}
        </button>

        {/* Collapsed State - Total Only */}
        {!isExpanded && (
          <div className="p-4 h-full flex flex-col items-center justify-start pt-16">
            <div className="bg-blue-100 p-3 rounded-full mb-4">
              <ShoppingCartIcon className="w-6 h-6 text-blue-600" />
            </div>
            <div className="text-center transform -rotate-90 whitespace-nowrap">
              <div className="text-xs text-gray-500 mb-1">{totalItems} items</div>
              <div className="font-bold text-green-600">${total.toFixed(2)}</div>
            </div>
          </div>
        )}

        {/* Expanded State - Full Preview */}
        {isExpanded && (
          <div className="h-full flex flex-col">
            {/* Header */}
            <div className="p-4 border-b border-gray-200 bg-gray-50">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold text-gray-900">Quote Preview</h3>
                <div className="flex items-center space-x-2">
                  <span className="text-sm text-gray-500">{totalItems} items</span>
                </div>
              </div>
            </div>

            {/* Items List */}
            <div className="flex-1 overflow-y-auto p-4 space-y-3">
              {selectedItems.length === 0 ? (
                <div className="text-center py-8">
                  <ShoppingCartIcon className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                  <p className="text-gray-500">No items selected</p>
                  <p className="text-sm text-gray-400">Add equipment or bundles to see your quote</p>
                </div>
              ) : (
                selectedItems.map((item) => (
                  <div key={item.equipment.id} className="bg-gray-50 rounded-lg p-3 border border-gray-200 hover:bg-gray-100 hover:border-gray-300 transition-all duration-200 hover:shadow-sm">
                    <div className="flex justify-between items-start mb-2">
                      <div className="flex-1 min-w-0">
                        <h4 className="text-sm font-medium text-gray-900 truncate">
                          {item.equipment.name}
                        </h4>
                        <p className="text-xs text-gray-500 mt-1">
                          ${item.equipment.basePrice.toFixed(2)} × {materialMarkup} markup
                        </p>
                      </div>
                      <button
                        onClick={() => onRemoveItem(item.equipment.id)}
                        className="text-gray-400 hover:text-red-500 transition-all duration-150 ml-2 hover:scale-110 active:scale-95 hover:bg-red-50 rounded-full p-1"
                      >
                        <XMarkIcon className="w-4 h-4" />
                      </button>
                    </div>

                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        <button
                          onClick={() => onQuantityChange(item.equipment.id, Math.max(1, item.quantity - 1))}
                          className="w-6 h-6 rounded-full bg-gray-200 flex items-center justify-center text-gray-600 hover:bg-red-100 hover:text-red-600 text-sm transition-all duration-150 hover:scale-105 active:scale-95"
                        >
                          -
                        </button>
                        <span className="text-sm font-medium min-w-[2rem] text-center transition-all duration-200">
                          {item.quantity}
                        </span>
                        <button
                          onClick={() => onQuantityChange(item.equipment.id, item.quantity + 1)}
                          className="w-6 h-6 rounded-full bg-gray-200 flex items-center justify-center text-gray-600 hover:bg-green-100 hover:text-green-600 text-sm transition-all duration-150 hover:scale-105 active:scale-95"
                        >
                          +
                        </button>
                      </div>
                      <div className="text-right">
                        <div className="text-sm font-semibold text-gray-900 transition-all duration-200 hover:text-green-600">
                          ${item.totalPrice.toFixed(2)}
                        </div>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>

            {/* Totals Section */}
            {selectedItems.length > 0 && (
              <div className="border-t border-gray-200 p-4 bg-gray-50">
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Subtotal</span>
                    <span className="text-gray-900">${subtotal.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">GST ({(gstRate * 100).toFixed(0)}%)</span>
                    <span className="text-gray-900">${gstAmount.toFixed(2)}</span>
                  </div>
                  <div className="border-t border-gray-300 pt-2">
                    <div className="flex justify-between items-center">
                      <span className="text-lg font-semibold text-gray-900">Total</span>
                      <span className="text-xl font-bold text-green-600 transition-all duration-300 hover:scale-105">${total.toFixed(2)}</span>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Mobile Bottom Sheet (shows on mobile instead of sidebar) */}
      <div className="lg:hidden">
        {isVisible && (
          <div className={`
            fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 shadow-lg z-50
            transition-transform duration-300 ease-in-out
            ${isExpanded ? 'transform translate-y-0' : 'transform translate-y-full'}
          `}>
            {/* Mobile Toggle Bar */}
            <div
              className="p-4 border-b border-gray-200 bg-gray-50 cursor-pointer"
              onClick={onToggle}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <ShoppingCartIcon className="w-5 h-5 text-blue-600" />
                  <span className="font-medium text-gray-900">Quote Preview</span>
                  <span className="text-sm text-gray-500">({totalItems} items)</span>
                </div>
                <div className="flex items-center space-x-2">
                  <span className="font-bold text-green-600">${total.toFixed(2)}</span>
                  <ChevronLeftIcon className={`w-4 h-4 text-gray-400 transition-transform ${isExpanded ? 'rotate-90' : '-rotate-90'}`} />
                </div>
              </div>
            </div>

            {/* Mobile Content */}
            {isExpanded && (
              <div className="max-h-96 overflow-y-auto">
                <div className="p-4 space-y-3">
                  {selectedItems.map((item) => (
                    <div key={item.equipment.id} className="flex items-center justify-between py-2 border-b border-gray-100 last:border-b-0">
                      <div className="flex-1 min-w-0">
                        <h4 className="text-sm font-medium text-gray-900 truncate">
                          {item.equipment.name}
                        </h4>
                        <p className="text-xs text-gray-500">
                          {item.quantity} × ${item.unitPrice.toFixed(2)}
                        </p>
                      </div>
                      <div className="flex items-center space-x-3">
                        <span className="text-sm font-semibold text-gray-900">
                          ${item.totalPrice.toFixed(2)}
                        </span>
                        <button
                          onClick={() => onRemoveItem(item.equipment.id)}
                          className="text-gray-400 hover:text-red-500"
                        >
                          <XMarkIcon className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Mobile Totals */}
                <div className="border-t border-gray-200 p-4 bg-gray-50">
                  <div className="flex justify-between items-center">
                    <span className="font-semibold text-gray-900">Total (inc. GST)</span>
                    <span className="text-lg font-bold text-green-600">${total.toFixed(2)}</span>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </>
  );
};