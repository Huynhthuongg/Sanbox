import { Router, Request, Response } from "express";
import { db } from "@workspace/db";
import { conversations, messages } from "@workspace/db";
import { SendOpenaiMessageBody } from "@workspace/api-zod";
import { eq, asc, and } from "drizzle-orm";
import { openai } from "@workspace/integrations-openai-ai-server";
import { ZodError } from "zod";
import { getServerAuth } from "../../middlewares/clerkJwt";
import { requireAuth } from "../../middlewares/requireAuth";

type ConvParams = { id: string };

const router = Router({ mergeParams: true });

router.use(requireAuth);

router.get("/", async (req: Request<ConvParams>, res: Response) => {
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
    const all = await db
      .select()
      .from(messages)
      .where(eq(messages.conversationId, id))
      .orderBy(asc(messages.createdAt));
    res.json(
      all.map((m) => ({
        id: m.id,
        conversationId: m.conversationId,
        role: m.role,
        content: m.content,
        createdAt: m.createdAt,
      }))
    );
  } catch (err) {
    req.log.error({ err }, "Failed to list messages");
    res.status(500).json({ error: "Failed to list messages" });
  }
});

router.post("/", async (req: Request<ConvParams>, res: Response) => {
  const { userId } = getServerAuth(req);
  const id = parseInt(req.params.id);

  try {
    const body = SendOpenaiMessageBody.parse(req.body);

    const [conv] = await db
      .select()
      .from(conversations)
      .where(and(eq(conversations.id, id), eq(conversations.userId, userId!)));

    if (!conv) {
      res.status(404).json({ error: "Conversation not found" });
      return;
    }

    // Save user message
    await db.insert(messages).values({
      conversationId: id,
      role: "user",
      content: body.content,
    });

    // Image generation mode — non-streaming response
    if (conv.mode === "image") {
      const imageResponse = await openai.images.generate({
        model: "gpt-image-1",
        prompt: body.content,
        size: "1024x1024",
      });

      const b64 = imageResponse.data?.[0]?.b64_json ?? "";
      const dataUrl = `data:image/png;base64,${b64}`;

      await db.insert(messages).values({
        conversationId: id,
        role: "assistant",
        content: dataUrl,
      });

      await db
        .update(conversations)
        .set({ updatedAt: new Date() })
        .where(eq(conversations.id, id));

      res.setHeader("Content-Type", "text/event-stream");
      res.setHeader("Cache-Control", "no-cache");
      res.setHeader("Connection", "keep-alive");
      res.write(`data: ${JSON.stringify({ imageUrl: dataUrl })}\n\n`);
      res.write(`data: ${JSON.stringify({ done: true })}\n\n`);
      res.end();
      return;
    }

    // Text streaming mode (chat or code)
    const existingMessages = await db
      .select()
      .from(messages)
      .where(eq(messages.conversationId, id))
      .orderBy(asc(messages.createdAt));

    const model = body.model ?? conv.model ?? "gpt-5.2";

    const systemPrompt =
      conv.mode === "code"
        ? "You are an expert programming assistant. Provide clean, well-commented code with clear explanations. Always use markdown code blocks with the correct language tag."
        : conv.mode === "flutter"
        ? `You are an expert Flutter and Dart developer with deep knowledge of the complete mobile app development workflow for 2026. You specialize in:

ARCHITECTURE: MVVM + Riverpod state management. Always structure apps with clear separation: Models, ViewModels (StateNotifier/AsyncNotifier), Views, Services, and Repositories.

FLUTTER STACK: Flutter 3.x, Dart 3.x, Riverpod 2.x, GoRouter for navigation, Freezed for immutable models, Dio for HTTP, firebase_core + firebase_auth + cloud_firestore + firebase_analytics.

FIREBASE BACKEND: Design Firestore collections with correct security rules. Use Firebase Auth for authentication. Structure Firestore documents to minimize reads. Write security rules that are secure by default.

AI INTEGRATION: Always recommend the Cloud Function proxy pattern to keep API keys server-side. Never expose API keys in client code. Design prompts for real user value, not demos. Implement response caching to minimize AI costs.

MONETIZATION: Use Google Play Billing (in_app_purchase package) or RevenueCat for subscription management. Design paywalls that convert. Implement the gamification layer (streaks, badges, progress) to reduce churn.

ASO 2026: Write store listings in FAQ format optimized for "Ask Play" (Google's AI discovery engine). Title ≤ 30 chars. Short description ≤ 80 chars. Long description uses keyword density 2-3%, FAQ format, and addresses user intent directly.

ANDROID VITALS: Always target: ANR Rate < 0.2% (hard limit 0.47%), Crash Rate < 0.5% (hard limit 1.09%), Cold Start < 1.0s (hard limit 1.5s), Excessive Wake Locks < 5%. Provide concrete code to achieve these thresholds.

PUBLISHING: Guide through AAB builds, keystore management, Play Console track sequence (Internal → Closed → Open → Production), and App Store Connect submission.

Always provide complete, production-ready code. Use markdown code blocks with the correct language tag (dart, yaml, json). Be specific with package versions. Flag potential ANR/crash risks in code.`
        : "You are Sandbox.ai, a powerful and helpful AI assistant. Be concise, accurate, and insightful.";

    const chatMessages = [
      { role: "system" as const, content: systemPrompt },
      ...existingMessages
        .filter((m) => m.role === "user" || m.role === "assistant")
        .map((m) => ({
          role: m.role as "user" | "assistant",
          content: m.content,
        })),
    ];

    res.setHeader("Content-Type", "text/event-stream");
    res.setHeader("Cache-Control", "no-cache");
    res.setHeader("Connection", "keep-alive");

    let fullResponse = "";

    const stream = await openai.chat.completions.create({
      model,
      max_completion_tokens: 8192,
      messages: chatMessages,
      stream: true,
    });

    for await (const chunk of stream) {
      const content = chunk.choices[0]?.delta?.content;
      if (content) {
        fullResponse += content;
        res.write(`data: ${JSON.stringify({ content })}\n\n`);
      }
    }

    await db.insert(messages).values({
      conversationId: id,
      role: "assistant",
      content: fullResponse,
    });

    await db
      .update(conversations)
      .set({ updatedAt: new Date() })
      .where(eq(conversations.id, id));

    res.write(`data: ${JSON.stringify({ done: true })}\n\n`);
    res.end();
  } catch (err) {
    if (err instanceof ZodError) {
      if (!res.headersSent) {
        res.status(400).json({ error: err.flatten() });
      }
      return;
    }
    req.log.error({ err }, "Failed to send message");
    if (!res.headersSent) {
      res.status(500).json({ error: "Failed to send message" });
    } else {
      res.write(`data: ${JSON.stringify({ error: "Stream error" })}\n\n`);
      res.end();
    }
  }
});

export default router;
