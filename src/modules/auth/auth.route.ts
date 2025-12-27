import { FastifyInstance } from "fastify";
import { createUser } from './auth.controller'


export async function authRoutes(app: FastifyInstance) {
    app.post("/signup", createUser);
}

export default authRoutes