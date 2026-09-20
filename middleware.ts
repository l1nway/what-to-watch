import type {NextRequest} from 'next/server'
import {NextResponse} from 'next/server'

export function middleware(request: NextRequest) {
    const session = request.cookies.get('session')
    const {pathname, search} = request.nextUrl

    const isAuthPage = pathname.startsWith('/auth')
    // the single route every email link lands on stays usable with or without a session
    const isLinkPage = pathname.startsWith('/reset')
    const isRootPage = pathname === '/'
    // /list may be publicly readable (public:true lists); auth guard lives in useList
    const isListPage = pathname.startsWith('/list')
    const isRandomPage = pathname.startsWith('/random')
    const isPublicPage = isAuthPage || isLinkPage || isRootPage || isListPage || isRandomPage

    if (!session) {
      if (!isPublicPage) {
        const returnTo = encodeURIComponent(`${pathname}${search}`)
        return NextResponse.redirect(
          new URL(`/auth?mode=login&returnTo=${returnTo}`, request.url)
        )
      }
      return NextResponse.next()
    }

    // a signed-in user may still need the email links: they are valid regardless of the session
    if (isPublicPage && !isLinkPage && !isListPage && !isRandomPage) {
      return NextResponse.redirect(new URL('/dashboard', request.url))
    }

    return NextResponse.next()
}

export const config = {
  matcher: [`/((?!api|_next/static|_next/image|favicon.ico|\\.well-known|.*\\.[\\w]+$).*)`],
}
