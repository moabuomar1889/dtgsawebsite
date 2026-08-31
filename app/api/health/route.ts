import { NextResponse } from 'next/server';
import { getPrisma } from '@/lib/db';

export const dynamic = 'force-dynamic';

export async function GET() {
    const startedAt = performance.now();

    try {
        await getPrisma().$queryRaw`SELECT 1`;
        return NextResponse.json({
            status: 'healthy',
            database: 'ready',
            responseTimeMs: Math.round(performance.now() - startedAt),
        }, {
            headers: { 'Cache-Control': 'no-store' },
        });
    } catch (error) {
        console.error('Health check failed', error);
        return NextResponse.json({
            status: 'unhealthy',
            database: 'unavailable',
        }, {
            status: 503,
            headers: { 'Cache-Control': 'no-store' },
        });
    }
}
