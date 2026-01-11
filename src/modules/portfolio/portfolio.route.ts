import { FastifyInstance } from "fastify";
import { getPortfolio } from "./portfolio.controller";


export async function portfolioRoutes(app: FastifyInstance) {

    app.get("/", {
        onRequest: [app.authenticate],
        schema: {
            description: 'Get user portfolio with wallet and holdings',
            tags: ['Portfolio'],
            security: [{ bearerAuth: [] }],
            response: {
                200: {
                    description: 'Portfolio fetched successfully',
                    type: 'object',
                    properties: {
                        statusCode: { type: 'number' },
                        data: {
                            type: 'object',
                            properties: {
                                portfolio: {
                                    type: 'object',
                                    properties: {
                                        wallet: {
                                            type: 'object',
                                            properties: {
                                                id: { type: 'string' },
                                                userId: { type: 'string' },
                                                balance: { type: 'number', description: 'Current wallet balance' },
                                                createdAt: { type: 'string', format: 'date-time' },
                                                updatedAt: { type: 'string', format: 'date-time' }
                                            }
                                        },
                                        holdings: {
                                            type: 'array',
                                            items: {
                                                type: 'object',
                                                properties: {
                                                    id: { type: 'string' },
                                                    userId: { type: 'string' },
                                                    symbol: { type: 'string', description: 'Stock symbol' },
                                                    quantity: { type: 'number', description: 'Total shares held' },
                                                    avgPrice: { type: 'number', description: 'Average purchase price' },
                                                    createdAt: { type: 'string', format: 'date-time' },
                                                    updatedAt: { type: 'string', format: 'date-time' }
                                                }
                                            }
                                        }
                                    }
                                }
                            }
                        },
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
    }, getPortfolio);


}

export default portfolioRoutes;