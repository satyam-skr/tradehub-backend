import { FastifyInstance } from "fastify";
import { priceStore } from "./priceStore.js";

export async function marketRoutes(app: FastifyInstance) {
    app.get("/prices", {
        schema: {
            description: 'Get all stock prices',
            tags: ['Market'],
            response: {
                200: {
                    description: 'All stock prices',
                    type: 'object',
                    additionalProperties: { type: 'number' }
                }
            }
        }
    }, async () => {
        return priceStore.all();
    });

    app.get("/price/:symbol", {
        schema: {
            description: 'Get price for a specific stock',
            tags: ['Market'],
            params: {
                type: 'object',
                properties: {
                    symbol: {
                        type: 'string',
                        description: 'Stock symbol/ticker'
                    }
                }
            },
            response: {
                200: {
                    description: 'Stock price',
                    type: 'object',
                    properties: {
                        price: {
                            type: 'number',
                            description: 'Current price of the stock'
                        }
                    }
                }
            }
        }
    }, async (req) => {
        const { symbol } = req.params as any;
        return { price: priceStore.get(symbol) };
    });
}

export default marketRoutes;