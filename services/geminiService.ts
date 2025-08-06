
import { GoogleGenAI, Chat } from "@google/genai";
import { NAMMAI_SYSTEM_PROMPT } from "../constants";

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY as string });

export const createNammaiChatSession = (): Chat => {
  const chat = ai.chats.create({
    model: 'gemini-2.5-flash',
    config: {
      systemInstruction: NAMMAI_SYSTEM_PROMPT,
    },
  });
  return chat;
};
