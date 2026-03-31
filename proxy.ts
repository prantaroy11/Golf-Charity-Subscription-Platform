import { createServerClient } from '@supabase/ssr';
import { NextResponse, type NextRequest } from 'next/server';

// ──────────────────────────────────────────────────────────
// Proxy — Session refresh on every navigation request
// Next.js 16 uses "proxy" instead of "middleware"
// ──────────────────────────────────────────────────────────

export async function proxy(request: NextRequest) {
  let supabaseResponse = NextResponse.next({
    request,
  });

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) =>
            request.cookies.set(name, value)
          );
          supabaseResponse = NextResponse.next({
            request,
          });
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options)
          );
        },
      },
    }
  );

  // Refresh the session — IMPORTANT: do not remove this
  // getUser() validates the JWT and refreshes the token if needed
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { pathname } = request.nextUrl;

  // ──────────────────────────────────────────────────────────
  // Protected routes: /dashboard/* and /admin/*
  // Redirect unauthenticated users to /login
  // ──────────────────────────────────────────────────────────
  const isProtectedRoute =
    pathname.startsWith('/dashboard') || pathname.startsWith('/admin');

  if (isProtectedRoute && !user) {
    const url = request.nextUrl.clone();
    url.pathname = '/login';
    url.searchParams.set('redirect', pathname);
    return NextResponse.redirect(url);
  }

  // ──────────────────────────────────────────────────────────
  // Admin routes: /admin/*
  // Only users with role === 'admin' can access
  // ──────────────────────────────────────────────────────────
  if (pathname.startsWith('/admin') && user) {
    const { data: profile } = await supabase
      .from('users')
      .select('role')
      .eq('id', user.id)
      .single();

    if (!profile || profile.role !== 'admin') {
      const url = request.nextUrl.clone();
      url.pathname = '/dashboard';
      return NextResponse.redirect(url);
    }
  }

  // ──────────────────────────────────────────────────────────
  // Auth pages: /login, /signup
  // Redirect authenticated users to /dashboard
  // ──────────────────────────────────────────────────────────
  const authPaths = ['/login', '/signup'];
  const isAuthRoute = authPaths.some((path) => pathname === path);

  if (user && isAuthRoute) {
    const redirect =
      request.nextUrl.searchParams.get('redirect') || '/dashboard';
    const url = request.nextUrl.clone();
    url.pathname = redirect;
    url.searchParams.delete('redirect');
    return NextResponse.redirect(url);
  }

  return supabaseResponse;
}

export const config = {
  matcher: [
    /*
     * Match all request paths except:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public folder files (images, etc.)
     * - api routes (handled by their own auth)
     */
    '/((?!_next/static|_next/image|favicon.ico|api/|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
};
