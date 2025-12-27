import { FastifyInstance } from "fastify";
import { createUser, loginUser } from './auth.controller'


export async function authRoutes(app: FastifyInstance) {
    app.post("/signup", createUser);
    app.post("/login", loginUser);}

export default authRoutes