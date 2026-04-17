import Database from "better-sqlite3";
import path from "path";

export interface Session {
  id: string;
  created_at: string;
  last_active: string;
  intent_summary: string | null;
  intent_history: string | null;
  raw_preferences: string | null;
}

export interface IntentSnapshot {
  timestamp: string;
  summary: string;
  car_ids: string[];
}

const SCHEMA = `
CREATE TABLE IF NOT EXISTS sessions (
  id TEXT PRIMARY KEY,
  created_at TEXT NOT NULL,
  last_active TEXT NOT NULL,
  intent_summary TEXT,
  intent_history TEXT,
  raw_preferences TEXT
);

CREATE TABLE IF NOT EXISTS messages (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  session_id TEXT NOT NULL,
  role TEXT NOT NULL,
  content TEXT NOT NULL,
  created_at TEXT NOT NULL,
  FOREIGN KEY (session_id) REFERENCES sessions(id)
);
`;

const globalForDb = global as typeof globalThis & { _db?: Database.Database };

function getDb() {
  if (!globalForDb._db) {
    globalForDb._db = new Database(path.join(process.cwd(), "chat.db"));
    globalForDb._db.pragma("journal_mode = WAL");
    globalForDb._db.exec(SCHEMA);
  }
  return globalForDb._db;
}

export function getOrCreateSession(id: string): Session {
  const db = getDb();
  const now = new Date().toISOString();

  const existing = db
    .prepare<[string], Session>("SELECT * FROM sessions WHERE id = ?")
    .get(id);

  if (existing) {
    db.prepare("UPDATE sessions SET last_active = ? WHERE id = ?").run(now, id);
    return { ...existing, last_active: now };
  }

  db.prepare(
    "INSERT INTO sessions (id, created_at, last_active) VALUES (?, ?, ?)"
  ).run(id, now, now);

  return {
    id,
    created_at: now,
    last_active: now,
    intent_summary: null,
    intent_history: null,
    raw_preferences: null,
  };
}

export interface Message {
  id: number;
  session_id: string;
  role: string;
  content: string;
  created_at: string;
}

export function getMessages(sessionId: string): Message[] {
  return getDb()
    .prepare<[string], Message>(
      "SELECT * FROM messages WHERE session_id = ? ORDER BY created_at ASC"
    )
    .all(sessionId);
}

export function saveMessage(
  sessionId: string,
  role: string,
  content: string
): void {
  const now = new Date().toISOString();
  getDb()
    .prepare(
      "INSERT INTO messages (session_id, role, content, created_at) VALUES (?, ?, ?, ?)"
    )
    .run(sessionId, role, content, now);
}

export function updateIntentSummary(
  sessionId: string,
  summary: string,
  carIds: string[]
): void {
  const db = getDb();
  const now = new Date().toISOString();

  const session = db
    .prepare<[string], Pick<Session, "intent_history">>(
      "SELECT intent_history FROM sessions WHERE id = ?"
    )
    .get(sessionId);

  const history: IntentSnapshot[] = session?.intent_history
    ? (JSON.parse(session.intent_history) as IntentSnapshot[])
    : [];

  history.push({ timestamp: now, summary, car_ids: carIds });
  if (history.length > 20) history.splice(0, history.length - 20);

  db.prepare(
    "UPDATE sessions SET intent_summary = ?, intent_history = ? WHERE id = ?"
  ).run(summary, JSON.stringify(history), sessionId);
}
