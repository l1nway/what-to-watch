'use client'

import {ArrowLeft, Film, Loader, LogOut, ReceiptText, Settings} from 'lucide-react'
import {AnimatePresence, motion} from 'framer-motion'
import useDashboard from '../dashboard/useDashboard'
import {Button} from '@/components/ui/button'
import {useCallback, useState} from 'react'
import {useRouter} from 'next/navigation'
import Footer from '../footer'

export default function Privacy() {
    const dashboardLogic = useDashboard()
    const {logout} = dashboardLogic
    const router = useRouter()

    const [redirect, setRedirect] = useState<boolean>(false)
    const [deauth, setDeauth] = useState<boolean>(false)
    const [back, setBack] = useState<boolean>(false)
    
    const bck = useCallback(() => {
        router.back()
        setBack(true)
    }, [])

    const stng = useCallback(() => {
        router.push('/settings')
        setRedirect(true)
    }, [])
    
    const de_auth = useCallback(() => {
        setDeauth(true)
        logout()
    }, [])
    
    const sections = [
    {
      id: 1,
      title: 'Data Collection',
      content: 'We collect your email, username, encrypted password, and the lists of movies you create. We log usage data like pages visited to improve the service.'
    },
    {
      id: 2,
      title: 'How We Use It',
      content: 'To personalize movie recommendations, sync your lists across devices, and communicate important updates. Your data is never sold to third parties.'
    },
    {
      id: 3,
      title: 'Cookies',
      content: 'We use essential cookies to maintain your login session. You can disable them in your browser, but some core features of What2Watch might not work.'
    },
    {
      id: 4,
      title: 'Your Rights',
      content: 'You can access, modify, or delete your account and all associated data at any time via your settings or by contacting our support team.'
    }
  ]

    return (
        <div className='bg-[#030712] h-screen flex flex-col relative'>
            <header className='shrink-0 bg-[#101828] flex justify-between items-center border-b border-b-[#1e2939] p-4'>
                <div className='flex gap-5 items-center'>
                    <AnimatePresence mode='wait'>
                        {!back ?
                            <motion.div
                                key='settings'
                                animate={{opacity: 1, scale: 1, rotate: 0}}
                                exit={{opacity: 0, scale: 0.5, rotate: 45}}
                                transition={{duration: 0.15}}
                            >
                                <ArrowLeft
                                    className='cursor-pointer text-[#777f8d] hover:text-white focus:text-white outline-none transition-colors duration-300 w-8 h-8'
                                    onClick={bck}
                                    tabIndex={0}
                                />
                            </motion.div>
                            :
                            <motion.div
                                key='loader'
                                initial={{opacity: 0, scale: 0.5}}
                                animate={{opacity: 1, scale: 1}}
                                exit={{opacity: 0, scale: 0.5}}
                                transition={{duration: 0.15}}
                            >
                                <Loader
                                    className='text-[#959dab] animate-spin w-8 h-8'
                                />
                            </motion.div>
                        }
                    </AnimatePresence>
                    <div
                        className='bg-[#7f22fe] rounded-[10px] w-min p-2'
                    >
                        <Film className='text-white'/>
                    </div>
                    <h1
                        className='text-white flex items-center'
                    >
                        What2Watch
                    </h1>
                </div>
                <div className='flex gap-5'>
                    <AnimatePresence mode='wait'>
                        {!redirect ?
                            <motion.div
                                key='settings'
                                animate={{opacity: 1, scale: 1, rotate: 0}}
                                exit={{opacity: 0, scale: 0.5, rotate: 45}}
                                transition={{duration: 0.15}}
                            >
                                <Settings
                                    className='outline-none cursor-pointer text-[#959dab] hover:text-white focus:text-white transition-colors duration-300'
                                    onClick={stng}
                                    tabIndex={0}
                                />
                            </motion.div>
                            :
                            <motion.div
                                key='loader'
                                initial={{opacity: 0, scale: 0.5}}
                                animate={{opacity: 1, scale: 1}}
                                exit={{opacity: 0, scale: 0.5}}
                                transition={{duration: 0.15}}
                            >
                                <Loader
                                    className='text-[#959dab] animate-spin'
                                />
                            </motion.div>
                        }
                    </AnimatePresence>
                    <div
                        key='settings'
                    >
                        <ReceiptText
                            className='outline-none text-white'
                            tabIndex={0}
                        />
                    </div>
                    <AnimatePresence mode='wait'>
                        {!deauth ?
                            <motion.div
                                key='settings'
                                animate={{opacity: 1, scale: 1, rotate: 0}}
                                exit={{opacity: 0, scale: 0.5, rotate: 45}}
                                transition={{duration: 0.15}}
                            >
                                <LogOut
                                    className='outline-none cursor-pointer text-[#959dab] hover:text-white focus:text-white transition-colors duration-300'
                                    onClick={de_auth}
                                    tabIndex={0}
                                />
                            </motion.div>
                            :
                            <motion.div
                                key='loader'
                                initial={{opacity: 0, scale: 0.5}}
                                animate={{opacity: 1, scale: 1}}
                                exit={{opacity: 0, scale: 0.5}}
                                transition={{duration: 0.15}}
                            >
                                <Loader
                                    className='text-[#959dab] animate-spin'
                                />
                            </motion.div>
                        }
                    </AnimatePresence>
                </div>
            </header>
            <main className='flex-1 overflow-y-auto [scrollbar-gutter:stable] [scrollbar-width:thin] [scrollbar-color:#641aca_#1e2939]'>
                <div className='max-w-5xl mx-auto px-6 pt-12 flex flex-col min-h-full'>
                    <div className='flex-1'>
                        <div className='mb-12'>
                            <h1 className='text-4xl font-bold mb-2 text-white'>Privacy Policy</h1>
                            <p className='text-gray-400'>Last updated: February 13, 2026</p>
                        </div>

                        <div className='grid grid-cols-1 md:grid-cols-2 gap-6'>
                            {sections.map((section) => (
                                <div 
                                    key={section.id} 
                                    className='bg-[#161B22] border border-gray-800 hover:border-[#8B5CF6] transition-colors p-8 rounded-xl shadow-lg duration-300'
                                >
                                    <h2 className='text-[#A855F7] text-xl font-bold mb-4'>
                                        {section.id}. {section.title}
                                    </h2>
                                    <p className='text-gray-300 leading-relaxed'>
                                        {section.content}
                                    </p>
                                </div>
                            ))}
                        </div>

                        <div className='mt-16 flex justify-center mb-12'>
                            <Button
                                onClick={bck}
                                className='outline-none focus-visible:ring-0 focus-visible:ring-offset-0 bg-[#7f22fe] hover:bg-[#641aca] focus:bg-[#641aca] transition-colors duration-300 cursor-pointer disabled:cursor-not-allowed disabled:opacity-50 px-10'
                            >
                                Back to Settings
                            </Button>
                        </div>
                    </div>
                    <Footer className='pb-4 pt-8 border-t border-[#1e2939]'/>
                </div>
            </main>
        </div>
    )
}