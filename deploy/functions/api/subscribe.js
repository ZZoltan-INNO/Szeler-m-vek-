// Hírlevél-feliratkozás: az e-mail-cím, a választott levéltípusok és a hozzájárulás szövege, verziója, időpontja (a hozzájárulás igazolására)
import { ready, json } from '../../lib/db.js';

export async function onRequestPost({ request, env }) {
  let b = {};
  try { b = JSON.parse((await request.text()).slice(0, 4000)); } catch (e) { return json({ ok: false, error: 'hibás kérés' }, { status: 400 }); }
  if (b['bot-field']) return json({ ok: true });                                   // csapda a robotoknak
  const email = String(b.email || '').trim().toLowerCase(), edu = b.edu ? 1 : 0, mkt = b.mkt ? 1 : 0;
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(email) || email.length > 254) return json({ ok: false, error: 'érvénytelen e-mail-cím' }, { status: 400 });
  if (!edu && !mkt) return json({ ok: false, error: 'nincs kiválasztott levéltípus' }, { status: 400 });
  const text = String(b.consent_text || '').slice(0, 2000), ver = String(b.consent_version || '').slice(0, 80), page = String(b.page || '').slice(0, 300);
  if (!text || !ver) return json({ ok: false, error: 'hiányzik a hozzájárulás szövege' }, { status: 400 });
  await ready(env.DB);
  const now = new Date().toISOString();
  await env.DB.prepare(`INSERT INTO subscribers (email, edu, mkt, consent_text, consent_version, consented_at, page, updated_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    ON CONFLICT(email) DO UPDATE SET edu = excluded.edu, mkt = excluded.mkt, consent_text = excluded.consent_text, consent_version = excluded.consent_version,
    consented_at = excluded.consented_at, page = excluded.page, updated_at = excluded.updated_at`).bind(email, edu, mkt, text, ver, now, page, now).run();
  return json({ ok: true });
}
