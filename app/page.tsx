import { redirect } from "next/navigation";

export default function Home() {
  const sessionId = crypto.randomUUID();
  redirect(`/${sessionId}`);
}
