/* eslint-disable @typescript-eslint/consistent-type-imports */
import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { ExaminerService } from '@/features/examiner/services/examinerServices';
import { authOptions } from '@/shared/lib/auth';
import {
  examinerPersonalInfoSchema,
  examinerLicenseSchema,
  examinerProfessionalSchema,
  examinerPracticeSchema,
  examinerEducationSchema,
  examinerIMESchema,
  examinerInsuranceSchema,
  examinerAvailabilitySchema,
  examinerConsentSchema,
} from '@/features/examiner/schemas/examinerSchema';

const examinerService = new ExaminerService();

interface RouteParams {
  params: Promise<{
    step: string;
  }>;
}

export async function PUT(request: NextRequest, { params }: RouteParams) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Authentication required' }, { status: 401 });
    }

    const body = await request.json();
    const { step } = await params;

    const requestInfo = {
      ip: request.headers.get('x-forwarded-for') || '0.0.0.0',
      userAgent: request.headers.get('user-agent') || undefined,
    };

    let result;

    switch (step) {
      case 'personal-info':
        try {
          const validatedData = examinerPersonalInfoSchema.parse(body);
          result = await examinerService.updatePersonalInfo(
            session.user.id,
            validatedData,
            requestInfo
          );
        } catch (validationError) {
          return NextResponse.json(
            { error: 'Invalid personal information data', details: validationError },
            { status: 400 }
          );
        }
        break;

      case 'license-info':
        try {
          const validatedData = examinerLicenseSchema.parse(body);
          result = await examinerService.updateLicenseInfo(
            session.user.id,
            validatedData,
            requestInfo
          );
        } catch (validationError) {
          return NextResponse.json(
            { error: 'Invalid license information data', details: validationError },
            { status: 400 }
          );
        }
        break;

      case 'professional-details':
        try {
          const validatedData = examinerProfessionalSchema.parse(body);
          result = await examinerService.updateProfessionalDetails(
            session.user.id,
            validatedData,
            requestInfo
          );
        } catch (validationError) {
          return NextResponse.json(
            { error: 'Invalid professional details data', details: validationError },
            { status: 400 }
          );
        }
        break;

      case 'practice-info':
        try {
          const validatedData = examinerPracticeSchema.parse(body);
          result = await examinerService.updatePracticeInfo(
            session.user.id,
            validatedData,
            requestInfo
          );
        } catch (validationError) {
          return NextResponse.json(
            { error: 'Invalid practice information data', details: validationError },
            { status: 400 }
          );
        }
        break;

      case 'education-credentials':
        try {
          const validatedData = examinerEducationSchema.parse(body);
          result = await examinerService.updateEducationCredentials(
            session.user.id,
            validatedData,
            requestInfo
          );
        } catch (validationError) {
          return NextResponse.json(
            { error: 'Invalid education credentials data', details: validationError },
            { status: 400 }
          );
        }
        break;

      case 'ime-experience':
        try {
          const validatedData = examinerIMESchema.parse(body);
          result = await examinerService.updateIMEExperience(
            session.user.id,
            validatedData,
            requestInfo
          );
        } catch (validationError) {
          return NextResponse.json(
            { error: 'Invalid IME experience data', details: validationError },
            { status: 400 }
          );
        }
        break;

      case 'insurance-legal':
        try {
          const validatedData = examinerInsuranceSchema.parse(body);
          result = await examinerService.updateInsuranceLegal(
            session.user.id,
            validatedData,
            requestInfo
          );
        } catch (validationError) {
          return NextResponse.json(
            { error: 'Invalid insurance/legal data', details: validationError },
            { status: 400 }
          );
        }
        break;

      case 'availability-rates':
        try {
          const validatedData = examinerAvailabilitySchema.parse(body);
          result = await examinerService.updateAvailabilityRates(
            session.user.id,
            validatedData,
            requestInfo
          );
        } catch (validationError) {
          return NextResponse.json(
            { error: 'Invalid availability/rates data', details: validationError },
            { status: 400 }
          );
        }
        break;

      case 'consent-compliance':
        try {
          const validatedData = examinerConsentSchema.parse(body);
          result = await examinerService.updateConsentCompliance(
            session.user.id,
            validatedData,
            requestInfo
          );
        } catch (validationError) {
          return NextResponse.json(
            { error: 'Invalid consent/compliance data', details: validationError },
            { status: 400 }
          );
        }
        break;

      default:
        return NextResponse.json({ error: 'Invalid onboarding step' }, { status: 400 });
    }

    if (!result.success) {
      return NextResponse.json({ error: result.message }, { status: 400 });
    }

    return NextResponse.json({
      success: true,
      message: result.message,
      profile: result.profile,
    });
  } catch (error) {
    console.error(`Examiner onboarding step error:`, error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
