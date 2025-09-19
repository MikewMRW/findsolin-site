import { NextResponse } from 'next/server';

export function middleware() {
  const res = NextResponse.next();
  // Force strict HTTPS for a year (includes subdomains, allows preload list)
  res.headers.set('Strict-Transport-Security', 'max-age=31536000; includeSubDomains; preload');
  return res;
}
