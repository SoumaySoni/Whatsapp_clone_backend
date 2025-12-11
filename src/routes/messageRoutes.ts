import { Router } from "express";
import { authMiddleware } from "../middleware/authMiddleware";
import { sendMessage, getMessages } from "../controllers/messageController";

const router = Router();

router.post("/send", authMiddleware, sendMessage);
router.get("/:chatId", authMiddleware, getMessages);

export default router;
