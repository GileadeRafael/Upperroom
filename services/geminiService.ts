import { GoogleGenAI } from "@google/genai";
import { Message, Mode } from '../types';
import { SYSTEM_INSTRUCTION } from '../constants';

export const sendMessageToGemini = async (
  history: Message[],
  currentMessage: string,
  mode: Mode
): Promise<string> => {
  try {
    // The API key must be obtained exclusively from the environment variable process.env.API_KEY.
    // We assume this variable is pre-configured and accessible.
    const apiKey = process.env.API_KEY;

    if (!apiKey) {
      console.error("API KEY MISSING.");
      return "⚠️ Configuração Necessária\n\nA variável de ambiente API_KEY não foi encontrada.";
    }

    const ai = new GoogleGenAI({ apiKey: apiKey });

    // Convert app history to Gemini Content format
    const contents = history.map((msg) => ({
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
    return "Houve uma falha na conexão. Verifique se sua API Key é válida e se tem permissão para este domínio.";
  }
};