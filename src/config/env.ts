import dotenv from "dotenv";
import { z } from "zod";

dotenv.config();

const envSchema = z.object({
  ACCESS_TOKEN_SECRET: z.string().min(1, "ACCESS_TOKEN_SECRET is required"),
  REFRESH_TOKEN_SECRET: z.string().min(1, "REFRESH_TOKEN_SECRET is required"),
  ACCESS_TOKEN_EXPIRY: z.string().min(1, "ACCESS_TOKEN_EXPIRY is required"),
  REFRESH_TOKEN_EXPIRY: z.string().min(1, "REFRESH_TOKEN_EXPIRY is required"),
  PORT: z
    .string()
    .transform((val) => parseInt(val, 10))
    .default(4000), // default port if not set
  DATABASE_URL: z.string().url("DATABASE_URL must be a valid URL"),
});

// Parse and validate process.env
export const env = envSchema.parse(process.env);
