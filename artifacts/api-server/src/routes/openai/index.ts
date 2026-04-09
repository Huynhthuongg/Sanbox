import { Router } from "express";
import conversationsRouter from "./conversations";
import messagesRouter from "./messages";
import imageRouter from "./image";
import { requireAuth } from "../../middlewares/requireAuth";

const router = Router();

router.use(requireAuth);

router.use("/conversations", conversationsRouter);
router.use("/conversations/:id/messages", messagesRouter);
router.use("/", imageRouter);

export default router;
