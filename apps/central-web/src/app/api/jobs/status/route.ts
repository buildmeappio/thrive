import { NextRequest, NextResponse } from 'next/server';
import { getTenantSetupStatus } from '@/domains/tenant/server/tenant.service';

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  const sessionId = req.nextUrl.searchParams.get('sessionId');

  if (!sessionId) {
    return NextResponse.json({ error: 'sessionId is required' }, { status: 400 });
  }

  const result = await getTenantSetupStatus(sessionId);

  return NextResponse.json({
    setupStatus: result.setupStatus,
    tenantSlug: result.tenantSlug,
    errorMessage: result.errorMessage,
  });
}
