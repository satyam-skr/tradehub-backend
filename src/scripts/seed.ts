import {env} from '../config/env.js'
import { prisma } from '../db/prisma.js';

const stocks = [
    { symbol: 'AAPL', name: 'Apple Inc.', exchange: 150.25 },
    { symbol: 'GOOGL', name: 'Alphabet Inc.', exchange: 2800.50 },
    { symbol: 'TSLA', name: 'Tesla Inc.', exchange: 700.80 },
    { symbol: 'AMZN', name: 'Amazon.com Inc.', exchange: 3200.00 },
    { symbol: 'MSFT', name: 'Microsoft Corp.', exchange: 280.75 },
    { symbol: 'NVDA', name: 'NVIDIA Corp.', exchange: 450.30 },
    { symbol: 'META', name: 'Meta Platforms Inc.', exchange: 180.90 },
    { symbol: 'NFLX', name: 'Netflix Inc.', exchange: 350.60 },
    { symbol: 'BTC', name: 'Bitcoin', exchange: 42000.00 },
    { symbol: 'ETH', name: 'Ethereum', exchange: 2200.00 },
];

async function main() {
    await prisma.stock.createMany({
        data: stocks
    });
}

// Run the seed function
main()
    .catch((e) => {
        console.error('❌ Fatal seeding error:', e);
        process.exit(1);
    })
    .finally(async () => {
        console.log(`inserted initial stocks data`)
        await prisma.$disconnect();
    });