// A feliratkozók letöltése CSV-ben, csak az ADMIN_TOKEN környezeti változóval: GET /api/subscribers  (fejléc: Authorization: Bearer <token>)
import { getStore } from '@netlify/blobs';

export default async (req) => {
  const tok = (req.headers.get('authorization') || '').replace(/^Bearer\s+/i, ''), adm = process.env.ADMIN_TOKEN;
  if (!adm || tok.length < 16 || tok !== adm) return new Response('nincs jogosultság', { status: 401 });
  const store = getStore({ name: 'horizonlens-subscribers', consistency: 'strong' }), { blobs } = await store.list();
  const rows = (await Promise.all(blobs.map(b => store.get(b.key, { type: 'json' })))).filter(Boolean).sort((a, b) => a.consented_at < b.consented_at ? -1 : 1);
  const q = v => '"' + String(v ?? '').replace(/"/g, '""') + '"';
  const csv = ['email,edukacios,marketing,hozzajarulas_verzio,hozzajarulas_ideje,oldal,hozzajarulas_szovege',
    ...rows.map(r => [r.email, r.edu, r.mkt, r.consent_version, r.consented_at, r.page, r.consent_text].map(q).join(','))].join('\r\n');
  return new Response('﻿' + csv, { headers: { 'content-type': 'text/csv; charset=utf-8', 'content-disposition': 'attachment; filename="feliratkozok.csv"', 'cache-control': 'no-store' } });
};

export const config = { path: '/api/subscribers' };
