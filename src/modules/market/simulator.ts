import { priceStore } from "./priceStore";

const symbols = ["AAPL", "MSFT", "GOOG", "AMZN"];

export function startMarketSimulator() {
    symbols.forEach(sym => {
        priceStore.set(sym, 100 + Math.random() * 50);
    });

    setInterval(() => {
        for (const sym of symbols) {
            const current = priceStore.get(sym)!;
            const change = (Math.random() - 0.5) * 2;
            const newPrice = Math.max(1, current + change);

            priceStore.set(sym, Number(newPrice.toFixed(2)));
        }
    }, 1000);
}
