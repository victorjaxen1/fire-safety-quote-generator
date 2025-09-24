import React, { useState } from 'react';
import { Equipment, Formulas } from '../types';
import equipmentData from '../data/equipment.json';
import formulasData from '../data/formulas.json';

const AdminPanel: React.FC = () => {
  const [equipment, setEquipment] = useState<Equipment[]>(equipmentData as Equipment[]);
  const [formulas, setFormulas] = useState<Formulas>(formulasData as Formulas);
  const [searchTerm, setSearchTerm] = useState('');
  const [editingId, setEditingId] = useState<number | null>(null);

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

  return (
    <div className="space-y-6">
      {/* Settings */}
      <div className="bg-white p-6 rounded-lg shadow">
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

      {/* Equipment Management */}
      <div className="bg-white p-6 rounded-lg shadow">
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
    </div>
  );
};

export default AdminPanel;