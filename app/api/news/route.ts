import { NextResponse } from 'next/server';
import { getPublicNews } from '@/lib/data-fetching';

export async function GET() {
    try {
        const news = await getPublicNews();
        return NextResponse.json(news);
    } catch (error) {
        console.error('Error fetching news:', error);
        return NextResponse.json([], { status: 500 });
    }
}
