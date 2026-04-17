import { streamText, generateText, tool, convertToModelMessages, hasToolCall } from "ai";
import { createGoogleGenerativeAI } from "@ai-sdk/google";
import { z } from "zod";
import { cars } from "@/lib/cars";
import type { RecommendCarsInput } from "@/lib/cars";
import {
  getOrCreateSession,
  saveMessage,
  updateIntentSummary,
} from "@/lib/db";
import { buildSystemPrompt, buildDistillationPrompt } from "@/lib/prompts";

type UIPart = { type: string; text?: string };
type UIMsg = { role: string; parts: UIPart[] };

function getTextFromParts(parts: UIPart[]): string {
  return parts.find((p) => p.type === "text")?.text ?? "";
}

const gemini = createGoogleGenerativeAI({
  apiKey: process.env.GEMINI_API_KEY,
});

export async function POST(req: Request) {
  const { messages, sessionId } = await req.json();

  const session = getOrCreateSession(sessionId);
  const systemPrompt = buildSystemPrompt(cars, session);

  const modelMessages = await convertToModelMessages(messages);

  const result = streamText({
    model: gemini("gemini-2.0-flash"),
    system: systemPrompt,
    messages: modelMessages,
    stopWhen: hasToolCall("recommendCars"),
    tools: {
      recommendCars: tool({
        description:
          "Call this when you have gathered enough information to recommend exactly 3 cars that match the user's intent",
        inputSchema: z.object({
          car_ids: z
            .array(z.string())
            .length(3)
            .describe("Exactly 3 car IDs from the dataset"),
          reasoning: z
            .string()
            .describe("Overall reasoning for these 3 picks based on user intent"),
          comparisons: z
            .array(
              z.object({
                car_id: z.string(),
                why_this_one: z
                  .string()
                  .describe("1 sentence specific reason this car fits this user"),
              })
            )
            .length(3),
        }),
        execute: async (input) => input,
      }),

    },
    onFinish: async ({ text, toolCalls }) => {
      const uiMessages = messages as UIMsg[];

      let lastUserMessage: UIMsg | undefined;
      for (let i = uiMessages.length - 1; i >= 0; i--) {
        if (uiMessages[i].role === "user") {
          lastUserMessage = uiMessages[i];
          break;
        }
      }

      if (lastUserMessage) {
        saveMessage(sessionId, "user", getTextFromParts(lastUserMessage.parts));
      }

      const recommendCall = toolCalls.find(
        (tc) => tc.toolName === "recommendCars"
      );
      const assistantContent = JSON.stringify({
        text,
        toolCall: recommendCall ? (recommendCall.input as RecommendCarsInput) : null,
      });
      saveMessage(sessionId, "assistant", assistantContent);

      if (recommendCall) {
        const conversationText = uiMessages
          .map((m) => `${m.role.toUpperCase()}: ${getTextFromParts(m.parts)}`)
          .join("\n");

        const distillationResult = await generateText({
          model: gemini("gemini-2.0-flash"),
          prompt: buildDistillationPrompt(conversationText),
        });

        const carIds = (recommendCall.input as RecommendCarsInput).car_ids;
        updateIntentSummary(sessionId, distillationResult.text, carIds);
      }
    },
  });

  return result.toUIMessageStreamResponse();
}
