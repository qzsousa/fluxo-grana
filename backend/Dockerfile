# Backend Dockerfile
FROM node:20-alpine AS builder

WORKDIR /app

# Install OpenSSL so Prisma detects the correct engine variant
RUN apk add --no-cache openssl

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

# Install OpenSSL so Prisma can load the correct engine
RUN apk add --no-cache openssl

# Copy built files
COPY package*.json ./
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/prisma ./prisma
COPY --from=builder /app/dist ./dist

# Create prisma client in production
ENV NODE_ENV=production
RUN npx prisma generate

EXPOSE 3000

CMD ["sh", "-c", "npx prisma migrate deploy && node dist/server.js"]