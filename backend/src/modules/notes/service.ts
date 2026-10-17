import { type Request, type Response } from "express";
import { prisma } from "../../config/prisma";
import { NotFoundError, UnauthorizedError, ValidationError } from "../../shared/errors";

/**
 * Lembretes pessoais da tela inicial.
 *
 * Nada aqui conversa com faturas ou saldo: é o post-it / anotação rápida que o
 * usuário deixa para si mesmo. A cor e o estilo de exibição são escolha do
 * cliente — o backend só guarda o texto.
 */

function requireUserId(req: Request): string {
  const userId = req.user?.id;
  if (!userId) throw new UnauthorizedError("Not authenticated");
  return userId;
}

// GET /api/v1/notes
// Fixadas primeiro, depois as mais recentes — é a ordem que a tela inicial usa.
export async function listNotes(req: Request, res: Response) {
  const userId = requireUserId(req);

  const notes = await prisma.note.findMany({
    where: { userId },
    orderBy: [{ pinned: "desc" }, { createdAt: "desc" }],
  });

  res.json({ notes });
}

// POST /api/v1/notes
export async function createNote(req: Request, res: Response) {
  const userId = requireUserId(req);
  const { content, color, pinned } = req.body;

  if (!content || !content.trim()) {
    throw new ValidationError("O lembrete não pode ficar vazio", {
      content: ["Escreva alguma coisa"],
    });
  }

  // Lista curta por padrão: a tela inicial mostra um bloco, não um mural.
  const count = await prisma.note.count({ where: { userId } });
  if (count >= 50) {
    throw new ValidationError("Você chegou ao limite de 50 lembretes", {
      content: ["Apague algum lembrete para adicionar outro"],
    });
  }

  const note = await prisma.note.create({
    data: {
      userId,
      content: content.trim(),
      color: color || null,
      pinned: pinned === true,
    },
  });

  res.status(201).json({ note });
}

// PUT /api/v1/notes/:id
export async function updateNote(req: Request, res: Response) {
  const userId = requireUserId(req);
  const { id } = req.params;
  const { content, color, pinned } = req.body;

  const existing = await prisma.note.findFirst({ where: { id, userId } });
  if (!existing) throw new NotFoundError("Lembrete não encontrado");

  if (content !== undefined && !content.trim()) {
    throw new ValidationError("O lembrete não pode ficar vazio", {
      content: ["Escreva alguma coisa"],
    });
  }

  const note = await prisma.note.update({
    where: { id },
    data: {
      ...(content !== undefined ? { content: content.trim() } : {}),
      ...(color !== undefined ? { color: color || null } : {}),
      ...(pinned !== undefined ? { pinned: pinned === true } : {}),
    },
  });

  res.json({ note });
}

// DELETE /api/v1/notes/:id
export async function deleteNote(req: Request, res: Response) {
  const userId = requireUserId(req);
  const { id } = req.params;

  const existing = await prisma.note.findFirst({ where: { id, userId } });
  if (!existing) throw new NotFoundError("Lembrete não encontrado");

  await prisma.note.delete({ where: { id } });

  res.json({ message: "Lembrete removido" });
}