export interface Equipment {
  id: number;
  name: string;
  category: string;
  basePrice: number;
  unit: string;
  description: string;
}

export interface Category {
  id: number;
  name: string;
  description: string;
}

export interface QuoteItem {
  equipment: Equipment;
  quantity: number;
  unitPrice: number;
  totalPrice: number;
}

export interface Quote {
  id: string;
  clientInfo: ClientInfo;
  items: QuoteItem[];
  subtotal: number;
  gst: number;
  total: number;
  createdAt: Date;
  validUntil: Date;
}

export interface ClientInfo {
  name: string;
  abn?: string;
  address: string;
  suburb: string;
  state: string;
  postcode: string;
  contactPerson: string;
  email: string;
  phone: string;
}

export interface Formulas {
  gstRate: number;
  materialMarkup: number;
  laborRate: number;
  overheads: number;
}

export interface BundleItem {
  equipmentId: number;
  quantity: number;
  notes?: string;
}

export interface EquipmentBundle {
  id: string;
  name: string;
  description: string;
  category: 'residential' | 'commercial' | 'industrial' | 'specialty';
  items: BundleItem[];
  totalBasePrice: number;
  isCustom: boolean;
  createdAt: string;
  usageCount: number;
}

export interface CompanyAddress {
  street: string;
  suburb: string;
  state: string;
  postcode: string;
  country: string;
}

export interface BankDetails {
  accountName: string;
  bsb: string;
  accountNumber: string;
}

export interface CompanySettings {
  companyName: string;
  tradingName?: string;
  abn?: string;
  address: CompanyAddress;
  phone: string;
  email: string;
  website?: string;
  logoUrl?: string;
  primaryColor?: string;
  termsAndConditions: string;
  paymentTerms: string;
  validityPeriod: number;
  footerText: string;
  bankDetails?: BankDetails;
  lastUpdated: string;
  version: number;
  isConfigured: boolean;
}