// A feliratkozók letöltése CSV-ben, csak az ADMIN_TOKEN titkos változóval: GET /api/subscribers  (fejléc: Authorization: Bearer <token>)
import { ready } from '../../lib/db.js';

export async function onRequestGet({ request, env }) {
  const tok = (request.headers.get('authorization') || '').replace(/^Bearer\s+/i, '');
  if (!env.ADMIN_TOKEN || tok.length < 16 || tok !== env.ADMIN_TOKEN) return new Response('nincs jogosultság', { status: 401 });
  await ready(env.DB);
  const { results } = await env.DB.prepare('SELECT email, edu, mkt, consent_version, consented_at, page, consent_text FROM subscribers ORDER BY consented_at').all();
  const q = v => '"' + String(v ?? '').replace(/"/g, '""') + '"';
  const csv = ['email,edukacios,marketing,hozzajarulas_verzio,hozzajarulas_ideje,oldal,hozzajarulas_szovege',
    ...results.map(r => [r.email, r.edu, r.mkt, r.consent_version, r.consented_at, r.page, r.consent_text].map(q).join(','))].join('\r\n');
  return new Response('﻿' + csv, { headers: { 'content-type': 'text/csv; charset=utf-8', 'content-disposition': 'attachment; filename="feliratkozok.csv"', 'cache-control': 'no-store' } });
}
