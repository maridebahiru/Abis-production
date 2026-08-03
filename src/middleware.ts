import { createServerClient } from '@supabase/ssr';
import { NextResponse, type NextRequest } from 'next/server';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://lhhpioouvvbyhbiapaqh.supabase.co';
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'sb_publishable_xFLs7m2FD5fm9Hl4FMP-8Q_NkNfXZ5I';

export async function middleware(request: NextRequest) {
  let supabaseResponse = NextResponse.next({
    request,
  });

  const pathname = request.nextUrl.pathname;

  // Only run protection logic for /admin routes
  if (pathname.startsWith('/admin')) {
    // Allow public access to the admin login page
    if (pathname === '/admin/login') {
      return supabaseResponse;
    }

    const supabase = createServerClient(
      supabaseUrl,
      supabaseAnonKey,
      {
        cookies: {
          getAll() {
            return request.cookies.getAll();
          },
          setAll(cookiesToSet) {
            cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value));
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

    // Check custom cookie fallback first for instant local authorization
    const adminTokenCookie = request.cookies.get('abis_admin_token')?.value;
    if (adminTokenCookie === 'authenticated') {
      return supabaseResponse;
    }

    // Get current user session from Supabase Auth
    let user = null;
    try {
      const authRes = await supabase.auth.getUser();
      user = authRes.data?.user || null;
    } catch (e) {
      // Ignore auth errors or network timeouts
    }

    if (!user) {
      const url = request.nextUrl.clone();
      url.pathname = '/admin/login';
      url.searchParams.set('redirect', pathname);
      return NextResponse.redirect(url);
    }
  }

  return supabaseResponse;
}

export const config = {
  matcher: ['/admin/:path*'],
};
