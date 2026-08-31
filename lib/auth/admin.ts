import { getCurrentAdminUser } from '@/lib/auth/session';

export async function requireAdminUser() {
    const user = await getCurrentAdminUser();

    if (!user) {
        throw new Error('Unauthorized');
    }

    return user;
}

export function unauthorizedResult() {
    return { success: false, error: 'Unauthorized' };
}
