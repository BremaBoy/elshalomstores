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
    const isLoginPage = request.nextUrl.pathname === '/login' || request.nextUrl.pathname === '/'

    // Redirect unauthenticated users
    if (isDashboard && !user) {
        return NextResponse.redirect(new URL('/login', request.url))
    }

    // Redirect authenticated users from login to dashboard
    if (user && isLoginPage) {
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

        // Cross-role protection
        if (request.nextUrl.pathname.startsWith('/dashboard/superadmin') && role !== 'SUPER_ADMIN') {
            return NextResponse.redirect(new URL('/dashboard/admin', request.url))
        }

        if (request.nextUrl.pathname.startsWith('/dashboard/admin') && role === 'SUPER_ADMIN') {
             // Let super admin access admin via the superadmin route or redirect?
             // User said: "superadmin redirected from /admin to /supaadmin"
             return NextResponse.redirect(new URL('/dashboard/superadmin', request.url))
        }
    }

    return response
}

export const config = {
    matcher: ['/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)'],
}
