'use client'

import {Film, Settings as SettingsIcon, LogOut, Loader, ArrowLeft, ReceiptText} from 'lucide-react'
import {AnimatePresence, motion} from 'framer-motion'
import {ReactNode, useCallback, useReducer} from 'react'
import {useRouter} from 'next/navigation'
import {merge} from '@/utils/reducer'
import {goOffline} from '@/lib/presence'
import {signOut} from 'firebase/auth'
import {auth} from '@/lib/firebase'

type State = {back: boolean; privacy: boolean; deauth: boolean}

const ICON_CLASS = 'outline-none cursor-pointer text-[#959dab] hover:text-white focus:text-white transition-colors duration-300'

// every header control swaps itself for a spinner once its navigation is under way
function IconSwap({pending, size = '', children}: {pending: boolean; size?: string; children: ReactNode}) {
    return (
        <AnimatePresence mode='wait'>
            {!pending
                ? <motion.div key='icon' animate={{opacity: 1, scale: 1, rotate: 0}} exit={{opacity: 0, scale: 0.5, rotate: 45}} transition={{duration: 0.15}}>
                    {children}
                </motion.div>
                : <motion.div key='loader' initial={{opacity: 0, scale: 0.5}} animate={{opacity: 1, scale: 1}} exit={{opacity: 0, scale: 0.5}} transition={{duration: 0.15}}>
                    <Loader className={`text-[#959dab] animate-spin ${size}`}/>
                </motion.div>
            }
        </AnimatePresence>
    )
}

export default function SettingsHeader() {
    const [state, dispatch] = useReducer(merge<State>, {back: false, privacy: false, deauth: false})
    const router = useRouter()

    const back = useCallback(() => {
        dispatch({back: true})
        router.back()
    }, [router])

    const policy = useCallback(() => {
        dispatch({privacy: true})
        router.push('/privacy')
    }, [router])

    const logout = useCallback(async () => {
        dispatch({deauth: true})
        if (auth.currentUser) await goOffline(auth.currentUser.uid)
        await signOut(auth)
        await fetch('/api/logout', {method: 'POST'})
        router.push('/auth?mode=login')
    }, [router])

    return (
        <header className='shrink-0 bg-[#101828] flex justify-between items-center border-b border-b-[#1e2939] p-4'>
            <div className='flex gap-5 items-center'>
                <IconSwap pending={state.back} size='w-8 h-8'>
                    <ArrowLeft className={`${ICON_CLASS} text-[#777f8d] w-8 h-8`} onClick={back} tabIndex={0}/>
                </IconSwap>
                <div className='bg-[#7f22fe] rounded-[10px] w-min p-2'>
                    <Film className='text-white'/>
                </div>
                <h1 className='text-white flex items-center'>What2Watch</h1>
            </div>
            <div className='flex gap-5'>
                <SettingsIcon className='text-white'/>
                <IconSwap pending={state.privacy}>
                    <ReceiptText className={ICON_CLASS} onClick={policy} tabIndex={0}/>
                </IconSwap>
                <IconSwap pending={state.deauth}>
                    <LogOut className={ICON_CLASS} onClick={logout} tabIndex={0}/>
                </IconSwap>
            </div>
        </header>
    )
}
