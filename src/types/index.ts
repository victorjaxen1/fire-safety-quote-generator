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