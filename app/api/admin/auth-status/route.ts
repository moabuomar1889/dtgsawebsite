import { NextResponse } from 'next/server';
import { getPrisma } from '@/lib/db';

export async function GET() {
    try {
        await getPrisma().$queryRaw`SELECT 1`;
        return NextResponse.json({ available: true }, { headers: { 'Cache-Control': 'no-store' } });
    } catch {
        return NextResponse.json(
            { available: false },
            { status: 503, headers: { 'Cache-Control': 'no-store' } }
        );
    }
}
