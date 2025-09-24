import React, { useState, useEffect } from 'react';
import { Equipment, Formulas, EquipmentBundle, CompanySettings } from '../types';
import equipmentData from '../data/equipment.json';
import formulasData from '../data/formulas.json';
import bundlesData from '../data/bundles.json';
import CompanySettingsForm from './CompanySettingsForm';

const AdminPanel: React.FC = () => {
  const [equipment, setEquipment] = useState<Equipment[]>(equipmentData as Equipment[]);
  const [formulas, setFormulas] = useState<Formulas>(formulasData as Formulas);
  const [bundles, setBundles] = useState<EquipmentBundle[]>([]);
  const [companySettings, setCompanySettings] = useState<CompanySettings>({} as CompanySettings);
  const [activeTab, setActiveTab] = useState<'pricing' | 'equipment' | 'bundles' | 'company'>('pricing');
  const [searchTerm, setSearchTerm] = useState('');
  const [editingId, setEditingId] = useState<number | null>(null);

  // Load bundles on component mount
  useEffect(() => {
    const loadBundles = () => {
      try {
        const predefinedBundles = bundlesData as EquipmentBundle[];
        const customBundlesStr = localStorage.getItem('customBundles');
        const customBundles: EquipmentBundle[] = customBundlesStr ? JSON.parse(customBundlesStr) : [];
        const usageStatsStr = localStorage.getItem('bundleUsageStats');
        const usageStats: Record<string, number> = usageStatsStr ? JSON.parse(usageStatsStr) : {};

        const allBundles = [...predefinedBundles, ...customBundles].map(bundle => ({
          ...bundle,
          usageCount: usageStats[bundle.id] || 0
        }));

        setBundles(allBundles);
      } catch (error) {
        console.error('Error loading bundles:', error);
        setBundles([]);
      }
    };

    loadBundles();
    loadCompanySettings();
  }, []);

  // Load company settings
  const loadCompanySettings = () => {
    try {
      const savedSettings = localStorage.getItem('company-settings');
      if (savedSettings) {
        const settings = JSON.parse(savedSettings);
        setCompanySettings(settings);
      }
    } catch (error) {
      console.error('Error loading company settings:', error);
    }
  };

  const saveCompanySettings = (settings: CompanySettings) => {
    try {
      localStorage.setItem('company-settings', JSON.stringify(settings));
      setCompanySettings(settings);

      // Show success notification (you could add a toast system here)
      alert('Company settings saved successfully!');
    } catch (error) {
      console.error('Error saving company settings:', error);
      alert('Failed to save company settings. Please try again.');
    }
  };

  const filteredEquipment = equipment.filter(item =>
    item.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const updatePrice = (id: number, newPrice: number) => {
    setEquipment(equipment.map(item =>
      item.id === id ? { ...item, basePrice: newPrice } : item
    ));
    setEditingId(null);
  };

  const updateFormulas = (field: keyof Formulas, value: number) => {
    setFormulas({ ...formulas, [field]: value });
  };

  const exportData = () => {
    const data = {
      equipment,
      formulas,
      exportedAt: new Date().toISOString()
    };

    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'equipment-data-backup.json';
    a.click();
    URL.revokeObjectURL(url);
  };

  const tabs = [
    { id: 'company', name: 'Company Settings', icon: '🏢' },
    { id: 'pricing', name: 'Pricing Settings', icon: '💰' },
    { id: 'equipment', name: 'Equipment Management', icon: '🔧' },
    { id: 'bundles', name: 'Bundle Management', icon: '📦' }
  ];

  return (
    <div className="space-y-6">
      {/* Tab Navigation */}
      <div className="bg-white rounded-lg shadow">
        <div className="border-b border-gray-200">
          <nav className="-mb-px flex">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`flex items-center gap-2 px-6 py-3 text-sm font-medium border-b-2 transition-colors ${
                  activeTab === tab.id
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                <span className="text-lg">{tab.icon}</span>
                {tab.name}
                {tab.id === 'company' && !companySettings.isConfigured && (
                  <span className="ml-2 bg-yellow-100 text-yellow-800 px-2 py-1 rounded-full text-xs font-medium">
                    Setup Required
                  </span>
                )}
              </button>
            ))}
          </nav>
        </div>

        {/* Tab Content */}
        <div className="p-6">
          {activeTab === 'company' && (
            <CompanySettingsForm
              settings={companySettings}
              onSave={saveCompanySettings}
            />
          )}

          {activeTab === 'pricing' && (
            <div>
              <h2 className="text-lg font-semibold mb-4">Pricing Settings</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Material Markup (multiplier)
            </label>
            <input
              type="number"
              step="0.1"
              value={formulas.materialMarkup}
              onChange={(e) => updateFormulas('materialMarkup', parseFloat(e.target.value))}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Labor Rate ($/hour)
            </label>
            <input
              type="number"
              value={formulas.laborRate}
              onChange={(e) => updateFormulas('laborRate', parseFloat(e.target.value))}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              GST Rate (%)
            </label>
            <input
              type="number"
              step="0.01"
              value={formulas.gstRate * 100}
              onChange={(e) => updateFormulas('gstRate', parseFloat(e.target.value) / 100)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Overheads (%)
            </label>
            <input
              type="number"
              step="0.01"
              value={formulas.overheads * 100}
              onChange={(e) => updateFormulas('overheads', parseFloat(e.target.value) / 100)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
            />
          </div>
              </div>
            </div>
          )}

          {activeTab === 'equipment' && (
            <div>
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-lg font-semibold">Equipment Management</h2>
          <button
            onClick={exportData}
            className="bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 text-sm"
          >
            Export Data
          </button>
        </div>

        <input
          type="text"
          placeholder="Search equipment..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 mb-4"
        />

        <div className="space-y-2 max-h-96 overflow-y-auto">
          {filteredEquipment.map((item) => (
            <div key={item.id} className="flex items-center justify-between p-3 border border-gray-200 rounded-md">
              <div className="flex-1">
                <h3 className="font-medium text-sm">{item.name}</h3>
                <p className="text-xs text-gray-500">{item.description}</p>
              </div>
              <div className="flex items-center space-x-3">
                {editingId === item.id ? (
                  <input
                    type="number"
                    step="0.01"
                    defaultValue={item.basePrice}
                    autoFocus
                    onBlur={(e) => updatePrice(item.id, parseFloat(e.target.value) || 0)}
                    onKeyPress={(e) => {
                      if (e.key === 'Enter') {
                        updatePrice(item.id, parseFloat((e.target as HTMLInputElement).value) || 0);
                      }
                    }}
                    className="w-24 px-2 py-1 border border-gray-300 rounded text-center text-sm"
                  />
                ) : (
                  <span
                    className="font-semibold cursor-pointer hover:bg-gray-100 px-2 py-1 rounded"
                    onClick={() => setEditingId(item.id)}
                  >
                    ${item.basePrice.toFixed(2)}
                  </span>
                )}
                <span className="text-xs text-gray-500 w-16">per {item.unit}</span>
                <span className="text-xs text-gray-600 w-20 text-right">
                  Sale: ${(item.basePrice * formulas.materialMarkup).toFixed(2)}
                </span>
              </div>
            </div>
          ))}
              </div>
            </div>
          )}

          {activeTab === 'bundles' && (
            <div>
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-lg font-semibold">Bundle Management</h2>
          <span className="text-sm text-gray-500">
            {bundles.length} bundles available
          </span>
        </div>

        <div className="space-y-4">
          {bundles.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              <p>No bundles found</p>
            </div>
          ) : (
            bundles.map((bundle) => {
              const bundlePrice = bundle.items.reduce((total, item) => {
                const equipmentItem = equipment.find(e => e.id === item.equipmentId);
                return total + (equipmentItem ? equipmentItem.basePrice * item.quantity * formulas.materialMarkup : 0);
              }, 0);

              return (
                <div key={bundle.id} className="border border-gray-200 rounded-lg p-4">
                  <div className="flex justify-between items-start mb-2">
                    <div>
                      <h3 className="font-medium text-gray-900">{bundle.name}</h3>
                      <p className="text-sm text-gray-600">{bundle.description}</p>
                      <div className="flex items-center gap-4 mt-1">
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                          bundle.category === 'residential' ? 'bg-green-100 text-green-800' :
                          bundle.category === 'commercial' ? 'bg-blue-100 text-blue-800' :
                          bundle.category === 'industrial' ? 'bg-orange-100 text-orange-800' :
                          'bg-purple-100 text-purple-800'
                        }`}>
                          {bundle.category}
                        </span>
                        <span className="text-xs text-gray-500">
                          {bundle.items.length} items
                        </span>
                        {bundle.usageCount > 0 && (
                          <span className="text-xs text-gray-500">
                            Used {bundle.usageCount} times
                          </span>
                        )}
                        {bundle.isCustom && (
                          <span className="px-2 py-1 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
                            Custom
                          </span>
                        )}
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-lg font-semibold text-gray-900">
                        ${bundlePrice.toFixed(2)}
                      </div>
                      <div className="text-sm text-gray-500">
                        + GST: ${(bundlePrice * formulas.gstRate).toFixed(2)}
                      </div>
                    </div>
                  </div>

                  <div className="mt-3 pt-3 border-t border-gray-100">
                    <div className="text-sm text-gray-600">
                      <strong>Items:</strong>
                      <div className="mt-1 space-y-1">
                        {bundle.items.map((item, index) => {
                          const equipmentItem = equipment.find(e => e.id === item.equipmentId);
                          return (
                            <div key={index} className="flex justify-between">
                              <span>• {item.quantity}x {equipmentItem?.name || 'Unknown Item'}</span>
                              <span>${equipmentItem ? (equipmentItem.basePrice * item.quantity * formulas.materialMarkup).toFixed(2) : '0'}</span>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  </div>
                </div>
              );
            })
          )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AdminPanel;