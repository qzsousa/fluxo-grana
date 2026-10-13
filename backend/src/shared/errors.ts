import { type Request, type Response, type NextFunction } from "express";
import { ZodError } from "zod";

export interface AppError extends Error {
  statusCode?: number;
  code?: string;
  details?: any;
}

export class ValidationError extends Error {
  public readonly statusCode = 400;
  public readonly code = "VALIDATION_ERROR";
  public readonly details: any;

  constructor(message: string, details: any) {
    super(message);
    this.name = "ValidationError";
    this.details = details;
  }
}

export class NotFoundError extends Error {
  public readonly statusCode = 404;
  public readonly code = "NOT_FOUND";

  constructor(message: string = "Resource not found") {
    super(message);
    this.name = "NotFoundError";
  }
}

export class UnauthorizedError extends Error {
  public readonly statusCode = 401;
  public readonly code = "UNAUTHORIZED";

  constructor(message: string = "Unauthorized") {
    super(message);
    this.name = "UnauthorizedError";
  }
}

export class ForbiddenError extends Error {
  public readonly statusCode = 403;
  public readonly code = "FORBIDDEN";

  constructor(message: string = "Forbidden") {
    super(message);
    this.name = "ForbiddenError";
  }
}

export class ConflictError extends Error {
  public readonly statusCode = 409;
  public readonly code = "CONFLICT";

  constructor(message: string = "Resource conflict") {
    super(message);
    this.name = "ConflictError";
  }
}

export class InternalError extends Error {
  public readonly statusCode = 500;
  public readonly code = "INTERNAL_ERROR";

  constructor(message: string = "Internal server error") {
    super(message);
    this.name = "InternalError";
  }
}

export function errorHandler(
  err: Error,
  _req: Request,
  res: Response,
  _next: NextFunction
): void {
  console.error("Error:", {
    name: err.name,
    message: err.message,
    stack: err.stack,
    code: (err as AppError).code,
    details: (err as AppError).details,
  });

  if (err instanceof ZodError) {
    res.status(400).json({
      error: "Validation failed",
      code: "VALIDATION_ERROR",
      details: err.flatten().fieldErrors,
    });
    return;
  }

  if (err instanceof ValidationError) {
    res.status(err.statusCode).json({
      error: err.message,
      code: err.code,
      details: err.details,
    });
    return;
  }

  if (err instanceof NotFoundError) {
    res.status(err.statusCode).json({
      error: err.message,
      code: err.code,
    });
    return;
  }

  if (err instanceof UnauthorizedError) {
    res.status(err.statusCode).json({
      error: err.message,
      code: err.code,
    });
    return;
  }

  if (err instanceof ForbiddenError) {
    res.status(err.statusCode).json({
      error: err.message,
      code: err.code,
    });
    return;
  }

  if (err instanceof ConflictError) {
    res.status(err.statusCode).json({
      error: err.message,
      code: err.code,
    });
    return;
  }

  if (err instanceof InternalError) {
    res.status(err.statusCode).json({
      error: err.message,
      code: err.code,
    });
    return;
  }

  // Prisma errors
  if (err.name === "PrismaClientKnownRequestError") {
    const prismaErr = err as any;
    if (prismaErr.code === "P2002") {
      res.status(409).json({
        error: "A record with this value already exists",
        code: "DUPLICATE_ENTRY",
        details: prismaErr.meta?.target,
      });
      return;
    }
    if (prismaErr.code === "P2025") {
      res.status(404).json({
        error: "Record not found",
        code: "NOT_FOUND",
      });
      return;
    }
  }

  // Default error
  res.status(500).json({
    error: "Internal server error",
    code: "INTERNAL_ERROR",
  });
}

export function asyncHandler(fn: Function) {
  return (req: Request, res: Response, next: NextFunction) => {
    Promise.resolve(fn(req, res, next)).catch(next);
  };
}