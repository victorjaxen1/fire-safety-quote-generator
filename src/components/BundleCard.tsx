import React from 'react';
import { EquipmentBundle, Equipment } from '../types/index';

interface BundleCardProps {
  bundle: EquipmentBundle;
  equipment: Equipment[];
  onAddBundle: (bundle: EquipmentBundle) => void;
  onPreview: (bundle: EquipmentBundle) => void;
}

const BundleCard: React.FC<BundleCardProps> = ({ bundle, equipment, onAddBundle, onPreview }) => {
  // Calculate bundle price and get equipment details
  const bundleDetails = React.useMemo(() => {
    let totalPrice = 0;
    const itemDetails = bundle.items.map(item => {
      const equipmentItem = equipment.find(e => e.id === item.equipmentId);
      const itemTotal = equipmentItem ? equipmentItem.basePrice * item.quantity : 0;
      totalPrice += itemTotal;
      return {
        ...item,
        equipment: equipmentItem,
        totalPrice: itemTotal
      };
    });

    return {
      items: itemDetails,
      totalPrice: totalPrice * 1.5 // Apply material markup
    };
  }, [bundle, equipment]);

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

  const visibleItems = bundleDetails.items.slice(0, 3);
  const remainingCount = bundleDetails.items.length - 3;

  return (
    <div className="bg-white rounded-lg shadow-md border border-gray-200 p-4 hover:shadow-lg transition-shadow duration-200">
      {/* Header */}
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <span className="text-2xl">{getCategoryIcon(bundle.category)}</span>
          <span className={`px-2 py-1 rounded-full text-xs font-medium ${getCategoryColor(bundle.category)}`}>
            {bundle.category}
          </span>
        </div>
        {bundle.usageCount > 0 && (
          <span className="text-xs text-gray-500">Used {bundle.usageCount} times</span>
        )}
      </div>

      {/* Bundle Name and Description */}
      <h3 className="font-semibold text-lg text-gray-900 mb-2">{bundle.name}</h3>
      <p className="text-gray-600 text-sm mb-4 overflow-hidden">{bundle.description}</p>

      {/* Equipment Preview */}
      <div className="mb-4">
        <div className="space-y-1">
          {visibleItems.map((item, index) => (
            <div key={index} className="flex items-center justify-between text-sm">
              <span className="text-gray-700">
                • {item.quantity}x {item.equipment?.name || 'Unknown Item'}
              </span>
              <span className="text-gray-500">
                ${item.equipment ? (item.equipment.basePrice * item.quantity * 1.5).toFixed(0) : '0'}
              </span>
            </div>
          ))}
          {remainingCount > 0 && (
            <div className="text-sm text-gray-500 italic">
              ...and {remainingCount} more items
            </div>
          )}
        </div>
      </div>

      {/* Price and Actions */}
      <div className="border-t pt-3">
        <div className="flex items-center justify-between mb-3">
          <span className="text-sm text-gray-600">{bundle.items.length} items</span>
          <span className="text-lg font-semibold text-gray-900">
            ${bundleDetails.totalPrice.toFixed(0)}
          </span>
        </div>

        <div className="flex gap-2">
          <button
            onClick={() => onPreview(bundle)}
            className="flex-1 px-3 py-2 text-sm border border-gray-300 rounded-md hover:bg-gray-50 transition-colors"
          >
            Preview
          </button>
          <button
            onClick={() => onAddBundle(bundle)}
            className="flex-1 px-3 py-2 text-sm bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
          >
            Add Bundle
          </button>
        </div>
      </div>
    </div>
  );
};

export default BundleCard;