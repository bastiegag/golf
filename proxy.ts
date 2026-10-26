import { auth } from './auth';

export const proxy = auth((request) => {
  const pathname = request.nextUrl.pathname;
  const isLoginPage = pathname === '/admin/login';

  if (!request.auth?.user && !isLoginPage) {
    return Response.redirect(new URL('/admin/login', request.nextUrl));
  }

  if (request.auth?.user && isLoginPage) {
    return Response.redirect(new URL('/admin', request.nextUrl));
  }

  return undefined;
});

export const config = {
  matcher: ['/admin/:path*'],
};
