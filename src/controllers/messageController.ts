import { Response } from "express";
import prisma from "../prisma";
import { AuthRequest } from "../middleware/authMiddleware";

// POST /api/messages/send
export const sendMessage = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.userId;
    const { chatId, content } = req.body;

    if (!userId) return res.status(401).json({ message: "Unauthorized" });
    if (!chatId || !content)
      return res.status(400).json({ message: "chatId and content are required" });

    // Make sure chat exists
    const chat = await prisma.chat.findUnique({
      where: { id: chatId },
    });

    if (!chat) return res.status(404).json({ message: "Chat not found" });

    // Create message with sender included
    const message = await prisma.message.create({
      data: {
        content,
        senderId: userId,
        chatId,
      },
      include: {
        sender: true,  // ← MISSING IN YOUR CODE, REQUIRED
      },
    });

    // Update chat time
    await prisma.chat.update({
      where: { id: chatId },
      data: { updatedAt: new Date() },
    });

    return res.status(201).json({ message });
  } catch (error) {
    console.error("sendMessage error:", error);
    return res.status(500).json({ message: "Server error" });
  }
};

// GET /api/messages/:chatId
export const getMessages = async (req: AuthRequest, res: Response) => {
    try {
        const userId = req.userId;
        const { chatId } = req.params;

        if (!userId) return res.status(401).json({ message: "Unauthorized" });

        // Check chat exists
        const chat = await prisma.chat.findUnique({
            where: { id: chatId },
        });

        if (!chat) return res.status(404).json({ message: "Chat not found" });

        // Fetch messages instead of creating new ones
        const messages = await prisma.message.findMany({
            where: { chatId },
            orderBy: { createdAt: "asc" },
            include: {
                sender: true,
            },
        });

        return res.json({ messages });
    } catch (error) {
        console.error("getMessages error:", error);
        return res.status(500).json({ message: "Server error" });
    }
};

