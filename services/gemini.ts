
import { GoogleGenAI, Type } from "@google/genai";

export const generateHolidayWish = async (keyword: string): Promise<{ message: string; signature: string }> => {
  // Always create a new instance right before use to ensure the latest API key is used
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  
  const response = await ai.models.generateContent({
    model: "gemini-3-flash-preview",
    contents: `Generate an ultra-luxurious, poetic Christmas wish for the Arix Signature Brand based on the keyword: "${keyword}". The tone should be sophisticated, regal, and elegant.`,
    config: {
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          message: {
            type: Type.STRING,
            description: "The poetic holiday message.",
          },
          signature: {
            type: Type.STRING,
            description: "A signature closing line like 'Arix 2024'.",
          },
        },
        required: ["message", "signature"],
      },
    },
  });

  try {
    // Access .text property directly as a string
    const text = response.text || "{}";
    return JSON.parse(text);
  } catch (e) {
    console.error("Failed to parse Gemini response:", e);
    return {
      message: "May your holidays be draped in emerald and gold.",
      signature: "Arix Signature"
    };
  }
};
