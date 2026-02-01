import { NextResponse, type NextRequest } from 'next/server'

const SESSION_COOKIE_NAME = 'household_session'

export function middleware(request: NextRequest) {
  const session = request.cookies.get(SESSION_COOKIE_NAME)
  const isLoginPage = request.nextUrl.pathname === '/login'

  // ログインページにアクセスしようとしている場合
  if (isLoginPage) {
    // すでにログイン済みならトップページへ
    if (session) {
      return NextResponse.redirect(new URL('/', request.url))
    }
    return NextResponse.next()
  }

  // 未ログインの場合はログインページへ
  if (!session) {
    return NextResponse.redirect(new URL('/login', request.url))
  }

  return NextResponse.next()
}

export const config = {
  matcher: [
    // ルートパスとその他のページパスに適用
    '/',
    '/login',
    '/((?!_next|favicon.ico|api).*)',
  ],
}
