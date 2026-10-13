import { Router } from "express";
import { register, login, refresh, logout, getMe } from "./service";
import { authMiddleware } from "../../shared/middleware";
import { validate, loginSchema, registerSchema, refreshSchema, logoutSchema } from "../../shared/validation";
import { asyncHandler } from "../../shared/errors";

const router = Router();

router.post("/login", validate(loginSchema), asyncHandler(login));
router.post("/register", validate(registerSchema), asyncHandler(register));
router.post("/refresh", validate(refreshSchema), asyncHandler(refresh));
router.post("/logout", validate(logoutSchema), asyncHandler(logout));
router.get("/me", authMiddleware, asyncHandler(getMe));

export default router;