import { FastifyInstance } from "fastify";
import { chatController } from "./chatbot.controller"

export async function orderRoutes(app: FastifyInstance) {
    app.post("/chat", {
        onRequest: [app.authenticate]
    }, chatController);
    
}

export default orderRoutes