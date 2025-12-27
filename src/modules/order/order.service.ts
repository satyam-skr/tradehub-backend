import { prisma } from "../../db/prisma";
import { ApiError } from "../../utils/ApiError";
import { OrderCreateType } from "../../validators/order.schema";
import { Decimal } from "@prisma/client/runtime/index-browser";
import { OrderSide, OrderType } from "../../generated/prisma";


const placeOrderService = async (data: OrderCreateType) => {
    const {
        userId,
        symbol,
        side,
        type,
        price,
        quantity
    } = data;

    if (type == "LIMIT") {
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
                    quantity
                }
            })

            return order;
        });

        return result;
    }

}

export {
    placeOrderService,
}