import React from 'react'
import { render } from '@testing-library/react'
import type { RenderOptions } from '@testing-library/react'

// Custom render function that includes any providers
const customRender = (
  ui: React.ReactElement,
  options?: Omit<RenderOptions, 'wrapper'>
) => render(ui, options)

// Re-export everything
export * from '@testing-library/react'
export { customRender as render }

// Mock data for tests
export const mockEquipment = [
  {
    id: 1,
    name: "Fire Indicator Panel",
    category: "Control Panels",
    basePrice: 2500,
    unit: "each",
    description: "Fire safety equipment: Fire Indicator Panel"
  },
  {
    id: 2,
    name: "Smoke Detectors",
    category: "Detection Devices",
    basePrice: 120,
    unit: "each",
    description: "Fire safety equipment: Smoke Detectors"
  },
  {
    id: 3,
    name: "Manual Call Points",
    category: "Manual Devices",
    basePrice: 65,
    unit: "each",
    description: "Fire safety equipment: Manual Call Points"
  }
]

export const mockCategories = [
  {
    id: 1,
    name: "Control Panels",
    description: "Fire indicator panels and control systems"
  },
  {
    id: 2,
    name: "Detection Devices",
    description: "Smoke detectors, heat detectors and bases"
  },
  {
    id: 3,
    name: "Manual Devices",
    description: "Manual call points and break glass units"
  }
]

export const mockFormulas = {
  gstRate: 0.1,
  materialMarkup: 1.5,
  laborRate: 150,
  overheads: 0.15
}

export const mockClientInfo = {
  name: "Test Company",
  abn: "12345678901",
  address: "123 Test St",
  suburb: "Test Suburb",
  state: "NSW",
  postcode: "2000",
  contactPerson: "John Doe",
  email: "john@test.com",
  phone: "0400000000"
}