import { FastifyInstance } from "fastify";
import { placeOrder } from "./order.controller"

export async function orderRoutes(app: FastifyInstance) {

  app.post("/create", {
    onRequest: [app.authenticate]
  },  placeOrder);
}

export default orderRoutes