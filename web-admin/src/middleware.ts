import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

export async function middleware(request: NextRequest) {
    let response = NextResponse.next({
        request: {
            headers: request.headers,
        },
    })

    const supabase = createServerClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
        {
            cookies: {
                getAll() {
                    return request.cookies.getAll()
                },
                setAll(cookiesToSet) {
                    cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value))
                    response = NextResponse.next({
                        request,
                    })
                    cookiesToSet.forEach(({ name, value, options }) =>
                        response.cookies.set(name, value, options)
                    )
                },
            },
        }
    )

    // Check auth session
    const { data: { user } } = await supabase.auth.getUser()

    // Protected routes pattern
    const isDashboard = request.nextUrl.pathname.startsWith('/dashboard')
    const isLoginPage = request.nextUrl.pathname === '/login'
    const isRoot = request.nextUrl.pathname === '/'
    const isAuthFlow = request.nextUrl.pathname.startsWith('/reset-password')

    // Redirect unauthenticated users
    if (isDashboard && !user) {
        return NextResponse.redirect(new URL('/login', request.url))
    }

    // Redirect authenticated users from login/root to dashboard
    // BUT only if they aren't in a reset-password flow
    if (user && (isLoginPage || isRoot) && !isAuthFlow) {
        return NextResponse.redirect(new URL('/dashboard', request.url))
    }

    if (user && isDashboard) {
        // Fetch role from profile or metadata (assuming user_metadata for now, or fetch from DB)
        // For security, ideally fetch from a protected 'admins' table in DB
        const role = user.app_metadata?.role || (user.user_metadata as any)?.role

        // Root dashboard redirect to role-specific dashboard
        if (request.nextUrl.pathname === '/dashboard') {
            if (role === 'SUPER_ADMIN') {
                return NextResponse.redirect(new URL('/dashboard/superadmin', request.url))
            }
            return NextResponse.redirect(new URL('/dashboard/admin', request.url))
        }

        // Cross-role protection: Ensure Super Admin and Admin stay in their respective base dashboards
        const isSuperAdminPath = request.nextUrl.pathname === '/dashboard/superadmin'
        const isAdminPath = request.nextUrl.pathname === '/dashboard/admin'

        if (isSuperAdminPath && role !== 'SUPER_ADMIN') {
            return NextResponse.redirect(new URL('/dashboard/admin', request.url))
        }

        if (isAdminPath && role === 'SUPER_ADMIN') {
             return NextResponse.redirect(new URL('/dashboard/superadmin', request.url))
        }
    }

    return response
}

export const config = {
    matcher: ['/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)'],
}
