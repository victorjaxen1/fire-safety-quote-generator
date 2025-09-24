import React, { useState, useEffect } from 'react';
import { CompanySettings, CompanyAddress } from '../types/index';

interface CompanySettingsFormProps {
  settings: CompanySettings;
  onSave: (settings: CompanySettings) => void;
  onCancel?: () => void;
}

const defaultSettings: CompanySettings = {
  companyName: '',
  tradingName: '',
  abn: '',
  address: {
    street: '',
    suburb: '',
    state: 'NSW',
    postcode: '',
    country: 'Australia'
  },
  phone: '',
  email: '',
  website: '',
  logoUrl: '',
  primaryColor: '#1f2937',
  termsAndConditions: `TERMS & CONDITIONS

1. Payment is due within 30 days of invoice date unless otherwise agreed in writing.

2. All work will be carried out in accordance with relevant Australian Standards and Building Codes.

3. This quotation is valid for 30 days from the date shown above.

4. Prices include GST where applicable.

5. Any variations to the scope of work may incur additional charges.

6. Installation work requires safe access to all areas. Additional charges may apply for difficult access.

7. Client is responsible for obtaining any required permits or approvals.

8. Equipment warranty as per manufacturer specifications.`,
  paymentTerms: 'Net 30 days',
  validityPeriod: 30,
  footerText: 'Thank you for your business',
  lastUpdated: '',
  version: 1,
  isConfigured: false
};

const CompanySettingsForm: React.FC<CompanySettingsFormProps> = ({
  settings,
  onSave,
  onCancel
}) => {
  const [formData, setFormData] = useState<CompanySettings>(settings.companyName ? settings : defaultSettings);
  const [hasChanges, setHasChanges] = useState(false);

  useEffect(() => {
    setFormData(settings.companyName ? settings : defaultSettings);
  }, [settings]);

  const handleInputChange = (field: string, value: string | number) => {
    setFormData(prev => {
      const updated = { ...prev };

      if (field.includes('.')) {
        const [parent, child] = field.split('.');
        updated[parent as keyof CompanySettings] = {
          ...(updated[parent as keyof CompanySettings] as any),
          [child]: value
        };
      } else {
        (updated as any)[field] = value;
      }

      return updated;
    });
    setHasChanges(true);
  };

  const handleSave = () => {
    const updatedSettings: CompanySettings = {
      ...formData,
      lastUpdated: new Date().toISOString(),
      version: (formData.version || 0) + 1,
      isConfigured: isFormComplete(formData)
    };

    onSave(updatedSettings);
    setHasChanges(false);
  };

  const isFormComplete = (data: CompanySettings): boolean => {
    return !!(
      data.companyName &&
      data.address.street &&
      data.address.suburb &&
      data.phone &&
      data.email
    );
  };

  const australianStates = [
    { code: 'NSW', name: 'New South Wales' },
    { code: 'VIC', name: 'Victoria' },
    { code: 'QLD', name: 'Queensland' },
    { code: 'WA', name: 'Western Australia' },
    { code: 'SA', name: 'South Australia' },
    { code: 'TAS', name: 'Tasmania' },
    { code: 'ACT', name: 'Australian Capital Territory' },
    { code: 'NT', name: 'Northern Territory' }
  ];

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
      {/* Header */}
      <div className="bg-gradient-to-r from-indigo-50 to-blue-50 p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="bg-indigo-100 p-2 rounded-lg">
              <span className="text-indigo-600 text-xl">🏢</span>
            </div>
            <div>
              <h2 className="text-lg font-semibold text-gray-900">Company Settings</h2>
              <p className="text-sm text-gray-600">
                Configure your business information for professional quotes
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            {formData.isConfigured ? (
              <span className="bg-green-100 text-green-800 px-2 py-1 rounded-full text-xs font-medium">
                Configured
              </span>
            ) : (
              <span className="bg-yellow-100 text-yellow-800 px-2 py-1 rounded-full text-xs font-medium">
                Setup Required
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Form Content */}
      <div className="p-6 space-y-8">
        {/* Basic Information */}
        <div>
          <h3 className="text-md font-semibold text-gray-900 mb-4">Basic Information</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Company Name <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={formData.companyName}
                onChange={(e) => handleInputChange('companyName', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Your Fire Safety Company Pty Ltd"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Trading Name
              </label>
              <input
                type="text"
                value={formData.tradingName || ''}
                onChange={(e) => handleInputChange('tradingName', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Fire Safety Solutions"
              />
            </div>
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                ABN (Australian Business Number)
              </label>
              <input
                type="text"
                value={formData.abn || ''}
                onChange={(e) => handleInputChange('abn', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="12 345 678 901"
              />
            </div>
          </div>
        </div>

        {/* Address */}
        <div>
          <h3 className="text-md font-semibold text-gray-900 mb-4">Business Address</h3>
          <div className="grid grid-cols-1 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Street Address <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={formData.address.street}
                onChange={(e) => handleInputChange('address.street', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="123 Business Street"
              />
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Suburb <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={formData.address.suburb}
                  onChange={(e) => handleInputChange('address.suburb', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Sydney"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  State
                </label>
                <select
                  value={formData.address.state}
                  onChange={(e) => handleInputChange('address.state', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  {australianStates.map(state => (
                    <option key={state.code} value={state.code}>
                      {state.code} - {state.name}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Postcode
                </label>
                <input
                  type="text"
                  value={formData.address.postcode}
                  onChange={(e) => handleInputChange('address.postcode', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="2000"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Contact Information */}
        <div>
          <h3 className="text-md font-semibold text-gray-900 mb-4">Contact Information</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Phone <span className="text-red-500">*</span>
              </label>
              <input
                type="tel"
                value={formData.phone}
                onChange={(e) => handleInputChange('phone', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="(02) 1234 5678"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Email <span className="text-red-500">*</span>
              </label>
              <input
                type="email"
                value={formData.email}
                onChange={(e) => handleInputChange('email', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="info@yourcompany.com.au"
              />
            </div>
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Website
              </label>
              <input
                type="url"
                value={formData.website || ''}
                onChange={(e) => handleInputChange('website', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="https://www.yourcompany.com.au"
              />
            </div>
          </div>
        </div>

        {/* Quote Terms */}
        <div>
          <h3 className="text-md font-semibold text-gray-900 mb-4">Quote Terms</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Payment Terms
              </label>
              <select
                value={formData.paymentTerms}
                onChange={(e) => handleInputChange('paymentTerms', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="Net 7 days">Net 7 days</option>
                <option value="Net 14 days">Net 14 days</option>
                <option value="Net 30 days">Net 30 days</option>
                <option value="Due on receipt">Due on receipt</option>
                <option value="50% deposit, balance on completion">50% deposit, balance on completion</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Quote Valid For (days)
              </label>
              <input
                type="number"
                min="1"
                max="365"
                value={formData.validityPeriod}
                onChange={(e) => handleInputChange('validityPeriod', parseInt(e.target.value) || 30)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Terms & Conditions
            </label>
            <textarea
              value={formData.termsAndConditions}
              onChange={(e) => handleInputChange('termsAndConditions', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              rows={12}
              placeholder="Enter your standard terms and conditions..."
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Footer Text
            </label>
            <input
              type="text"
              value={formData.footerText}
              onChange={(e) => handleInputChange('footerText', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Thank you for your business"
            />
          </div>
        </div>

        {/* Actions */}
        <div className="flex justify-end gap-3 pt-6 border-t border-gray-200">
          {onCancel && (
            <button
              onClick={onCancel}
              className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50 transition-colors"
            >
              Cancel
            </button>
          )}
          <button
            onClick={handleSave}
            disabled={!hasChanges}
            className={`px-6 py-2 rounded-md text-white transition-colors ${
              hasChanges
                ? 'bg-blue-600 hover:bg-blue-700'
                : 'bg-gray-400 cursor-not-allowed'
            }`}
          >
            {hasChanges ? 'Save Settings' : 'No Changes'}
          </button>
        </div>

        {!isFormComplete(formData) && (
          <div className="bg-yellow-50 border border-yellow-200 rounded-md p-4">
            <div className="flex">
              <div className="flex-shrink-0">
                <span className="text-yellow-400 text-lg">⚠️</span>
              </div>
              <div className="ml-3">
                <h3 className="text-sm font-medium text-yellow-800">
                  Complete Required Fields
                </h3>
                <div className="mt-2 text-sm text-yellow-700">
                  <p>Please fill in all required fields (*) to enable professional quote generation.</p>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default CompanySettingsForm;