import { getOrCreateSession, getMessages } from "@/lib/db";

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const session = getOrCreateSession(id);
  const messages = getMessages(id);
  return Response.json({ session, messages });
}
