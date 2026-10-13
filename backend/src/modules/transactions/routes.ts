import { Router } from "express";
import {
  listTransactions,
  createTransaction,
  getTransaction,
  updateTransaction,
  deleteTransaction,
  getTransactionsStats,
} from "./service";
import { authMiddleware } from "../../shared/middleware";
import { validate, validateParams, validateQuery, createTransactionSchema, updateTransactionSchema, transactionFiltersSchema, idParamSchema } from "../../shared/validation";
import { asyncHandler } from "../../shared/errors";

const router = Router();

router.use(authMiddleware);

router.get("/", validateQuery(transactionFiltersSchema), asyncHandler(listTransactions));
router.post("/", validate(createTransactionSchema), asyncHandler(createTransaction));
router.get("/stats", asyncHandler(getTransactionsStats));
router.get("/:id", validateParams(idParamSchema), asyncHandler(getTransaction));
router.put("/:id", validateParams(idParamSchema), validate(updateTransactionSchema), asyncHandler(updateTransaction));
router.delete("/:id", validateParams(idParamSchema), asyncHandler(deleteTransaction));

export default router;