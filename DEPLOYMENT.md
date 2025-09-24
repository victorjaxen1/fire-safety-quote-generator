# Deployment Guide

## Quick Deploy to Netlify (Free)

### Option 1: Drag & Drop (Easiest)
1. Build the project:
   ```bash
   npm install
   npm run build
   ```
2. Go to [netlify.com](https://netlify.com) and sign up
3. Drag the `dist` folder to the Netlify deploy area
4. Your app will be live instantly!

### Option 2: Git Integration (Recommended)
1. Push your code to GitHub:
   ```bash
   git init
   git add .
   git commit -m "Initial commit"
   git remote add origin YOUR_GITHUB_REPO_URL
   git push -u origin main
   ```

2. Connect to Netlify:
   - Go to [netlify.com](https://netlify.com)
   - Click "Add new site" → "Import an existing project"
   - Choose GitHub and select your repository
   - Build settings are automatically detected from `netlify.toml`
   - Click "Deploy site"

3. Your app will be live with automatic deployments!

## Local Development

### Prerequisites
- Node.js 18+ installed
- npm or yarn package manager

### Setup
```bash
# Clone or navigate to project directory
cd fire-quote-app

# Install dependencies
npm install

# Start development server
npm run dev

# Open browser to http://localhost:3000
```

### Available Scripts
- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run preview` - Preview production build
- `npm run lint` - Run code linting

## Customization

### Company Branding
Update the export templates in `src/utils/exportUtils.ts`:
- Replace `[COMPANY NAME]` with your company name
- Replace `[COMPANY ADDRESS]` with your address
- Replace `[COMPANY ABN]` with your ABN
- Replace `[COMPANY PHONE]` with your phone number

### Equipment Data
- Equipment items are in `src/data/equipment.json`
- Pricing formulas are in `src/data/formulas.json`
- Categories are in `src/data/categories.json`

### Styling
- Uses Tailwind CSS for styling
- Colors can be customized in `tailwind.config.js`
- Main styles are in `src/index.css`

## Troubleshooting

### Build Issues
If you encounter build errors:
1. Delete `node_modules` and `package-lock.json`
2. Run `npm install` again
3. Try `npm run build`

### Export Issues
If PDF/Excel exports don't work:
1. Ensure you're using a modern browser (Chrome recommended)
2. Check browser console for errors
3. Some browsers block automatic downloads - check download settings

### Deployment Issues
If Netlify deployment fails:
1. Check the build log for errors
2. Ensure all dependencies are listed in `package.json`
3. Try building locally first with `npm run build`

## Data Backup

### Export Equipment Data
Use the Admin panel to export all equipment data as JSON for backup.

### Manual Backup
Copy these files for full data backup:
- `src/data/equipment.json`
- `src/data/formulas.json`
- `src/data/categories.json`

## Performance

The app is optimized for speed:
- Client-side only (no server required)
- Instant search and filtering
- Lazy loading for large lists
- Optimized build size

## Browser Support

Tested and supported:
- Chrome 90+
- Firefox 90+
- Safari 14+
- Edge 90+

## Next Steps

Once deployed, you can:
1. Share the URL with your team
2. Bookmark for easy access
3. Add to mobile home screen for app-like experience
4. Consider adding user authentication for multi-user setups