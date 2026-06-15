import { NextResponse } from 'next/server';
import { getPublicClients } from '@/lib/data-fetching';

export async function GET() {
    try {
        const clients = await getPublicClients();
        return NextResponse.json(clients);
    } catch (error) {
        console.error('Error fetching clients:', error);
        return NextResponse.json([], { status: 500 });
    }
}
