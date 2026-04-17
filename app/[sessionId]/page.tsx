import { ChatInterface } from "@/components/chat-interface";
import { getOrCreateSession, getMessages } from "@/lib/db";

interface Props {
  params: Promise<{ sessionId: string }>;
}

export default async function SessionPage({ params }: Props) {
  const { sessionId } = await params;
  const session = getOrCreateSession(sessionId);
  const messages = getMessages(sessionId);

  return (
    <main className="h-screen flex flex-col">
      <ChatInterface
        sessionId={sessionId}
        previousIntent={session.intent_summary}
        initialMessages={messages}
      />
    </main>
  );
}
