'use client'

import {ref, onValue, onDisconnect, serverTimestamp, update} from 'firebase/database'
import {getAuth, onAuthStateChanged} from 'firebase/auth'
import {AnimatePresence, motion} from 'framer-motion'
import {usePathname} from 'next/navigation'
import {FrozenRouter} from './frozenRouter'
import {rtdb} from '@/lib/firebase'
import {useEffect} from 'react'

export default function PageAnimatePresence({children}: {children: React.ReactNode}) {
  const pathname = usePathname()

  useEffect(() => {
    const auth = getAuth()
    const unsubscribeAuth = onAuthStateChanged(auth, (user) => {
      if (!user) return

      const statusRef = ref(rtdb, `/status/${user.uid}`)
      const connectedRef = ref(rtdb, '.info/connected')

      const unsubscribeConn = onValue(connectedRef, (snap) => {
        if (snap.val() === true) {
          onDisconnect(statusRef).update({
            state: 'offline',
            last_changed: serverTimestamp(),
          }).then(() => {
            update(statusRef, {
              state: 'online',
              last_changed: serverTimestamp(),
            })
          })
        }
      })
      return () => unsubscribeConn()
    })
    return () => unsubscribeAuth()
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