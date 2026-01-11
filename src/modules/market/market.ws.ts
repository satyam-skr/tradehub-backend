import { FastifyInstance } from "fastify";
import { priceStore } from "./priceStore";

const clients = new Set<any>();

export async function marketWs(app: FastifyInstance) {
  app.get("/ws/market", { websocket: true }, (connection, req) => {
    clients.add(connection);

    connection.on("close", () => {
      clients.delete(connection);
    });
  });

  setInterval(() => {
    const data = JSON.stringify({
      type: "PRICE_UPDATE",
      prices: priceStore.all()
    });

    for (const client of clients) {
      if (client.readyState === WebSocket.OPEN) {
        client.send(data);
      }
    }
  }, 1000);
}
