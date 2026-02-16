'use client'

import {useState, useEffect, useCallback, useMemo} from 'react'
import {useSearchParams, useRouter} from 'next/navigation'
import {ArrowLeft, Loader, Sparkles} from 'lucide-react'
import SlideDown from '../components/slideDown'
import {doc, getDoc} from 'firebase/firestore'
import {Button} from '@/components/ui/button'
import {motion, Easing, AnimatePresence} from 'framer-motion'
import {db} from '@/lib/firebase'

interface MovieData {
    id: number
    title: string
    poster_path: string
}

export default function Random() {
    const searchParams = useSearchParams()
    const listId = searchParams.get('id')
    const router = useRouter()

    const [desc, setDesc] = useState<string>('You can choose a movie randomly or play a quiz to eliminate')
    const [title, setTitle] = useState<string>('Choose your mode')
    const [loading, setLoading] = useState<boolean>(true)
    
    const [selectedMovie, setSelectedMovie] = useState<MovieData | null>(null)
    const [poster, setPoster] = useState<string | undefined>(undefined)
    const [allIds, setAllIds] = useState<number[]>([])

    const [done, setDone] = useState<boolean>(false) 
    const [random, setRandom] = useState<boolean>(false)
    const [quiz, setQuiz] = useState<boolean>(true)
    const [queue, setQueue] = useState<number[]>([])
    const [winners, setWinners] = useState<number[]>([])
    const [currentPair, setCurrentPair] = useState<[number, number] | null>(null)
    const [totalRounds, setTotalRounds] = useState(0)
    const [currentRoundNum, setCurrentRoundNum] = useState(1)
    const [pairData, setPairData] = useState<{f: MovieData, s: MovieData} | null>(null)
    
    const fetchIds = useCallback(async () => {
        if (!listId) return
        try {
            const listRef = doc(db, 'lists', listId)
            const snap = await getDoc(listRef)
            if (snap.exists()) {
                const movies = snap.data().movies || []
                setAllIds(movies.map((m: any) => m.id))
            }
        } catch (e) {
            console.error(e)
        } finally {
            setLoading(false)
        }
    }, [listId])

    const pickRandomMovie = useCallback(async () => {
        if (allIds.length === 0) return

        setQuiz(false)
        setTimeout(() => {
            setRandom(true)
            setDone(false)
        }, 50)

        let activeIds = currentPair ? [...currentPair, ...queue, ...winners] : allIds
        setTitle('Picking your movie…')
        setDesc('The wheel is spinning…')

        const randomId = activeIds[Math.floor(Math.random() * activeIds.length)]

        try {
            const res = await fetch(`https://api.themoviedb.org/3/movie/${randomId}?api_key=${process.env.NEXT_PUBLIC_TMDB_API_KEY}`)
            const data = await res.json()

            setPoster(`https://image.tmdb.org/t/p/w500${data.poster_path}`)
            setTimeout(() => {
                setDesc('Your randomly selected movie')
                setTitle('Watch this!')
                setSelectedMovie(data)
                setDone(true)
            }, 2000)
        } catch (e) {
            console.error(e)
        }
    }, [allIds, currentPair, queue, winners])

    const startQuiz = useCallback((ids: number[]) => {
        const shuffled = [...ids].sort(() => Math.random() - 0.5)
        
        const rounds = Math.ceil(Math.log2(shuffled.length))
        setTotalRounds(rounds)
        setCurrentRoundNum(1)
        
        setupNextPair(shuffled, [])
    }, [])

    const setupNextPair = (currentQueue: number[], currentWinners: number[]) => {
        if (currentQueue.length >= 2) {
            const [first, second, ...rest] = currentQueue
            setCurrentPair([first, second])
            setQueue(rest)
            setWinners(currentWinners)
        } else if (currentQueue.length === 1) {
            const survivor = currentQueue[0]
            const nextRoundList = [...currentWinners, survivor]
            
            handleRoundEnd(nextRoundList)
        } else {
            handleRoundEnd(currentWinners)
        }
    }

    const pickFilm = (winnerId: number) => {
        const updatedWinners = [...winners, winnerId]


        if (queue.length >= 2) {
            const [nextFirst, nextSecond, ...rest] = queue
            setCurrentPair([nextFirst, nextSecond])
            setQueue(rest)
            setWinners(updatedWinners)
        } else if (queue.length === 1) {
            const finalWinners = [...updatedWinners, queue[0]]
            handleRoundEnd(finalWinners)
        } else {
            handleRoundEnd(updatedWinners)
        }
    }

    const handleRoundEnd = async (nextRoundMovies: number[]) => {
        if (nextRoundMovies.length === 1) {
            const winnerId = nextRoundMovies[0]
            
            setQuiz(false)
            setRandom(true)
            setDone(false)
            setTitle('Calculating results…')
            setDesc('Determining your perfect match…')

            try {
                const res = await fetch(`https://api.themoviedb.org/3/movie/${winnerId}?api_key=${process.env.NEXT_PUBLIC_TMDB_API_KEY}`)
                const data = await res.json()

                setSelectedMovie(data)
                setPoster(`https://image.tmdb.org/t/p/w500${data.poster_path}`)
                
                setTimeout(() => {
                    setDone(true)
                    setTitle('Winner!')
                    setDesc('Based on your choices, this is the perfect movie:')
                }, 2000)
            } catch (e) {
                console.error(e)
                setDone(true)
            }
        } else {
            setCurrentRoundNum((prev) => prev + 1)
            const shuffledWinners = [...nextRoundMovies].sort(() => Math.random() - 0.5)
            const [first, second, ...rest] = shuffledWinners
            setCurrentPair([first, second])
            setQueue(rest)
            setWinners([])
        }
    }

    useEffect(() => {
        fetchIds()
    }, [listId])

    useEffect(() => {
        if (allIds.length > 0) {
            startQuiz(allIds)
        }
    }, [allIds, startQuiz])

    useEffect(() => {
        if (!loading && allIds.length === 0) router.back()
    }, [loading, allIds.length])

    useEffect(() => {
        if (currentPair) {
            const fetchPair = async () => {
                const [id1, id2] = currentPair
                const res1 = await fetch(`https://api.themoviedb.org/3/movie/${id1}?api_key=${process.env.NEXT_PUBLIC_TMDB_API_KEY}`)
                const res2 = await fetch(`https://api.themoviedb.org/3/movie/${id2}?api_key=${process.env.NEXT_PUBLIC_TMDB_API_KEY}`)
                const d1 = await res1.json()
                const d2 = await res2.json()
                setPairData({f: d1, s: d2})
            }
            fetchPair()
        }
    }, [currentPair])

    const linear: Easing = [0, 0, 1, 1]
    const easeInOut: Easing = [0.42, 0, 0.58, 1]
    const easeOut: Easing = [0, 0, 0.58, 1]

    const cardVariants = useMemo(() => ({
        spinning: {
            rotate: [0, 360],
            rotateY: 0,
            filter: 'blur(25px)',
            backgroundColor: '#7f22fe',
            transition: {
                rotate: {
                    repeat: Infinity,
                    duration: 1.2,
                    ease: linear,
                },
                rotateY: {duration: 0.8, ease: easeInOut},
                filter: {duration: 0.8},
                backgroundColor: {duration: 0.8}
            },
        },
        reveal: {
            rotate: 0,
            rotateY: [0, 360, 720],
            filter: 'blur(0px)',
            backgroundColor: 'rgba(127, 34, 254, 0)',
            transition: {
                rotate: {
                    duration: 1.5,
                    ease: easeOut,
                },
                rotateY: {
                    duration: 2,
                    ease: easeInOut,
                },
                filter: {
                    duration: 1.5,
                    ease: easeOut,
                },
                backgroundColor: {duration: 1.5}
            },
        },
    }), [])
    
    const [back, setBack] = useState<boolean>(false)
    
    const bck = useCallback(() => {
        router.back()
        setBack(true)
    }, [])

    if (allIds.length > 0) router.back

    return (
        <div className='bg-[#030712] h-screen flex flex-col '>
            <header className='shrink-0 flex w-full justify-between bg-[#101828] border-b border-b-[#1e2939] p-4'>
                <div className='flex text-white gap-3 items-center'>
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
                    <h1>Random pick</h1>
                </div>
            </header>
            
            <div className='[scrollbar-gutter:stable] [scrollbar-width:thin] [scrollbar-color:#641aca_#1e2939] flex-1 overflow-y-auto overflow-x-hidden min-h-0 flex items-center flex-col gap-2 pt-4 max-md:gap-1 max-md:pt-2'>
                <div className='bg-[#1b0c41] p-4 rounded-full max-w-min'>
                    <Sparkles className='text-[#a684ff]'/>
                </div>
                <span className='text-white' key={title}>{title}</span>
                <span className='text-white px-4 text-center' key={desc}>{desc}</span>
                <AnimatePresence mode='wait'>
                    {(!loading && quiz && pairData && !done && !random) && 
                        <motion.div
                            className='flex flex-col items-center gap-3 w-fit px-4'
                            transition={{duration: 0.5, ease: [0.4, 0, 0.2, 1]}}
                            animate={{height: 'auto', opacity: 1}}
                            initial={{height: 0, opacity: 0}}
                            exit={{height: 0, opacity: 0}}
                            key='quiz'
                        >
                            <div className='flex items-center gap-4 text-[#777f8d] text-sm font-medium'>
                                <span>Round {currentRoundNum}</span>
                                <div className='h-1 w-20 bg-[#1e2939] rounded-full overflow-hidden'>
                                    <motion.div
                                        animate={{width: `${(currentRoundNum / totalRounds) * 100}%`}}
                                        className='h-full bg-[#7f22fe]'
                                        initial={{width: 0}}
                                    />
                                </div>
                            </div>

                            <motion.div
                                className='flex gap-4 max-md:w-full w-[75%] justify-center items-center'
                                animate={{opacity: 1, x: 0, scale: 1}}
                                key={`round-${currentPair?.join('-')}`}
                                exit={{opacity: 0, x: -20, scale: 0.5}}
                                initial={{opacity: 0, scale: 0.5}}
                            >
                                <button 
                                    onClick={() => pickFilm(pairData.f.id)}
                                    className='cursor-pointer group relative overflow-hidden rounded-2xl border-2 border-transparent hover:border-[#7f22fe] transition-all duration-300 active:scale-95'
                                >
                                    <img 
                                        src={`https://image.tmdb.org/t/p/w500${pairData.f.poster_path}`} 
                                        alt={pairData.f.title}
                                        className='h-full w-full aspect-[2/3] object-cover group-hover:opacity-80 transition-opacity'
                                    />
                                    <div className='absolute bottom-0 left-0 right-0 p-2 bg-black/60 backdrop-blur-sm text-white text-xs text-center opacity-0 group-hover:opacity-100 transition-opacity'>
                                        {pairData.f.title}
                                    </div>
                                </button>

                                <div className='text-[#a684ff] font-bold italic text-2xl'>VS</div>

                                <button 
                                    onClick={() => pickFilm(pairData.s.id)}
                                    className='cursor-pointer group relative overflow-hidden rounded-2xl border-2 border-transparent hover:border-[#7f22fe] transition-all duration-300 active:scale-95'
                                >
                                    <img 
                                        src={`https://image.tmdb.org/t/p/w500${pairData.s.poster_path}`} 
                                        alt={pairData.s.title}
                                        className='h-full w-full aspect-[2/3] object-cover group-hover:opacity-80 transition-opacity'
                                    />
                                    <div className='absolute bottom-0 left-0 right-0 p-2 bg-black/60 backdrop-blur-sm text-white text-xs text-center opacity-0 group-hover:opacity-100 transition-opacity'>
                                        {pairData.s.title}
                                    </div>
                                </button>
                            </motion.div>
                            
                            <p className='text-[#959dab] text-sm italic'>Click on poster to select</p>
                        </motion.div>
                    }
                </AnimatePresence>
                <AnimatePresence initial={false}>
                    {random &&
                        <motion.div
                            style={{transformStyle: 'preserve-3d', willChange: 'transform', transform: 'translateZ(0)'}}
                            transition={{duration: 0.5, ease: [0.4, 0, 0.2, 1]}}
                            animate={{height: 'auto', opacity: 1}}
                            className='grid justify-items-center'
                            initial={{height: 0, opacity: 0}}
                            exit={{height: 0, opacity: 0}}
                            key='spinning-card'
                        >
                            <div className='w-[75%] flex justify-center perspective-1000 py-10 max-md:py-5'>
                                <motion.div
                                    className='relative overflow-hidden border-4 border-[#7f22fe] rounded-[15px] w-full h-full flex items-center justify-center bg-[#101828] left-0 right-0 mx-auto'
                                    style={{
                                        transformStyle: 'preserve-3d',
                                        willChange: 'transform'
                                    }}
                                    animate={done ? 'reveal' : 'spinning'}
                                    variants={cardVariants}
                                    initial='spinning'
                                    key='random-div'
                                >
                                    <motion.img
                                        src={done 
                                            ? (selectedMovie?.poster_path ? `https://image.tmdb.org/t/p/w500${selectedMovie.poster_path}` : undefined)
                                            : (poster || undefined)
                                        }
                                        className='w-full h-full object-cover'
                                        animate={{opacity: done ? 1 : 0.2}}
                                        transition={{duration: 1}}
                                        initial={{opacity: 0}}
                                        key='random-img'
                                    />
                                    
                                    <motion.div 
                                        className='absolute inset-0 bg-[#7f22fe] pointer-events-none'
                                        animate={{opacity: done ? 0 : 0.7}}
                                        style={{mixBlendMode: 'overlay'}}
                                        transition={{duration: 1.5}}
                                        key='random-div2'
                                    />
                                </motion.div>
                            </div>
                        </motion.div>
                    }
                    {(done || (!random && !loading)) &&
                        <motion.div
                            key='buttons'
                            initial={{height: 0, opacity: 0}}
                            animate={{height: 'auto', opacity: 1, transition: {
                                duration: 0.5, delay: random ? 0 : 0.5, ease: [0.4, 0, 0.2, 1]
                            }}}
                            exit={{height: 0, opacity: 0, transition: { 
                                duration: 0.2, delay: 0, ease: 'easeIn'
                            }}}
                        >
                            <div className='flex flex-col gap-2 w-full items-center'>
                                <h1 className='text-white text-center'>{selectedMovie?.title}</h1>
                                <div className='flex gap-2 max-md:flex-col max-md:w-full max-md:items-center max-md:gap-3'>
                                    <Button
                                        className='outline-none focus-visible:ring-0 focus-visible:ring-offset-0 bg-[#7f22fe] hover:bg-[#641aca] focus:bg-[#641aca] cursor-pointer max-md:w-[90%] max-md:h-10'
                                        onClick={pickRandomMovie}
                                    >
                                        Choose randomly
                                    </Button>
                                    <Button 
                                        className='outline-none focus-visible:ring-0 focus-visible:ring-offset-0 bg-[#1e2939] hover:bg-[#303844] focus:bg-[#303844] cursor-pointer max-md:w-[90%] max-md:h-10'
                                        onClick={() => router.back()}
                                    >
                                        Back to list
                                    </Button>
                                </div>
                            </div>
                        </motion.div>
                    }
                </AnimatePresence>
            </div>
        </div>
    )
}