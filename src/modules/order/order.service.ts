import { prisma } from "../../db/prisma";
import { ApiError } from "../../utils/ApiError";
import { OrderCreateType } from "../../validators/order.schema";
import { Decimal } from "@prisma/client/runtime/index-browser";
import { OrderSide, OrderType } from "../../generated/prisma";
import { matchBuyOrder, matchSellOrder } from "../matchEngine/matchEngine";


const placeOrderService = async (data: OrderCreateType) => {
    const {
        userId,
        symbol,
        side,
        type,
        price,
        quantity
    } = data;

    if (type == "LIMIT" && side == "BUY") {
        const requiredAmount = price! * quantity;

        const result = await prisma.$transaction(async (tx) => {
            const wallet = await tx.wallet.findUnique({
                where: { userId }
            });

            if (!wallet) {
                throw new ApiError(
                    404,
                    "Wallet not found"
                )
            }

            if (wallet.balance.toNumber() < requiredAmount) {
                throw new ApiError(
                    400,
                    "Insufficient Balance"
                )
            }

            // 1. Lock Money
            await tx.wallet.update({
                where: { userId },
                data: {
                    balance: {
                        decrement: requiredAmount
                    },
                    lockedBalance: {
                        increment: requiredAmount
                    }
                }
            })

            // 2. Create Order
            const order = await tx.order.create({
                data: {
                    userId,
                    symbol,
                    side: OrderSide[side],
                    type: OrderType[type],
                    price: new Decimal(price!),
                    quantity,
                    filledQuantity: 0,
                    status: "OPEN"
                }
            });

            return order;
        });

        await matchBuyOrder(result.id);

        return await prisma.order.findUnique({
            where: {
                id: result.id
            }
        });


    }

    if (type == "LIMIT" && side == "SELL") {
        // verify is the user actually owns the stock or not
        const result = await prisma.$transaction(async (tx) => {
            const holding = await tx.stockHolding.findUnique({
                where: {
                    userId_symbol: {
                        userId,
                        symbol
                    }
                }
            });

            if (!holding || (holding.quantity) < quantity) {
                throw new ApiError(400, "Insufficient stock holdings");
            }

            // Lock the stocks
            await tx.stockHolding.update({
                where: {
                    userId_symbol: {
                        userId,
                        symbol
                    }
                },
                data: {
                    quantity: {decrement: quantity},
                    locked: { increment: quantity }
                }
            });


            const order = await tx.order.create({
                data: {
                    userId,
                    symbol,
                    side: OrderSide[side],
                    type: OrderType[type],
                    price: new Decimal(price!),
                    quantity
                }
            })

            return order;
        });

        await matchSellOrder(result.id);

        return await prisma.order.findUnique({
            where: { id: result.id }
        });
    }

}

const getMyOrdersService = async (userId: string) => {
    try {
        const orders  = await prisma.order.findMany({
            where: {
                userId,
                status : { not : "FILLED" }
            }
        })
        return orders;
    } catch (error) {
        throw new ApiError(500, "Error while fetching orders" )
    }
}


export {
    placeOrderService,
    getMyOrdersService
}