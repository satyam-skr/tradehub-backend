import { FastifyInstance } from "fastify";
import { placeOrder, getMyOrders, deleteOrderById, getOrderBook } from "./order.controller.js"

export async function orderRoutes(app: FastifyInstance) {

  app.post("/create", {
    onRequest: [app.authenticate],
    schema: {
      description: 'Place a new order (BUY/SELL, LIMIT/MARKET)',
      tags: ['Orders'],
      security: [{ bearerAuth: [] }],
      body: {
        type: 'object',
        required: ['symbol', 'side', 'type', 'quantity'],
        properties: {
          symbol: {
            type: 'string',
            description: 'Stock symbol/ticker'
          },
          side: {
            type: 'string',
            enum: ['BUY', 'SELL'],
            description: 'Order side'
          },
          type: {
            type: 'string',
            enum: ['LIMIT', 'MARKET'],
            description: 'Order type'
          },
          price: {
            type: 'number',
            description: 'Price per unit (required for LIMIT orders)'
          },
          quantity: {
            type: 'number',
            description: 'Order quantity'
          }
        }
      },
      response: {
        201: {
          description: 'Order created successfully',
          type: 'object',
          properties: {
            statusCode: { type: 'number' },
            data: {
              type: 'object',
              properties: {
                order: {
                  type: 'object',
                  properties: {
                    id: { type: 'string' },
                    symbol: { type: 'string' },
                    side: { type: 'string', enum: ['BUY', 'SELL'] },
                    type: { type: 'string', enum: ['LIMIT', 'MARKET'] },
                    price: { type: 'number' },
                    quantity: { type: 'number' },
                    filledQuantity: { type: 'number' },
                    status: { type: 'string', enum: ['OPEN', 'PARTIAL', 'FILLED', 'CANCELLED'] },
                    userId: { type: 'string' },
                    createdAt: { type: 'string', format: 'date-time' },
                    updatedAt: { type: 'string', format: 'date-time' }
                  }
                }
              }
            },
            message: { type: 'string' },
            success: { type: 'boolean' }
          }
        },
        400: {
          description: 'Invalid request format',
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
  }, placeOrder);

  app.get("/", {
    onRequest: [app.authenticate],
    schema: {
      description: 'Get all orders for authenticated user',
      tags: ['Orders'],
      security: [{ bearerAuth: [] }],
      response: {
        200: {
          description: 'Orders fetched successfully',
          type: 'object',
          properties: {
            statusCode: { type: 'number' },
            data: {
              type: 'object',
              properties: {
                orders: {
                  type: 'array',
                  items: {
                    type: 'object',
                    properties: {
                      id: { type: 'string' },
                      symbol: { type: 'string' },
                      side: { type: 'string', enum: ['BUY', 'SELL'] },
                      type: { type: 'string', enum: ['LIMIT', 'MARKET'] },
                      price: { type: 'number' },
                      quantity: { type: 'number' },
                      filledQuantity: { type: 'number' },
                      status: { type: 'string', enum: ['OPEN', 'PARTIAL', 'FILLED', 'CANCELLED'] },
                      userId: { type: 'string' },
                      createdAt: { type: 'string', format: 'date-time' },
                      updatedAt: { type: 'string', format: 'date-time' }
                    }
                  }
                }
              }
            },
            message: { type: 'string' },
            success: { type: 'boolean' }
          }
        },
        400: {
          description: 'Unauthenticated',
          type: 'object',
          properties: {
            statusCode: { type: 'number' },
            message: { type: 'string' },
            success: { type: 'boolean' }
          }
        }
      }
    }
  }, getMyOrders)

  app.delete("/:orderId", {
    onRequest: [app.authenticate],
    schema: {
      description: 'Cancel/delete a specific order',
      tags: ['Orders'],
      security: [{ bearerAuth: [] }],
      params: {
        type: 'object',
        properties: {
          orderId: {
            type: 'string',
            description: 'The unique ID of the order to cancel'
          }
        }
      },
      response: {
        200: {
          description: 'Order deleted successfully',
          type: 'object',
          properties: {
            statusCode: { type: 'number' },
            data: { type: 'object' },
            message: { type: 'string' },
            success: { type: 'boolean' }
          }
        },
        400: {
          description: 'Unauthenticated',
          type: 'object',
          properties: {
            statusCode: { type: 'number' },
            message: { type: 'string' },
            success: { type: 'boolean' }
          }
        },
        500: {
          description: 'Error deleting order',
          type: 'object',
          properties: {
            statusCode: { type: 'number' },
            message: { type: 'string' },
            success: { type: 'boolean' }
          }
        }
      }
    }
  }, deleteOrderById)

  app.get("/orderbook/:ticker", {
    schema: {
      description: 'Get order book for a specific stock',
      tags: ['Orders'],
      params: {
        type: 'object',
        properties: {
          ticker: {
            type: 'string',
            description: 'Stock symbol/ticker'
          }
        }
      },
      response: {
        200: {
          description: 'Order book fetched successfully',
          type: 'object',
          properties: {
            statusCode: { type: 'number' },
            data: {
              type: 'object',
              properties: {
                orderBook: {
                  type: 'object',
                  properties: {
                    bids: {
                      type: 'array',
                      description: 'Buy orders sorted by price (highest first)',
                      items: {
                        type: 'object',
                        properties: {
                          price: { type: 'number' },
                          quantity: { type: 'number' }
                        }
                      }
                    },
                    asks: {
                      type: 'array',
                      description: 'Sell orders sorted by price (lowest first)',
                      items: {
                        type: 'object',
                        properties: {
                          price: { type: 'number' },
                          quantity: { type: 'number' }
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
        }
      }
    }
  }, getOrderBook)
}

export default orderRoutes