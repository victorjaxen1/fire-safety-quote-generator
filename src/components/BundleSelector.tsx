import React, { useState, useEffect } from 'react';
import { EquipmentBundle, Equipment } from '../types/index';
import BundleCard from './BundleCard';
import bundlesData from '../data/bundles.json';

interface BundleSelectorProps {
  equipment: Equipment[];
  onAddBundle: (bundle: EquipmentBundle) => void;
  onPreviewBundle: (bundle: EquipmentBundle) => void;
}

const BundleSelector: React.FC<BundleSelectorProps> = ({
  equipment,
  onAddBundle,
  onPreviewBundle
}) => {
  const [bundles, setBundles] = useState<EquipmentBundle[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [isExpanded, setIsExpanded] = useState(false);

  useEffect(() => {
    // Load bundles from JSON and localStorage (for custom bundles)
    const loadBundles = () => {
      try {
        // Load predefined bundles
        const predefinedBundles = bundlesData as EquipmentBundle[];

        // Load custom bundles from localStorage
        const customBundlesStr = localStorage.getItem('customBundles');
        const customBundles: EquipmentBundle[] = customBundlesStr ? JSON.parse(customBundlesStr) : [];

        // Load usage stats
        const usageStatsStr = localStorage.getItem('bundleUsageStats');
        const usageStats: Record<string, number> = usageStatsStr ? JSON.parse(usageStatsStr) : {};

        // Combine and sort by usage count
        const allBundles = [...predefinedBundles, ...customBundles].map(bundle => ({
          ...bundle,
          usageCount: usageStats[bundle.id] || 0
        })).sort((a, b) => b.usageCount - a.usageCount);

        setBundles(allBundles);
      } catch (error) {
        console.error('Error loading bundles:', error);
        setBundles([]);
      }
    };

    loadBundles();
  }, []);

  const categories = [
    { id: 'all', name: 'All Bundles', count: bundles.length },
    { id: 'residential', name: 'Residential', count: bundles.filter(b => b.category === 'residential').length },
    { id: 'commercial', name: 'Commercial', count: bundles.filter(b => b.category === 'commercial').length },
    { id: 'industrial', name: 'Industrial', count: bundles.filter(b => b.category === 'industrial').length },
    { id: 'specialty', name: 'Specialty', count: bundles.filter(b => b.category === 'specialty').length },
  ];

  const filteredBundles = selectedCategory === 'all'
    ? bundles
    : bundles.filter(bundle => bundle.category === selectedCategory);

  const handleAddBundle = (bundle: EquipmentBundle) => {
    // Track usage
    const usageStatsStr = localStorage.getItem('bundleUsageStats');
    const usageStats: Record<string, number> = usageStatsStr ? JSON.parse(usageStatsStr) : {};
    usageStats[bundle.id] = (usageStats[bundle.id] || 0) + 1;
    localStorage.setItem('bundleUsageStats', JSON.stringify(usageStats));

    // Update local state
    setBundles(prevBundles =>
      prevBundles.map(b =>
        b.id === bundle.id
          ? { ...b, usageCount: usageStats[bundle.id] }
          : b
      ).sort((a, b) => b.usageCount - a.usageCount)
    );

    onAddBundle(bundle);
  };

  if (bundles.length === 0) {
    return (
      <div className="bg-gray-50 rounded-lg p-4 text-center text-gray-600">
        <p>No equipment bundles available</p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
      {/* Header */}
      <div
        className="bg-gradient-to-r from-blue-50 to-indigo-50 p-4 cursor-pointer"
        onClick={() => setIsExpanded(!isExpanded)}
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="bg-blue-100 p-2 rounded-lg">
              <span className="text-blue-600 text-xl">📦</span>
            </div>
            <div>
              <h2 className="text-lg font-semibold text-gray-900">Equipment Bundles</h2>
              <p className="text-sm text-gray-600">
                Pre-configured packages for common fire safety scenarios
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded-full text-xs font-medium">
              {filteredBundles.length} bundles
            </span>
            <svg
              className={`w-5 h-5 text-gray-500 transition-transform ${isExpanded ? 'rotate-180' : ''}`}
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
          </div>
        </div>
      </div>

      {/* Content */}
      {isExpanded && (
        <div className="p-4">
          {/* Category Filter */}
          <div className="mb-6">
            <div className="flex flex-wrap gap-2">
              {categories.map((category) => (
                <button
                  key={category.id}
                  onClick={() => setSelectedCategory(category.id)}
                  className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                    selectedCategory === category.id
                      ? 'bg-blue-600 text-white'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  {category.name}
                  {category.count > 0 && (
                    <span className={`ml-1 ${
                      selectedCategory === category.id ? 'text-blue-200' : 'text-gray-500'
                    }`}>
                      ({category.count})
                    </span>
                  )}
                </button>
              ))}
            </div>
          </div>

          {/* Bundle Grid */}
          {filteredBundles.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredBundles.map((bundle) => (
                <BundleCard
                  key={bundle.id}
                  bundle={bundle}
                  equipment={equipment}
                  onAddBundle={handleAddBundle}
                  onPreview={onPreviewBundle}
                />
              ))}
            </div>
          ) : (
            <div className="text-center py-8 text-gray-600">
              <div className="text-4xl mb-2">📭</div>
              <p>No bundles found in the "{categories.find(c => c.id === selectedCategory)?.name}" category</p>
              <p className="text-sm mt-1">Try selecting a different category or create a custom bundle</p>
            </div>
          )}

          {/* Popular Bundles Indicator */}
          {selectedCategory === 'all' && bundles.some(b => b.usageCount > 0) && (
            <div className="mt-6 pt-4 border-t border-gray-200">
              <div className="flex items-center gap-2 text-sm text-gray-600">
                <span className="text-yellow-500">⭐</span>
                <span>Most popular bundles are shown first based on usage</span>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default BundleSelector;