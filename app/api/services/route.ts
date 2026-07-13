import { NextResponse } from 'next/server';
import { getPublicContentService } from '@/backend/config/public-content';

export async function GET() {
    try {
        const services = await getPublicContentService().getServices();
        return NextResponse.json(services);
    } catch (error) {
        console.error('Error fetching services:', error);
        return NextResponse.json([], { status: 500 });
    }
}
