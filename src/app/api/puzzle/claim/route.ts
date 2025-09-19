import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { createHash } from 'crypto';

export const runtime = 'nodejs';

const supabase = createClient(
  process.env.SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
  { auth: { persistSession: false } }
);

const CAMPAIGN_ID = 'launch-1';

function getClientIp(req: NextRequest) {
  const fwd = req.headers.get('x-forwarded-for') || '';
  const ip = fwd.split(',')[0]?.trim();
  return ip || '0.0.0.0';
}

function hashIp(ip: string) {
  const salt = process.env.IP_SALT || 'change-me';
  return createHash('sha256').update(`${ip}|${salt}`).digest('hex');
}

function canonicalizeEmail(raw: string) {
  let email = raw.trim().toLowerCase();
  const [local, domain] = email.split('@');
  const noPlus = local.split('+')[0];
  if (domain === 'gmail.com' || domain === 'googlemail.com') {
    return `${noPlus.replace(/\./g, '')}@gmail.com`;
  }
  return `${noPlus}@${domain}`;
}

// small starter list
const DISPOSABLE = new Set(['mailinator.com','yopmail.com','tempmail.com']);

export async function POST(req: NextRequest) {
  try {
    const { email, proof, letters } = await req.json();
    if (typeof email !== 'string' || !email.includes('@')) {
      return NextResponse.json({ ok: false, reason: 'bad-email' }, { status: 400 });
    }
    if (proof !== 'HOME') {
      return NextResponse.json({ ok: false, reason: 'bad-proof' }, { status: 400 });
    }

    const email_canonical = canonicalizeEmail(email);
    const domain = email_canonical.split('@')[1];
    if (DISPOSABLE.has(domain)) {
      return NextResponse.json({ ok: false, reason: 'disposable' }, { status: 400 });
    }

    const ip = getClientIp(req);
    const ip_hash = hashIp(ip);
    const ua = req.headers.get('user-agent') || '';

    // Rate limit: 3 attempts/hour per IP
    const since = new Date(Date.now() - 60 * 60 * 1000).toISOString();
    const { count: attempts } = await supabase
      .from('claim_attempts')
      .select('*', { count: 'exact', head: true })
      .eq('campaign_id', CAMPAIGN_ID)
      .eq('ip_hash', ip_hash)
      .gte('created_at', since);

    if ((attempts ?? 0) >= 3) {
      return NextResponse.json({ ok: false, reason: 'rate' }, { status: 429 });
    }

    // record attempt (best-effort)
    await supabase.from('claim_attempts').insert({
      campaign_id: CAMPAIGN_ID,
      ip_hash,
      email: email_canonical,
    });

    // Final claim insert (enforces unique email + unique IP)
    const { error } = await supabase.from('claims').insert({
      campaign_id: CAMPAIGN_ID,
      email,
      ip_hash,
      proof,
      letters,
      user_agent: ua,
    });

    if (error) {
      if (error.code === '23505') {
        if (error.message.includes('uniq_claim_email')) {
          return NextResponse.json({ ok: false, reason: 'email' }, { status: 409 });
        }
        if (error.message.includes('uniq_claim_ip')) {
          return NextResponse.json({ ok: false, reason: 'ip' }, { status: 429 });
        }
      }
      console.error('Supabase insert error:', error);
      return NextResponse.json({ ok: false, reason: 'server' }, { status: 500 });
    }

    return NextResponse.json({ ok: true });
  } catch (e) {
    console.error('Claim route error:', e);
    return NextResponse.json({ ok: false, reason: 'server' }, { status: 500 });
  }
}

