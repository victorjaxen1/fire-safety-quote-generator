# Fire Safety Quote Generator

A modern web application for generating fire safety equipment quotes, built specifically for Australian fire safety businesses.

## Features

### Quote Builder
- **Real-time search** - Find equipment quickly with instant filtering
- **Live calculations** - Totals update automatically as you add items
- **Australian compliance** - GST calculation and Australian business format
- **Client management** - Capture all necessary client information
- **Multiple export formats** - PDF, Excel, and CSV exports

### Admin Panel
- **Equipment management** - Update prices and add new equipment
- **Formula configuration** - Adjust markups, GST rates, and labor costs
- **Data backup** - Export equipment data for backup purposes

### Export Options
- **PDF Quotes** - Professional formatted quotes ready for clients
- **Excel Export** - Structured spreadsheets for further analysis
- **CSV Export** - Simple data format for external systems

## Technology Stack

- **Frontend**: React 18 with TypeScript
- **Styling**: Tailwind CSS
- **Build Tool**: Vite
- **Exports**: jsPDF (PDF), SheetJS (Excel), native CSV
- **Deployment**: Netlify (free hosting)

## Equipment Data

The application includes 78+ fire safety equipment items extracted from your original Excel system:
- Fire Indicator Panels
- Control Panels and Indicators
- Alerting Devices
- Occupant Warning Equipment
- Manual Safety Devices
- Installation Components
- Cabling and Wiring
- Circuit Protection

## Australian Compliance

- **GST**: Automatic 10% GST calculation
- **Business Details**: ABN field and Australian address format
- **Currency**: Australian Dollar (AUD) formatting
- **States**: All Australian states and territories included

## Getting Started

### For Development
1. Install dependencies: \`npm install\`
2. Start development server: \`npm run dev\`
3. Open browser to \`http://localhost:3000\`

### For Deployment on Netlify
1. Push code to GitHub repository
2. Connect repository to Netlify
3. Deploy automatically with included \`netlify.toml\` configuration

## Usage

### Creating a Quote
1. Fill in client information
2. Search and select equipment items
3. Adjust quantities as needed
4. Export in preferred format (PDF, Excel, or CSV)

### Managing Equipment
1. Go to Admin panel
2. Update equipment prices by clicking on price values
3. Modify markup rates and formulas as needed
4. Export data for backup

### Quote Numbering
Quotes are automatically numbered using the format: \`QT-YYYYMMDD-XXX\`
- QT: Quote prefix
- YYYYMMDD: Current date
- XXX: Random 3-digit number

## Configuration

### Pricing Formulas
- **Material Markup**: Default 1.5x (configurable)
- **GST Rate**: 10% (Australian standard)
- **Labor Rate**: $150/hour (configurable)
- **Overheads**: 15% (configurable)

### Data Storage
- Equipment data stored in JSON files
- Quotes stored temporarily in browser localStorage
- No server database required for basic functionality

## Future Enhancements

The application is designed with scalability in mind:
- User authentication system
- Cloud data storage
- Quote history tracking
- Customer database
- Inventory management
- Reporting dashboard
- Multi-user support

## Support

This application replaces manual Excel-based quote generation with a faster, more consistent web-based system while maintaining all existing pricing and calculation logic.