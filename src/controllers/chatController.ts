import { Response } from "express";
import prisma from "../prisma";
import { AuthRequest } from "../middleware/authMiddleware";

// GET /api/chats  → all chats for logged-in user
export const getUserChats = async (req: AuthRequest, res: Response) => {
    try {
        const userId = req.userId;
        if (!userId) {
            return res.status(401).json({ message: "Unauthorized" });
        }

        const chats = await prisma.chat.findMany({
            where: {
                OR: [
                    { user1Id: userId },
                    { user2Id: userId },
                ],
            },
            include: {
                user1: true,
                user2: true,
                messages: {
                    orderBy: { createdAt: "desc" },
                    take: 1, // last message only
                },
            },
            orderBy: {
                updatedAt: "desc",
            },
        });

        return res.json({ chats });
    } catch (error) {
        console.error("getUserChats error:", error);
        return res.status(500).json({ message: "Server error" });
    }
};

// POST /api/chats  → create or get 1-1 chat with another user
// body: { otherUserId: string }
export const createOrGetChat = async (req: AuthRequest, res: Response) => {
    try {
        const userId = req.userId;
        const { otherUserId } = req.body;

        if (!userId) {
            return res.status(401).json({ message: "Unauthorized" });
        }

        if (!otherUserId) {
            return res.status(400).json({ message: "otherUserId is required" });
        }

        if (otherUserId === userId) {
            return res.status(400).json({ message: "Cannot start chat with yourself" });
        }

        // Check if other user exists
        const otherUser = await prisma.user.findUnique({
            where: { id: otherUserId },
        });

        if (!otherUser) {
            return res.status(404).json({ message: "User not found" });
        }

        // Find existing chat between these two users (any order)
        let chat = await prisma.chat.findFirst({
            where: {
                OR: [
                    { user1Id: userId, user2Id: otherUserId },
                    { user1Id: otherUserId, user2Id: userId },
                ],
            },
            include: {
                user1: true,
                user2: true,
            },
        });

        // If no chat, create one
        if (!chat) {
            chat = await prisma.chat.create({
                data: {
                    user1Id: userId,
                    user2Id: otherUserId,
                },
                include: {
                    user1: true,
                    user2: true,
                },
            });
        }

        return res.status(200).json({ chat });
    } catch (error) {
        console.error("createOrGetChat error:", error);
        return res.status(500).json({ message: "Server error" });
    }
};
