import { NextRequest, NextResponse } from "next/server";
import authHandlers from "@/domains/auth/server/handlers";

/**
 * POST /api/examiner/approve
 * Approves a medical examiner profile and sends approval email notification
 *
 * Request Body:
 * {
 *   "examinerProfileId": "uuid-string",
 *   "approvedBy": "uuid-string" (optional - ID of approver)
 * }
 *
 * Response:
 * {
 *   "success": true,
 *   "message": "Medical examiner approved successfully",
 *   "data": {
 *     "examinerProfileId": "uuid-string",
 *     "status": "ACCEPTED",
 *     "approvedAt": "2025-01-01T00:00:00.000Z"
 *   }
 * }
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    const { examinerProfileId, approvedBy } = body;

    if (!examinerProfileId) {
      return NextResponse.json(
        {
          success: false,
          message: "examinerProfileId is required",
        },
        { status: 400 }
      );
    }

    const result = await authHandlers.approveMedicalExaminer({
      examinerProfileId,
      approvedBy,
    });

    return NextResponse.json(result, { status: 200 });
  } catch (error) {
    console.error("Error approving medical examiner:", error);

    const errorMessage =
      error instanceof Error
        ? error.message
        : "Failed to approve medical examiner";
    const statusCode = (error as any)?.statusCode || 500;

    return NextResponse.json(
      {
        success: false,
        message: errorMessage,
      },
      { status: statusCode }
    );
  }
}
