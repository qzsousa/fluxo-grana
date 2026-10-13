import { Router } from "express";
import { getMe, updateMe } from "./service";
import { authMiddleware } from "../../shared/middleware";
import { validate, updateMeSchema } from "../../shared/validation";
import { asyncHandler } from "../../shared/errors";

const router = Router();

router.use(authMiddleware);

router.get("/me", asyncHandler(getMe));
router.put("/me", validate(updateMeSchema), asyncHandler(updateMe));

export default router;