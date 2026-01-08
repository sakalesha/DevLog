
import { GoogleGenAI, Type } from "@google/genai";

const ai = new GoogleGenAI({ apiKey: import.meta.env.VITE_GEMINI_API_KEY || (typeof process !== 'undefined' ? process.env.API_KEY : '') || '' });

export interface DeepDiveResult {
  text: string;
  sources: { title: string; uri: string }[];
}

export const geminiService = {
  generateKeyTakeaway: async (content: string): Promise<string> => {
    try {
      const response = await ai.models.generateContent({
        model: 'gemini-3-flash-preview',
        contents: `Please summarize the following learning content into a concise (max 200 characters) "Key Takeaway" for a developer journal:\n\n${content}`,
        config: {
          maxOutputTokens: 400,
          thinkingConfig: { thinkingBudget: 100 },
          temperature: 0.7
        }
      });
      return response.text || "No takeaway generated.";
    } catch (error) {
      console.error("Gemini Error:", error);
      return "Could not generate takeaway. Please write manually.";
    }
  },

  getLearningSuggestions: async (topic: string, category: string): Promise<string[]> => {
    try {
      const response = await ai.models.generateContent({
        model: 'gemini-3-flash-preview',
        contents: `I just learned about "${topic}" in the category of "${category}". Suggest 3 related advanced topics I should study next.`,
        config: {
          responseMimeType: "application/json",
          responseSchema: {
            type: Type.ARRAY,
            items: { type: Type.STRING }
          }
        }
      });
      return JSON.parse(response.text || '[]');
    } catch (error) {
      return ["System Design Patterns", "Concurrency in Depth", "Advanced Testing"];
    }
  },

  performDeepDive: async (topic: string): Promise<DeepDiveResult> => {
    try {
      const response = await ai.models.generateContent({
        model: 'gemini-3-flash-preview',
        contents: `Provide a technical deep dive and latest best practices for "${topic}". Focus on implementation details for a senior engineer.`,
        config: {
          tools: [{ googleSearch: {} }],
        },
      });

      const sources = response.candidates?.[0]?.groundingMetadata?.groundingChunks
        ?.map((chunk: any) => ({
          title: chunk.web?.title || "Resource",
          uri: chunk.web?.uri || ""
        }))
        .filter((s: any) => s.uri) || [];

      return {
        text: response.text || "No deep dive content found.",
        sources: sources
      };
    } catch (error) {
      console.error("Deep Dive Error:", error);
      return { text: "Search grounding failed. Please try again later.", sources: [] };
    }
  }
};
