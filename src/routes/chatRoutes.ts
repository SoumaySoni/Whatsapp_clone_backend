import { Router } from "express";
import { authMiddleware } from "../middleware/authMiddleware";
import { getUserChats, createOrGetChat } from "../controllers/chatController";

const router = Router();

router.get("/", authMiddleware, getUserChats);
router.post("/", authMiddleware, createOrGetChat);

export default router;
