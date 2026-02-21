import type {NextRequest} from 'next/server'
import {NextResponse} from 'next/server'

export function middleware(request: NextRequest) {
    const session = request.cookies.get('session')
    const {pathname} = request.nextUrl

    const isAuthPage = pathname.startsWith('/auth')
    const isRootPage = pathname === '/'
    const isPublicPage = isAuthPage || isRootPage

    if (!session) {
      if (!isPublicPage) {
        const returnTo = encodeURIComponent(pathname)
        return NextResponse.redirect(
          new URL(`/auth?mode=login&returnTo=${returnTo}`, request.url)
        )
      }
      return NextResponse.next()
    }

    if (session) {
      if (isPublicPage) {
        return NextResponse.redirect(new URL('/dashboard', request.url))
      }
    }

    return NextResponse.next()
}

export const config = {
  matcher: ['/((?!api|_next/static|_next/image|favicon.ico|public|images).*)'],
}