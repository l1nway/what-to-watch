import './globals.css'
import PageAnimatePresence from './components/PageAnimatePresence'
import {AuthProvider} from './components/authProvider'

export default function RootLayout({children}: Readonly<{children: React.ReactNode}>) {
  return (
    <html lang='en' className='h-full overflow-hidden'>
      <body className='h-full overflow-hidden fixed inset-0'>
          <AuthProvider>
            <PageAnimatePresence>
              {children}
            </PageAnimatePresence>
          </AuthProvider>
      </body>
    </html>
  )
}