import { FastifyReply, FastifyRequest } from "fastify";
import { ApiError } from "../../utils/ApiError.js";
import { ApiResponse } from "../../utils/ApiResponse.js";
import {sendMessageService} from './chatbot.service.js'

const chatController = async (
    req : FastifyRequest,
    reply : FastifyReply
) => {

    const {userMessage} = req.body as any
    if (!userMessage){
        throw new ApiError(400, "no prompt provided")
    }

    const chatbotResponse = await sendMessageService(userMessage);

    return reply
        .status(200)
        .send(new ApiResponse(
            200,
            {chatbotResponse},
            "message sent and response received"
        ));


}

export {
    chatController,
}