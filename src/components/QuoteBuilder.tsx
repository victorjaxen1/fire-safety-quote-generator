import { useState, useEffect, useRef } from 'react';
import { Equipment, QuoteItem, ClientInfo, Formulas, Category, EquipmentBundle } from '../types';
import equipmentData from '../data/equipment.json';
import categoriesData from '../data/categories.json';
import formulasData from '../data/formulas.json';
import { exportToPDF, exportToExcel, exportToCSV, generateQuoteNumber } from '../utils/exportUtils';
import BundleSelector from './BundleSelector';
import BundlePreviewModal from './BundlePreviewModal';

const QuoteBuilder: React.FC = () => {
  const [equipment] = useState<Equipment[]>(equipmentData as Equipment[]);
  const [categories] = useState<Category[]>(categoriesData as Category[]);
  const [formulas] = useState<Formulas>(formulasData as Formulas);
  const [selectedItems, setSelectedItems] = useState<QuoteItem[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [favorites, setFavorites] = useState<number[]>([]);
  const [showFavoritesOnly, setShowFavoritesOnly] = useState(false);
  const [saveStatus, setSaveStatus] = useState<'saved' | 'saving' | 'unsaved'>('saved');
  const [showDraftRestore, setShowDraftRestore] = useState(false);
  const [savedClients, setSavedClients] = useState<(ClientInfo & { id: string; lastUsed: Date; useCount: number })[]>([]);
  const [showClientSuggestions, setShowClientSuggestions] = useState(false);
  const clientSuggestionsRef = useRef<HTMLDivElement>(null);
  const [previewBundle, setPreviewBundle] = useState<EquipmentBundle | null>(null);
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

  // Load favorites from localStorage on component mount
  useEffect(() => {
    const savedFavorites = localStorage.getItem('fire-quotes-favorites');
    if (savedFavorites) {
      try {
        setFavorites(JSON.parse(savedFavorites));
      } catch (error) {
        console.error('Failed to load favorites:', error);
      }
    }
  }, []);

  // Save favorites to localStorage whenever favorites change
  useEffect(() => {
    localStorage.setItem('fire-quotes-favorites', JSON.stringify(favorites));
  }, [favorites]);

  // Load saved clients on component mount
  useEffect(() => {
    const saved = localStorage.getItem('fire-quotes-clients');
    if (saved) {
      try {
        const clients = JSON.parse(saved);
        setSavedClients(clients.map((c: any) => ({...c, lastUsed: new Date(c.lastUsed)})));
      } catch (error) {
        console.error('Failed to load saved clients:', error);
      }
    }
  }, []);

  // Handle click outside to close client suggestions
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (clientSuggestionsRef.current && !clientSuggestionsRef.current.contains(event.target as Node)) {
        setShowClientSuggestions(false);
      }
    };

    if (showClientSuggestions) {
      document.addEventListener('mousedown', handleClickOutside);
      return () => document.removeEventListener('mousedown', handleClickOutside);
    }
  }, [showClientSuggestions]);

  // Load draft on component mount
  useEffect(() => {
    const savedDraft = localStorage.getItem('fire-quotes-draft');
    if (savedDraft) {
      try {
        const draft = JSON.parse(savedDraft);
        const draftAge = Date.now() - new Date(draft.lastSaved).getTime();
        const maxAge = 24 * 60 * 60 * 1000; // 24 hours

        if (draftAge < maxAge && (draft.clientInfo.name || draft.selectedItems.length > 0)) {
          setShowDraftRestore(true);
        }
      } catch (error) {
        console.error('Failed to load draft:', error);
      }
    }
  }, []);

  // Auto-save draft
  useEffect(() => {
    const saveDraft = () => {
      if (clientInfo.name || selectedItems.length > 0) {
        setSaveStatus('saving');

        const draft = {
          id: 'current-draft',
          clientInfo,
          selectedItems,
          lastSaved: new Date().toISOString(),
          autoSaved: true
        };

        try {
          localStorage.setItem('fire-quotes-draft', JSON.stringify(draft));
          setSaveStatus('saved');
          setTimeout(() => setSaveStatus('unsaved'), 2000); // Show "saved" for 2 seconds
        } catch (error) {
          console.error('Failed to save draft:', error);
          setSaveStatus('unsaved');
        }
      }
    };

    const debouncedSave = setTimeout(saveDraft, 2000); // Save after 2 seconds of inactivity
    return () => clearTimeout(debouncedSave);
  }, [clientInfo, selectedItems]);

  const restoreDraft = () => {
    const savedDraft = localStorage.getItem('fire-quotes-draft');
    if (savedDraft) {
      try {
        const draft = JSON.parse(savedDraft);
        setClientInfo(draft.clientInfo);
        setSelectedItems(draft.selectedItems);
        setShowDraftRestore(false);
        setSaveStatus('saved');
      } catch (error) {
        console.error('Failed to restore draft:', error);
      }
    }
  };

  const clearDraft = () => {
    localStorage.removeItem('fire-quotes-draft');
    setShowDraftRestore(false);
  };

  const startNewQuote = () => {
    setClientInfo({
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
    setSelectedItems([]);
    clearDraft();
    setSaveStatus('saved');
    setShowClientSuggestions(false);
  };

  const saveClient = (clientToSave: ClientInfo) => {
    if (!clientToSave.name.trim()) return;

    const existingIndex = savedClients.findIndex(c =>
      c.name.toLowerCase() === clientToSave.name.toLowerCase()
    );

    let updatedClients;
    if (existingIndex >= 0) {
      // Update existing client
      updatedClients = [...savedClients];
      updatedClients[existingIndex] = {
        ...clientToSave,
        id: savedClients[existingIndex].id,
        lastUsed: new Date(),
        useCount: savedClients[existingIndex].useCount + 1
      };
    } else {
      // Add new client
      const newClient = {
        ...clientToSave,
        id: `client-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
        lastUsed: new Date(),
        useCount: 1
      };
      updatedClients = [newClient, ...savedClients].slice(0, 100); // Keep only last 100
    }

    setSavedClients(updatedClients);
    localStorage.setItem('fire-quotes-clients', JSON.stringify(updatedClients));
  };

  const fillClientForm = (client: ClientInfo) => {
    setClientInfo(client);
    setShowClientSuggestions(false);
    saveClient(client); // Update use count and last used
  };

  const getClientSuggestions = (searchTerm: string) => {
    if (searchTerm.length < 2) return [];
    return savedClients
      .filter(client =>
        client.name.toLowerCase().includes(searchTerm.toLowerCase())
      )
      .sort((a, b) => b.useCount - a.useCount)
      .slice(0, 5);
  };

  const toggleFavorite = (equipmentId: number) => {
    setFavorites(prev => {
      if (prev.includes(equipmentId)) {
        return prev.filter(id => id !== equipmentId);
      } else {
        return [...prev, equipmentId];
      }
    });
  };

  const filteredEquipment = equipment
    .filter(item => {
      const matchesSearch = item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           item.description.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesCategory = selectedCategory === 'all' || item.category === selectedCategory;
      const matchesFavorites = !showFavoritesOnly || favorites.includes(item.id);
      return matchesSearch && matchesCategory && matchesFavorites;
    })
    .sort((a, b) => {
      // Sort favorites to top
      const aIsFav = favorites.includes(a.id);
      const bIsFav = favorites.includes(b.id);
      if (aIsFav && !bIsFav) return -1;
      if (!aIsFav && bIsFav) return 1;
      return 0;
    });

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

  const addBundleToQuote = (bundle: EquipmentBundle, customQuantities?: Record<number, number>) => {
    setSelectedItems(prevItems => {
      let updatedItems = [...prevItems];

      bundle.items.forEach(bundleItem => {
        const equipmentItem = equipment.find(e => e.id === bundleItem.equipmentId);
        if (equipmentItem) {
          const quantity = customQuantities?.[bundleItem.equipmentId] || bundleItem.quantity;
          const existingIndex = updatedItems.findIndex(item => item.equipment.id === equipmentItem.id);

          if (existingIndex >= 0) {
            // Update existing item quantity
            updatedItems[existingIndex] = {
              ...updatedItems[existingIndex],
              quantity: updatedItems[existingIndex].quantity + quantity,
              totalPrice: (updatedItems[existingIndex].quantity + quantity) * updatedItems[existingIndex].unitPrice
            };
          } else {
            // Add new item with full quantity
            const unitPrice = equipmentItem.basePrice * formulas.materialMarkup;
            const newItem: QuoteItem = {
              equipment: equipmentItem,
              quantity,
              unitPrice,
              totalPrice: unitPrice * quantity
            };
            updatedItems.push(newItem);
          }
        }
      });

      return updatedItems;
    });
  };

  const handlePreviewBundle = (bundle: EquipmentBundle) => {
    setPreviewBundle(bundle);
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
      {/* Draft Restore Banner */}
      {showDraftRestore && (
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <div className="text-blue-600">
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                </svg>
              </div>
              <div>
                <h3 className="text-sm font-medium text-blue-800">Draft Available</h3>
                <p className="text-sm text-blue-600">You have an unsaved quote draft. Would you like to restore it?</p>
              </div>
            </div>
            <div className="flex space-x-2">
              <button
                onClick={restoreDraft}
                className="bg-blue-600 text-white px-3 py-1 rounded text-sm hover:bg-blue-700"
              >
                Restore
              </button>
              <button
                onClick={clearDraft}
                className="bg-gray-300 text-gray-700 px-3 py-1 rounded text-sm hover:bg-gray-400"
              >
                Discard
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Save Status & Actions */}
      <div className="bg-white p-4 rounded-lg shadow flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <h1 className="text-xl font-semibold">Quote Builder</h1>
          <div className="flex items-center space-x-2">
            {saveStatus === 'saving' && (
              <>
                <div className="w-4 h-4 border-2 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
                <span className="text-sm text-gray-600">Saving draft...</span>
              </>
            )}
            {saveStatus === 'saved' && (
              <>
                <div className="w-4 h-4 text-green-600">
                  <svg fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                </div>
                <span className="text-sm text-green-600">Draft saved</span>
              </>
            )}
          </div>
        </div>
        <div className="flex space-x-2">
          <button
            onClick={startNewQuote}
            className="bg-gray-500 text-white px-4 py-2 rounded-md hover:bg-gray-600 text-sm"
          >
            New Quote
          </button>
        </div>
      </div>
      {/* Client Information */}
      <div className="bg-white p-6 rounded-lg shadow">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold">Client Information</h2>
          {savedClients.length > 0 && (
            <button
              onClick={() => setShowClientSuggestions(!showClientSuggestions)}
              className="text-sm text-primary-600 hover:text-primary-700 flex items-center space-x-1"
            >
              <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M8 4a4 4 0 100 8 4 4 0 000-8zM2 8a6 6 0 1110.89 3.476l4.817 4.817a1 1 0 01-1.414 1.414l-4.816-4.816A6 6 0 012 8z" clipRule="evenodd" />
              </svg>
              <span>Recent Clients ({savedClients.length})</span>
            </button>
          )}
        </div>

        {/* Client Suggestions */}
        {showClientSuggestions && savedClients.length > 0 && (
          <div className="mb-4 bg-gray-50 border border-gray-200 rounded-lg p-3">
            <h3 className="text-sm font-medium text-gray-700 mb-2">Recent Clients</h3>
            <div className="space-y-2 max-h-40 overflow-y-auto">
              {savedClients.slice(0, 10).map((client) => (
                <button
                  key={client.id}
                  onClick={() => fillClientForm(client)}
                  className="w-full text-left p-2 hover:bg-white border border-transparent hover:border-gray-200 rounded text-sm"
                >
                  <div className="font-medium">{client.name}</div>
                  <div className="text-gray-500 text-xs">
                    {client.address ? `${client.address}, ${client.suburb} ${client.state}` : 'No address'}
                  </div>
                  <div className="text-gray-400 text-xs">
                    Used {client.useCount} times • Last: {client.lastUsed.toLocaleDateString()}
                  </div>
                </button>
              ))}
            </div>
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          <div className="relative" ref={clientSuggestionsRef}>
            <input
              type="text"
              placeholder="Company Name"
              value={clientInfo.name}
              onChange={(e) => {
                const newValue = e.target.value;
                setClientInfo({...clientInfo, name: newValue});
                // Auto-show suggestions when typing
                if (newValue.length >= 2 && savedClients.length > 0) {
                  setShowClientSuggestions(true);
                }
              }}
              onFocus={() => {
                if (clientInfo.name.length >= 2 && savedClients.length > 0) {
                  setShowClientSuggestions(true);
                }
              }}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
            />

            {/* Live suggestions dropdown */}
            {showClientSuggestions && clientInfo.name.length >= 2 && (
              <div className="absolute z-10 w-full mt-1 bg-white border border-gray-200 rounded-md shadow-lg">
                {getClientSuggestions(clientInfo.name).map((client) => (
                  <button
                    key={client.id}
                    onClick={() => fillClientForm(client)}
                    className="w-full text-left p-3 hover:bg-gray-50 border-b border-gray-100 last:border-b-0"
                  >
                    <div className="font-medium text-sm">{client.name}</div>
                    <div className="text-xs text-gray-500">
                      {client.contactPerson && `${client.contactPerson} • `}
                      {client.phone}
                    </div>
                  </button>
                ))}
              </div>
            )}
          </div>
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

      {/* Bundle Selection */}
      <div className="mb-6">
        <BundleSelector
          equipment={equipment}
          onAddBundle={addBundleToQuote}
          onPreviewBundle={handlePreviewBundle}
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Equipment Selection */}
        <div className="bg-white p-6 rounded-lg shadow">
          <h2 className="text-lg font-semibold mb-4">Equipment Selection</h2>

          <div className="space-y-3 mb-4">
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
            >
              <option value="all">All Categories ({equipment.length} items)</option>
              {categories.map((category) => {
                const count = equipment.filter(item => item.category === category.name).length;
                return (
                  <option key={category.id} value={category.name}>
                    {category.name} ({count} items)
                  </option>
                );
              })}
            </select>

            <input
              type="text"
              placeholder="Search equipment..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
            />

            <div className="flex items-center space-x-4">
              <label className="flex items-center space-x-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={showFavoritesOnly}
                  onChange={(e) => setShowFavoritesOnly(e.target.checked)}
                  className="rounded border-gray-300 text-primary-600 focus:ring-primary-500"
                />
                <span className="text-sm text-gray-700">
                  Show favorites only ({favorites.length})
                </span>
              </label>
            </div>
          </div>

          {filteredEquipment.length === 0 && (searchTerm || selectedCategory !== 'all' || showFavoritesOnly) && (
            <div className="text-center py-8 text-gray-500">
              <p>No equipment found matching your criteria.</p>
              <button
                onClick={() => {
                  setSearchTerm('');
                  setSelectedCategory('all');
                  setShowFavoritesOnly(false);
                }}
                className="text-primary-600 hover:text-primary-700 mt-2"
              >
                Clear filters
              </button>
            </div>
          )}

          <div className="space-y-2 max-h-96 overflow-y-auto">
            {filteredEquipment.map((item) => {
              const isFavorite = favorites.includes(item.id);
              return (
                <div
                  key={item.id}
                  className={`flex items-center justify-between p-3 border border-gray-200 rounded-md hover:bg-gray-50 ${
                    isFavorite ? 'bg-yellow-50 border-yellow-200' : ''
                  }`}
                >
                  <div className="flex items-center space-x-3 flex-1">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        toggleFavorite(item.id);
                      }}
                      className={`text-lg hover:scale-110 transition-transform ${
                        isFavorite ? 'text-yellow-500' : 'text-gray-300 hover:text-yellow-400'
                      }`}
                      title={isFavorite ? 'Remove from favorites' : 'Add to favorites'}
                    >
                      {isFavorite ? '★' : '☆'}
                    </button>
                    <div
                      className="flex-1 cursor-pointer"
                      onClick={() => addItem(item)}
                    >
                      <h3 className="font-medium text-sm">{item.name}</h3>
                      <p className="text-xs text-gray-500">{item.description}</p>
                      <p className="text-xs text-gray-400">{item.category}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-semibold">${(item.basePrice * formulas.materialMarkup).toFixed(2)}</p>
                    <p className="text-xs text-gray-500">per {item.unit}</p>
                  </div>
                </div>
              );
            })}
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
                  onClick={() => {
                    saveClient(clientInfo); // Save client before export
                    handleExportPDF();
                    clearDraft(); // Clear draft after successful export
                  }}
                  className="flex-1 bg-primary-600 text-white py-2 px-4 rounded-md hover:bg-primary-700 text-sm"
                >
                  Export PDF
                </button>
                <button
                  onClick={() => {
                    saveClient(clientInfo); // Save client before export
                    handleExportExcel();
                    clearDraft(); // Clear draft after successful export
                  }}
                  className="flex-1 bg-green-600 text-white py-2 px-4 rounded-md hover:bg-green-700 text-sm"
                >
                  Export Excel
                </button>
                <button
                  onClick={() => {
                    saveClient(clientInfo); // Save client before export
                    handleExportCSV();
                    clearDraft(); // Clear draft after successful export
                  }}
                  className="flex-1 bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 text-sm"
                >
                  Export CSV
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Bundle Preview Modal */}
      <BundlePreviewModal
        bundle={previewBundle}
        equipment={equipment}
        isOpen={previewBundle !== null}
        onClose={() => setPreviewBundle(null)}
        onAddBundle={addBundleToQuote}
      />
    </div>
  );
};

export default QuoteBuilder;