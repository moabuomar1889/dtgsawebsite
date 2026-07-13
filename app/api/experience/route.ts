import { NextResponse } from 'next/server';
import { getPublicContentService } from '@/backend/config/public-content';

export async function GET() {
    try {
        const experience = await getPublicContentService().getExperience();
        return NextResponse.json(experience);
    } catch (error) {
        console.error('Error fetching experience:', error);
        return NextResponse.json([], { status: 500 });
    }
}
