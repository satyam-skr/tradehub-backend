import { prisma } from "../../db/prisma.js";
import { ApiError } from "../../utils/ApiError.js";
import { OrderCreateType } from "../../validators/order.schema.js";
import { Decimal } from "@prisma/client/runtime/index-browser";
import { OrderSide, OrderType } from "../../generated/prisma";
import { matchBuyOrder, matchSellOrder, matchMarketBuy, matchMarketSell } from "../matchEngine/matchEngine.js";


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
                    quantity: { decrement: quantity },
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

    if (type === "MARKET" && side === "BUY") {
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

            if (wallet.balance.toNumber() < 0) {
                throw new ApiError(
                    400,
                    "Insufficient Balance"
                )
            }

            // Create order with no price
            const order = await tx.order.create({
                data: {
                    userId,
                    symbol,
                    side,
                    type,
                    quantity,
                    filledQuantity: 0,
                    status: "OPEN"
                }
            });

            return order;
        });

        // Match immediately
        await matchMarketBuy(result.id);
        return result;
    }

    if (type === "MARKET" && side === "SELL") {
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

            await tx.stockHolding.update({
                where: {
                    userId_symbol: {
                        userId,
                        symbol
                    }
                },
                data: {
                    quantity: { decrement: quantity },
                    locked: { increment: quantity }
                }
            });

            const order = await tx.order.create({
                data: {
                    userId,
                    symbol,
                    side: OrderSide[side],
                    type: OrderType[type],
                    quantity
                }
            })
            return order;
        });

        await matchMarketSell(result.id);

        return await prisma.order.findUnique({
            where: { id: result.id }
        });

    }
}

const getMyOrdersService = async (userId: string) => {
    try {
        const orders = await prisma.order.findMany({
            where: {
                userId,
                status: { in: ["OPEN", "PARTIAL"] }
            }
        })
        return orders;
    } catch (error) {
        throw new ApiError(500, "Error while fetching orders")
    }
}


const deleteOrderByIdService = async (orderId: string, userId: string) => {
    try {
        const result = await prisma.$transaction(async (tx) => {
            const order = await tx.order.findUnique({
                where: { id: orderId }
            });
            if (!order) throw new ApiError(404, "order not found")

            if (order.filledQuantity == order.quantity) {
                throw new ApiError(400, "sry order is completed and cant be deleted")
            }

            if (order.status === "CANCELLED") {
                throw new ApiError(400, "order is already cancelled")
            }

            const user = await tx.user.findUnique({
                where: { id: order.userId }
            });
            if (!user) throw new ApiError(404, "user not found");
            
            if(user.id != userId){
                throw new ApiError(402, "you are not permitted to do this action");
            }
            
            const remainingQty = order.quantity - order.filledQuantity;
            
            if (order.side == "SELL") {
                await tx.stockHolding.update({
                    where: {
                        userId_symbol: {
                            userId: user.id,
                            symbol: order.symbol
                        }
                    },
                    data: {
                        locked: { decrement: remainingQty },
                        quantity: { increment: remainingQty }
                    }
                })
            }
            else if (order.side == "BUY") {
                const price = order.price!.mul(remainingQty);
                await tx.wallet.update({
                    where: { userId: user.id },
                    data: {
                        lockedBalance: { decrement: price },
                        balance: { increment: price }
                    }
                })
            }

            await tx.order.update({
                where: { id: orderId },
                data: {
                    status: "CANCELLED"
                }
            });
        })

    } catch (error) {
        throw new ApiError(500, "Error while fetching orders")
    }
}


const getOrderBookService = async (symbol: string) => {
    const orders = await prisma.order.findMany({
        where: {
            symbol,
            status: { in: ["OPEN", "PARTIAL"] }
        }
    });

    const buyBook: Record<string, number> = {};
    const sellBook: Record<string, number> = {};

    for (const o of orders) {
        const remaining = o.quantity - o.filledQuantity;
        if (remaining <= 0) continue;

        const price = o.price!.toString();

        if (o.side === "BUY") {
            buyBook[price] = (buyBook[price] || 0) + remaining;
        } else {
            sellBook[price] = (sellBook[price] || 0) + remaining;
        }
    }

    const bids = Object.entries(buyBook)
        .map(([price, qty]) => ({ price: Number(price), quantity: qty }))
        .sort((a, b) => b.price - a.price);

    const asks = Object.entries(sellBook)
        .map(([price, qty]) => ({ price: Number(price), quantity: qty }))
        .sort((a, b) => a.price - b.price);

    return { symbol, bids, asks };
}


export {
    placeOrderService,
    getMyOrdersService,
    deleteOrderByIdService,
    getOrderBookService
}