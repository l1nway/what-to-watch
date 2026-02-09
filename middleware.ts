import {NextResponse} from 'next/server'
import type {NextRequest} from 'next/server'

export function middleware(request: NextRequest) {
  const session = request.cookies.get('session')
  const {pathname} = request.nextUrl

  if (!session && !pathname.startsWith('/auth')) {
    const returnTo = encodeURIComponent(pathname)
    return NextResponse.redirect(new URL(`/auth?mode=login&returnTo=${returnTo}`, request.url))
  }

  if (session && pathname.startsWith('/auth')) {
    return NextResponse.redirect(new URL('/dashboard', request.url))
  }

  return NextResponse.next()
}

export const config = {
  matcher: ['/((?!api|_next/static|_next/image|favicon.ico|public).*)'],
}