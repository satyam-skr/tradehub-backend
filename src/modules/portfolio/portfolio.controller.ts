import { FastifyRequest, FastifyReply } from "fastify"
import { getPortfolioService } from "./portfolio.service.js"
import { ApiError } from "../../utils/ApiError.js";
import { ApiResponse } from "../../utils/ApiResponse.js";

const getPortfolio = async (
    req : FastifyRequest,
    reply: FastifyReply
) => {
    if (!req.user?.userId) {
        throw new ApiError(401, "you are Unauthorized");
    }
    const userId = req.user.userId;
    const portfolio = await getPortfolioService(userId);

    return reply
        .status(200)
        .send(new ApiResponse(
            200,
            {portfolio}
        ));
};



export {
    getPortfolio
}