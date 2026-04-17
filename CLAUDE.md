# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
npm run dev        # Start dev server (http://localhost:3000)
npm run build      # Production build
npm run lint       # ESLint
```

## Architecture

**Single Next.js 16 app — no separate backend.**

### Request flow
1. User visits `/` → server generates UUID → `redirect(/[uuid])`
2. `/[sessionId]/page.tsx` (server component) — calls `getOrCreateSession` + `getMessages` from SQLite, passes data to `<ChatInterface>`
3. `<ChatInterface>` (client) — uses Vercel AI SDK `useChat` hook → streams to `POST /api/chat`
4. `/api/chat/route.ts` — calls Gemini via `streamText`, defines `recommendCars` tool, returns SSE via `result.toDataStreamResponse()`
5. When Gemini calls `recommendCars`, the client detects `toolInvocations` in the message and renders `<CarCard>` components inline

### Intent distillation
- Every time `recommendCars` is called, `onFinish` triggers a lightweight `generateText` call to distill the conversation into a 1-2 sentence summary
- Stored in `sessions.intent_summary` + appended to `sessions.intent_history` (JSON array)
- On return visits, `intent_summary` is injected into the system prompt so the AI doesn't re-ask known questions
- Users can "Start Fresh" (clears `useChat` messages) or "Continue" (loads prior history)

### Key files
- `data/cars.json` — 45 mock Indian market cars (the AI's recommendation pool)
- `lib/cars.ts` — `Car` interface + `getCarById` / `getCarsById` helpers
- `lib/db.ts` — better-sqlite3 singleton with hot-reload safety; all DB helpers here
- `lib/prompts.ts` — `buildSystemPrompt` (injects car dataset + returning-user context) and `buildDistillationPrompt`
- `components/chat-interface.tsx` — main chat UI, parses `toolInvocations` to render car cards
- `components/car-card.tsx` — individual car recommendation card with gradient header, specs, pros, why-for-you

### Database (SQLite — chat.db)
Two tables: `sessions` (id, intent_summary, intent_history JSON, last_active) and `messages` (session_id, role, content). Schema auto-created on first run via `lib/db.ts`.

### AI SDK pattern
`streamText` with `maxSteps: 3` allows Gemini to call `recommendCars` tool and continue the conversation. The tool result is NOT executed server-side — the client reads `toolInvocations` from the streamed message and renders the car cards.

### Environment
```
GEMINI_API_KEY=...    # in .env.local
```
