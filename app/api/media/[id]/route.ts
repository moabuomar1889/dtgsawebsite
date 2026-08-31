import { NextResponse } from 'next/server';
import { getPrisma } from '@/lib/db';

export async function GET(
    _request: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    const { id } = await params;

    try {
        const asset = await getPrisma().mediaAsset.findUnique({ where: { id } });
        if (!asset) return new NextResponse('Not found', { status: 404 });

        return new NextResponse(asset.bytes as BodyInit, {
            headers: {
                'Content-Type': asset.mime_type,
                'Content-Length': String(asset.size),
                'Cache-Control': 'public, max-age=31536000, immutable',
                'X-Content-Type-Options': 'nosniff',
            },
        });
    } catch {
        return new NextResponse('Not found', { status: 404 });
    }
}
