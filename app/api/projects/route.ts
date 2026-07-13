import { NextResponse } from 'next/server';
import { getPublicContentService } from '@/backend/config/public-content';

export async function GET() {
    try {
        const projects = await getPublicContentService().getProjects();
        return NextResponse.json(projects);
    } catch (error) {
        console.error('Error fetching projects:', error);
        return NextResponse.json([], { status: 500 });
    }
}
