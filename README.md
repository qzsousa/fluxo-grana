# Finance App - Full Stack Financial System

A complete financial management application built with modern web technologies.

## 📦 Project Structure

```
ia-financeiro/
├── backend/              # Express.js API
│   ├── prisma/           # Database schema and migrations
│   ├── src/              # Source code
│   ├── tests/            # Vitest tests
│   └── package.json
├── frontend/             # Vue 3 frontend
│   ├── src/
│   ├── tests/
│   └── package.json
├── docker-compose.yml    # Docker compose for local dev
└── README.md
```

## 🚀 Tech Stack

| Layer | Technology |
|-------|------------|
| **Backend** | Node.js 20 + Express + TypeScript |
| **Database** | PostgreSQL + Prisma |
| **Frontend** | Vue 3 + Vite + TypeScript |
| **Auth** | JWT (access + refresh tokens) |
| **Styling** | Tailwind CSS |
| **Testing** | Vitest + Playwright |
| **Docs** | Swagger/OpenAPI at `/docs` |

## 📖 Documentation

- **API Docs**: `http://localhost:3000/docs` (Swagger UI)
- **Backend Docs**: See `backend/README.md`
- **Frontend Docs**: See `frontend/README.md`

## 🛠️ Setup

### Backend
```bash
cd backend
npm install
cp .env.example .env
npm run db:migrate
npm run dev
```

### Frontend
```bash
cd frontend
npm install
cp .env .env.local
npm run dev
```

## 📱 Features

- ✅ User authentication (register, login, refresh)
- ✅ Account management (checking, savings, credit, investment)
- ✅ Transaction tracking (create, update, delete, import OFX/CSV)
- ✅ Budgets with alerts
- ✅ Financial goals
- ✅ Recurring transactions
- ✅ Investments portfolio
- ✅ Family sharing
- ✅ Public API with webhooks
- ✅ Swagger docs at `/docs`
- ✅ Responsive mobile-first design

## 🧪 Testing

```bash
# Backend tests
cd backend
npm run test           # Unit tests
npm run test:coverage  # With coverage

# Frontend tests
cd frontend
npm run test           # Unit tests
npm run test:e2e       # E2E tests with Playwright
```

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Run tests
5. Submit a pull request

## 📄 License

MIT