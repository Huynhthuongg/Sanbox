import { Router, type Request, type Response } from "express";
import Stripe from "stripe";
import { logger } from "../lib/logger";

const router = Router();

const stripe = new Stripe(process.env["STRIPE_SECRET_KEY"] ?? "", {
  apiVersion: "2026-03-25.dahlia",
});

const APP_URL = process.env["APP_URL"] ?? "https://sandbox-ai.app";

// ── Price config ────────────────────────────────────────────────────
const PRICES = {
  pro_monthly: {
    unit_amount: 1900,       // $19.00
    currency: "usd",
    recurring: { interval: "month" as const },
    product_data: { name: "Sandbox.ai Pro · Tháng", description: "Không giới hạn messages · 4 AI Modes · Vector Memory · One-Click Deploy" },
  },
  pro_annual: {
    unit_amount: 16800,      // $14/tháng × 12 = $168/năm
    currency: "usd",
    recurring: { interval: "year" as const },
    product_data: { name: "Sandbox.ai Pro · Năm", description: "Không giới hạn messages · 4 AI Modes · Vector Memory · One-Click Deploy · Tiết kiệm 26%" },
  },
};

// ── POST /api/stripe/create-checkout-session ────────────────────────
router.post("/create-checkout-session", async (req: Request, res: Response) => {
  const { plan, userId, userEmail } = req.body as {
    plan: "pro_monthly" | "pro_annual";
    userId?: string;
    userEmail?: string;
  };

  if (!plan || !PRICES[plan]) {
    res.status(400).json({ error: "Invalid plan. Expected: pro_monthly | pro_annual" });
    return;
  }

  try {
    const session = await stripe.checkout.sessions.create({
      mode: "subscription",
      payment_method_types: ["card"],
      line_items: [
        {
          price_data: PRICES[plan],
          quantity: 1,
        },
      ],
      customer_email: userEmail,
      client_reference_id: userId,
      metadata: { plan, userId: userId ?? "" },
      success_url: `${APP_URL}/chat?upgrade=success&session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${APP_URL}/pricing?upgrade=cancelled`,
      allow_promotion_codes: true,
      subscription_data: {
        metadata: { plan, userId: userId ?? "" },
        trial_period_days: 7,
      },
    });

    logger.info({ sessionId: session.id, plan, userId }, "Stripe checkout session created");
    res.json({ url: session.url, sessionId: session.id });
  } catch (err) {
    logger.error({ err }, "Failed to create Stripe checkout session");
    res.status(500).json({ error: "Failed to create checkout session" });
  }
});

// ── GET /api/stripe/session/:sessionId ─────────────────────────────
router.get("/session/:sessionId", async (req: Request, res: Response) => {
  const { sessionId } = req.params;
  try {
    const session = await stripe.checkout.sessions.retrieve(sessionId as string, {
      expand: ["subscription", "customer"],
    });
    res.json({
      status: session.status,
      paymentStatus: session.payment_status,
      plan: session.metadata?.["plan"],
      customerEmail: session.customer_email,
    });
  } catch (err) {
    logger.error({ err }, "Failed to retrieve Stripe session");
    res.status(404).json({ error: "Session not found" });
  }
});

// ── POST /api/stripe/webhook ────────────────────────────────────────
// IMPORTANT: Must use express.raw() for this route (set in app.ts)
router.post("/webhook", async (req: Request, res: Response) => {
  const webhookSecret = process.env["STRIPE_WEBHOOK_SECRET"];
  const sig = req.headers["stripe-signature"] as string;

  let event: Stripe.Event;

  try {
    if (webhookSecret && sig) {
      event = stripe.webhooks.constructEvent(req.body as Buffer, sig, webhookSecret);
    } else {
      // Dev mode: accept without signature verification
      event = req.body as Stripe.Event;
    }
  } catch (err) {
    logger.error({ err }, "Stripe webhook signature verification failed");
    res.status(400).json({ error: "Webhook signature verification failed" });
    return;
  }

  logger.info({ type: event.type }, "Stripe webhook received");

  switch (event.type) {
    case "checkout.session.completed": {
      const session = event.data.object as Stripe.Checkout.Session;
      const { userId, plan } = session.metadata ?? {};
      logger.info({ userId, plan, sessionId: session.id }, "✅ Payment successful — upgrade user to Pro");
      // TODO: Update user plan in DB when users table is set up
      break;
    }
    case "customer.subscription.deleted": {
      const sub = event.data.object as Stripe.Subscription;
      const userId = sub.metadata?.["userId"];
      logger.info({ userId }, "❌ Subscription cancelled — downgrade user to Free");
      // TODO: Downgrade user in DB
      break;
    }
    case "invoice.payment_failed": {
      const inv = event.data.object as Stripe.Invoice;
      logger.warn({ customerId: inv.customer }, "⚠️ Invoice payment failed");
      break;
    }
    default:
      logger.debug({ type: event.type }, "Unhandled Stripe event");
  }

  res.json({ received: true });
});

// ── GET /api/stripe/portal ──────────────────────────────────────────
router.post("/portal", async (req: Request, res: Response) => {
  const { customerId } = req.body as { customerId?: string };
  if (!customerId) {
    res.status(400).json({ error: "customerId required" });
    return;
  }
  try {
    const session = await stripe.billingPortal.sessions.create({
      customer: customerId,
      return_url: `${APP_URL}/settings`,
    });
    res.json({ url: session.url });
  } catch (err) {
    logger.error({ err }, "Failed to create billing portal session");
    res.status(500).json({ error: "Failed to create billing portal" });
  }
});

export default router;
