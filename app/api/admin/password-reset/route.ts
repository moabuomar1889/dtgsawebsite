import { NextResponse, type NextRequest } from 'next/server';
import { isConfiguredAdminEmail } from '@/lib/auth/admin';

const RESET_RATE_LIMIT_STATUS = 429;

function getSupabaseConfig() {
    const supabaseUrl = process.env.SUPABASE_INTERNAL_URL ?? process.env.NEXT_PUBLIC_SUPABASE_URL;
    const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

    if (!supabaseUrl || !anonKey) {
        throw new Error('Supabase is not configured');
    }

    return {
        anonKey,
        supabaseUrl: supabaseUrl.replace(/\/+$/, ''),
    };
}

function getResetRedirectUrl(request: NextRequest) {
    const configuredSiteUrl = process.env.NEXT_PUBLIC_SITE_URL?.replace(/\/+$/, '');

    if (configuredSiteUrl) {
        return `${configuredSiteUrl}/admin/reset-password`;
    }

    return `${request.nextUrl.origin}/admin/reset-password`;
}

function safeSuccessResponse() {
    return NextResponse.json({
        ok: true,
        message: 'If this email has admin access, a reset link has been sent. Please wait at least 60 seconds before requesting another link.',
    });
}

export async function POST(request: NextRequest) {
    let email = '';

    try {
        const body = (await request.json()) as { email?: unknown };
        email = typeof body.email === 'string' ? body.email.trim().toLowerCase() : '';
    } catch {
        return NextResponse.json(
            { ok: false, message: 'Invalid request body.' },
            { status: 400 }
        );
    }

    if (!email || !email.includes('@')) {
        return NextResponse.json(
            { ok: false, message: 'Enter a valid email address.' },
            { status: 400 }
        );
    }

    if (!isConfiguredAdminEmail(email)) {
        return safeSuccessResponse();
    }

    try {
        const { anonKey, supabaseUrl } = getSupabaseConfig();
        const redirectTo = getResetRedirectUrl(request);
        const recoverUrl = `${supabaseUrl}/auth/v1/recover?redirect_to=${encodeURIComponent(redirectTo)}`;

        const response = await fetch(recoverUrl, {
            method: 'POST',
            headers: {
                apikey: anonKey,
                Authorization: `Bearer ${anonKey}`,
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ email }),
            cache: 'no-store',
        });

        if (response.ok) {
            return safeSuccessResponse();
        }

        let detail = '';
        try {
            const payload = await response.json();
            detail = typeof payload?.msg === 'string'
                ? payload.msg
                : typeof payload?.message === 'string'
                    ? payload.message
                    : '';
        } catch {
            detail = await response.text();
        }

        console.error('Password reset request failed', {
            email,
            status: response.status,
            detail,
        });

        if (response.status === RESET_RATE_LIMIT_STATUS || /security purposes|rate/i.test(detail)) {
            return NextResponse.json(
                {
                    ok: false,
                    message: 'Please wait about 60 seconds before requesting another reset link.',
                },
                { status: RESET_RATE_LIMIT_STATUS }
            );
        }

        return NextResponse.json(
            {
                ok: false,
                message: 'The reset email could not be sent right now. Please try again in a minute.',
            },
            { status: 502 }
        );
    } catch (error) {
        console.error('Password reset route failed', error);

        return NextResponse.json(
            {
                ok: false,
                message: 'The reset email service is not available right now.',
            },
            { status: 500 }
        );
    }
}
