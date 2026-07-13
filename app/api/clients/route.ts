import { NextResponse } from 'next/server';
import { getPublicContentService } from '@/backend/config/public-content';

export async function GET() {
    try {
        const clients = await getPublicContentService().getClients();
        return NextResponse.json(clients);
    } catch (error) {
        console.error('Error fetching clients:', error);
        return NextResponse.json([], { status: 500 });
    }
}
