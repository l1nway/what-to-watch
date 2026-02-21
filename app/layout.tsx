import PageAnimatePresence from './components/PageAnimatePresence'
import {AuthProvider} from './components/authProvider'
import {Suspense} from 'react'
import {Metadata} from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'What2Watch',
  description: 'Find your next movie with friends',
  keywords: ['films', 'what to watch', 'w2w'],
  alternates: {
    canonical: 'https://what-to-watch.pro',
  },
  robots: {
    index: true,
    follow: true,
  },
  openGraph: {
    title: 'What2Watch',
    description: 'Find your next movie with friends',
    url: 'https://what-to-watch.pro',
    siteName: 'What2Watch',
    images: [
      {
        url: 'https://what-to-watch.pro/images/preview.png',
        width: 1200,
        height: 630,
      },
    ],
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'What2Watch',
    description: 'Find your next movie with friends',
    images: ['https://what-to-watch.pro/images/preview.png'],
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