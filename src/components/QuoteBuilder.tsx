import { useState } from 'react';
import { Equipment, QuoteItem, ClientInfo, Formulas } from '../types';
import equipmentData from '../data/equipment.json';
import formulasData from '../data/formulas.json';
import { exportToPDF, exportToExcel, exportToCSV, generateQuoteNumber } from '../utils/exportUtils';

const QuoteBuilder: React.FC = () => {
  const [equipment] = useState<Equipment[]>(equipmentData as Equipment[]);
  const [formulas] = useState<Formulas>(formulasData as Formulas);
  const [selectedItems, setSelectedItems] = useState<QuoteItem[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [clientInfo, setClientInfo] = useState<ClientInfo>({
    name: '',
    abn: '',
    address: '',
    suburb: '',
    state: 'NSW',
    postcode: '',
    contactPerson: '',
    email: '',
    phone: ''
  });

  const filteredEquipment = equipment.filter(item =>
    item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    item.description.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const addItem = (equip: Equipment) => {
    const existingIndex = selectedItems.findIndex(item => item.equipment.id === equip.id);

    if (existingIndex >= 0) {
      const updated = [...selectedItems];
      updated[existingIndex].quantity += 1;
      updated[existingIndex].totalPrice = updated[existingIndex].quantity * updated[existingIndex].unitPrice;
      setSelectedItems(updated);
    } else {
      const unitPrice = equip.basePrice * formulas.materialMarkup;
      const newItem: QuoteItem = {
        equipment: equip,
        quantity: 1,
        unitPrice,
        totalPrice: unitPrice
      };
      setSelectedItems([...selectedItems, newItem]);
    }
  };

  const updateQuantity = (index: number, quantity: number) => {
    if (quantity <= 0) {
      setSelectedItems(selectedItems.filter((_, i) => i !== index));
      return;
    }

    const updated = [...selectedItems];
    updated[index].quantity = quantity;
    updated[index].totalPrice = quantity * updated[index].unitPrice;
    setSelectedItems(updated);
  };

  const subtotal = selectedItems.reduce((sum, item) => sum + item.totalPrice, 0);
  const gstAmount = subtotal * formulas.gstRate;
  const total = subtotal + gstAmount;

  const handleExportPDF = () => {
    const quoteNum = generateQuoteNumber();
    exportToPDF(quoteNum, clientInfo, selectedItems, subtotal, gstAmount, total);
  };

  const handleExportExcel = () => {
    const quoteNum = generateQuoteNumber();
    exportToExcel(quoteNum, clientInfo, selectedItems, subtotal, gstAmount, total);
  };

  const handleExportCSV = () => {
    const quoteNum = generateQuoteNumber();
    exportToCSV(quoteNum, clientInfo, selectedItems, subtotal, gstAmount, total);
  };

  return (
    <div className="space-y-6">
      {/* Client Information */}
      <div className="bg-white p-6 rounded-lg shadow">
        <h2 className="text-lg font-semibold mb-4">Client Information</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          <input
            type="text"
            placeholder="Company Name"
            value={clientInfo.name}
            onChange={(e) => setClientInfo({...clientInfo, name: e.target.value})}
            className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
          />
          <input
            type="text"
            placeholder="ABN (optional)"
            value={clientInfo.abn}
            onChange={(e) => setClientInfo({...clientInfo, abn: e.target.value})}
            className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
          />
          <input
            type="text"
            placeholder="Contact Person"
            value={clientInfo.contactPerson}
            onChange={(e) => setClientInfo({...clientInfo, contactPerson: e.target.value})}
            className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
          />
          <input
            type="text"
            placeholder="Address"
            value={clientInfo.address}
            onChange={(e) => setClientInfo({...clientInfo, address: e.target.value})}
            className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
          />
          <input
            type="text"
            placeholder="Suburb"
            value={clientInfo.suburb}
            onChange={(e) => setClientInfo({...clientInfo, suburb: e.target.value})}
            className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
          />
          <select
            value={clientInfo.state}
            onChange={(e) => setClientInfo({...clientInfo, state: e.target.value})}
            className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
          >
            <option value="NSW">NSW</option>
            <option value="VIC">VIC</option>
            <option value="QLD">QLD</option>
            <option value="WA">WA</option>
            <option value="SA">SA</option>
            <option value="TAS">TAS</option>
            <option value="ACT">ACT</option>
            <option value="NT">NT</option>
          </select>
          <input
            type="text"
            placeholder="Postcode"
            value={clientInfo.postcode}
            onChange={(e) => setClientInfo({...clientInfo, postcode: e.target.value})}
            className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
          />
          <input
            type="email"
            placeholder="Email"
            value={clientInfo.email}
            onChange={(e) => setClientInfo({...clientInfo, email: e.target.value})}
            className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
          />
          <input
            type="tel"
            placeholder="Phone"
            value={clientInfo.phone}
            onChange={(e) => setClientInfo({...clientInfo, phone: e.target.value})}
            className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
          />
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Equipment Selection */}
        <div className="bg-white p-6 rounded-lg shadow">
          <h2 className="text-lg font-semibold mb-4">Equipment Selection</h2>

          <input
            type="text"
            placeholder="Search equipment..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 mb-4"
          />

          <div className="space-y-2 max-h-96 overflow-y-auto">
            {filteredEquipment.map((item) => (
              <div
                key={item.id}
                className="flex items-center justify-between p-3 border border-gray-200 rounded-md hover:bg-gray-50 cursor-pointer"
                onClick={() => addItem(item)}
              >
                <div className="flex-1">
                  <h3 className="font-medium text-sm">{item.name}</h3>
                  <p className="text-xs text-gray-500">{item.description}</p>
                </div>
                <div className="text-right">
                  <p className="font-semibold">${(item.basePrice * formulas.materialMarkup).toFixed(2)}</p>
                  <p className="text-xs text-gray-500">per {item.unit}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Quote Summary */}
        <div className="bg-white p-6 rounded-lg shadow">
          <h2 className="text-lg font-semibold mb-4">Quote Summary</h2>

          <div className="space-y-3 mb-4">
            {selectedItems.map((item, index) => (
              <div key={item.equipment.id} className="flex items-center justify-between p-2 border border-gray-200 rounded">
                <div className="flex-1">
                  <h4 className="font-medium text-sm">{item.equipment.name}</h4>
                  <p className="text-xs text-gray-500">${item.unitPrice.toFixed(2)} per {item.equipment.unit}</p>
                </div>
                <div className="flex items-center space-x-2">
                  <input
                    type="number"
                    min="1"
                    value={item.quantity}
                    onChange={(e) => updateQuantity(index, parseInt(e.target.value) || 1)}
                    className="w-16 px-2 py-1 border border-gray-300 rounded text-center text-sm"
                  />
                  <span className="font-semibold text-sm w-20 text-right">
                    ${item.totalPrice.toFixed(2)}
                  </span>
                  <button
                    onClick={() => updateQuantity(index, 0)}
                    className="text-red-500 hover:text-red-700 text-sm"
                  >
                    ×
                  </button>
                </div>
              </div>
            ))}
          </div>

          {selectedItems.length > 0 && (
            <div className="border-t pt-4 space-y-2">
              <div className="flex justify-between">
                <span>Subtotal:</span>
                <span className="font-semibold">${subtotal.toFixed(2)}</span>
              </div>
              <div className="flex justify-between">
                <span>GST (10%):</span>
                <span className="font-semibold">${gstAmount.toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-lg font-bold border-t pt-2">
                <span>Total:</span>
                <span>${total.toFixed(2)}</span>
              </div>

              <div className="flex space-x-2 mt-4">
                <button
                  onClick={handleExportPDF}
                  className="flex-1 bg-primary-600 text-white py-2 px-4 rounded-md hover:bg-primary-700 text-sm"
                >
                  Export PDF
                </button>
                <button
                  onClick={handleExportExcel}
                  className="flex-1 bg-green-600 text-white py-2 px-4 rounded-md hover:bg-green-700 text-sm"
                >
                  Export Excel
                </button>
                <button
                  onClick={handleExportCSV}
                  className="flex-1 bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 text-sm"
                >
                  Export CSV
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default QuoteBuilder;