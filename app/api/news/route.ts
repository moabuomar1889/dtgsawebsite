import { NextResponse } from 'next/server';
import { getPublicContentService } from '@/backend/config/public-content';

export async function GET() {
    try {
        const news = await getPublicContentService().getNews();
        return NextResponse.json(news);
    } catch (error) {
        console.error('Error fetching news:', error);
        return NextResponse.json([], { status: 500 });
    }
}
