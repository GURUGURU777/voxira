import { createServerClient } from '@supabase/ssr';
import { NextResponse, type NextRequest } from 'next/server';

export async function middleware(request: NextRequest) {
  let response = NextResponse.next({ request: { headers: request.headers } });

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() { return request.cookies.getAll(); },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value, options }) => {
            request.cookies.set(name, value);
            response.cookies.set(name, value, options);
          });
        },
      },
    }
  );

  const { data: { user } } = await supabase.auth.getUser();

  const pathname = request.nextUrl.pathname;
  const protectedPaths = ['/dashboard', '/library', '/cycles', '/stats', '/home', '/onboarding', '/settings'];
  const isProtected = protectedPaths.some(p => pathname.startsWith(p));

  // Protected routes: redirect to login if not authenticated
  if (!user && isProtected) {
    const redirectResponse = NextResponse.redirect(new URL('/login', request.url));
    response.cookies.getAll().forEach(cookie => redirectResponse.cookies.set(cookie));
    return redirectResponse;
  }

  // Authenticated users: redirect landing and login to /home
  if (user && (pathname === '/' || pathname === '/login')) {
    const redirectResponse = NextResponse.redirect(new URL('/home', request.url));
    response.cookies.getAll().forEach(cookie => redirectResponse.cookies.set(cookie));
    return redirectResponse;
  }

  // Onboarding check: authenticated users on app pages (not /onboarding itself)
  if (user && isProtected && !pathname.startsWith('/onboarding')) {
    const { data: profile } = await supabase.from('profiles').select('onboarding_completed').eq('id', user.id).single();
    if (profile && profile.onboarding_completed === false) {
      const redirectResponse = NextResponse.redirect(new URL('/onboarding', request.url));
      response.cookies.getAll().forEach(cookie => redirectResponse.cookies.set(cookie));
      return redirectResponse;
    }
  }

  return response;
}

export const config = {
  matcher: ['/', '/dashboard/:path*', '/library/:path*', '/cycles/:path*', '/stats/:path*', '/home/:path*', '/onboarding/:path*', '/settings/:path*', '/login'],
};
