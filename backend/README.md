# Finance App - Backend

A full-stack financial system API built with Node.js, Express, TypeScript, and PostgreSQL.

## Features

- 🔐 **Authentication**: JWT-based auth with refresh tokens and 2FA support
- 💰 **Accounts**: Manage checking, savings, credit cards, investments
- 📊 **Transactions**: Create, filter, import (OFX/CSV), categorize
- 📈 **Budgets**: Monthly/yearly budgets with alerts
- 🎯 **Goals**: Financial goal tracking
- 🔄 **Recurring**: Scheduled transactions (subscriptions, etc.)
- 📈 **Investments**: Portfolio management with price history
- 👨‍👩‍👧‍👦 **Family**: Shared financial accounts
- 📜 **API**: Public API with key-based access
- 📚 **Docs**: Swagger/OpenAPI at `/docs`

## Tech Stack

- **Runtime**: Node.js 20+
- **Framework**: Express.js
- **Language**: TypeScript
- **Database**: PostgreSQL
- **ORM**: Prisma
- **Auth**: JWT (access + refresh tokens)
- **Validation**: Zod
- **Testing**: Vitest + Playwright

## Prerequisites

- Node.js 20+
- PostgreSQL 14+
- npm 9+

## Installation

```bash
cd backend
npm install
```

## Database Setup

```bash
# Copy environment file
cp .env.example .env

# Edit .env with your database URL
# DATABASE_URL="postgresql://user:password@localhost:5432/finance?schema=public"

# Run migrations
npm run db:migrate
```

## Development

```bash
# Start development server
npm run dev
# Server runs on http://localhost:3000
```

## Production

```bash
npm run build
npm run start
```

## API Documentation

The API documentation is available at `http://localhost:3000/docs` when the server is running.

## Testing

```bash
# Run unit tests
npm run test

# Run with coverage
npm run test:coverage

# Run linting
npm run lint
```

## Project Structure

```
src/
├── config/
│   ├── env.ts           # Environment variables
│   └── prisma.ts        # Database client
├── modules/             # Feature modules
│   ├── auth/            # Authentication
│   ├── users/           # User management
│   ├── accounts/        # Account CRUD
│   ├── transactions/    # Transaction CRUD
│   └── ...
├── shared/              # Shared utilities
│   ├── middleware.ts    # Auth middleware
│   └── auth.ts          # Auth helpers
├── docs/                # Swagger docs
└── tests/               # Test files
```

## Environment Variables

See `.env.example` for available environment variables.

## License

MIT