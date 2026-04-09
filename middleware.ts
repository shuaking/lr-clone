import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

// 需要认证的路由
const protectedRoutes = ['/app', '/vocabulary', '/stats', '/admin'];

// 公开路由
const publicRoutes = ['/', '/login', '/catalog', '/pricing'];

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // 检查是否是受保护的路由
  const isProtectedRoute = protectedRoutes.some((route) =>
    pathname.startsWith(route)
  );

  // 检查是否是公开路由
  const isPublicRoute = publicRoutes.some((route) => pathname === route);

  // 从 cookie 中获取认证状态
  const authCookie = request.cookies.get('auth-storage');
  const isAuthenticated = authCookie?.value?.includes('"user"');

  // 如果是受保护路由且未登录，重定向到登录页
  if (isProtectedRoute && !isAuthenticated) {
    const loginUrl = new URL('/login', request.url);
    loginUrl.searchParams.set('redirect', pathname);
    return NextResponse.redirect(loginUrl);
  }

  // 如果已登录且访问登录页，重定向到应用
  if (pathname === '/login' && isAuthenticated) {
    return NextResponse.redirect(new URL('/app', request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     */
    '/((?!api|_next/static|_next/image|favicon.ico).*)',
  ],
};
