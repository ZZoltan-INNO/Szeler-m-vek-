// Névtelen összesítő számláló: látogatók, letett turbinák, mentett képek. Személyes adatot nem tárol (IP-t, sütit sem).
// GET /api/stats → {users, turbines, images, since};  POST /api/stats {"kind": "users" | "turbines" | "images"} → +1
import { getStore } from '@netlify/blobs';

const KINDS = ['users', 'turbines', 'images'];

export default async (req) => {
  const store = getStore({ name: 'horizonlens-stats', consistency: 'strong' });
  if (req.method === 'POST') {
    let kind = null;
    try { ({ kind } = JSON.parse((await req.text()).slice(0, 200))); } catch (e) { /* hibás kérés */ }
    if (!KINDS.includes(kind)) return new Response('ismeretlen esemény', { status: 400 });
    // feltételes írás: ha közben más is írt, újraolvas és újrapróbál (így egyidejű kéréseknél sem vész el számlálás)
    for (let i = 0; i < 6; i++) {
      const cur = await store.getWithMetadata('counts', { type: 'json' });
      const data = cur && cur.data ? cur.data : { users: 0, turbines: 0, images: 0, since: new Date().toISOString() };
      data[kind] = (data[kind] || 0) + 1;
      const res = cur ? await store.setJSON('counts', data, { onlyIfMatch: cur.etag }) : await store.setJSON('counts', data, { onlyIfNew: true });
      if (!res || res.modified !== false) break;
    }
    return new Response(null, { status: 204 });
  }
  const cur = (await store.get('counts', { type: 'json' })) || { users: 0, turbines: 0, images: 0 };
  return Response.json(cur, { headers: { 'cache-control': 'public, max-age=60' } });
};

export const config = { path: '/api/stats' };
