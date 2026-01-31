import { NextResponse } from 'next/server';
import { getPublicServices } from '@/lib/data-fetching';

export async function GET() {
    try {
        const services = await getPublicServices();
        return NextResponse.json(services);
    } catch (error) {
        console.error('Error fetching services:', error);
        return NextResponse.json([], { status: 500 });
    }
}
