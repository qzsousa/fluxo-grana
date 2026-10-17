import { Router } from "express";
import {
  listInvoices,
  listUpcomingInvoices,
  getInvoice,
  payInvoice,
  revertInvoicePayment,
} from "./service";
import { authMiddleware } from "../../shared/middleware";
import {
  validate,
  validateParams,
  validateQuery,
  payInvoiceSchema,
  invoiceListQuerySchema,
  upcomingQuerySchema,
  idParamSchema,
} from "../../shared/validation";
import { asyncHandler } from "../../shared/errors";

const router = Router();

router.use(authMiddleware);

router.get("/", validateQuery(invoiceListQuerySchema), asyncHandler(listInvoices));
// Precisa vir antes de "/:id" para não ser capturada pelo parâmetro.
router.get("/upcoming", validateQuery(upcomingQuerySchema), asyncHandler(listUpcomingInvoices));
router.get("/:id", validateParams(idParamSchema), asyncHandler(getInvoice));
router.post(
  "/:id/pay",
  validateParams(idParamSchema),
  validate(payInvoiceSchema),
  asyncHandler(payInvoice)
);
router.delete("/:id/payment", validateParams(idParamSchema), asyncHandler(revertInvoicePayment));

export default router;
