import { GoogleGenAI, Chat } from "@google/genai";

let chatSession: Chat | null = null;
let isApiKeyValid = false;

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
  try {
    const apiKey = import.meta.env.VITE_GEMINI_API_KEY || process.env.API_KEY;

    // Check if API key exists and is not a placeholder
    if (!apiKey || apiKey === 'PLACEHOLDER_API_KEY' || apiKey.includes('PLACEHOLDER')) {
      console.warn('Gemini API key not configured. AI Chat will be disabled.');
      isApiKeyValid = false;
      return;
    }

    const ai = new GoogleGenAI({ apiKey });

    chatSession = ai.chats.create({
      model: 'gemini-3-flash-preview',
      config: {
        systemInstruction: SYSTEM_INSTRUCTION + `\n\nCurrent Project List Context:\n${contextData}`,
      },
    });

    isApiKeyValid = true;
  } catch (error) {
    console.error('Failed to initialize Gemini chat:', error);
    isApiKeyValid = false;
    chatSession = null;
  }
};

export const sendMessageToGemini = async (message: string): Promise<string> => {
  if (!isApiKeyValid) {
    return "AI Chat is currently unavailable. Please contact Osama directly for inquiries.";
  }

  if (!chatSession) {
    await initializeChat("Visitor has started a chat.");
    if (!isApiKeyValid) {
      return "AI Chat is currently unavailable. Please contact Osama directly for inquiries.";
    }
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