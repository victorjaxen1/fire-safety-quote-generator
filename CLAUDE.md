# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

This repository contains a **Fire Safety Quote Generator** - a modern React TypeScript web application that replaces an Excel-based quote generation system. The app generates professional quotes for fire safety equipment with Australian business compliance (GST, ABN, etc.).

## Commands

### Development
```bash
cd fire-quote-app
npm install          # Install dependencies
npm run dev         # Start development server (http://localhost:3000)
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
- **Build Output**: `fire-quote-app/dist/` directory

## Architecture

### High-Level Structure
- **Frontend**: React 18 + TypeScript + Vite build system
- **Styling**: Tailwind CSS for responsive design
- **Data**: JSON files (no database) - equipment, formulas, categories
- **Exports**: Client-side PDF (jsPDF), Excel (SheetJS), CSV generation
- **Deployment**: Static hosting on Netlify with automatic CI/CD

### Key Components
- `QuoteBuilder.tsx` - Main quote creation interface with real-time calculations
- `AdminPanel.tsx` - Equipment management and pricing configuration
- `exportUtils.ts` - PDF, Excel, CSV export functionality with Australian formatting
- `types/index.ts` - TypeScript interfaces for Equipment, Quote, Client data

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
4. **Real-time Calculations** - Live price updates as user selects equipment
5. **Export Generation** - Professional quotes with Australian business formatting

### Application Structure
```
fire-quote-app/
├── src/
│   ├── components/          # React components
│   │   ├── QuoteBuilder.tsx # Main quote interface
│   │   └── AdminPanel.tsx   # Equipment management
│   ├── data/               # Static JSON data
│   │   ├── equipment.json  # Equipment catalog
│   │   ├── formulas.json   # Pricing formulas
│   │   └── categories.json # Equipment categories
│   ├── types/
│   │   └── index.ts        # TypeScript definitions
│   ├── utils/
│   │   └── exportUtils.ts  # PDF/Excel/CSV exports
│   ├── App.tsx             # Main app with routing
│   └── main.tsx            # React app entry point
├── netlify.toml            # Netlify deployment config
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
- **PDF**: Professional quote layout with company placeholders
- **Excel**: Structured spreadsheet with formulas intact
- **CSV**: Simple data format for external systems

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
- **Missing dependencies**: Run `npm install` in `fire-quote-app/` directory
- **Netlify build fails**: Check build logs, verify Node.js version compatibility (requires Node 18+)
- **Vite dev server issues**: Default port 3000, check for conflicts
- **ESLint warnings**: Use `npm run lint` to check TypeScript issues before building

### Export Problems
- **PDF generation**: Requires modern browser, check jsPDF compatibility
- **Excel export**: Uses SheetJS library, verify XLSX import
- **File downloads**: Browser may block downloads, check download settings

## Directory Structure Notes

- **Root directory**: Contains legacy JSON files (equipment.json, formulas.json, categories.json) - these are NOT used by the app
- **Active data**: All application data is in `fire-quote-app/src/data/` directory
- **Development**: Always work in the `fire-quote-app/` subdirectory
- **Deployment**: Netlify builds from `fire-quote-app/` using `netlify.toml` config

## Future Enhancements

The codebase is structured to support:
- User authentication system
- Cloud data synchronization
- Quote history tracking
- Customer database integration
- Multi-user collaboration
- Advanced reporting features