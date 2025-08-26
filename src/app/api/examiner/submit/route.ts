/* eslint-disable @typescript-eslint/consistent-type-imports */
import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { ExaminerService } from '@/features/examiner/examiner.service';
import { authOptions } from '@/shared/lib/auth';

const examinerService = new ExaminerService();

// Submit profile for review
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Authentication required' }, { status: 401 });
    }

    const result = await examinerService.submitForReview(session.user.id, {
      ip: request.headers.get('x-forwarded-for') || '0.0.0.0',
      userAgent: request.headers.get('user-agent') || undefined,
    });

    if (!result.success) {
      return NextResponse.json({ error: result.message }, { status: 400 });
    }

    return NextResponse.json({
      success: true,
      message: result.message,
    });
  } catch (error) {
    console.error('Submit profile for review error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
