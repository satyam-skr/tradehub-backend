import { PrismaClient } from "../generated/prisma";
import { PrismaPg } from "@prisma/adapter-pg";
import pg from "pg";

const pool = new pg.Pool({
  connectionString: process.env.DATABASE_URL,
});


const adapter = new PrismaPg(pool);

const prisma = new PrismaClient({
  adapter,
  errorFormat: "pretty",
  log: ["info", "warn", "error"],
});

export { prisma };