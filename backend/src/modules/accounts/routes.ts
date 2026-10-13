import { Router } from "express";
import {
  listAccounts,
  createAccount,
  getAccount,
  updateAccount,
  deleteAccount,
  getBalanceHistory,
} from "./service";
import { authMiddleware } from "../../shared/middleware";
import { validate, validateParams, createAccountSchema, updateAccountSchema, idParamSchema } from "../../shared/validation";
import { asyncHandler } from "../../shared/errors";

const router = Router();

router.use(authMiddleware);

router.get("/", asyncHandler(listAccounts));
router.post("/", validate(createAccountSchema), asyncHandler(createAccount));
router.get("/:id", validateParams(idParamSchema), asyncHandler(getAccount));
router.put("/:id", validateParams(idParamSchema), validate(updateAccountSchema), asyncHandler(updateAccount));
router.delete("/:id", validateParams(idParamSchema), asyncHandler(deleteAccount));
router.get("/:id/balance-history", validateParams(idParamSchema), asyncHandler(getBalanceHistory));

export default router;