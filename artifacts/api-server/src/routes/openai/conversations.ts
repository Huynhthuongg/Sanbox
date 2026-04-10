import { Router, Request, Response } from "express";
import { db } from "@workspace/db";
import { conversations, messages } from "@workspace/db";
import { CreateOpenaiConversationBody, UpdateOpenaiConversationBody } from "@workspace/api-zod";
import { eq, desc, asc, and } from "drizzle-orm";
import { ZodError } from "zod";
import { getServerAuth } from "../../middlewares/clerkJwt";
import { requireAuth } from "../../middlewares/requireAuth";

type IdParams = { id: string };

const router = Router();

router.use(requireAuth);

router.get("/", async (req, res: Response) => {
  const { userId } = getServerAuth(req);
  try {
    const all = await db
      .select()
      .from(conversations)
      .where(eq(conversations.userId, userId!))
      .orderBy(desc(conversations.updatedAt));
    res.json(
      all.map((c) => ({
        id: c.id,
        title: c.title,
        mode: c.mode,
        model: c.model,
        createdAt: c.createdAt,
        updatedAt: c.updatedAt,
      }))
    );
  } catch {
    res.status(500).json({ error: "Failed to list conversations" });
  }
});

router.post("/", async (req, res: Response) => {
  const { userId } = getServerAuth(req);
  try {
    const body = CreateOpenaiConversationBody.parse(req.body);
    const [conv] = await db
      .insert(conversations)
      .values({
        userId: userId!,
        title: body.title,
        mode: body.mode ?? "chat",
        model: body.model ?? "gpt-5.2",
      })
      .returning();
    res.status(201).json({
      id: conv.id,
      title: conv.title,
      mode: conv.mode,
      model: conv.model,
      createdAt: conv.createdAt,
      updatedAt: conv.updatedAt,
    });
  } catch (err) {
    if (err instanceof ZodError) {
      res.status(400).json({ error: err.flatten() });
      return;
    }
    res.status(500).json({ error: "Failed to create conversation" });
  }
});

router.get("/:id", async (req: Request<IdParams>, res: Response) => {
  const { userId } = getServerAuth(req);
  try {
    const id = parseInt(req.params.id);
    const [conv] = await db
      .select()
      .from(conversations)
      .where(and(eq(conversations.id, id), eq(conversations.userId, userId!)));
    if (!conv) {
      res.status(404).json({ error: "Conversation not found" });
      return;
    }
    const msgs = await db
      .select()
      .from(messages)
      .where(eq(messages.conversationId, id))
      .orderBy(asc(messages.createdAt));
    res.json({
      id: conv.id,
      title: conv.title,
      mode: conv.mode,
      model: conv.model,
      createdAt: conv.createdAt,
      updatedAt: conv.updatedAt,
      messages: msgs.map((m) => ({
        id: m.id,
        conversationId: m.conversationId,
        role: m.role,
        content: m.content,
        createdAt: m.createdAt,
      })),
    });
  } catch {
    res.status(500).json({ error: "Failed to get conversation" });
  }
});

router.patch("/:id", async (req: Request<IdParams>, res: Response) => {
  const { userId } = getServerAuth(req);
  try {
    const id = parseInt(req.params.id);
    const body = UpdateOpenaiConversationBody.parse(req.body);

    const updates: Partial<{ title: string; model: string; updatedAt: Date }> = {
      updatedAt: new Date(),
    };
    if (body.title !== undefined) updates.title = body.title;
    if (body.model !== undefined) updates.model = body.model;

    const [conv] = await db
      .update(conversations)
      .set(updates)
      .where(and(eq(conversations.id, id), eq(conversations.userId, userId!)))
      .returning();

    if (!conv) {
      res.status(404).json({ error: "Conversation not found" });
      return;
    }

    res.json({
      id: conv.id,
      title: conv.title,
      mode: conv.mode,
      model: conv.model,
      createdAt: conv.createdAt,
      updatedAt: conv.updatedAt,
    });
  } catch (err) {
    if (err instanceof ZodError) {
      res.status(400).json({ error: err.flatten() });
      return;
    }
    res.status(500).json({ error: "Failed to update conversation" });
  }
});

router.delete("/:id", async (req: Request<IdParams>, res: Response) => {
  const { userId } = getServerAuth(req);
  try {
    const id = parseInt(req.params.id);
    const deleted = await db
      .delete(conversations)
      .where(and(eq(conversations.id, id), eq(conversations.userId, userId!)))
      .returning();
    if (!deleted.length) {
      res.status(404).json({ error: "Conversation not found" });
      return;
    }
    res.status(204).send();
  } catch {
    res.status(500).json({ error: "Failed to delete conversation" });
  }
});

export default router;
