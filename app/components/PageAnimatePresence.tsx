'use client'

import {getAuth, onAuthStateChanged} from 'firebase/auth'
import {AnimatePresence, motion} from 'framer-motion'
import {usePathname} from 'next/navigation'
import {FrozenRouter} from './frozenRouter'
import {startPresence} from '@/lib/presence'
import {useEffect} from 'react'

export default function PageAnimatePresence({children}: {children: React.ReactNode}) {
  const pathname = usePathname()

  useEffect(() => {
    const auth = getAuth()
    let stopPresence: (() => void) | null = null

    const unsubscribeAuth = onAuthStateChanged(auth, (user) => {
      stopPresence?.()
      stopPresence = user ? startPresence(user.uid) : null
    })

    return () => {
      stopPresence?.()
      unsubscribeAuth()
    }
  }, [])

  return (
    <AnimatePresence mode='wait' onExitComplete={() => window.scrollTo(0, 0)}>
      <motion.div
        key={pathname}
        initial={{opacity: 0, y: 10}}
        animate={{opacity: 1, y: 0}}
        exit={{opacity: 0, y: -10}}
        transition={{duration: 0.3, ease: 'easeInOut'}}
      >
        <FrozenRouter>
          {children}
        </FrozenRouter>
      </motion.div>
    </AnimatePresence>
  )
}