import { FastifyInstance, FastifyReply, FastifyRequest } from "fastify";


export async function basicRoutes(app: FastifyInstance){
    app.get("/", async function root(
        req: FastifyRequest,
        reply: FastifyReply
    ){
        return reply.status(200).send({
            "status":"ok",
            "message":"api is up and running"
        });
    })

    app.get("/health", async function health(
        req: FastifyRequest,
        reply: FastifyReply
    ){
        return reply.status(200).send({
            "status":"ok",
            "message":"api is healthy"
        });
    })
    
    app.get("/api/health", async function health(
        req: FastifyRequest,
        reply: FastifyReply
    ){
        return reply.status(200).send({
            "status":"ok",
            "message":"api is healthy"
        });
    })
}