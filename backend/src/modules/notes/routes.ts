import { Router } from "express";
import { listNotes, createNote, updateNote, deleteNote } from "./service";
import { authMiddleware } from "../../shared/middleware";
import {
  validate,
  validateParams,
  createNoteSchema,
  updateNoteSchema,
  idParamSchema,
} from "../../shared/validation";
import { asyncHandler } from "../../shared/errors";

const router = Router();

router.use(authMiddleware);

router.get("/", asyncHandler(listNotes));
router.post("/", validate(createNoteSchema), asyncHandler(createNote));
router.put(
  "/:id",
  validateParams(idParamSchema),
  validate(updateNoteSchema),
  asyncHandler(updateNote)
);
router.delete("/:id", validateParams(idParamSchema), asyncHandler(deleteNote));

export default router;