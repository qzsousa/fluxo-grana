# Finance App - Frontend

A responsive financial dashboard built with Vue 3, TypeScript, and Tailwind CSS.

## Features

- 📱 **Responsive**: Mobile-first design with drawer navigation
- 📊 **Dashboard**: Financial overview widgets
- 💰 **Accounts**: View and manage all accounts
- 📋 **Transactions**: List, filter, search
- 🎨 **Modern UI**: Clean, accessible interface

## Tech Stack

- **Framework**: Vue 3 + Vite
- **Language**: TypeScript
- **Routing**: Vue Router
- **State**: Pinia
- **HTTP**: Axios
- **Styling**: Tailwind CSS
- **Testing**: Vitest + Playwright

## Prerequisites

- Node.js 20+
- npm 9+

## Installation

```bash
cd frontend
npm install
```

## Environment Variables

```bash
# Copy environment file
cp .env `.env`

# Edit `.env` for your needs
VITE_API_URL=http://localhost:3000/api/v1
VITE_APP_NAME=Finance App
```

## Development

```bash
npm run dev
# Frontend runs on http://localhost:5173
```

## Production Build

```bash
npm run build
```

## Testing

```bash
# Run unit tests
npm run test

# Run with coverage
npm run test:coverage

# Run E2E tests
npm run test:e2e
```

## Project Structure

```
src/
├── assets/           # Static assets
├── components/       # Reusable UI components
├── composables/      # Vue composables
├── layouts/          # Layout components
├── pages/            # Route pages
│   ├── auth/         # Login, Register
│   ├── dashboard/    # Main dashboard
│   ├── accounts/     # Accounts pages
│   ├── transactions/ # Transaction pages
│   └── ...
├── router/           # Vue Router
├── stores/           # Pinia stores
├── services/         # API services
├── types/            # TypeScript types
├── utils/            # Utility functions
└── styles/           # Tailwind CSS
```

## Mobile Responsiveness

The frontend is built with mobile-first responsive design:
- Sidebar collapses to a drawer on mobile (< 1024px)
- Tables transform to card layouts on small screens
- Touch-friendly buttons and inputs
- Responsive grid layouts

## License

MIT