import { Router, type IRouter } from "express";
import healthRouter from "./health";
import openaiRouter from "./openai";
import mobileRouter from "./mobile";
import adminRouter from "./admin";
import stripeRouter from "./stripe";

const router: IRouter = Router();

router.use(healthRouter);
router.use("/openai", openaiRouter);
router.use("/mobile", mobileRouter);
router.use("/admin", adminRouter);
router.use("/stripe", stripeRouter);

export default router;
