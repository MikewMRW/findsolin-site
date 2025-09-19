// src/app/api/puzzle/claim/route.ts
export const runtime = 'nodejs';

import { NextRequest, NextResponse } from 'next/server';
import crypto from 'crypto';

const SB_URL = process.env.SUPABASE_URL;                 // e.g. https://xxxxx.supabase.co
const SB_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;    // service role key
const IP_SALT = process.env.IP_SALT || 'salt';
const CAMPAIGN_ID = process.env.CAMPAIGN_ID || 'default';

function bad(msg: string, status = 400) {
  return NextResponse.json({ ok: false, error: msg }, { status });
}
function headersAuth() {
  if (!SB_URL || !SB_KEY) throw new Error('Missing Supabase env vars');
  return {
    apikey: SB_KEY,
    Authorization: `Bearer ${SB_KEY}`,
    'Content-Type': 'application/json',
  };
}
function getIp(req: NextRequest) {
  const h = req.headers;
  const fwd = h.get('x-forwarded-for');
  const ip = (h.get('x-real-ip') || (fwd ? fwd.split(',')[0].trim() : '') || '0.0.0.0');
  return ip;
}
function hashIp(ip: string) {
  return crypto.createHash('sha256').update(`${IP_SALT}|${ip}`).digest('hex').slice(0, 32);
}

export async function GET() {
  return NextResponse.json({ ok: true }); // health check
}

export async function POST(req: NextRequest) {
  try {
    const { email, proof, letters } = await req.json();

    if (!email || typeof email !== 'string') return bad('Missing email');
    // Very basic proof check; adjust to your game logic:
    const hasAll = Array.isArray(letters) && ['H', 'O', 'M', 'E'].every((l) => letters.includes(l));
    if (!proof || proof.toUpperCase() !== 'HOME' || !hasAll) return bad('Invalid proof', 403);

    const ip = getIp(req);
    const ip_hash = hashIp(ip);

    // 1) Reject if this email already claimed
    {
      const url = new URL(`${SB_URL}/rest/v1/claims`);
      url.searchParams.set('email', `eq.${email}`);
      url.searchParams.set('campaign_id', `eq.${CAMPAIGN_ID}`);
      url.searchParams.set('select', 'id');

      const r = await fetch(url, { headers: headersAuth(), cache: 'no-store' });
      if (!r.ok) return bad('Supabase email check failed', 500);
      const rows = await r.json();
      if (Array.isArray(rows) && rows.length > 0) {
        return NextResponse.json({ ok: false, reason: 'email' }, { status: 409 });
      }
    }

    // 2) Reject if this IP already claimed
    {
      const url = new URL(`${SB_URL}/rest/v1/claims`);
      url.searchParams.set('ip_hash', `eq.${ip_hash}`);
      url.searchParams.set('campaign_id', `eq.${CAMPAIGN_ID}`);
      url.searchParams.set('select', 'id');

      const r = await fetch(url, { headers: headersAuth(), cache: 'no-store' });
      if (!r.ok) return bad('Supabase ip check failed', 500);
      const rows = await r.json();
      if (Array.isArray(rows) && rows.length > 0) {
        return NextResponse.json({ ok: false, reason: 'ip' }, { status: 409 });
      }
    }

    // 3) Insert claim
    {
      const r = await fetch(`${SB_URL}/rest/v1/claims`, {
        method: 'POST',
        headers: { ...headersAuth(), Prefer: 'return=representation' },
        body: JSON.stringify({
          email,
          ip_hash,
          campaign_id: CAMPAIGN_ID,
          letters,
          created_at: new Date().toISOString(),
          // add more fields if you like (user agent, etc.)
        }),
      });
      if (!r.ok) {
        const text = await r.text();
        return bad(`Supabase insert failed: ${text}`, 500);
      }
    }

    return NextResponse.json({ ok: true });
  } catch (e: any) {
    return bad(e?.message || 'Unknown error', 500);
  }
}
