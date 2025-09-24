import '@testing-library/jest-dom'

// Mock localStorage
const localStorageMock = {
  getItem: vi.fn(),
  setItem: vi.fn(),
  removeItem: vi.fn(),
  clear: vi.fn(),
}

Object.defineProperty(window, 'localStorage', {
  value: localStorageMock,
})

// Mock URL.createObjectURL for file downloads
Object.defineProperty(window.URL, 'createObjectURL', {
  value: vi.fn(() => 'mocked-url'),
})

Object.defineProperty(window.URL, 'revokeObjectURL', {
  value: vi.fn(),
})

// Mock window.open for PDF exports
Object.defineProperty(window, 'open', {
  value: vi.fn(),
})

// Reset all mocks before each test
beforeEach(() => {
  vi.clearAllMocks()
  localStorageMock.getItem.mockReturnValue(null)
})