import React, { useState, useEffect } from 'react';
import { EquipmentBundle, Equipment } from '../types/index';

interface BundlePreviewModalProps {
  bundle: EquipmentBundle | null;
  equipment: Equipment[];
  isOpen: boolean;
  onClose: () => void;
  onAddBundle: (bundle: EquipmentBundle, customQuantities?: Record<number, number>) => void;
}

const BundlePreviewModal: React.FC<BundlePreviewModalProps> = ({
  bundle,
  equipment,
  isOpen,
  onClose,
  onAddBundle
}) => {
  const [customQuantities, setCustomQuantities] = useState<Record<number, number>>({});
  const [showCustomQuantities, setShowCustomQuantities] = useState(false);

  useEffect(() => {
    if (bundle) {
      // Initialize custom quantities with bundle defaults
      const initialQuantities: Record<number, number> = {};
      bundle.items.forEach(item => {
        initialQuantities[item.equipmentId] = item.quantity;
      });
      setCustomQuantities(initialQuantities);
    }
  }, [bundle]);

  if (!isOpen || !bundle) return null;

  const bundleDetails = bundle.items.map(item => {
    const equipmentItem = equipment.find(e => e.id === item.equipmentId);
    const quantity = showCustomQuantities ? (customQuantities[item.equipmentId] || item.quantity) : item.quantity;
    const unitPrice = equipmentItem ? equipmentItem.basePrice * 1.5 : 0; // Apply markup
    const totalPrice = unitPrice * quantity;

    return {
      ...item,
      equipment: equipmentItem,
      quantity,
      unitPrice,
      totalPrice
    };
  });

  const totalBundlePrice = bundleDetails.reduce((sum, item) => sum + item.totalPrice, 0);
  const originalPrice = bundle.items.reduce((sum, item) => {
    const equipmentItem = equipment.find(e => e.id === item.equipmentId);
    return sum + (equipmentItem ? equipmentItem.basePrice * 1.5 * item.quantity : 0);
  }, 0);

  const handleQuantityChange = (equipmentId: number, newQuantity: number) => {
    setCustomQuantities(prev => ({
      ...prev,
      [equipmentId]: Math.max(0, newQuantity)
    }));
  };

  const handleAddBundle = () => {
    if (showCustomQuantities) {
      onAddBundle(bundle, customQuantities);
    } else {
      onAddBundle(bundle);
    }
    onClose();
  };

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'residential': return '🏠';
      case 'commercial': return '🏢';
      case 'industrial': return '🏭';
      case 'specialty': return '⚡';
      default: return '📦';
    }
  };

  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'residential': return 'bg-green-100 text-green-800';
      case 'commercial': return 'bg-blue-100 text-blue-800';
      case 'industrial': return 'bg-orange-100 text-orange-800';
      case 'specialty': return 'bg-purple-100 text-purple-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="bg-gray-50 px-6 py-4 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <span className="text-2xl">{getCategoryIcon(bundle.category)}</span>
              <div>
                <h2 className="text-xl font-semibold text-gray-900">{bundle.name}</h2>
                <div className="flex items-center gap-2 mt-1">
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${getCategoryColor(bundle.category)}`}>
                    {bundle.category}
                  </span>
                  {bundle.usageCount > 0 && (
                    <span className="text-xs text-gray-500">Used {bundle.usageCount} times</span>
                  )}
                </div>
              </div>
            </div>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 transition-colors"
            >
              <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto max-h-[calc(90vh-200px)]">
          {/* Description */}
          <div className="mb-6">
            <p className="text-gray-700">{bundle.description}</p>
          </div>

          {/* Customize Toggle */}
          <div className="mb-4">
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={showCustomQuantities}
                onChange={(e) => setShowCustomQuantities(e.target.checked)}
                className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
              />
              <span className="text-sm text-gray-700">Customize quantities before adding</span>
            </label>
          </div>

          {/* Equipment List */}
          <div className="mb-6">
            <h3 className="text-lg font-medium text-gray-900 mb-4">Included Equipment</h3>
            <div className="overflow-x-auto">
              <table className="w-full border border-gray-200 rounded-lg">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">Equipment</th>
                    <th className="px-4 py-3 text-center text-sm font-medium text-gray-700">Quantity</th>
                    <th className="px-4 py-3 text-right text-sm font-medium text-gray-700">Unit Price</th>
                    <th className="px-4 py-3 text-right text-sm font-medium text-gray-700">Total</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {bundleDetails.map((item, index) => (
                    <tr key={index} className="hover:bg-gray-50">
                      <td className="px-4 py-3">
                        <div>
                          <div className="font-medium text-gray-900">
                            {item.equipment?.name || 'Unknown Equipment'}
                          </div>
                          <div className="text-sm text-gray-600">{item.equipment?.description}</div>
                          {item.notes && (
                            <div className="text-xs text-blue-600 mt-1">Note: {item.notes}</div>
                          )}
                        </div>
                      </td>
                      <td className="px-4 py-3 text-center">
                        {showCustomQuantities ? (
                          <input
                            type="number"
                            min="0"
                            value={customQuantities[item.equipmentId] || 0}
                            onChange={(e) => handleQuantityChange(item.equipmentId, parseInt(e.target.value) || 0)}
                            className="w-16 px-2 py-1 border border-gray-300 rounded text-center text-sm"
                          />
                        ) : (
                          <span className="text-gray-900">{item.quantity}</span>
                        )}
                        <div className="text-xs text-gray-500 mt-1">
                          {item.equipment?.unit || 'each'}
                        </div>
                      </td>
                      <td className="px-4 py-3 text-right text-gray-900">
                        ${item.unitPrice.toFixed(2)}
                      </td>
                      <td className="px-4 py-3 text-right font-medium text-gray-900">
                        ${item.totalPrice.toFixed(2)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Price Summary */}
          <div className="bg-gray-50 rounded-lg p-4">
            <div className="flex justify-between items-center">
              <div>
                <div className="text-sm text-gray-600">Bundle Total ({bundleDetails.length} items)</div>
                {showCustomQuantities && originalPrice !== totalBundlePrice && (
                  <div className="text-xs text-gray-500">
                    Original: ${originalPrice.toFixed(2)}
                    {totalBundlePrice > originalPrice && (
                      <span className="text-green-600 ml-2">
                        (+${(totalBundlePrice - originalPrice).toFixed(2)})
                      </span>
                    )}
                    {totalBundlePrice < originalPrice && (
                      <span className="text-red-600 ml-2">
                        (-${(originalPrice - totalBundlePrice).toFixed(2)})
                      </span>
                    )}
                  </div>
                )}
              </div>
              <div className="text-right">
                <div className="text-2xl font-bold text-gray-900">
                  ${totalBundlePrice.toFixed(2)}
                </div>
                <div className="text-sm text-gray-600">
                  + GST (10%) = ${(totalBundlePrice * 1.1).toFixed(2)}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="bg-gray-50 px-6 py-4 border-t border-gray-200 flex justify-end gap-3">
          <button
            onClick={onClose}
            className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50 transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handleAddBundle}
            className="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
          >
            Add Bundle to Quote
          </button>
        </div>
      </div>
    </div>
  );
};

export default BundlePreviewModal;