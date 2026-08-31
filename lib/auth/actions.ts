'use server';

import { getPrisma } from '@/lib/db';
import { requireAdminUser, unauthorizedResult } from '@/lib/auth/admin';
import { hashPassword, verifyPassword } from '@/lib/auth/password';

const MIN_PASSWORD_LENGTH = 12;

export async function changeAdminPassword(
    input: { currentPassword: string; newPassword: string }
): Promise<{ success: boolean; error?: string }> {
    let user;
    try {
        user = await requireAdminUser();
    } catch {
        return unauthorizedResult();
    }

    if (input.newPassword.length < MIN_PASSWORD_LENGTH) {
        return { success: false, error: `New password must be at least ${MIN_PASSWORD_LENGTH} characters` };
    }

    if (!await verifyPassword(input.currentPassword, user.password_hash)) {
        return { success: false, error: 'Current password is incorrect' };
    }

    await getPrisma().adminUser.update({
        where: { id: user.id },
        data: { password_hash: await hashPassword(input.newPassword) },
    });
    return { success: true };
}
