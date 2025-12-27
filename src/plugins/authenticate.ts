import { FastifyPluginAsync } from "fastify";
import { ApiError } from "../utils/ApiError";
import fp from "fastify-plugin";

const authenticate: FastifyPluginAsync = async (app) => {
    app.decorate(
        "authenticate",
        async (req: any, reply: any) => {
            try {
                // If Authorization header exists → verify header token
                if (req.headers.authorization) {
                    await req.jwtVerify();
                    return;
                }

                // Else try cookie token
                if (req.cookies?.accessToken) {
                    await req.jwtVerify({ onlyCookie: true });
                    return;
                }

                // No token found
                throw new ApiError(401, "Token missing");
            } catch (err) {
                reply.code(401).send(
                    new ApiError(
                        401,
                        "Unauthorized",
                        err
                    )
                );
            }
        }
    );
};

export default fp(authenticate);
