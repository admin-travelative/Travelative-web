import { NextResponse } from 'next/server';
import { jwtVerify } from 'jose';

// JWT_SECRET must be set as an env var accessible in middleware (server-side only)
// Add JWT_SECRET to .env.local  (no NEXT_PUBLIC_ prefix so it stays server-side)
const JWT_SECRET = process.env.JWT_SECRET || 'travelative_super_secret_jwt_key_2024';

export async function middleware(request) {
    const adminToken = request.cookies.get('adminToken')?.value;
    const { pathname } = request.nextUrl;

    // ── Login page ────────────────────────────────────────────────────────────
    if (pathname.startsWith('/admin/login')) {
        if (adminToken) {
            // Already logged in → bounce to dashboard
            try {
                await jwtVerify(adminToken, new TextEncoder().encode(JWT_SECRET));
                return NextResponse.redirect(new URL('/admin', request.url));
            } catch {
                // Token invalid — let them reach login page
                const res = NextResponse.next();
                res.cookies.delete('adminToken');
                return res;
            }
        }
        return NextResponse.next();
    }

    // ── All other /admin routes ───────────────────────────────────────────────
    if (!adminToken) {
        return NextResponse.redirect(new URL('/admin/login', request.url));
    }

    try {
        // Verify JWT locally — zero network latency
        await jwtVerify(adminToken, new TextEncoder().encode(JWT_SECRET));
        return NextResponse.next();
    } catch {
        // Token expired / invalid — clear cookie and redirect to login
        const response = NextResponse.redirect(new URL('/admin/login', request.url));
        response.cookies.delete('adminToken');
        return response;
    }
}

export const config = {
    matcher: ['/admin/:path*'],
};
