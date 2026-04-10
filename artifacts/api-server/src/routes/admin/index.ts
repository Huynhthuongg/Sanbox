import { Router, Request, Response } from "express";
import { requireAuth } from "../../middlewares/requireAuth";
import { requireRole } from "../../middlewares/requireRole";
import { db } from "@workspace/db";
import { conversations } from "@workspace/db";
import { sql } from "drizzle-orm";

const router = Router();

router.use(requireAuth);

const CLERK_SECRET_KEY = process.env.CLERK_SECRET_KEY ?? "";
const CLERK_API = "https://api.clerk.com/v1";

interface ClerkEmailAddress {
  email_address: string;
}

interface ClerkPublicMetadata {
  role?: string;
  plan?: string;
}

interface ClerkUser {
  id: string;
  email_addresses: ClerkEmailAddress[];
  first_name: string | null;
  last_name: string | null;
  image_url: string;
  public_metadata: ClerkPublicMetadata;
  created_at: number;
  last_sign_in_at: number | null;
}

interface ClerkUserCount {
  total_count: number;
}

async function clerkFetch<T>(path: string, options: RequestInit = {}): Promise<T> {
  const res = await fetch(`${CLERK_API}${path}`, {
    ...options,
    headers: {
      Authorization: `Bearer ${CLERK_SECRET_KEY}`,
      "Content-Type": "application/json",
      ...options.headers,
    },
  });
  if (!res.ok) {
    const text = await res.text();
    throw new Error(`Clerk API error ${res.status}: ${text}`);
  }
  return res.json() as Promise<T>;
}

router.get("/users", requireRole("admin"), async (_req: Request, res: Response) => {
  try {
    const data = await clerkFetch<ClerkUser[]>("/users?limit=100&offset=0");
    const users = data.map((u) => ({
      id: u.id,
      email: u.email_addresses?.[0]?.email_address ?? "",
      firstName: u.first_name ?? "",
      lastName: u.last_name ?? "",
      imageUrl: u.image_url ?? "",
      role: u.public_metadata?.role ?? "user",
      plan: u.public_metadata?.plan ?? "free",
      createdAt: u.created_at,
      lastSignInAt: u.last_sign_in_at,
    }));
    res.json(users);
  } catch {
    res.status(500).json({ error: "Failed to list users" });
  }
});

const VALID_ROLES = ["user", "moderator", "admin"] as const;
const VALID_PLANS = ["free", "pro", "enterprise"] as const;

router.patch("/users/:id", requireRole("admin"), async (req: Request<{ id: string }>, res: Response) => {
  const { id } = req.params;
  const { role, plan } = req.body as { role?: string; plan?: string };

  if (role !== undefined && !(VALID_ROLES as readonly string[]).includes(role)) {
    res.status(400).json({ error: `Invalid role. Allowed: ${VALID_ROLES.join(", ")}` });
    return;
  }
  if (plan !== undefined && !(VALID_PLANS as readonly string[]).includes(plan)) {
    res.status(400).json({ error: `Invalid plan. Allowed: ${VALID_PLANS.join(", ")}` });
    return;
  }

  try {
    const currentUser = await clerkFetch<ClerkUser>(`/users/${id}`);
    const currentMeta: ClerkPublicMetadata = currentUser.public_metadata ?? {};
    const updatedMeta: ClerkPublicMetadata = { ...currentMeta };
    if (role !== undefined) updatedMeta.role = role;
    if (plan !== undefined) updatedMeta.plan = plan;

    await clerkFetch<unknown>(`/users/${id}/metadata`, {
      method: "PATCH",
      body: JSON.stringify({ public_metadata: updatedMeta }),
    });

    res.json({ success: true, userId: id, role: updatedMeta.role, plan: updatedMeta.plan });
  } catch {
    res.status(500).json({ error: "Failed to update user" });
  }
});

router.get("/stats", requireRole("moderator"), async (_req: Request, res: Response) => {
  try {
    const [{ total_conversations }] = await db
      .select({ total_conversations: sql<number>`count(*)::int` })
      .from(conversations);

    let totalUsers = 0;
    try {
      const countData = await clerkFetch<ClerkUserCount>("/users/count");
      totalUsers = countData.total_count ?? 0;
    } catch {
      // count is a best-effort stat; don't fail the whole request
    }

    res.json({
      totalConversations: total_conversations ?? 0,
      totalUsers,
    });
  } catch {
    res.status(500).json({ error: "Failed to get stats" });
  }
});

export default router;
