import { NextResponse, type NextRequest } from 'next/server';
import { ADMIN_SESSION_COOKIE } from '@/lib/auth/constants';

export function proxy(request: NextRequest) {
    const isLoginPage = request.nextUrl.pathname === '/admin/login';
    const hasSessionCookie = Boolean(request.cookies.get(ADMIN_SESSION_COOKIE)?.value);

    if (!isLoginPage && !hasSessionCookie) {
        const url = request.nextUrl.clone();
        url.pathname = '/admin/login';
        return NextResponse.redirect(url);
    }

    return NextResponse.next();
}

export const config = {
    matcher: ['/admin/:path*'],
};
