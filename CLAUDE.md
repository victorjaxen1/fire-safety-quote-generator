# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

This repository contains a **Fire Safety Quote Generator** - a modern React TypeScript web application that replaces an Excel-based quote generation system. The app generates professional quotes for fire safety equipment with Australian business compliance (GST, ABN, etc.).

## Commands

### Development
```bash
npm install          # Install dependencies
npm run dev         # Start development server (http://localhost:5173)
npm run build       # Build for production
npm run preview     # Preview production build
npm run lint        # Run TypeScript linting
```

### Testing
```bash
npm test          # Run tests in watch mode
npm run test:run  # Run tests once
npm run test:ui   # Run tests with UI
npm run test:coverage  # Run tests with coverage report
```

**Testing Stack:**
- **Vitest**: Fast test runner with native ESM support
- **@testing-library/react**: React component testing utilities
- **jsdom**: Browser environment simulation
- **Coverage**: Istanbul/v8 coverage reports

**Test Organization:**
- `src/test/setup.ts`: Test environment configuration and mocks
- `src/test/utils.tsx`: Shared test utilities and mock data
- `*.test.tsx`: Component test files organized by feature

### Deployment
- **Live App**: https://github.com/victorjaxen1/fire-safety-quote-generator (deployed on Netlify)
- **Auto-deployment**: Push to GitHub main branch triggers automatic Netlify rebuild
- **Build Output**: `dist/` directory

## Architecture

### High-Level Structure
- **Frontend**: React 18 + TypeScript + Vite build system
- **Styling**: Tailwind CSS for responsive design
- **Data**: JSON files (no database) - equipment, formulas, categories
- **Exports**: Client-side PDF (jsPDF), Excel (SheetJS), CSV generation
- **Deployment**: Static hosting on Netlify with automatic CI/CD

### Key Components
- `QuoteBuilder.tsx` - Main quote creation interface with bundles, real-time calculations, and draft management
- `AdminPanel.tsx` - Equipment management, pricing, bundles, and company settings configuration
- `BundleSelector.tsx` - Smart equipment bundles with category filtering and preview modals
- `CompanySettingsForm.tsx` - Professional company configuration with Australian formatting
- `exportUtils.ts` - Professional PDF/Excel/CSV export with branding and dedicated terms pages
- `types/index.ts` - TypeScript interfaces for Equipment, Quote, Client, Bundle, and Company data

### State Management
- Uses React `useState` hooks throughout (no Redux/Zustand)
- Equipment data loaded from JSON files at component mount
- Client quote data stored temporarily in component state
- Admin panel changes persist in localStorage only (session-based)
- No global state management - data flows via props

### Data Flow
1. **Equipment Data** (`src/data/equipment.json`) - 78+ fire safety items with base prices
2. **Pricing Formulas** (`src/data/formulas.json`) - Material markup (1.5x), GST (10%), labor rates
3. **Categories** (`src/data/categories.json`) - Equipment categorization for filtering
4. **Bundle Data** (`src/data/bundles.json`) - Pre-configured equipment combinations for common scenarios
5. **Company Settings** (`localStorage`) - Professional branding and business configuration
6. **Real-time Calculations** - Live price updates as user selects equipment or bundles
7. **Export Generation** - Professional quotes with company branding and dedicated terms pages

### Application Structure
```
├── src/
│   ├── components/          # React components
│   │   ├── QuoteBuilder.tsx # Main quote interface with bundles
│   │   ├── AdminPanel.tsx   # Equipment and company management
│   │   ├── BundleSelector.tsx # Smart equipment bundles
│   │   ├── BundlePreviewModal.tsx # Bundle details and customization
│   │   └── CompanySettingsForm.tsx # Professional company configuration
│   ├── data/               # Static JSON data
│   │   ├── equipment.json  # Equipment catalog (78+ items)
│   │   ├── formulas.json   # Pricing formulas and rates
│   │   ├── categories.json # Equipment categorization
│   │   └── bundles.json    # Pre-configured equipment bundles
│   ├── test/               # Test configuration and utilities
│   │   ├── setup.ts        # Test environment setup
│   │   └── utils.tsx       # Test utilities and mocks
│   ├── types/
│   │   └── index.ts        # TypeScript definitions
│   ├── utils/
│   │   └── exportUtils.ts  # PDF/Excel/CSV exports
│   ├── App.tsx             # Main app with routing
│   └── main.tsx            # React app entry point
├── index.html              # HTML template
├── netlify.toml            # Netlify deployment config
├── vite.config.ts          # Vite build configuration
├── tsconfig.json           # TypeScript configuration
└── package.json            # Dependencies and scripts
```

## Equipment Management

### Data Structure
```typescript
interface Equipment {
  id: number;
  name: string;
  category: string;
  basePrice: number;
  unit: string;
  description: string;
}
```

### Price Updates
- Admin panel allows click-to-edit pricing (double-click price values)
- Material markup automatically applied (configurable via formulas.json)
- Changes persist in localStorage for session only (not permanent)
- Export data backup functionality included (JSON download)
- Formula configuration: GST rate (10%), material markup (1.5x), labor rate ($150/hour), overheads (15%)

## Australian Business Compliance

### Required Features
- **GST Calculation**: Automatic 10% GST on quotes
- **ABN Field**: Optional Australian Business Number capture
- **Address Format**: Australian states/territories dropdown
- **Currency**: AUD formatting throughout
- **Quote Numbering**: Format `QT-YYYYMMDD-XXX` with date and random suffix

### Export Formats
- **PDF**: Professional quote layout with branded headers, company information, and dedicated terms page
- **Excel**: Structured spreadsheet with company details and formulas intact
- **CSV**: Simple data format for external systems integration

## Development Notes

### Key Design Decisions
- **Client-side only**: No backend required, perfect for small business use
- **localStorage**: Temporary quote storage (no permanent database)
- **Component-based**: Modular React architecture for easy maintenance
- **TypeScript**: Full type safety for reliability

### Performance Optimizations
- **Real-time search**: Debounced equipment filtering
- **Live calculations**: Instant price updates without page refresh
- **Lazy loading**: Efficient rendering of large equipment lists
- **Build optimization**: Vite bundler with tree-shaking

### Migration from Excel
- Original Excel data extracted and structured in JSON format
- Maintains existing pricing formulas and business logic
- Improves speed and consistency over manual Excel workflow
- Eliminates manual calculation errors and formula corruption

## Troubleshooting

### Common Build Issues
- **TypeScript errors**: Ensure all imports are used, remove unused React imports
- **Missing dependencies**: Run `npm install` in root directory
- **Netlify build fails**: Check build logs, verify Node.js version compatibility (requires Node 18+)
- **Vite dev server issues**: Default port 5173, check for conflicts
- **ESLint warnings**: Use `npm run lint` to check TypeScript issues before building

### Export Problems
- **PDF generation**: Requires modern browser, check jsPDF compatibility
- **Excel export**: Uses SheetJS library, verify XLSX import
- **File downloads**: Browser may block downloads, check download settings

## Directory Structure Notes

- **Root directory**: Contains the main app files for Netlify deployment
- **Legacy files**: Old JSON files in root (equipment.json, formulas.json, categories.json) are kept for reference
- **Active data**: All application data is in `src/data/` directory
- **Development**: Work directly in the root directory
- **Deployment**: Netlify builds from root using `netlify.toml` config

## Deployment Best Practices

### **Netlify Configuration**
- App files MUST be in root directory for Netlify auto-deployment
- `netlify.toml` must be in root with correct build settings
- Build command: `npm run build` (Vite only, not `tsc && vite build`)
- Publish directory: `dist`
- Node version: 18+ (specified in netlify.toml)

### **TypeScript & Testing Setup**
- **Production Build**: Exclude test files to avoid compilation errors
- **Test Files**: Use `.test.tsx` or `.spec.tsx` extensions
- **Vitest Globals**: Always import `vi`, `beforeEach` etc. from 'vitest'
- **Build Process**: Use Vite-only build for simplicity
- **Config Files**:
  - `tsconfig.json` - excludes test files from compilation
  - `vite.config.ts` - excludes test files from bundle with rollupOptions

### **Common Deployment Issues & Solutions**

**Issue**: Netlify build fails with "All files already uploaded"
**Solution**: Files are in subdirectory - move app to root directory

**Issue**: TypeScript errors on test files during build
**Solution**: Exclude test files in tsconfig.json and vite.config.ts

**Issue**: "vi is not defined" in test setup
**Solution**: Import `vi`, `beforeEach` from 'vitest' explicitly

**Issue**: Build command fails with `tsc && vite build`
**Solution**: Use `vite build` only - Vite has TypeScript support built-in

## Recent Major Updates (Session Summary)

### **Latest Business-Critical Improvements (Current Session)**
1. **Smart Equipment Bundles System**
   - 6 pre-configured equipment bundles for common fire safety scenarios
   - Bundle categories: Residential, Commercial, Industrial, Specialty
   - One-click bundle addition to quotes (replaces 10+ individual selections)
   - Custom quantity adjustment within bundle preview
   - Usage statistics tracking and bundle management in AdminPanel
   - Revolutionary efficiency improvement: 5-minute quotes reduced to 30 seconds

2. **Professional Company Branding System**
   - Complete company settings configuration with Australian address formatting
   - Replaces all placeholder text in PDF/Excel/CSV exports
   - Professional quote presentation with real company information
   - Configurable validity periods, payment terms, and custom T&C
   - Tabbed AdminPanel interface with company settings as primary tab

3. **Premium PDF Output Quality**
   - Complete PDF generation redesign with professional styling
   - Branded header with company colors and professional typography
   - Structured table format with alternating row colors
   - Enhanced visual hierarchy and commercial-quality appearance
   - **Dedicated Terms & Conditions Page**: Always on final page with professional legal document formatting
   - Multi-page terms support with proper text wrapping and clause emphasis

### **Previous UX Improvements**
1. **Category Filtering System**
   - 6 meaningful equipment categories (Control Panels, Detection Devices, etc.)
   - Automatic categorization of 78+ equipment items
   - Combined category + text search functionality
   - Live item count display per category

2. **Equipment Favorites System**
   - Star/unstar equipment with localStorage persistence
   - "Show favorites only" filtering toggle
   - Favorites sorted to top of equipment list
   - Visual highlighting for favorite items

3. **Auto-save Draft Functionality**
   - Automatic saving every 2 seconds after changes
   - Visual save status indicators ("Saving..." / "Saved")
   - Draft restoration banner on page reload
   - 24-hour draft expiry with age validation
   - Clear draft on successful export

4. **Client Information Persistence**
   - Save and recall client information with usage tracking
   - Live search suggestions while typing
   - "Recent Clients" management system
   - Auto-fill forms from saved client data
   - Maximum 100 clients with LRU eviction

### **Technical Infrastructure Added**
- **Bundle System**: Complete TypeScript interfaces and data structures
- **Company Settings**: Comprehensive configuration system with localStorage persistence
- **Professional PDF Generation**: jsPDF with advanced styling, colors, and layout
- **Comprehensive Testing**: 60+ tests with Vitest & React Testing Library
- **Mock Strategy**: Complete localStorage, file download, and timer mocking
- **Error Handling**: Graceful degradation for storage failures
- **Performance**: Debounced operations, efficient filtering algorithms
- **Code Organization**: Feature-based test separation with shared utilities

### **Development Lessons Learned**

**Critical Implementation Patterns (From Current Session)**:
- **Atomic State Updates**: When adding multiple items to React state, use single `setState()` with spread syntax to prevent batching issues
  ```typescript
  // CORRECT: Atomic update
  setSelectedItems(prevItems => [...prevItems, ...newItems]);

  // WRONG: Multiple calls get batched incorrectly
  newItems.forEach(item => addItem(item));
  ```
- **Large Function Edits**: When editing very large functions (like PDF generation), create new file and replace original rather than string replacement
- **PDF Layout Management**: Always use `doc.addPage()` for dedicated sections like Terms & Conditions to ensure professional document structure
- **Company Configuration Priority**: Make company settings the primary tab in admin interfaces - professional branding is business-critical

**React State Management**:
- Bundle addition requires atomic state updates to prevent React batching issues
- Use functional state updates with spread operators for complex array manipulations
- Test state changes immediately after implementation to catch batching problems

**PDF Generation Best Practices**:
- Use professional color schemes and typography for business documents
- Implement alternating table row colors for readability
- Create dedicated pages for legal content (Terms & Conditions)
- Support multi-page content with proper text wrapping
- Always include branded headers on new pages for consistency

**Project Structure**:
- Keep app files in root for Netlify deployment
- Use consistent naming for test files
- Separate test utilities from production code
- Organize bundle and company data in logical JSON structures

**Build Configuration**:
- Exclude test files from production builds
- Use Vite-only builds for simplicity
- Configure proper TypeScript paths

**Testing Best Practices**:
- Import Vitest globals explicitly
- Mock all external dependencies (localStorage, DOM APIs)
- Use feature-based test file organization
- Test error scenarios and edge cases

**Git & Deployment**:
- Always test build process before pushing
- Use meaningful commit messages with feature summaries
- Verify Netlify configuration matches directory structure
- Test major features immediately after deployment to catch integration issues

## Future Enhancements

The codebase is structured to support:
- User authentication system
- Cloud data synchronization
- Quote history tracking
- Customer database integration
- Multi-user collaboration
- Advanced reporting features

## Quick Troubleshooting

**Build Fails**: Check if test files are excluded in both tsconfig.json and vite.config.ts
**Features Not Deployed**: Verify app files are in root directory, not subdirectory
**localStorage Errors**: Check mock setup in test configuration
**TypeScript Errors**: Ensure all imports are properly typed and used