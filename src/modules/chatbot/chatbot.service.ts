import { GoogleGenAI } from "@google/genai";
import { env } from "../../config/env.js";
import { SYSTEM_PROMPT } from "./chatbot.prompt.js";

const ai = new GoogleGenAI({
    apiKey: env.GEMINI_API_KEY
});


const sendMessageService = async (userMessage: string) => {
    const chat = ai.chats.create({
        model: "gemini-2.5-flash",
        config: {
            systemInstruction: SYSTEM_PROMPT
        },
        history: [],
    });



    const response = await chat.sendMessage({
        message: userMessage,
    });
    return response.text;
}

export {
    sendMessageService,
}