// Ha a D1-kötés (DB) hiányzik a Pages-beállításokból, érthető 503-as választ adunk a nyers 1101-es hiba helyett
import { json } from '../../lib/db.js';

export async function onRequest({ env, next }) {
  if (!env.DB) return json({ ok: false, error: 'nincs adatbázis-kötés (DB) a Cloudflare Pages beállításaiban' }, { status: 503 });
  return next();
}
