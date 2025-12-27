import Fastify from "fastify";
import jwt from "@fastify/jwt";
import cors from "@fastify/cors";
import { env } from "./config/env";

const app = Fastify({ logger: true });

app.register(cors);
app.register(jwt, {
  secret: env.ACCESS_TOKEN_SECRET,
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



//routes import
import authRoutes from "./modules/auth/auth.route";


//routes use
app.register(authRoutes, {prefix: "/api/v1/auth"})


export default app;