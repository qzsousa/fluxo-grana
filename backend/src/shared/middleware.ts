import { type Request, type Response, type NextFunction } from "express";
import jwt from "jsonwebtoken";
import { env } from "../config/env";

interface JwtPayload {
  sub: string;
  email: string;
  type: "access" | "refresh";
}

declare global {
  namespace Express {
    interface Request {
      user?: {
        id: string;
        email: string;
      };
    }
  }
}

export function authMiddleware(
  req: Request,
  res: Response,
  next: NextFunction
): void {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    res.status(401).json({ error: "Access token required", code: "UNAUTHORIZED" });
    return;
  }

  const token = authHeader.split(" ")[1];

  try {
    const payload = jwt.verify(token, env.JWT_SECRET) as JwtPayload;

    if (payload.type !== "access") {
      res.status(401).json({ error: "Invalid token type", code: "INVALID_TOKEN_TYPE" });
      return;
    }

    req.user = { id: payload.sub, email: payload.email };
    next();
  } catch (error) {
    res.status(401).json({ error: "Invalid or expired token", code: "TOKEN_EXPIRED" });
  }
}

export default authMiddleware;