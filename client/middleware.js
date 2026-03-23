import { NextResponse } from 'next/server';

export async function middleware(request) {
    const adminToken = request.cookies.get('adminToken')?.value;
    const { pathname } = request.nextUrl;

    // Allow login page to load without token
    if (pathname.startsWith('/admin/login')) {
        if (adminToken) {
            return NextResponse.redirect(new URL('/admin', request.url));
        }
        return NextResponse.next();
    }

    // Require token for all other /admin routes
    if (!adminToken) {
        return NextResponse.redirect(new URL('/admin/login', request.url));
    }

    // Server-side token validation
    try {
        const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';
        const verifyRes = await fetch(`${apiUrl}/api/admin/verify`, {
            method: 'GET',
            headers: {
                'Cookie': `adminToken=${adminToken}`
            }
        });

        if (!verifyRes.ok) {
            // Token invalid or expired, clear it by forcing a redirect
            const response = NextResponse.redirect(new URL('/admin/login', request.url));
            response.cookies.delete('adminToken');
            return response;
        }

        // Add Cache-Control: no-store so browser never caches admin pages
        // This prevents back button from showing admin panel after logout
        const response = NextResponse.next();
        response.headers.set('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate');
        return response;
    } catch (err) {
        // Fallback if API is down, allow routing but user won't see data
        const response = NextResponse.next();
        response.headers.set('Cache-Control', 'no-store');
        return response;
    }
}

export const config = {
    matcher: ['/admin/:path*'],
};
