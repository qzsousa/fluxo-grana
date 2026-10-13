import { type Request, type Response, type NextFunction } from "express";

export interface BaseController {
  (req: Request, res: Response, next?: NextFunction): Promise<void> | void;
}

export function handleErrors(fn: BaseController) {
  return async (req: Request, res: Response, next: NextFunction) => {
    try {
      await fn(req, res, next);
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: "Internal server error" });
    }
  };
}