import { NextRequest, NextResponse } from "next/server";
import authHandlers from "@/domains/auth/server/handlers";
import ErrorMessages from "@/constants/ErrorMessages";

/**
 * POST /api/examiner/approve
 * Approves a medical examiner application and sends approval email notification
 *
 * Request Body:
 * {
 *   "applicationId": "uuid-string",
 *   "approvedBy": "uuid-string" (optional - ID of approver)
 * }
 *
 * Response:
 * {
 *   "success": true,
 *   "message": "Medical examiner application approved successfully",
 *   "data": {
 *     "applicationId": "uuid-string",
 *     "status": "ACCEPTED",
 *     "approvedAt": "2025-01-01T00:00:00.000Z"
 *   }
 * }
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    const { applicationId, approvedBy } = body;

    if (!applicationId) {
      return NextResponse.json(
        {
          success: false,
          message: "Application ID is required",
        },
        { status: 400 },
      );
    }

    const result = await authHandlers.approveMedicalExaminer({
      applicationId,
      approvedBy,
    });

    return NextResponse.json(result, { status: 200 });
  } catch (error) {
    console.error("Error approving medical examiner:", error);

    const errorMessage =
      error instanceof Error
        ? error.message
        : ErrorMessages.FAILED_APPROVE_EXAMINER;
    const statusCode = (error as { statusCode?: number })?.statusCode || 500;

    return NextResponse.json(
      {
        success: false,
        message: errorMessage,
      },
      { status: statusCode },
    );
  }
}
