import { FastifyInstance } from "fastify";
import { chatController } from "./chatbot.controller"

export async function chatbotRoute(app: FastifyInstance) {
    app.post("/chat", {
        onRequest: [app.authenticate],
        schema: {
            description: 'Send message to AI trading chatbot',
            tags: ['Chatbot'],
            security: [{ bearerAuth: [] }],
            body: {
                type: 'object',
                required: ['userMessage'],
                properties: {
                    userMessage: {
                        type: 'string',
                        description: 'The message or question to send to the chatbot'
                    }
                }
            },
            response: {
                200: {
                    description: 'Message sent successfully',
                    type: 'object',
                    properties: {
                        statusCode: { type: 'number' },
                        data: {
                            type: 'object',
                            properties: {
                                chatbotResponse: { type: 'string' }
                            }
                        },
                        message: { type: 'string' },
                        success: { type: 'boolean' }
                    }
                },
                400: {
                    description: 'Bad request',
                    type: 'object',
                    properties: {
                        statusCode: { type: 'number' },
                        message: { type: 'string' },
                        success: { type: 'boolean' }
                    }
                },
                401: {
                    description: 'Unauthorized',
                    type: 'object',
                    properties: {
                        statusCode: { type: 'number' },
                        message: { type: 'string' },
                        success: { type: 'boolean' }
                    }
                }
            }
        }
    }, chatController);
    
}

export default chatbotRoute