import express, { Request, Response } from "express";
import http from "http";
import cors from "cors";
import dotenv from "dotenv";
import { Server as SocketIOServer } from "socket.io";
import prisma from "./prisma";
import authRoutes from "./routes/authRoutes";
import { authMiddleware } from "./middleware/authMiddleware";
import chatRoutes from "./routes/chatRoutes";
import messageRoutes from "./routes/messageRoutes";

dotenv.config();

const app = express();

// Middlewares
app.use(express.json());
app.use(
    cors({
        origin: process.env.CLIENT_URL,
        credentials: true,
    })
);
app.use("/api/auth", authRoutes);
app.use("/api/chats", chatRoutes);
app.use("/api/messages", messageRoutes);

// Test route
app.get("/", (req: Request, res: Response) => {
    res.json({ message: "WhatsApp backend server running..." });
});

app.get("/protected", authMiddleware, (req, res) => {
    res.json({ message: "Access granted" });
});

// HTTP server + Socket.IO
const server = http.createServer(app);
const io = new SocketIOServer(server, {
    cors: {
        origin: process.env.CLIENT_URL,
        methods: ["GET", "POST"],
    },
});

// Socket events (basic)
io.on("connection", (socket) => {
    console.log("User connected:", socket.id);

    // Join user room (userId will come from frontend)
    socket.on("join", (userId: string) => {
        socket.join(userId);
        console.log(`User ${userId} joined their room`);
    });

    // Join specific chat room
    socket.on("joinChat", (chatId: string) => {
        socket.join(chatId);
        console.log(`Socket ${socket.id} joined chat ${chatId}`);
    });

    // Listen for messages and send to chat room
    socket.on("sendMessage", (data) => {
        const { chatId, message } = data;
        io.to(chatId).emit("receiveMessage", message);
    });

    socket.on("disconnect", () => {
        console.log("User disconnected:", socket.id);
    });
});

const PORT = process.env.PORT || 5000;

server.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});

prisma.$connect()
    .then(() => console.log("Prisma connected to PostgreSQL"))
    .catch((err) => console.error("Prisma DB connection error:", err));
