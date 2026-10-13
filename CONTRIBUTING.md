# Contributing to Finance App

Thank you for your interest in contributing to the Finance App!

## Development Setup

1. Fork the repository
2. Clone your fork locally
3. Install dependencies:
   ```bash
   npm install
   ```

4. Set up environment variables (see `.env.example`)

5. Start development servers:
   ```bash
   # Terminal 1: Backend
   cd backend
   npm run dev

   # Terminal 2: Frontend  
   cd frontend
   npm run dev
   ```

## Project Structure

### Backend
- `src/modules/` - Feature modules (auth, accounts, transactions, etc.)
- `src/shared/` - Shared utilities and middleware
- `src/config/` - Configuration and database client
- `src/docs/` - OpenAPI/Swagger documentation
- `tests/` - Vitest tests

### Frontend
- `src/pages/` - Route pages
- `src/components/` - Reusable components
- `src/stores/` - Pinia stores
- `src/services/` - API services
- `src/router/` - Vue Router
- `src/layouts/` - Layout components

## Coding Standards

- **TypeScript**: Use strict mode, avoid `any`
- **Linting**: Run `npm run lint` before committing
- **Formatting**: Run `npm run format` or use prettier
- **Commit messages**: Use conventional commits (feat:, fix:, docs:, etc.)

## Testing

```bash
# Backend tests
cd backend
npm run test

# Frontend tests  
cd frontend
npm run test
```

## Branches

- `main` - Production ready
- `develop` - Development
- `feature/*` - New features
- `fix/*` - Bug fixes
- `docs/*` - Documentation

## Pull Request Process

1. Create a feature branch
2. Make your changes
3. Run tests
4. Update documentation if needed
5. Submit PR with description

## License

By contributing, you agree your contributions will be licensed under MIT.