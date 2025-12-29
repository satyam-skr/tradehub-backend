type PriceMap = Record<string, number>;

class PriceStore {
    private prices: PriceMap = {};

    set(symbol: string, price: number) {
        this.prices[symbol] = price;
    }

    get(symbol: string) {
        return this.prices[symbol];
    }

    all() {
        return this.prices;
    }
}

export const priceStore = new PriceStore();
