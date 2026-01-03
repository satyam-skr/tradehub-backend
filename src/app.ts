import Fastify from "fastify";
import jwt from "@fastify/jwt";
import cors from "@fastify/cors";
import fastifyCookie from "@fastify/cookie";
import { env } from "./config/env";
import authenticatePlugin from "./plugins/authenticate";
import websocket from "@fastify/websocket";
import { marketWs } from "./modules/market/market.ws";



const app = Fastify({ logger: true });

app.register(cors, {
  origin: (origin, cb) => cb(null, true),
  credentials: true,
});
app.register(fastifyCookie);
app.register(websocket);
marketWs(app);

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

// app.register(jwt, {
//   secret: env.REFRESH_TOKEN_SECRET,
//   namespace: "refreshJwt",
//   jwtDecode: "refreshJwtDecode",
//   sign: {
//     expiresIn: env.REFRESH_TOKEN_EXPIRY
//   }
// });

app.register(authenticatePlugin);


//routes import
import authRoutes from "./modules/auth/auth.route";
import orderRoutes from "./modules/order/order.route";
import portfolioRoutes from "./modules/portfolio/portfolio.route";
import marketRoutes from "./modules/market/market.routes";
import chatbotRoutes from "./modules/chatbot/chatbot.route"


//routes use
app.register(authRoutes, { prefix: "/api/v1/auth" });
app.register(orderRoutes, { prefix: "/api/v1/order", })
app.register(portfolioRoutes, { prefix: "api/v1/portfolio" })
app.register(marketRoutes, { prefix: "/api/v1/market" });
app.register(chatbotRoutes, { prefix: "api/v1/stocky" });



export default app;