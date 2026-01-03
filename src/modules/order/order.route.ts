import { FastifyInstance } from "fastify";
import { placeOrder, getMyOrders, deleteOrderById, getOrderBook } from "./order.controller"

export async function orderRoutes(app: FastifyInstance) {

  app.post("/create", {
    onRequest: [app.authenticate]
  },  placeOrder);

  app.get("/", {
    onRequest: [app.authenticate]
  }, getMyOrders)

  app.delete("/:orderId", {
    onRequest: [app.authenticate]
  }, deleteOrderById)

  app.get("/orderbook/:ticker", {
  }, getOrderBook)
}

export default orderRoutes