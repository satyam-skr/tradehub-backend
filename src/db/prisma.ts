import { PrismaClient } from "../generated/prisma/index.js";
import { PrismaPg } from "@prisma/adapter-pg";
import pg from "pg";
import { env } from "../config/env.js";

const DATABASE_URL = env.DATABASE_URL;

const pool = new pg.Pool({
  connectionString: DATABASE_URL,
});


const adapter = new PrismaPg(pool);

const prisma = new PrismaClient({
  adapter,
  errorFormat: "pretty",
  log: ["info", "warn", "error"],
});

export { prisma };