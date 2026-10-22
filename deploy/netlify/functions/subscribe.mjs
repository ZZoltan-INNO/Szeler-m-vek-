// Hírlevél-feliratkozás (Netlify Blobs): az e-mail-cím, a választott levéltípusok és a hozzájárulás szövege, verziója, időpontja (a hozzájárulás igazolására)
import { getStore } from '@netlify/blobs';

export default async (req) => {
  if (req.method !== 'POST') return new Response('csak POST', { status: 405 });
  let b = {};
  try { b = JSON.parse((await req.text()).slice(0, 4000)); } catch (e) { return Response.json({ ok: false, error: 'hibás kérés' }, { status: 400 }); }
  if (b['bot-field']) return Response.json({ ok: true });                                   // csapda a robotoknak
  const email = String(b.email || '').trim().toLowerCase(), edu = b.edu ? 1 : 0, mkt = b.mkt ? 1 : 0;
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(email) || email.length > 254) return Response.json({ ok: false, error: 'érvénytelen e-mail-cím' }, { status: 400 });
  if (!edu && !mkt) return Response.json({ ok: false, error: 'nincs kiválasztott levéltípus' }, { status: 400 });
  const text = String(b.consent_text || '').slice(0, 2000), ver = String(b.consent_version || '').slice(0, 80), page = String(b.page || '').slice(0, 300);
  if (!text || !ver) return Response.json({ ok: false, error: 'hiányzik a hozzájárulás szövege' }, { status: 400 });
  const now = new Date().toISOString();
  await getStore({ name: 'horizonlens-subscribers', consistency: 'strong' })
    .setJSON(encodeURIComponent(email), { email, edu, mkt, consent_text: text, consent_version: ver, consented_at: now, page, updated_at: now });
  return Response.json({ ok: true });
};

export const config = { path: '/api/subscribe' };
