import { NextResponse } from "next/server";
import prisma from "@/lib/db";

export const runtime = "nodejs";

/**
 * Health check endpoint for deployment monitoring
 * Used by load balancers and orchestration systems to verify service health,
 * now also checks connectivity to the Prisma database.
 */
export async function GET() {
  try {
    // Check Prisma DB connection
    // Note: If you see PrismaClientConstructorValidationError about engine type "client",
    // you need to run: npx prisma generate
    // This regenerates the Prisma client with engineType = "library" from schema.prisma
    await prisma.$queryRaw`SELECT 1`;

    // Check basic system health
    const healthStatus = {
      status: "healthy",
      timestamp: new Date().toISOString(),
      service: "examiner-web",
      basePath: "/examiner",
      environment: process.env.NODE_ENV || "development",
      uptime:
        typeof process !== "undefined" && process.uptime
          ? process.uptime()
          : undefined,
      database: "connected",
    };

    return NextResponse.json(healthStatus, {
      status: 200,
      headers: {
        "Cache-Control": "no-cache, no-store, must-revalidate",
        Pragma: "no-cache",
        Expires: "0",
      },
    });
  } catch (error) {
    return NextResponse.json(
      {
        status: "unhealthy",
        timestamp: new Date().toISOString(),
        error: error instanceof Error ? error.message : "Unknown error",
        database: "disconnected",
      },
      {
        status: 503,
        headers: {
          "Cache-Control": "no-cache, no-store, must-revalidate",
        },
      }
    );
  }
}

// Support HEAD requests for lightweight health checks
export async function HEAD() {
  return new NextResponse(null, { status: 200 });
}
