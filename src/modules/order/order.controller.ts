import { FastifyRequest, FastifyReply } from "fastify";
import { OrderCreateType, PlaceOrderType, placeOrderSchema } from "../../validators/order.schema";
import { ApiError } from "../../utils/ApiError";
import { placeOrderService, getMyOrdersService } from "./order.service";
import { ApiResponse } from "../../utils/ApiResponse";

const placeOrder = async (
    req: FastifyRequest<{ Body: PlaceOrderType }>,
    reply: FastifyReply
) => {
    const parsed = placeOrderSchema.safeParse(req.body);

    if (!parsed.success) {
        return reply
            .status(400)
            .send(new ApiError(
                400,
                "wrong format",
                parsed.error.flatten().fieldErrors
            ));
    }

    const data = parsed.data;
    if (!req.user?.userId) {
        throw new ApiError(401, "you are Unauthorized");
    }
    const userId = req.user.userId;

    const order = await placeOrderService({
        ...data,
        userId
    } as OrderCreateType);

    if (!order) {
        throw new ApiError(
            500,
            "error while creating order"
        )
    }

    return reply
        .status(201)
        .send(new ApiResponse(
            201,
            { order },
            "order created successfully"
        ))

}

const getMyOrders = async (
    req: FastifyRequest,
    rep: FastifyReply
) => {
    const userId = req.user.userId;
    if(!userId){
        throw new ApiError(400, "unauthenticated")
    }

    const orders = await getMyOrdersService(userId);

    return rep
        .status(200)
        .send(new ApiResponse(
            200,
            {orders},
            "orders fetched successfully"
        ));
}

export {
    placeOrder,
    getMyOrders
}