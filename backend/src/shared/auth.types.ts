import { type Request, type Response } from "express";
import jwt from "jsonwebtoken";
import { env } from "../config/env.js";

interface JwtPayload {
  sub: string;
  email: string;
  type: "access" | "refresh";
}

interface Tokens {
  accessToken: string;
  refreshToken: string;
}

function generateTokens(userId: string, email: string): Tokens {
  const accessToken = jwt.sign(
    { sub: userId, email, type: "access" },
    env.JWT_SECRET,
    { expiresIn: env.JWT_ACCESS_EXPIRY } as jwt.SignOptions
  );

  const refreshToken = jwt.sign(
    { sub: userId, email, type: "refresh" },
    env.JWT_SECRET,
    { expiresIn: env.JWT_REFRESH_EXPIRY } as jwt.SignOptions
  );

  return { accessToken, refreshToken };
}

export { JwtPayload, Tokens, generateTokens };