import { NextResponse, type NextRequest } from 'next/server';
import { getPrisma } from '@/lib/db';
import { verifyPassword } from '@/lib/auth/password';
import { createAdminSession } from '@/lib/auth/session';

const INVALID_CREDENTIALS = 'Invalid email or password';

export async function POST(request: NextRequest) {
    let email = '';
    let password = '';

    try {
        const body = await request.json() as { email?: unknown; password?: unknown };
        email = typeof body.email === 'string' ? body.email.trim().toLowerCase() : '';
        password = typeof body.password === 'string' ? body.password : '';
    } catch {
        return NextResponse.json({ ok: false, message: 'Invalid request body' }, { status: 400 });
    }

    if (!email || !password) {
        return NextResponse.json({ ok: false, message: INVALID_CREDENTIALS }, { status: 401 });
    }

    try {
        const user = await getPrisma().adminUser.findUnique({ where: { email } });
        const valid = user
            && user.is_active
            && user.role === 'admin'
            && await verifyPassword(password, user.password_hash);

        if (!valid) {
            return NextResponse.json({ ok: false, message: INVALID_CREDENTIALS }, { status: 401 });
        }

        await createAdminSession(user.id);
        return NextResponse.json({ ok: true });
    } catch (error) {
        console.error('Admin login failed', error);
        return NextResponse.json(
            { ok: false, message: 'The admin service is temporarily unavailable' },
            { status: 503 }
        );
    }
}
