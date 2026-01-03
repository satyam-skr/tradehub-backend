// import { FastifyDynamicSwaggerOptions } from "@fastify/swagger";

// export const swaggerOptions: FastifyDynamicSwaggerOptions = {
//   openapi: {
//     info: {
//       title: "Trading Platform API",
//       description: "A comprehensive trading platform API with authentication, order management, portfolio tracking, and real-time market data",
//       version: "1.0.0",
//       contact: {
//         name: "Satyam Kumar Rai",
//         email: "support@tradingplatform.com",
//       },
//     },
//     servers: [
//       {
//         url: "http://localhost:3000",
//         description: "Development server",
//       },
//     ],
//     tags: [
//       { name: "Authentication", description: "User authentication and authorization endpoints" },
//       { name: "Orders", description: "Order placement and management endpoints" },
//       { name: "Portfolio", description: "Portfolio and holdings endpoints" },
//       { name: "Market", description: "Market data and pricing endpoints" },
//     ],
//     components: {
//       securitySchemes: {
//         bearerAuth: {
//           type: "http",
//           scheme: "bearer",
//           bearerFormat: "JWT",
//           description: "Enter your JWT token",
//         },
//         cookieAuth: {
//           type: "apiKey",
//           in: "cookie",
//           name: "accessToken",
//           description: "JWT token stored in cookie",
//         },
//       },
//       schemas: {
//         // Error responses
//         ApiError: {
//           type: "object",
//           properties: {
//             statusCode: { type: "number", example: 400 },
//             message: { type: "string", example: "Error message" },
//             success: { type: "boolean", example: false },
//             errors: { type: "object" },
//           },
//         },
//         ApiResponse: {
//           type: "object",
//           properties: {
//             statusCode: { type: "number", example: 200 },
//             data: { type: "object" },
//             message: { type: "string", example: "Success message" },
//             success: { type: "boolean", example: true },
//           },
//         },
//         // Auth schemas
//         SignupRequest: {
//           type: "object",
//           required: ["email", "password"],
//           properties: {
//             email: {
//               type: "string",
//               format: "email",
//               example: "user@example.com",
//               description: "User email address",
//             },
//             password: {
//               type: "string",
//               minLength: 6,
//               example: "password123",
//               description: "User password (minimum 6 characters)",
//             },
//           },
//         },
//         LoginRequest: {
//           type: "object",
//           required: ["email", "password"],
//           properties: {
//             email: {
//               type: "string",
//               format: "email",
//               example: "user@example.com",
//               description: "User email address",
//             },
//             password: {
//               type: "string",
//               minLength: 6,
//               example: "password123",
//               description: "User password",
//             },
//           },
//         },
//         UserResponse: {
//           type: "object",
//           properties: {
//             id: { type: "string", example: "cm5e8vf9s0000h8g2gqm5o3pr" },
//             email: { type: "string", example: "user@example.com" },
//             createdAt: { type: "string", format: "date-time" },
//             updatedAt: { type: "string", format: "date-time" },
//           },
//         },
//         AuthResponse: {
//           type: "object",
//           properties: {
//             statusCode: { type: "number", example: 201 },
//             data: {
//               type: "object",
//               properties: {
//                 user: { $ref: "#/components/schemas/UserResponse" },
//                 accessToken: { type: "string", example: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..." },
//               },
//             },
//             message: { type: "string", example: "signup successful" },
//             success: { type: "boolean", example: true },
//           },
//         },
//         // Order schemas
//         PlaceOrderRequest: {
//           type: "object",
//           required: ["symbol", "side", "type", "quantity"],
//           properties: {
//             symbol: {
//               type: "string",
//               example: "AAPL",
//               description: "Stock symbol/ticker",
//             },
//             side: {
//               type: "string",
//               enum: ["BUY", "SELL"],
//               example: "BUY",
//               description: "Order side",
//             },
//             type: {
//               type: "string",
//               enum: ["LIMIT", "MARKET"],
//               example: "LIMIT",
//               description: "Order type",
//             },
//             price: {
//               type: "number",
//               example: 150.50,
//               description: "Price per unit (required for LIMIT orders, must not be provided for MARKET orders)",
//             },
//             quantity: {
//               type: "number",
//               example: 10,
//               description: "Order quantity",
//             },
//           },
//         },
//         Order: {
//           type: "object",
//           properties: {
//             id: { type: "string", example: "cm5e8vf9s0001h8g2abcdefgh" },
//             symbol: { type: "string", example: "AAPL" },
//             side: { type: "string", enum: ["BUY", "SELL"], example: "BUY" },
//             type: { type: "string", enum: ["LIMIT", "MARKET"], example: "LIMIT" },
//             price: { type: "number", example: 150.50 },
//             quantity: { type: "number", example: 10 },
//             filledQuantity: { type: "number", example: 0 },
//             status: {
//               type: "string",
//               enum: ["OPEN", "PARTIAL", "FILLED", "CANCELLED"],
//               example: "OPEN",
//             },
//             userId: { type: "string", example: "cm5e8vf9s0000h8g2gqm5o3pr" },
//             createdAt: { type: "string", format: "date-time" },
//             updatedAt: { type: "string", format: "date-time" },
//           },
//         },
//         OrderResponse: {
//           type: "object",
//           properties: {
//             statusCode: { type: "number", example: 201 },
//             data: {
//               type: "object",
//               properties: {
//                 order: { $ref: "#/components/schemas/Order" },
//               },
//             },
//             message: { type: "string", example: "order created successfully" },
//             success: { type: "boolean", example: true },
//           },
//         },
//         OrdersListResponse: {
//           type: "object",
//           properties: {
//             statusCode: { type: "number", example: 200 },
//             data: {
//               type: "object",
//               properties: {
//                 orders: {
//                   type: "array",
//                   items: { $ref: "#/components/schemas/Order" },
//                 },
//               },
//             },
//             message: { type: "string", example: "orders fetched successfully" },
//             success: { type: "boolean", example: true },
//           },
//         },
//         OrderBook: {
//           type: "object",
//           properties: {
//             bids: {
//               type: "array",
//               items: {
//                 type: "object",
//                 properties: {
//                   price: { type: "number", example: 150.25 },
//                   quantity: { type: "number", example: 100 },
//                 },
//               },
//               description: "Buy orders sorted by price (highest first)",
//             },
//             asks: {
//               type: "array",
//               items: {
//                 type: "object",
//                 properties: {
//                   price: { type: "number", example: 150.75 },
//                   quantity: { type: "number", example: 50 },
//                 },
//               },
//               description: "Sell orders sorted by price (lowest first)",
//             },
//           },
//         },
//         OrderBookResponse: {
//           type: "object",
//           properties: {
//             statusCode: { type: "number", example: 200 },
//             data: {
//               type: "object",
//               properties: {
//                 orderBook: { $ref: "#/components/schemas/OrderBook" },
//               },
//             },
//             message: { type: "string", example: "orderBook fetched successfully" },
//             success: { type: "boolean", example: true },
//           },
//         },
//         // Portfolio schemas
//         StockHolding: {
//           type: "object",
//           properties: {
//             id: { type: "string", example: "cm5e8vf9s0003h8g2xyz12345" },
//             userId: { type: "string", example: "cm5e8vf9s0000h8g2gqm5o3pr" },
//             symbol: { type: "string", example: "AAPL" },
//             quantity: { type: "number", example: 50 },
//             avgPrice: { type: "number", example: 145.30 },
//             createdAt: { type: "string", format: "date-time" },
//             updatedAt: { type: "string", format: "date-time" },
//           },
//         },
//         Wallet: {
//           type: "object",
//           properties: {
//             id: { type: "string", example: "cm5e8vf9s0002h8g2wallet001" },
//             userId: { type: "string", example: "cm5e8vf9s0000h8g2gqm5o3pr" },
//             balance: { type: "number", example: 10000.50 },
//             createdAt: { type: "string", format: "date-time" },
//             updatedAt: { type: "string", format: "date-time" },
//           },
//         },
//         Portfolio: {
//           type: "object",
//           properties: {
//             wallet: { $ref: "#/components/schemas/Wallet" },
//             holdings: {
//               type: "array",
//               items: { $ref: "#/components/schemas/StockHolding" },
//             },
//           },
//         },
//         PortfolioResponse: {
//           type: "object",
//           properties: {
//             statusCode: { type: "number", example: 200 },
//             data: {
//               type: "object",
//               properties: {
//                 portfolio: { $ref: "#/components/schemas/Portfolio" },
//               },
//             },
//             message: { type: "string", example: "Success" },
//             success: { type: "boolean", example: true },
//           },
//         },
//         // Market schemas
//         PriceData: {
//           type: "object",
//           properties: {
//             symbol: { type: "string", example: "AAPL" },
//             price: { type: "number", example: 150.50 },
//           },
//         },
//         AllPricesResponse: {
//           type: "object",
//           additionalProperties: {
//             type: "number",
//           },
//           example: {
//             AAPL: 150.50,
//             GOOGL: 2800.75,
//             MSFT: 350.25,
//           },
//         },
//         SinglePriceResponse: {
//           type: "object",
//           properties: {
//             price: { type: "number", example: 150.50 },
//           },
//         },
//       },
//     },
//   },
// };

// export const swaggerUiOptions = {
//   routePrefix: "/docs",
//   staticCSP: true,
//   transformStaticCSP: (header: string) => header,
//   exposeRoute: true,
// };
