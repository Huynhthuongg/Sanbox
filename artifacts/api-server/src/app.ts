import express, { type Express } from "express";
import cors from "cors";
import pinoHttp from "pino-http";
import { CLERK_PROXY_PATH, clerkProxyMiddleware } from "./middlewares/clerkProxyMiddleware";
import { clerkJwtMiddleware } from "./middlewares/clerkJwt";
import router from "./routes";
import { logger } from "./lib/logger";

const app: Express = express();

app.use(
  pinoHttp({
    logger,
    serializers: {
      req(req) {
        return {
          id: req.id,
          method: req.method,
          url: req.url?.split("?")[0],
        };
      },
      res(res) {
        return {
          statusCode: res.statusCode,
        };
      },
    },
  }),
);

app.use(CLERK_PROXY_PATH, clerkProxyMiddleware());

app.use(cors({ credentials: true, origin: true }));

// Raw body for Stripe webhook signature verification
app.use("/api/stripe/webhook", express.raw({ type: "application/json" }));

app.use(express.json({ limit: "50mb" }));
app.use(express.urlencoded({ extended: true, limit: "50mb" }));

app.use(clerkJwtMiddleware);

app.use("/api", router);

export default app;
