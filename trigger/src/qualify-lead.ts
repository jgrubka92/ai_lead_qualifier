import { task } from "@trigger.dev/sdk/v3";
import { GoogleGenerativeAI } from "@google/generative-ai";
import {
  LeadInput,
  QualificationResult,
  formatLeadForPrompt,
  validateResult,
} from "../../tools/scorecard";
import { QUALIFY_LEAD_PROMPT } from "../../workflows/qualify-lead-prompt";

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!);

const model = genAI.getGenerativeModel({
  model: "gemini-2.5-flash",
  systemInstruction: QUALIFY_LEAD_PROMPT,
  generationConfig: {
    // Force raw JSON output — eliminates markdown fences, preamble text, and
    // thinking traces that cause JSON.parse to fail on valid-looking responses.
    responseMimeType: "application/json",
  },
});

export const qualifyLead = task({
  id: "qualify-lead",
  maxDuration: 60,
  run: async (payload: LeadInput): Promise<QualificationResult> => {
    const result = await model.generateContent(
      `Here is the lead to qualify:\n\n${formatLeadForPrompt(payload)}`
    );

    const parsed = JSON.parse(result.response.text());
    return validateResult(parsed);
  },
});
