import type { User } from '@supabase/supabase-js';

const FALLBACK_ADMIN_EMAIL = 'mo.abuomar@dtgsa.com';

function getConfiguredAdminEmails(): Set<string> {
    const configured = [
        process.env.ADMIN_EMAILS,
        process.env.ADMIN_EMAIL,
        FALLBACK_ADMIN_EMAIL,
    ]
        .filter(Boolean)
        .flatMap((value) => value!.split(','))
        .map((email) => email.trim().toLowerCase())
        .filter(Boolean);

    return new Set(configured);
}

export function isConfiguredAdminEmail(email: string | null | undefined): boolean {
    if (!email) {
        return false;
    }

    return getConfiguredAdminEmails().has(email.trim().toLowerCase());
}

export function isAdminUser(user: User | null | undefined): user is User {
    if (!user?.email) {
        return false;
    }

    const role = user.app_metadata?.role;
    if (role === 'admin') {
        return true;
    }

    return isConfiguredAdminEmail(user.email);
}

export async function requireAdminUser(
    supabase: {
        auth: {
            getUser: () => Promise<{ data: { user: User | null }; error: unknown }>;
        };
    }
): Promise<User> {
    const {
        data: { user },
        error,
    } = await supabase.auth.getUser();

    if (error || !isAdminUser(user)) {
        throw new Error('Unauthorized');
    }

    return user;
}

export function unauthorizedResult() {
    return { success: false, error: 'Unauthorized' };
}
