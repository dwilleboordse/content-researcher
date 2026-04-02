import { kv } from '@vercel/kv';
export default async function handler(req, res) {
  const key = 'content-researcher-reports';
  if (req.method === 'GET') { try { return res.status(200).json({ reports: (await kv.get(key)) || [] }); } catch (e) { return res.status(200).json({ reports: [] }); } }
  if (req.method === 'POST') {
    try { const existing = (await kv.get(key)) || []; existing.push({ date: new Date().toISOString(), report: req.body.report }); await kv.set(key, existing.slice(-30)); return res.status(200).json({ ok: true }); }
    catch (e) { return res.status(500).json({ error: e.message }); }
  }
  return res.status(405).json({ error: 'Method not allowed' });
}
