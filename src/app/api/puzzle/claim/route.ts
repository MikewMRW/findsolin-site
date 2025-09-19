// src/app/api/puzzle/claim/route.ts
export const runtime = 'nodejs';

import { NextRequest, NextResponse } from 'next/server';
import { createHash } from 'crypto';

const SB_URL = process.env.SUPABASE_URL!;
const SB_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY!;
const IP_SALT = process.env.IP_SALT || 'salt';
const CAMPAIGN_ID = process.env.CAMPAIGN_ID || 'default';

function authHeaders() {
  return {
    apikey: SB_KEY,
    Authorization: `Bearer ${SB_KEY}`,
    'Content-Type': 'application/json',
  };
}

function getIp(req: NextRequest) {
  const fwd = req.headers.get('x-forwarded-for');
  return req.headers.get('x-real-ip') || (fwd ? fwd.split(',')[0].trim() : '') || '0.0.0.0';
}

function ipHash(ip: string) {
  return createHash('sha256').update(`${IP_SALT}|${ip}`).digest('hex').slice(0, 32);
}

export async function GET() {
  return NextResponse.json({ ok: true });
}

export async function POST(req: NextRequest) {
  try {
    const { email, proof, letters } = await req.json();

    if (!email || typeof email !== 'string') {
      return NextResponse.json({ ok: false, error: 'Missing email' }, { status: 400 });
    }

    const solved =
      typeof proof === 'string' &&
      proof.toUpperCase() === 'HOME' &&
      Array.isArray(letters) &&
      ['H', 'O', 'M', 'E'].every((l) => letters.includes(l));

    if (!solved) {
      return NextResponse.json({ ok: false, error: 'Invalid proof' }, { status: 403 });
    }

    const ip = getIp(req);
    const hash = ipHash(ip);

    // 1) Email already used?
    {
      const url = new URL(`${SB_URL}/rest/v1/claims`);
      url.searchParams.set('select', 'id');
      url.searchParams.set('email', `eq.${email}`);
      url.searchParams.set('campaign_id', `eq.${CAMPAIGN_ID}`);

      const r = await fetch(url, { headers: authHeaders(), cache: 'no-store' });
      if (!r.ok) return NextResponse.json({ ok: false, error: 'Supabase email check failed' }, { status: 500 });
      const rows = await r.json();
      if (Array.isArray(rows) && rows.length > 0) {
        return NextResponse.json({ ok: false, reason: 'email' }, { status: 409 });
      }
    }

    // 2) IP already used?
    {
      const url = new URL(`${SB_URL}/rest/v1/claims`);
      url.searchParams.set('select', 'id');
      url.searchParams.set('ip_hash', `eq.${hash}`);
      url.searchParams.set('campaign_id', `eq.${CAMPAIGN_ID}`);

      const r = await fetch(url, { headers: authHeaders(), cache: 'no-store' });
      if (!r.ok) return NextResponse.json({ ok: false, error: 'Supabase ip check failed' }, { status: 500 });
      const rows = await r.json();
      if (Array.isArray(rows) && rows.length > 0) {
        return NextResponse.json({ ok: false, reason: 'ip' }, { status: 409 });
      }
    }

    // 3) Insert claim
    {
      const r = await fetch(`${SB_URL}/rest/v1/claims`, {
        method: 'POST',
        headers: { ...authHeaders(), Prefer: 'return=representation' },
        body: JSON.stringify({
          email,
          ip_hash: hash,
          campaign_id: CAMPAIGN_ID,
          letters,
          created_at: new Date().toISOString(),
        }),
      });
      if (!r.ok) {
        const text = await r.text();
        return NextResponse.json({ ok: false, error: `Supabase insert failed: ${text}` }, { status: 500 });
      }
    }

    return NextResponse.json({ ok: true });
  } catch (e: any) {
    return NextResponse.json({ ok: false, error: e?.message || 'Unknown error' }, { status: 500 });
  }
}
