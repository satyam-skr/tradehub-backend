import { prisma } from "../../db/prisma"


const getPortfolioService = async (userId: string) => {
    return await prisma.stockHolding.findMany({
        where: { userId }
    })
}



export {
    getPortfolioService,
}