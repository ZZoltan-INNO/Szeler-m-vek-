// Névtelen összesítő számláló: látogatók, letett turbinák, mentett képek. Személyes adatot nem tárol (IP-t, sütit sem).
// GET /api/stats → {users, turbines, images, since};  POST /api/stats {"kind": "users" | "turbines" | "images"} → +1
import { ready, json } from '../../lib/db.js';

const KINDS = ['users', 'turbines', 'images'];

export async function onRequestGet({ env }) {
  await ready(env.DB);
  const { results } = await env.DB.prepare('SELECT kind, n, since FROM counts').all();
  const out = { since: null };
  for (const r of results) { out[r.kind] = r.n; if (!out.since || r.since < out.since) out.since = r.since; }
  return json(out, { headers: { 'cache-control': 'public, max-age=60' } });
}

export async function onRequestPost({ request, env }) {
  let kind = null;
  try { ({ kind } = JSON.parse((await request.text()).slice(0, 200))); } catch (e) { /* hibás kérés */ }
  if (!KINDS.includes(kind)) return new Response('ismeretlen esemény', { status: 400 });
  await ready(env.DB);
  await env.DB.prepare('UPDATE counts SET n = n + 1 WHERE kind = ?').bind(kind).run();   // egy lépésben: egyidejű kéréseknél sem vész el számlálás
  return new Response(null, { status: 204 });
}
