// src/app/api/puzzle/claim/route.ts
import { NextResponse } from 'next/server';
import { headers } from 'next/headers';
import { kv } from '@vercel/kv';

export const runtime = 'edge';

function normalizeEmail(e: string) {
  return String(e || '').trim().toLowerCase();
}

function validEmail(e: string) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(e);
}

export async function POST(req: Request) {
  try {
    const { email, proof, letters } = await req.json();

    const emailNorm = normalizeEmail(email);
    if (!validEmail(emailNorm)) {
      return NextResponse.json({ error: 'bad-email' }, { status: 400 });
    }

    // quick client proof: HOME + all four letters
    const set = new Set<string>(Array.isArray(letters) ? letters : []);
    const okLetters = ['H', 'O', 'M', 'E'].every((c) => set.has(c));
    if (proof !== 'HOME' || !okLetters) {
      return NextResponse.json({ error: 'bad-proof' }, { status: 400 });
    }

    // get requester IP (works on Vercel)
    const ip =
      headers().get('x-forwarded-for')?.split(',')[0]?.trim() ||
      headers().get('x-real-ip') ||
      'unknown';

    // keys
    const emailKey = `fs:claim:email:${emailNorm}`;
    const ipKey = `fs:claim:ip:${ip}`;
    const countKey = 'fs:claim:count';
    const LIMIT = 50;

    // deny if email or ip already used
    const [emailUsed, ipUsed, currentCount] = await Promise.all([
      kv.exists(emailKey),
      kv.exists(ipKey),
      kv.get<number>(countKey),
    ]);

    if (emailUsed) {
      return NextResponse.json({ error: 'dup-email' }, { status: 409 });
    }
    if (ipUsed) {
      return NextResponse.json({ error: 'dup-ip' }, { status: 409 });
    }

    // enforce global cap
    const nextCount = (currentCount || 0) + 1;
    if (nextCount > LIMIT) {
      return NextResponse.json({ error: 'limit' }, { status: 429 });
    }

    // record success:
    await Promise.all([
      // email claim remembered for ~90 days
      kv.set(emailKey, Date.now(), { ex: 60 * 60 * 24 * 90 }),
      // IP claim remembered for ~7 days
      kv.set(ipKey, emailNorm, { ex: 60 * 60 * 24 * 7 }),
      kv.set(countKey, nextCount),
    ]);

    // (Here you could queue an email with a unique code)
    return NextResponse.json({ ok: true }, { status: 200 });
  } catch (err) {
    return NextResponse.json({ error: 'bad-request' }, { status: 400 });
  }
}

