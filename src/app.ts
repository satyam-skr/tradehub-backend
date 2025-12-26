import Fastify from "fastify";
import jwt from "@fastify/jwt";
import cors from "@fastify/cors";
import dotenv from "dotenv";

dotenv.config()

const app = Fastify({ logger: true });

app.register(cors);
app.register(jwt, {
  secret: process.env.JWT_SECRET!
});




export default app;