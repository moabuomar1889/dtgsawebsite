import { NextResponse } from 'next/server';
import { getPublicProjects } from '@/lib/data-fetching';

export async function GET() {
    try {
        const projects = await getPublicProjects();
        return NextResponse.json(projects);
    } catch (error) {
        console.error('Error fetching projects:', error);
        return NextResponse.json([], { status: 500 });
    }
}
