# Jairo's Real Estate Landing Page

## Overview
A high-performance landing page built for Jairo's real estate business, optimized for lead generation and conversion. This page features Google Places integration for address autocomplete, multi-step form submission, and direct integration with Go High Level CRM via Zapier.

## 🚀 Features
- **Smart Address Autocomplete**: Powered by Google Places API
- **Multi-step Lead Capture Form**:
  - Step 1: Property Address & Phone Number
  - Step 2: Property Details & Contact Information
- **Real-time Data Persistence**: Auto-saves user inputs
- **CRM Integration**: Direct connection to Go High Level
- **Analytics Suite**: Google Analytics, Facebook Pixel, and Hotjar integration
- **Mobile-First Design**: Fully responsive across all devices
- **SEO Optimized**: Meta tags and structured data for real estate

## 🛠 Tech Stack
- Next.js 13+ (React Framework)
- TypeScript
- TailwindCSS
- Google Places API
- Zapier Webhooks
- Google Sheets API
- Go High Level CRM

## 🎨 Brand Colors
- Primary: `#5b5a99`
- Accent: `#65bee4`
- Background: `#ffffff`
- Text: `#333333`

## 📁 Project Structure
```
src/
├── components/     # Reusable React components
├── pages/         # Next.js pages and routes
├── assets/        # Static assets and styles
├── utils/         # Utility functions and API handlers
└── backend/       # Backend integrations
```

## 🚦 Getting Started

### Prerequisites
- Node.js 18+
- npm or yarn
- Google Places API key
- Go High Level API credentials
- Zapier account

### Environment Variables
Create a `.env.local` file with:
```
NEXT_PUBLIC_GOOGLE_PLACES_API_KEY=your_key_here
NEXT_PUBLIC_GA_TRACKING_ID=your_ga_id
NEXT_PUBLIC_FB_PIXEL_ID=your_pixel_id
GOHIGHLEVEL_API_KEY=your_key_here
ZAPIER_WEBHOOK_URL=your_webhook_url
GOOGLE_SHEETS_PRIVATE_KEY=your_key_here
GOOGLE_SHEETS_CLIENT_EMAIL=your_email_here
GOOGLE_SHEETS_SHEET_ID=your_sheet_id
```

### Installation
```bash
# Install dependencies
npm install

# Run development server
npm run dev

# Build for production
npm run build

# Start production server
npm start
```

## 📊 Lead Tracking
All leads are automatically:
1. Saved to Google Sheets
2. Sent to Go High Level CRM
3. Tracked in Google Analytics
4. Recorded for Facebook ad attribution

### Google Sheets Structure
| Column | Description |
|--------|-------------|
| timestamp | ISO string format |
| leadId | Unique identifier |
| address | Full property address |
| phone | Contact phone |
| firstName | First name |
| lastName | Last name |
| email | Email address |
| propertyCondition | Current condition |
| timeframe | Selling timeframe |
| price | Asking price |

## 🔄 CI/CD
- Automated deployments via Vercel
- Branch previews for feature testing
- Automated performance monitoring

## 📱 Mobile Optimization
- Responsive design for all screen sizes
- Touch-friendly interface
- Optimized images and assets
- Progressive loading

## 📈 Performance Metrics
- Lighthouse Score: 90+
- Core Web Vitals optimized
- First Contentful Paint < 1.5s
- Time to Interactive < 3.5s

## 🔍 SEO Configuration
- Optimized meta tags
- Structured data for real estate
- XML sitemap
- Robots.txt configuration

## 🛟 Support
For technical support or questions, contact the development team at [contact@email.com]

## 🔄 Branch Management
This is the `client/jairo/main` branch, dedicated to Jairo's landing page version. For feature development:
1. Create feature branches from this branch using:
   ```bash
   git checkout -b client/jairo/feature-name
   ```
2. Merge completed features back to `client/jairo/main`
3. Deploy updates from `client/jairo/main` 