import './globals.css'
import PageAnimatePresence from './components/PageAnimatePresence'
import {AuthProvider} from './components/authProvider'
import {Suspense} from 'react'
import {Metadata} from 'next'

export const metadata: Metadata = {
  title: {
    template: '%s | What to Watch',
    default: 'What to Watch',
  },
}

export default function RootLayout({children}: Readonly<{children: React.ReactNode}>) {
  return (
    <html lang='en' className='h-full overflow-hidden'>
      <body className='h-full overflow-hidden fixed inset-0'>
          <AuthProvider>
            <PageAnimatePresence>
              <Suspense fallback={null}>
                {children}
              </Suspense>
            </PageAnimatePresence>
          </AuthProvider>
      </body>
    </html>
  )
}