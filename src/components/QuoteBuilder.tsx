import { useState, useEffect, useRef } from 'react';
import { Equipment, QuoteItem, ClientInfo, Formulas, Category, EquipmentBundle, CompanySettings } from '../types';
import equipmentData from '../data/equipment.json';
import categoriesData from '../data/categories.json';
import formulasData from '../data/formulas.json';
import { exportToPDF, exportToExcel, exportToCSV, generateQuoteNumber } from '../utils/exportUtils';
import BundleSelector from './BundleSelector';
import BundlePreviewModal from './BundlePreviewModal';
import StepIndicator from './StepIndicator';
import CollapsibleSection from './CollapsibleSection';
import EmptyState from './EmptyState';
import { QuotePreviewSidebar } from './QuotePreviewSidebar';

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
  const [quoteNumber, setQuoteNumber] = useState<string>('');
  const [currentStep, setCurrentStep] = useState<number>(1);
  const [isExporting, setIsExporting] = useState<boolean>(false);
  const [exportingType, setExportingType] = useState<string>('');
  const [companySettings, setCompanySettings] = useState<CompanySettings>({} as CompanySettings);
  const [sidebarExpanded, setSidebarExpanded] = useState(false);
  const [showSidebar, setShowSidebar] = useState(false);
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

  // Load company settings on component mount
  useEffect(() => {
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

    loadCompanySettings();
  }, []);

  // Auto-show/hide sidebar when items change
  useEffect(() => {
    if (selectedItems.length > 0 && !showSidebar) {
      setShowSidebar(true);
      setSidebarExpanded(true);
    } else if (selectedItems.length === 0) {
      setShowSidebar(false);
      setSidebarExpanded(false);
    }
  }, [selectedItems.length, showSidebar]);

  // Auto-expand sidebar during equipment selection step
  useEffect(() => {
    if (currentStep === 2 && selectedItems.length > 0) {
      setSidebarExpanded(true);
    }
  }, [currentStep, selectedItems.length]);

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
          quoteNumber,
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
  }, [clientInfo, selectedItems, quoteNumber]);

  const restoreDraft = () => {
    const savedDraft = localStorage.getItem('fire-quotes-draft');
    if (savedDraft) {
      try {
        const draft = JSON.parse(savedDraft);
        setClientInfo(draft.clientInfo);
        setSelectedItems(draft.selectedItems);
        setQuoteNumber(draft.quoteNumber || '');
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
    setQuoteNumber('');
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

  const fillClientForm = (client: ClientInfo & { id?: string; lastUsed?: Date; useCount?: number }) => {
    console.log('fillClientForm called with:', client); // Debug: incoming data

    // Extract only ClientInfo properties, excluding tracking metadata
    const clientInfoOnly: ClientInfo = {
      name: client.name || '',
      abn: client.abn || '',
      address: client.address || '',
      suburb: client.suburb || '',
      state: client.state || 'NSW',
      postcode: client.postcode || '',
      contactPerson: client.contactPerson || '',
      email: client.email || '',
      phone: client.phone || ''
    };

    console.log('Setting clientInfo to:', clientInfoOnly); // Debug: what we're setting
    console.log('Current clientInfo before update:', clientInfo); // Debug: current state

    setClientInfo(clientInfoOnly);
    setShowClientSuggestions(false);

    // Don't call saveClient here to avoid recursion - the client is already saved
    // saveClient(clientInfoOnly); // Remove this to prevent potential issues
  };

  const getClientSuggestions = (searchTerm: string) => {
    console.log('getClientSuggestions called with:', searchTerm, 'savedClients:', savedClients.length);
    if (searchTerm.length < 2) return [];

    const filtered = savedClients.filter(client => {
      const match = client.name.toLowerCase().includes(searchTerm.toLowerCase());
      console.log(`Checking "${client.name}" vs "${searchTerm}": ${match}`);
      return match;
    });

    console.log('Filtered suggestions:', filtered);
    return filtered
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

  // Step completion logic - Streamlined 3-step flow
  const isClientComplete = () => clientInfo.name.trim() && clientInfo.email.trim();
  const isEquipmentComplete = () => selectedItems.length > 0;

  const getStepStatus = (step: number) => {
    switch (step) {
      case 1:
        if (currentStep > 1 && isClientComplete()) return 'completed';
        if (currentStep === 1) return 'active';
        return 'pending';
      case 2:
        if (currentStep > 2 && isEquipmentComplete()) return 'completed';
        if (currentStep === 2) return 'active';
        return isClientComplete() ? 'pending' : 'disabled';
      case 3:
        if (currentStep === 3) return 'active';
        return isEquipmentComplete() ? 'pending' : 'disabled';
      default:
        return 'pending';
    }
  };

  const handleStepClick = (targetStep: number) => {
    // Allow navigation to completed steps or the next logical step (max 3 steps)
    const canNavigate = targetStep <= 3 && targetStep <= currentStep + 1 && getStepStatus(targetStep) !== 'disabled';
    if (canNavigate) {
      setCurrentStep(targetStep);
    }
  };

  // Debug: Monitor clientInfo state changes
  useEffect(() => {
    console.log('clientInfo state changed:', clientInfo);
  }, [clientInfo]);

  // Debug: Monitor showClientSuggestions state changes
  useEffect(() => {
    console.log('showClientSuggestions state changed:', showClientSuggestions);
  }, [showClientSuggestions]);

  // Auto-advance logic - streamlined for 3-step flow
  useEffect(() => {
    // No auto-advance needed - users control flow with contextual actions
    // Step 1: Client completes → manual advance to Step 2
    // Step 2: Equipment + Export → manual export advances to Step 3
    // Step 3: Export complete → manual actions to continue
  }, [currentStep, isClientComplete, isEquipmentComplete, quoteNumber]);

  // Section summary helpers
  const getClientSummary = () => {
    if (!isClientComplete()) return '';
    return `${clientInfo.name}${clientInfo.email ? ` (${clientInfo.email})` : ''}`;
  };

  const getEquipmentSummary = () => {
    if (selectedItems.length === 0) return '';
    return `${selectedItems.length} item${selectedItems.length === 1 ? '' : 's'} selected`;
  };


  // Contextual Actions System
  const getContextualActions = () => {
    switch (currentStep) {
      case 1: // Client Info Step
        return [
          {
            label: isClientComplete() ? 'Continue to Equipment' : 'Complete Client Info',
            onClick: () => isClientComplete() ? setCurrentStep(2) : null,
            variant: 'primary' as const,
            disabled: !isClientComplete(),
            icon: 'arrow-right'
          },
          {
            label: 'Save Draft',
            onClick: () => {}, // Already auto-saves
            variant: 'secondary' as const,
            disabled: false,
            icon: 'save'
          }
        ];

      case 2: // Equipment Selection with Live Sidebar
        return [
          {
            label: isExporting && exportingType === 'PDF' ? 'Exporting PDF...' : 'Export PDF',
            onClick: async () => {
              if (isExporting || selectedItems.length === 0) return;
              setIsExporting(true);
              setExportingType('PDF');
              saveClient(clientInfo);
              await new Promise(resolve => setTimeout(resolve, 500)); // Simulate processing
              handleExportPDF();
              clearDraft();
              setCurrentStep(3);
              setTimeout(() => {
                setIsExporting(false);
                setExportingType('');
              }, 1000);
            },
            variant: 'primary' as const,
            disabled: selectedItems.length === 0 || isExporting,
            icon: isExporting && exportingType === 'PDF' ? 'loading' : 'download'
          },
          {
            label: isExporting && exportingType === 'Excel' ? 'Exporting Excel...' : 'Export Excel',
            onClick: async () => {
              if (isExporting || selectedItems.length === 0) return;
              setIsExporting(true);
              setExportingType('Excel');
              saveClient(clientInfo);
              await new Promise(resolve => setTimeout(resolve, 500)); // Simulate processing
              handleExportExcel();
              clearDraft();
              setTimeout(() => {
                setIsExporting(false);
                setExportingType('');
              }, 1000);
            },
            variant: 'secondary' as const,
            disabled: selectedItems.length === 0 || isExporting,
            icon: isExporting && exportingType === 'Excel' ? 'loading' : 'document'
          },
          {
            label: 'Back to Client',
            onClick: () => setCurrentStep(1),
            variant: 'tertiary' as const,
            disabled: false,
            icon: 'arrow-left'
          }
        ];

      case 3: // Export Complete Step
        return [
          {
            label: 'Start New Quote',
            onClick: () => {
              startNewQuote();
              setCurrentStep(1);
            },
            variant: 'primary' as const,
            disabled: false,
            icon: 'plus'
          },
          {
            label: 'Export Again',
            onClick: () => setCurrentStep(2),
            variant: 'secondary' as const,
            disabled: false,
            icon: 'refresh'
          },
          {
            label: 'Add More Items',
            onClick: () => setCurrentStep(2),
            variant: 'tertiary' as const,
            disabled: false,
            icon: 'plus'
          }
        ];

      default:
        return [];
    }
  };

  const getActionButtonClasses = (variant: 'primary' | 'secondary' | 'tertiary', disabled: boolean) => {
    const baseClasses = "flex items-center space-x-2 px-4 py-2 rounded-lg font-medium text-sm transition-all duration-200";

    if (disabled) {
      return `${baseClasses} bg-gray-100 text-gray-400 cursor-not-allowed`;
    }

    switch (variant) {
      case 'primary':
        return `${baseClasses} bg-blue-600 text-white hover:bg-blue-700 shadow-sm hover:shadow-md`;
      case 'secondary':
        return `${baseClasses} bg-gray-100 text-gray-700 hover:bg-gray-200 border border-gray-300`;
      case 'tertiary':
        return `${baseClasses} text-blue-600 hover:text-blue-700 hover:bg-blue-50`;
      default:
        return baseClasses;
    }
  };

  const getActionIcon = (iconType: string) => {
    const iconClasses = "w-4 h-4";

    switch (iconType) {
      case 'arrow-right':
        return (
          <svg className={iconClasses} fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M10.293 3.293a1 1 0 011.414 0l6 6a1 1 0 010 1.414l-6 6a1 1 0 01-1.414-1.414L14.586 11H3a1 1 0 110-2h11.586l-4.293-4.293a1 1 0 010-1.414z" clipRule="evenodd" />
          </svg>
        );
      case 'arrow-left':
        return (
          <svg className={iconClasses} fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M9.707 16.707a1 1 0 01-1.414 0l-6-6a1 1 0 010-1.414l6-6a1 1 0 011.414 1.414L5.414 9H17a1 1 0 110 2H5.414l4.293 4.293a1 1 0 010 1.414z" clipRule="evenodd" />
          </svg>
        );
      case 'download':
        return (
          <svg className={iconClasses} fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M3 17a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm3.293-7.707a1 1 0 011.414 0L9 10.586V3a1 1 0 112 0v7.586l1.293-1.293a1 1 0 111.414 1.414l-3 3a1 1 0 01-1.414 0l-3-3a1 1 0 010-1.414z" clipRule="evenodd" />
          </svg>
        );
      case 'document':
        return (
          <svg className={iconClasses} fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M4 4a2 2 0 012-2h4.586A2 2 0 0112 2.586L15.414 6A2 2 0 0116 7.414V16a2 2 0 01-2 2H6a2 2 0 01-2-2V4z" clipRule="evenodd" />
          </svg>
        );
      case 'save':
        return (
          <svg className={iconClasses} fill="currentColor" viewBox="0 0 20 20">
            <path d="M7.707 10.293a1 1 0 10-1.414 1.414l3 3a1 1 0 001.414 0l3-3a1 1 0 00-1.414-1.414L11 11.586V6h5a2 2 0 012 2v8a2 2 0 01-2 2H4a2 2 0 01-2-2V8a2 2 0 012-2h5v5.586l-1.293-1.293zM9 4a1 1 0 012 0v2H9V4z" />
          </svg>
        );
      case 'plus':
        return (
          <svg className={iconClasses} fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z" clipRule="evenodd" />
          </svg>
        );
      case 'refresh':
        return (
          <svg className={iconClasses} fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M4 2a1 1 0 011 1v2.101a7.002 7.002 0 0111.601 2.566 1 1 0 11-1.885.666A5.002 5.002 0 005.999 7H9a1 1 0 010 2H4a1 1 0 01-1-1V3a1 1 0 011-1zm.008 9.057a1 1 0 011.276.61A5.002 5.002 0 0014.001 13H11a1 1 0 110-2h5a1 1 0 011 1v5a1 1 0 11-2 0v-2.101a7.002 7.002 0 01-11.601-2.566 1 1 0 01.61-1.276z" clipRule="evenodd" />
          </svg>
        );
      case 'loading':
        return (
          <div className={`${iconClasses} animate-spin`}>
            <svg fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z"></path>
            </svg>
          </div>
        );
      default:
        return null;
    }
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
      // Generate quote number if this is the first item
      if (selectedItems.length === 0 && !quoteNumber) {
        setQuoteNumber(generateQuoteNumber());
      }

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
    // Generate quote number if this is the first items being added
    if (selectedItems.length === 0 && !quoteNumber) {
      setQuoteNumber(generateQuoteNumber());
    }

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
      const newItems = selectedItems.filter((_, i) => i !== index);
      setSelectedItems(newItems);

      // Clear quote number if no items left
      if (newItems.length === 0) {
        setQuoteNumber('');
      }
      return;
    }

    const updated = [...selectedItems];
    updated[index].quantity = quantity;
    updated[index].totalPrice = quantity * updated[index].unitPrice;
    setSelectedItems(updated);
  };

  // Sidebar-specific quantity update function
  const updateQuantityById = (equipmentId: number, quantity: number) => {
    const index = selectedItems.findIndex(item => item.equipment.id === equipmentId);
    if (index >= 0) {
      updateQuantity(index, quantity);
    }
  };

  // Sidebar-specific remove function
  const removeItemById = (equipmentId: number) => {
    const index = selectedItems.findIndex(item => item.equipment.id === equipmentId);
    if (index >= 0) {
      updateQuantity(index, 0);
    }
  };

  // Toggle sidebar expansion
  const toggleSidebar = () => {
    setSidebarExpanded(!sidebarExpanded);
  };

  const subtotal = selectedItems.reduce((sum, item) => sum + item.totalPrice, 0);
  const gstAmount = subtotal * formulas.gstRate;
  const total = subtotal + gstAmount;

  const handleExportPDF = () => {
    exportToPDF(quoteNumber, clientInfo, selectedItems, subtotal, gstAmount, total, companySettings);
  };

  const handleExportExcel = () => {
    exportToExcel(quoteNumber, clientInfo, selectedItems, subtotal, gstAmount, total, companySettings);
  };

  const handleExportCSV = () => {
    exportToCSV(quoteNumber, clientInfo, selectedItems, subtotal, gstAmount, total, companySettings);
  };

  return (
    <div className={`min-h-screen ${showSidebar ? (sidebarExpanded ? 'lg:pr-96 pr-0' : 'lg:pr-16 pr-0') : ''} transition-all duration-300`}>
      {/* Quote Preview Sidebar */}
      <QuotePreviewSidebar
        selectedItems={selectedItems}
        total={total}
        isExpanded={sidebarExpanded}
        isVisible={showSidebar}
        onToggle={toggleSidebar}
        onRemoveItem={removeItemById}
        onQuantityChange={updateQuantityById}
        gstRate={formulas.gstRate}
        materialMarkup={formulas.materialMarkup}
      />

      <div className="space-y-6 p-4">
      {/* Step Progress Indicator */}
      <div className="sticky top-0 z-10 bg-white shadow-sm">
        <StepIndicator
          currentStep={currentStep}
          onStepClick={handleStepClick}
          getStepStatus={getStepStatus}
        />
      </div>

      {/* Contextual Actions Bar */}
      <div className="bg-white p-4 rounded-lg shadow border-l-4 border-blue-500">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
              <span className="text-blue-600 font-semibold text-sm">{currentStep}</span>
            </div>
            <div>
              <h3 className="font-medium text-gray-900">
                {currentStep === 1 && 'Complete Client Information'}
                {currentStep === 2 && 'Select Equipment & Export Quote'}
                {currentStep === 3 && 'Quote Complete!'}
              </h3>
              <p className="text-sm text-gray-600">
                {currentStep === 1 && 'Fill in your client details to continue'}
                {currentStep === 2 && 'Add equipment items and export when ready - see live preview in sidebar'}
                {currentStep === 3 && 'Your quote has been exported successfully'}
              </p>
            </div>
          </div>
          <div className="flex items-center space-x-3">
            {getContextualActions().map((action, index) => (
              <button
                key={index}
                onClick={action.onClick}
                disabled={action.disabled}
                className={getActionButtonClasses(action.variant, action.disabled)}
              >
                {getActionIcon(action.icon)}
                <span>{action.label}</span>
              </button>
            ))}
          </div>
        </div>
      </div>

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
      <CollapsibleSection
        title="Client Information"
        step={1}
        currentStep={currentStep}
        isCompleted={isClientComplete()}
        completionSummary={getClientSummary()}
        stepStatus={getStepStatus(1)}
        onEdit={() => setCurrentStep(1)}
      >
        {savedClients.length > 0 && (
          <div className="flex items-center justify-end mb-4">
            <button
              onClick={() => setShowClientSuggestions(!showClientSuggestions)}
              className="text-sm text-primary-600 hover:text-primary-700 flex items-center space-x-1"
            >
              <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M8 4a4 4 0 100 8 4 4 0 000-8zM2 8a6 6 0 1110.89 3.476l4.817 4.817a1 1 0 01-1.414 1.414l-4.816-4.816A6 6 0 012 8z" clipRule="evenodd" />
              </svg>
              <span>Recent Clients ({savedClients.length})</span>
            </button>
          </div>
        )}

        {/* Client Suggestions */}
        {showClientSuggestions && savedClients.length > 0 && (
          <div className="mb-4 bg-gray-50 border border-gray-200 rounded-lg p-3">
            <h3 className="text-sm font-medium text-gray-700 mb-2">Recent Clients</h3>
            <div className="space-y-2 max-h-40 overflow-y-auto">
              {savedClients.slice(0, 10).map((client) => (
                <div
                  key={client.id}
                  onClick={(e) => {
                    console.log('Recent Client clicked!', client.name);
                    e.preventDefault();
                    e.stopPropagation();
                    fillClientForm(client);
                  }}
                  className="w-full text-left p-2 hover:bg-white border border-transparent hover:border-gray-200 rounded text-sm cursor-pointer"
                  role="button"
                  tabIndex={0}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' || e.key === ' ') {
                      e.preventDefault();
                      fillClientForm(client);
                    }
                  }}
                >
                  <div className="font-medium">{client.name}</div>
                  <div className="text-gray-500 text-xs">
                    {client.address ? `${client.address}, ${client.suburb} ${client.state}` : 'No address'}
                  </div>
                  <div className="text-gray-400 text-xs">
                    Used {client.useCount} times • Last: {client.lastUsed.toLocaleDateString()}
                  </div>
                </div>
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
                console.log('onChange:', { newValue, length: newValue.length, savedClientsCount: savedClients.length, shouldShow: newValue.length >= 2 && savedClients.length > 0 });
                if (newValue.length >= 2 && savedClients.length > 0) {
                  console.log('Setting showClientSuggestions to TRUE');
                  setShowClientSuggestions(true);
                } else {
                  console.log('Setting showClientSuggestions to FALSE');
                  setShowClientSuggestions(false);
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
            {(() => {
              const suggestions = getClientSuggestions(clientInfo.name);
              console.log('Dropdown condition check:', {
                showClientSuggestions,
                nameLength: clientInfo.name.length,
                suggestionsCount: suggestions.length,
                shouldShow: showClientSuggestions && clientInfo.name.length >= 2 && suggestions.length > 0
              });
              return showClientSuggestions && clientInfo.name.length >= 2 && suggestions.length > 0;
            })() && (
              <div className="absolute z-10 w-full mt-1 bg-white border border-gray-200 rounded-md shadow-lg">
                {getClientSuggestions(clientInfo.name).map((client) => (
                  <button
                    key={client.id}
                    onClick={(e) => {
                      console.log('Live search client clicked!', client.name); // Debug: Live search click
                      e.preventDefault();
                      e.stopPropagation();
                      fillClientForm(client);
                    }}
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
      </CollapsibleSection>

      {/* Equipment & Bundle Selection */}
      <CollapsibleSection
        title="Equipment Selection"
        step={2}
        currentStep={currentStep}
        isCompleted={isEquipmentComplete()}
        completionSummary={getEquipmentSummary()}
        stepStatus={getStepStatus(2)}
        onEdit={() => setCurrentStep(2)}
      >
        {/* Bundle Selection */}
        <div className="mb-6">
          <BundleSelector
            equipment={equipment}
            onAddBundle={addBundleToQuote}
            onPreviewBundle={handlePreviewBundle}
          />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Individual Equipment Selection */}
          <div className="bg-white p-4 rounded-lg border border-gray-200">
            <h3 className="text-md font-semibold mb-4">Individual Equipment</h3>

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
            <EmptyState
              icon="exclamation"
              title="No Equipment Found"
              description="No equipment matches your current filters. Try adjusting your search or clearing filters."
              actions={[
                {
                  label: "Clear All Filters",
                  onClick: () => {
                    setSearchTerm('');
                    setSelectedCategory('all');
                    setShowFavoritesOnly(false);
                  },
                  variant: 'primary'
                }
              ]}
            />
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
      </div>
      </CollapsibleSection>


      {/* Bundle Preview Modal */}
      <BundlePreviewModal
        bundle={previewBundle}
        equipment={equipment}
        isOpen={previewBundle !== null}
        onClose={() => setPreviewBundle(null)}
        onAddBundle={addBundleToQuote}
      />
      </div>
    </div>
  );
};

export default QuoteBuilder;