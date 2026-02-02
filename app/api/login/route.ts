import {auth} from 'firebase-admin'
import {cookies} from 'next/headers'
import {NextResponse} from 'next/server'
import {customInitApp} from '@/lib/firebase-admin'

customInitApp()

export async function POST(request: Request) {
  try {
    const {idToken} = await request.json()
    const expiresIn = 60 * 60 * 24 * 5 * 1000

    const sessionCookie = await auth().createSessionCookie(idToken, {expiresIn})
    
    const cookieStore = await cookies()
    cookieStore.set('session', sessionCookie, {
      maxAge: expiresIn,
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      path: '/',
    })

    return NextResponse.json({status: 'success'})
  } catch (error) {
    console.error('Login API Error:', error)
    return NextResponse.json({error: 'Unauthorized'}, {status: 401})
  }
}