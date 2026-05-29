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
});

export const qualifyLead = task({
  id: "qualify-lead",
  maxDuration: 60,
  run: async (payload: LeadInput): Promise<QualificationResult> => {
    const result = await model.generateContent(
      `Here is the lead to qualify:\n\n${formatLeadForPrompt(payload)}`
    );

    const text = result.response.text();

    // Strip any markdown code fences if the model adds them
    const json = text
      .replace(/^```json\s*/i, "")
      .replace(/\s*```$/i, "")
      .trim();

    const parsed = JSON.parse(json);
    return validateResult(parsed);
  },
});
