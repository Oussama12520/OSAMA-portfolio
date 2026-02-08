import { GoogleGenAI, Chat } from "@google/genai";

let chatSession: Chat | null = null;

const SYSTEM_INSTRUCTION = `
You are an AI assistant for OSAMA's professional portfolio.
OSAMA is a Backend Developer & Bot Maker, an expert in C# and Python.
He is passionate about clean code and automation.

His Portfolio includes:
- Discord Bots
- Telegram Bots
- Web Services
- Control Panels
- PC Softwares
- AI Agents

Your goal is to answer visitor questions about Osama's skills, experience, and the services he offers.
Be professional, concise, and enthusiastic.
If asked about prices, suggest they look at the specific project card or contact Osama directly for a quote.
If asked about technical details, emphasize his expertise in C# (.NET) and Python (Django, FastAPI, Scripting).

You have access to the context of his work.
`;

export const initializeChat = async (contextData: string) => {
  // Use process.env.API_KEY directly as per guidelines.
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  
  chatSession = ai.chats.create({
    model: 'gemini-3-flash-preview',
    config: {
      systemInstruction: SYSTEM_INSTRUCTION + `\n\nCurrent Project List Context:\n${contextData}`,
    },
  });
};

export const sendMessageToGemini = async (message: string): Promise<string> => {
  if (!chatSession) {
    await initializeChat("Visitor has started a chat.");
  }

  try {
    if (chatSession) {
        const response = await chatSession.sendMessage({ message });
        return response.text || "I didn't quite catch that. Could you rephrase?";
    }
    return "Error: Chat session not initialized.";
  } catch (error) {
    console.error("Gemini API Error:", error);
    return "I'm having trouble connecting to the server right now. Please try again later.";
  }
};