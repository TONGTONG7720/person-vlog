import { NextResponse } from 'next/server';

import { getSystemHealth } from '@/server/observability/health';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

const healthResponseHeaders = {
  'Cache-Control': 'no-store, max-age=0',
  'X-Robots-Tag': 'noindex',
} as const;

export async function GET(): Promise<NextResponse> {
  const health = await getSystemHealth();

  return NextResponse.json(health, {
    headers: healthResponseHeaders,
    status: health.status === 'ok' ? 200 : 503,
  });
}
