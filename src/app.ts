import Fastify from "fastify";
import jwt from "@fastify/jwt";
import cors from "@fastify/cors";
import fastifyCookie from "@fastify/cookie";
import { env } from "./config/env.js";
import authenticatePlugin from "./plugins/authenticate.js";
import websocket from "@fastify/websocket";
import { marketWs } from "./modules/market/market.ws.js";
import fastifySwagger from '@fastify/swagger';
import fastifySwaggerUi from '@fastify/swagger-ui'
import rateLimit from "@fastify/rate-limit";



const app = Fastify({ logger: true });
app.register(fastifySwagger, {
  openapi: {
    info: {
      title: 'Trading Platform API',
      description: 'A comprehensive trading platform API with authentication, order management, portfolio tracking, real-time market data, and AI-powered chatbot assistance',
      version: '1.0.0',
      contact: {
        name: 'API Support',
        email: 'support@tradingplatform.com'
      }
    },
    servers: [
      { url: 'http://localhost:4000', description: 'Development server' }
    ],
    tags: [
      { name: 'Authentication', description: 'User registration and login endpoints' },
      { name: 'Orders', description: 'Order placement, management, and order book endpoints' },
      { name: 'Portfolio', description: 'Portfolio and holdings management endpoints' },
      { name: 'Market', description: 'Market data and real-time pricing endpoints' },
      { name: 'Chatbot', description: 'AI-powered trading assistant endpoints' }
    ],
    components: {
      securitySchemes: {
        bearerAuth: {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT',
          description: 'Enter your JWT access token'
        }
      }
    }
  }
});
app.register(fastifySwaggerUi, {
  routePrefix: '/documentation',
  uiConfig: {
    docExpansion: 'list',
    deepLinking: true,
    persistAuthorization: true
  },
  uiHooks: {
    onRequest: function (request, reply, next) { next() },
    preHandler: function (request, reply, next) { next() }
  },
  staticCSP: true,
  transformStaticCSP: (header) => header
});

app.register(cors, {
  origin: (origin, cb) => cb(null, true),
  credentials: true,
});
app.register(rateLimit, {
  max: 100,
  timeWindow: "1 minute",
});

app.register(fastifyCookie);
app.register(websocket);
app.register(marketWs);

app.register(jwt, {
  secret: env.ACCESS_TOKEN_SECRET,
  cookie: {
    cookieName: "accessToken",
    signed: false
  },
  sign: {
    expiresIn: env.ACCESS_TOKEN_EXPIRY
  }
});



app.register(authenticatePlugin);


//routes import
import { basicRoutes } from "./config/basicRoutes.js";
import authRoutes from "./modules/auth/auth.route.js";
import orderRoutes from "./modules/order/order.route.js";
import portfolioRoutes from "./modules/portfolio/portfolio.route.js";
import marketRoutes from "./modules/market/market.routes.js";
import chatbotRoutes from "./modules/chatbot/chatbot.route.js"


//routes use
app.register(basicRoutes, {prefix: ""});
app.register(authRoutes, { prefix: "/api/v1/auth" });
app.register(orderRoutes, { prefix: "/api/v1/order", })
app.register(portfolioRoutes, { prefix: "/api/v1/portfolio" })
app.register(marketRoutes, { prefix: "/api/v1/market" });
app.register(chatbotRoutes, { prefix: "/api/v1/stocky" });



export default app;