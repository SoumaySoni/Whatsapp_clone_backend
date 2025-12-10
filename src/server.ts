import express, { Request, Response } from "express";
import http from "http";
import cors from "cors";
import dotenv from "dotenv";
import { Server as SocketIOServer } from "socket.io";
import prisma from "./prisma";

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

// Test route
app.get("/", (req: Request, res: Response) => {
    res.json({ message: "WhatsApp backend server running..." });
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
