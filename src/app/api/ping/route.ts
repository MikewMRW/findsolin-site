// src/app/api/ping/route.ts
export const runtime = 'edge';

import { NextResponse } from 'next/server';
import { headers } from 'next/headers';

export async function GET() {
  const h = headers();
  const ip =
    h.get('x-real-ip') ||
    (h.get('x-forwarded-for')?.split(',')[0].trim() ?? '');

  return NextResponse.json({
    ok: true,
    env: process.env.NODE_ENV,
    time: new Date().toISOString(),
    ip,
  });
}
