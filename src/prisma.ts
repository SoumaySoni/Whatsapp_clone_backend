import dotenv from "dotenv";
dotenv.config();

import { PrismaClient } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import { Pool } from "pg";

// Create a PostgreSQL connection pool using DATABASE_URL
const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
});

// Wrap the pool with Prisma's PostgreSQL adapter
const adapter = new PrismaPg(pool);

// Create a PrismaClient instance using the adapter (required in Prisma 7)
const prisma = new PrismaClient({
    adapter,
});

export default prisma;
