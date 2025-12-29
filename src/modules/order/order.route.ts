import { FastifyInstance } from "fastify";
import { placeOrder, getMyOrders } from "./order.controller"

export async function orderRoutes(app: FastifyInstance) {

  app.post("/create", {
    onRequest: [app.authenticate]
  },  placeOrder);

  app.get("/", {
    onRequest: [app.authenticate]
  }, getMyOrders)
}

export default orderRoutes