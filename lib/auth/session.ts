import { createHash, randomBytes } from 'node:crypto';
import { cookies } from 'next/headers';
import { getPrisma } from '@/lib/db';
import { ADMIN_SESSION_COOKIE } from '@/lib/auth/constants';
const SESSION_DURATION_MS = 12 * 60 * 60 * 1000;

function hashSessionToken(token: string): string {
    return createHash('sha256').update(token).digest('hex');
}

export async function createAdminSession(userId: string): Promise<void> {
    const token = randomBytes(32).toString('base64url');
    const expiresAt = new Date(Date.now() + SESSION_DURATION_MS);
    const prisma = getPrisma();

    await prisma.$transaction([
        prisma.adminSession.deleteMany({ where: { expires_at: { lt: new Date() } } }),
        prisma.adminSession.create({
            data: { token_hash: hashSessionToken(token), user_id: userId, expires_at: expiresAt },
        }),
    ]);

    (await cookies()).set(ADMIN_SESSION_COOKIE, token, {
        httpOnly: true,
        sameSite: 'lax',
        secure: process.env.NODE_ENV === 'production',
        path: '/',
        expires: expiresAt,
    });
}

export async function deleteCurrentAdminSession(): Promise<void> {
    const cookieStore = await cookies();
    const token = cookieStore.get(ADMIN_SESSION_COOKIE)?.value;

    if (token) {
        await getPrisma().adminSession.deleteMany({ where: { token_hash: hashSessionToken(token) } });
    }

    cookieStore.delete(ADMIN_SESSION_COOKIE);
}

export async function getCurrentAdminUser() {
    const token = (await cookies()).get(ADMIN_SESSION_COOKIE)?.value;
    if (!token) return null;

    const session = await getPrisma().adminSession.findUnique({
        where: { token_hash: hashSessionToken(token) },
        include: { user: true },
    });

    if (!session || session.expires_at <= new Date() || !session.user.is_active || session.user.role !== 'admin') {
        return null;
    }

    return session.user;
}
