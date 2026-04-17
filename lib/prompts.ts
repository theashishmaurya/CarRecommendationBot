import type { Car } from "@/lib/cars";
import type { Session } from "@/lib/db";

export function buildSystemPrompt(cars: Car[], session: Session | null): string {
  const carDataset = JSON.stringify(
    cars.map((c) => ({
      id: c.id,
      make: c.make,
      model: c.model,
      body_type: c.body_type,
      fuel_type: c.fuel_type,
      transmission: c.transmission,
      price_lakh: c.price_lakh,
      use_case_tags: c.use_case_tags,
      seating: c.seating,
      ground_clearance_mm: c.ground_clearance_mm,
      tagline: c.tagline,
    }))
  );

  let returningUserSection = "";
  if (session?.intent_summary) {
    let historyLines = "";
    if (session.intent_history) {
      try {
        const history: Array<{ summary: string; timestamp: string }> = JSON.parse(
          session.intent_history
        );
        if (history.length > 0) {
          historyLines =
            "\n" +
            history
              .map((h) => `Previously explored: ${h.summary} (at ${h.timestamp})`)
              .join("\n");
        }
      } catch {
        // malformed history — skip silently
      }
    }

    returningUserSection = `

RETURNING USER CONTEXT:
Previous intent summary: "${session.intent_summary}"${historyLines}

Don't repeat questions you already know the answer to. Acknowledge what you remember. Ask if they want to continue exploring or go in a new direction.`;
  }

  return `You are a friendly, opinionated car advisor for the Indian market. Your goal: help someone who has NO idea what car to buy go from confused to confident, in a short conversation.

CONVERSATION RULES:
- Ask max 3-4 short conversational questions to understand INTENT — not specs.
- Focus on: where they drive (city traffic / highway / mixed / off-road), who rides with them (solo / couple / family with kids / extended family), primary purpose (daily commute / weekend trips / road trips / adventure), driving feel (relaxed/automatic / don't care / sporty/manual).
- NEVER ask about budget unless the user explicitly mentions money.
- After 3-4 exchanges where you understand intent, call the \`recommendCars\` tool with EXACTLY 3 car IDs.
- Be opinionated — say "For your lifestyle, X is the strongest pick because..." not "here are some options".
- Keep responses SHORT — 2-3 sentences then ask ONE question.
- The \`recommendCars\` tool can be called multiple times in a conversation if the user's intent changes or they ask to explore a different direction.
- Pick cars that genuinely match the user's stated intent, not random popular cars.

AVAILABLE CARS:
${carDataset}${returningUserSection}`;
}

export function buildDistillationPrompt(conversationText: string): string {
  return `Read the following car-buying conversation and write a SHORT intent phrase (not a full sentence) that completes: "Last time you were looking for: ___"

Rules:
- Write ONLY the completion phrase, no prefix like "User is" or "The user wants"
- Keep it under 15 words, conversational, e.g. "a compact city hatchback with automatic transmission" or "a family SUV for highway road trips"
- Capture their LATEST intent, not earlier pivots
- Focus on: car type, use case, key preference

CONVERSATION:
${conversationText}`;
}
