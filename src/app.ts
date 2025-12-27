import Fastify from "fastify";
import jwt from "@fastify/jwt";
import cors from "@fastify/cors";
import fastifyCookie from "@fastify/cookie";
import { env } from "./config/env";
import authenticatePlugin from "./plugins/authenticate";


const app = Fastify({ logger: true });

app.register(cors);
app.register(fastifyCookie);
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


//routes use
app.register(authRoutes, { prefix: "/api/v1/auth" });
app.register(orderRoutes, {
  prefix: "/api/v1/order",
})


export default app;