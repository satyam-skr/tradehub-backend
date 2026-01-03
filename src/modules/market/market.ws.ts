import { FastifyInstance } from "fastify";
import { priceStore } from "./priceStore";

const clients = new Set<any>();

export async function marketWs(app: FastifyInstance) {
  app.get("/ws/market", { websocket: true }, (conn) => {
    clients.add(conn.socket);

    conn.socket.on("close", () => {
      clients.delete(conn.socket);
    });
  });

  setInterval(() => {
    const data = JSON.stringify({
      type: "PRICE_UPDATE",
      prices: priceStore.all()
    });

    for (const client of clients) {
        client.send(data);
    }
  }, 1000);
}
