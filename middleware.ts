import createMiddleware from 'next-intl/middleware';
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { locales, defaultLocale } from './i18n';

// 创建 i18n 中间件
const intlMiddleware = createMiddleware({
  locales,
  defaultLocale,
  localePrefix: 'as-needed', // 默认语言不显示前缀
});

// 需要认证的路由（不包含语言前缀）
const protectedRoutes = ['/app', '/vocabulary', '/stats', '/admin'];

// 公开路由
const publicRoutes = ['/', '/login', '/catalog', '/pricing'];

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // 移除语言前缀以检查实际路由
  const pathnameWithoutLocale = pathname.replace(/^\/(zh|en|ja)/, '') || '/';

  // 检查是否是受保护的路由
  const isProtectedRoute = protectedRoutes.some((route) =>
    pathnameWithoutLocale.startsWith(route)
  );

  // 从 cookie 中获取认证状态
  const authCookie = request.cookies.get('auth-storage');
  let isAuthenticated = false;

  if (authCookie?.value) {
    try {
      const decoded = decodeURIComponent(authCookie.value);
      const authData = JSON.parse(decoded);
      isAuthenticated = !!authData?.state?.user;
    } catch {
      // Cookie 格式错误，视为未认证
      isAuthenticated = false;
    }
  }

  // 如果是受保护路由且未登录，重定向到登录页
  if (isProtectedRoute && !isAuthenticated) {
    const locale = pathname.match(/^\/(zh|en|ja)/)?.[1] || defaultLocale;
    const loginUrl = new URL(`/${locale}/login`, request.url);
    loginUrl.searchParams.set('redirect', pathnameWithoutLocale);
    return NextResponse.redirect(loginUrl);
  }

  // 如果已登录且访问登录页，重定向到应用
  if (pathnameWithoutLocale === '/login' && isAuthenticated) {
    const locale = pathname.match(/^\/(zh|en|ja)/)?.[1] || defaultLocale;
    return NextResponse.redirect(new URL(`/${locale}/app`, request.url));
  }

  // 应用 i18n 中间件
  return intlMiddleware(request);
}

export const config = {
  matcher: ['/', '/(zh|en|ja)/:path*', '/((?!_next|_vercel|api|.*\\..*).*)'],
};
