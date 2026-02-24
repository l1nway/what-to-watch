'use client'

import {UserCog, Zap, SearchCode, Loader} from 'lucide-react'
import {Card, CardContent} from '@/components/ui/card'
import {useRouter, usePathname} from 'next/navigation'
import SlideLeft from './components/slideLeft'
import {Button} from '@/components/ui/button'
import {useCallback, useState} from 'react'
import {Gemini} from './components/gemini'
import {motion} from 'framer-motion'
import Footer from './footer'

export default function Intro() {
    const pathname = usePathname()
    const router = useRouter()
    const [loading, setLoading] = useState<boolean>(false)

    const auth = useCallback(() => {
        router.push('/auth')
        setLoading(true)
    }, [])
    
    return (
        <div className='overflow-y-auto [scrollbar-gutter:stable] [scrollbar-width:thin] [scrollbar-color:#641aca_#1e2939] h-screen w-full bg-gradient-to-br from-[#2f0d68] to-[#030712] flex flex-col pb-4 text-white'>
            <section className='px-6 pt-24 pb-16 max-md:pt-12 max-md:pb-12 text-center'>
                <motion.h1
                    className='text-5xl md:text-6xl font-bold mb-6'
                    initial={{opacity: 0, y: 20}}
                    animate={{opacity: 1, y: 0}}
                >
                    What2Watch
                </motion.h1>
                <motion.p
                    className='text-lg text-white/70 max-w-2xl mx-auto mb-10'
                    initial={{opacity: 0, y: 20}}
                    animate={{opacity: 1, y: 0}}
                    transition={{delay: 0.1}}
                >
                    The ultimate social ecosystem for movie lovers. Solve the «What should we watch?» dilemma with real-time group synchronization, AI-powered recommendations, and a cinematic interface.
                </motion.p>
                <Button
                    className='outline-none focus-visible:ring-0 focus-visible:ring-offset-0 bg-[#7f22fe] hover:bg-[#641aca] focus:bg-[#641aca] transition-colors duration-300 cursor-pointer h-13 w-fit text-2xl'
                    disabled={loading}
                    onClick={auth}
                >
                    Let's start <SlideLeft visibility={loading}><Loader className='ml-2 animate-spin'/></SlideLeft>
                </Button>
            </section>

            <section className='px-6 pb-24 w-full gap-6 flex flex-wrap'>
                {features.map((f, i) => (
                    <motion.div
                        // className='intro-card flex'
                        className={`flex gap-6 intro-card ${i % 2 !== 0 ? '' : 'desktop-reverse'} max-md:!flex-col`}
                        whileInView={{opacity: 1, y: 0}}
                        transition={{delay: i * 0.05}}
                        initial={{opacity: 0, y: 30}}
                        key={`${pathname}-${i}`}
                        viewport={{once: true}}
                    >
                        <Card className='max-md:max-w-full w-fit min-w-auto max-w-[40%] hover:border-[#7f22fe] transition-colors duration-300 border border-[#1e2939] rounded-2xl bg-white/5 border-white/10 rounded-2xl h-full'>
                            <CardContent className='p-6'>
                                <div className='min-w-fit flex gap-2 pb-3 items-center'>
                                    <f.icon className='w-8 h-8 text-purple-400'/>
                                    <h3 className='font-semibold text-lg text-white whitespace-nowrap'>{f.title}</h3>
                                </div>
                                <p className='text-sm text-white/60'>{f.desc}</p>
                            </CardContent>
                        </Card>
                        <div className='max-md:min-w-full w-[69%] hover:border-[#7f22fe] transition-colors duration-300 border border-[#1e2939] rounded-2xl bg-white/5 border-white/10 rounded-2xl'>
                            <img className='p-6 rounded-2xl aspect-[4/3]' src='\images\Screen Shot 2026-02-23 at 10.26.25.png'/>
                        </div>
                    </motion.div>
                ))}
            </section>
            <Footer className='mt-auto'/>
        </div>
    )
}

const features = [
  {
    icon: UserCog,
    title: 'Personalized Identity',
    desc: 'Express yourself with a customizable profile. Edit your avatar on-the-fly, manage personal watchlists, and showcase your unique cinematic taste.',
  }, {
    icon: Zap,
    title: 'Social Pulse',
    desc: `Experience a living platform. Track friends’ online presence, monitor real-time activities, and stay connected through dynamic status updates.`,
  }, {
    icon: SearchCode,
    title: 'TMDB Base',
    desc: `Access a world-class database. Seamlessly search, filter, and categorize millions of titles into «Watched», «Planned», or «Dropped» with rich metadata.`,
  }, {
    icon: Gemini,
    title: 'AI Intelligence',
    desc: 'Leverage cutting-edge LLMs to instantly discover films that share the soul of your favorite movie. One click analyzes the plot, mood, and style to deliver a curated list of recommendations that truly hit the mark.',
  }
]
