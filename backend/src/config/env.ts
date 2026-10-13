import { config } from "dotenv";
import { z } from "zod";

config();

const envSchema = z.object({
  NODE_ENV: z.enum(["development", "production", "test"]).default("development"),
  PORT: z.string().transform((val) => parseInt(val, 10)).default("3000"),
  DATABASE_URL: z.string().url("DATABASE_URL must be a valid URL"),
  JWT_SECRET: z.string().min(32, "JWT_SECRET must be at least 32 characters"),
  JWT_ACCESS_EXPIRY: z.string().default("15m"),
  JWT_REFRESH_EXPIRY: z.string().default("7d"),
  BCRYPT_ROUNDS: z.string().transform((val) => parseInt(val, 10)).default("12"),
  EMAIL_FROM: z.string().email().optional(),
  RESEND_API_KEY: z.string().optional(),
  FRONTEND_URL: z.string().url().default("http://localhost:5173"),
  RATE_LIMIT_WINDOW_MS: z.string().transform((val) => parseInt(val, 10)).default("900000"),
  RATE_LIMIT_MAX_REQUESTS: z
    .string()
    .transform((val) => parseInt(val, 10))
    .default("100"),
});

const envFileConfig = envSchema.safeParse(process.env);

if (!envFileConfig.success) {
  console.error("❌ Environment validation failed:");
  console.error(envFileConfig.error.errors);
  process.exit(1);
}

export const env = envFileConfig.data;

export const isProduction = env.NODE_ENV === "production";
export const isDevelopment = env.NODE_ENV === "development";
export const isTest = env.NODE_ENV === "test";

export interface Config {
  port: number;
  databaseUrl: string;
  jwtSecret: string;
  jwtAccessExpiry: string;
  jwtRefreshExpiry: string;
  bcryptRounds: number;
  emailFrom: string | undefined;
  resendApiKey: string | undefined;
  frontendUrl: string;
  rateLimitWindowMs: number;
  rateLimitMaxRequests: number;
  isProduction: boolean;
  isDevelopment: boolean;
  isTest: boolean;
}