import { FastifyInstance } from "fastify";
import { getPortfolio } from "./portfolio.controller";


export async function portfolioRoutes(app: FastifyInstance) {

    app.get("/", {
        onRequest: [app.authenticate]
    }, getPortfolio);


}

export default portfolioRoutes;