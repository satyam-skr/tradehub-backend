import { prisma } from "../../db/prisma.js"


const getPortfolioService = async (userId: string) => {
    const holdings = await prisma.stockHolding.findMany({
        where: { userId }
    })

    const wallet = await prisma.wallet.findUnique({
        where: { userId }
    })

    return {
        holdings,
        wallet
    }
}

export {
    getPortfolioService,
}