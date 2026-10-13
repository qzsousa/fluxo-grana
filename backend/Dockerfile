# Backend Dockerfile
FROM node:20-alpine AS builder

WORKDIR /app

# Install dependencies
COPY package*.json ./
RUN npm ci

# Copy source
COPY tsconfig*.json ./
COPY prisma ./prisma/
COPY src ./src/

# Generate Prisma client
RUN npx prisma generate

# Build
RUN npm run build

# Production image
FROM node:20-alpine AS production

WORKDIR /app

# Copy built files
COPY package*.json ./
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/prisma ./prisma
COPY --from=builder /app/dist ./dist

# Create prisma client in production
ENV NODE_ENV=production
RUN npx prisma generate

EXPOSE 3000

CMD ["node", "dist/server.js"]