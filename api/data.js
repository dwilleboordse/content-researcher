import { kv } from '@vercel/kv';
const KEY = 'content-researcher-data';
export default async function handler(req, res) {
  if (req.method === 'GET') { try { return res.status(200).json((await kv.get(KEY)) || { profiles: [], config: {} }); } catch (e) { return res.status(200).json({ profiles: [], config: {} }); } }
  if (req.method === 'POST') { try { await kv.set(KEY, req.body); return res.status(200).json({ ok: true }); } catch (e) { return res.status(500).json({ error: e.message }); } }
  return res.status(405).json({ error: 'Method not allowed' });
}
