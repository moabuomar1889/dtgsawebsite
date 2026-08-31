import { NextResponse } from 'next/server';
import { deleteCurrentAdminSession } from '@/lib/auth/session';

export async function POST() {
    try {
        await deleteCurrentAdminSession();
    } catch (error) {
        console.error('Admin logout failed', error);
    }

    return NextResponse.json({ ok: true });
}
