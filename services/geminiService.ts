import { GoogleGenAI, Content } from "@google/genai";
import { Message, Mode } from '../types';
import { SYSTEM_INSTRUCTION } from '../constants';

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

export const sendMessageToGemini = async (
  history: Message[],
  currentMessage: string,
  mode: Mode
): Promise<string> => {
  try {
    // Convert app history to Gemini Content format
    const contents: Content[] = history.map((msg) => ({
      role: msg.role,
      parts: [{ text: msg.text }],
    }));

    // Add the current user message with a hidden system context trigger for the specific mode
    const modeTrigger = `[SISTEMA: ATIVE O MODO ${mode.toUpperCase()} PARA ESTA RESPOSTA]`;
    
    // We append the new message to the history for the API call
    contents.push({
      role: 'user',
      parts: [{ text: `${modeTrigger}\n\n${currentMessage}` }],
    });

    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: contents,
      config: {
        systemInstruction: SYSTEM_INSTRUCTION,
        temperature: 0.7, // Balance between creativity (Devocional) and precision (Estudo)
      },
    });

    if (response.text) {
      return response.text;
    }

    return "Não foi possível gerar uma resposta no momento.";
  } catch (error) {
    console.error("Gemini API Error:", error);
    return "Houve uma falha na conexão. Tente novamente.";
  }
};