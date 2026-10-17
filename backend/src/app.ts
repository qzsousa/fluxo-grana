import express, { type Express, type Request, type Response, type NextFunction } from "express";
import cors from "cors";
import helmet from "helmet";
import morgan from "morgan";
import rateLimit from "express-rate-limit";
import { env } from "./config/env";
import { prisma } from "./config/prisma";

// Routes
import authRoutes from "./modules/auth/routes";
import userRoutes from "./modules/users/routes";
import accountRoutes from "./modules/accounts/routes";
import transactionRoutes from "./modules/transactions/routes";
import invoiceRoutes from "./modules/invoices/routes";
import noteRoutes from "./modules/notes/routes";

// Swagger docs
import { swaggerUi, swaggerDocument } from "./docs/swagger";

// Error handling
import { errorHandler } from "./shared/errors";

export function createApp(): Express {
  const app = express();

  // Security headers
  app.use(
    helmet({
      contentSecurityPolicy: {
        directives: {
          defaultSrc: ["'self'"],
          styleSrc: ["'self'", "'unsafe-inline'"],
          scriptSrc: ["'self'"],
          imgSrc: ["'self'", "data:", "https:"],
          connectSrc: ["'self'"],
          fontSrc: ["'self'"],
          objectSrc: ["'none'"],
          mediaSrc: ["'self'"],
          frameSrc: ["'none'"],
        },
      },
      crossOriginEmbedderPolicy: false,
      hsts: {
        maxAge: 31536000,
        includeSubDomains: true,
        preload: true,
      },
    })
  );

  // CORS
  app.use(
    cors({
      origin: env.FRONTEND_URL,
      credentials: true,
      methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
      allowedHeaders: ["Content-Type", "Authorization", "X-Requested-With"],
      exposedHeaders: ["X-Total-Count"],
    })
  );

  // Rate limiting - different limits for auth vs API
  const authLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 100, // auth endpoints (dev-friendly)
    message: { error: "Too many authentication attempts, please try again later" },
    standardHeaders: true,
    legacyHeaders: false,
  });

  const apiLimiter = rateLimit({
    windowMs: env.RATE_LIMIT_WINDOW_MS,
    max: env.RATE_LIMIT_MAX_REQUESTS,
    message: { error: "Too many requests, please try again later" },
    standardHeaders: true,
    legacyHeaders: false,
  });

  app.use("/api/v1/auth", authLimiter);
  app.use("/api/v1", apiLimiter);

  // Body parsing
  app.use(express.json({ limit: "10mb" }));
  app.use(express.urlencoded({ extended: true, limit: "10mb" }));

  // Request logging
  if (env.NODE_ENV !== "production") {
    app.use(morgan("dev"));
  } else {
    app.use(morgan("combined"));
  }

  // Health check
  app.get("/health", (_req: Request, res: Response) => {
    res.json({ status: "ok", timestamp: new Date().toISOString() });
  });

  // API routes
  app.use("/api/v1/auth", authRoutes);
  app.use("/api/v1/users", userRoutes);
  app.use("/api/v1/accounts", accountRoutes);
  app.use("/api/v1/transactions", transactionRoutes);
  app.use("/api/v1/invoices", invoiceRoutes);
  app.use("/api/v1/notes", noteRoutes);

  // Swagger docs
  app.use("/docs", swaggerUi.serve, swaggerUi.setup(swaggerDocument));

  // Error handling middleware
  app.use(errorHandler);

  // 404 handler
  app.use("*", (_req: Request, res: Response) => {
    res.status(404).json({ error: "Not Found", code: "NOT_FOUND" });
  });

  return app;
}

export default createApp;