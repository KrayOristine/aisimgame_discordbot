import { HarmBlockThreshold, HarmCategory } from "@google/genai";

export const DEFAULT_RAG_SETTINGS: RagSettings = {
  summaryFrequency: 10,
  topK: 5,
  summarizeBeforeRag: true,
};

export const DEFAULT_AI_PERFORMANCE_SETTINGS: AiPerformanceSettings = {
  maxOutputTokens: 8000,
  thinkingBudget: 1200,
  jsonBuffer: 1024,
  thinkingLevel: "Medium",
  selectedModel: "gemini-3.0-flash-preview",
};


export const DEFAULT_SAFETY_SETTINGS: SafetySettingsConfig = {
  enabled: false,
  settings: [
    { category: HarmCategory.HARM_CATEGORY_HARASSMENT, threshold: HarmBlockThreshold.OFF },
    { category: HarmCategory.HARM_CATEGORY_HATE_SPEECH, threshold: HarmBlockThreshold.OFF },
    { category: HarmCategory.HARM_CATEGORY_SEXUALLY_EXPLICIT, threshold: HarmBlockThreshold.OFF },
    { category: HarmCategory.HARM_CATEGORY_DANGEROUS_CONTENT, threshold: HarmBlockThreshold.OFF },
    { category: HarmCategory.HARM_CATEGORY_CIVIC_INTEGRITY, threshold: HarmBlockThreshold.OFF },
    { category: HarmCategory.HARM_CATEGORY_IMAGE_HARASSMENT, threshold: HarmBlockThreshold.OFF },
    { category: HarmCategory.HARM_CATEGORY_IMAGE_HATE, threshold: HarmBlockThreshold.OFF },
    {
      category: HarmCategory.HARM_CATEGORY_IMAGE_DANGEROUS_CONTENT,
      threshold: HarmBlockThreshold.OFF,
    },
    {
      category: HarmCategory.HARM_CATEGORY_IMAGE_SEXUALLY_EXPLICIT,
      threshold: HarmBlockThreshold.OFF,
    },
    { category: HarmCategory.HARM_CATEGORY_JAILBREAK, threshold: HarmBlockThreshold.OFF },
  ],
};


