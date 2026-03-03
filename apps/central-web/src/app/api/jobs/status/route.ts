import { NextRequest, NextResponse } from 'next/server';
import { getProvisioningJobBySessionId } from '@/domains/tenant/server/tenant.service';

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  const sessionId = req.nextUrl.searchParams.get('sessionId');

  if (!sessionId) {
    return NextResponse.json({ error: 'sessionId is required' }, { status: 400 });
  }

  const job = await getProvisioningJobBySessionId(sessionId);

  if (!job) {
    return NextResponse.json({ status: 'PENDING', tenantSlug: null, errorMessage: null });
  }

  return NextResponse.json({
    status: job.status,
    tenantSlug: job.tenantSlug,
    errorMessage: job.errorMessage,
  });
}
