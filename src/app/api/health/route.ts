import { NextResponse } from 'next/server';
import prisma from '@/lib/db';

// Mark route as dynamic to prevent static analysis during build
export const dynamic = 'force-dynamic';

/**
 * Health check endpoint for deployment monitoring
 * Used by load balancers and orchestration systems to verify service health,
 * now also checks connectivity to the Prisma database.
 */
export async function GET() {
    try {
        // Check Prisma DB connection
        await prisma.$queryRaw`SELECT 1`;

        // Check basic system health
        const healthStatus = {
            status: 'healthy',
            timestamp: new Date().toISOString(),
            service: 'admin-web',
            basePath: '/admin',
            environment: process.env.NODE_ENV || 'development',
            uptime: typeof process !== 'undefined' && process.uptime ? process.uptime() : undefined,
            database: 'connected',
        };

        return NextResponse.json(healthStatus, {
            status: 200,
            headers: {
                'Cache-Control': 'no-cache, no-store, must-revalidate',
                'Pragma': 'no-cache',
                'Expires': '0',
            },
        });
    } catch (error) {
        return NextResponse.json(
            {
                status: 'unhealthy',
                timestamp: new Date().toISOString(),
                error: error instanceof Error ? error.message : 'Unknown error',
                database: 'disconnected',
            },
            {
                status: 503,
                headers: {
                    'Cache-Control': 'no-cache, no-store, must-revalidate',
                },
            }
        );
    }
}

// Support HEAD requests for lightweight health checks
export async function HEAD() {
    return new NextResponse(null, { status: 200 });
}
