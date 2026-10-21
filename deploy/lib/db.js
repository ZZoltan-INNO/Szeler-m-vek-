// Cloudflare D1 (kötés neve: DB): a táblák első használatkor jönnek létre
export async function ready(db) {
  await db.batch([
    db.prepare('CREATE TABLE IF NOT EXISTS counts (kind TEXT PRIMARY KEY, n INTEGER NOT NULL DEFAULT 0, since TEXT)'),
    db.prepare("INSERT OR IGNORE INTO counts (kind, n, since) VALUES ('users', 0, datetime('now')), ('turbines', 0, datetime('now')), ('images', 0, datetime('now'))"),
    db.prepare(`CREATE TABLE IF NOT EXISTS subscribers (email TEXT PRIMARY KEY, edu INTEGER NOT NULL, mkt INTEGER NOT NULL,
      consent_text TEXT NOT NULL, consent_version TEXT NOT NULL, consented_at TEXT NOT NULL, page TEXT, updated_at TEXT NOT NULL)`)
  ]);
}
export const json = (data, init = {}) => new Response(JSON.stringify(data), { ...init, headers: { 'content-type': 'application/json; charset=utf-8', ...(init.headers || {}) } });
