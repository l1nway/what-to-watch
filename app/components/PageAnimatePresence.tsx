'use client'

import {AnimatePresence, motion} from 'framer-motion'
import {usePathname} from 'next/navigation'
import {FrozenRouter} from './frozenRouter'

export default function PageAnimatePresence({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()

  return (
    <AnimatePresence mode='wait' onExitComplete={() => window.scrollTo(0, 0)}>
      <motion.div
        key={pathname}
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -10 }}
        transition={{ duration: 0.3, ease: "easeInOut" }}
      >
        <FrozenRouter>
          {children}
        </FrozenRouter>
      </motion.div>
    </AnimatePresence>
  )
}