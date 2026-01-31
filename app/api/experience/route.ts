import { NextResponse } from 'next/server';
import { getPublicExperience } from '@/lib/data-fetching';

export async function GET() {
    try {
        const experience = await getPublicExperience();
        return NextResponse.json(experience);
    } catch (error) {
        console.error('Error fetching experience:', error);
        return NextResponse.json([], { status: 500 });
    }
}
