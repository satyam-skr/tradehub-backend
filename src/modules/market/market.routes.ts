import { FastifyInstance } from "fastify";
import { priceStore } from "./priceStore";

export async function marketRoutes(app: FastifyInstance) {
    app.get("/prices", async () => {
        return priceStore.all();
    });

    app.get("/price/:symbol", async (req) => {
        const { symbol } = req.params as any;
        return { price: priceStore.get(symbol) };
    });
}

export default marketRoutes;