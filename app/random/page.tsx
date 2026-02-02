'use client'

import {useSearchParams, useRouter} from 'next/navigation'
import {useState, useEffect, useCallback, useMemo} from 'react'
import {ArrowLeft, Sparkles} from 'lucide-react'
import {doc, getDoc} from 'firebase/firestore'
import {Button} from '@/components/ui/button'
import {motion} from 'framer-motion'
import SlideDown from '../components/slideDown'
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

    const [desc, setDesc] = useState<string>('The wheel is spinning…')
    const [title, setTitle] = useState<string>('Picking your movie…')
    const [loading, setLoading] = useState<boolean>(true)
    const [done, setDone] = useState<boolean>(false)
    
    const [selectedMovie, setSelectedMovie] = useState<MovieData | null>(null)
    const [poster, setPoster] = useState<string | undefined>(undefined)
    const [allIds, setAllIds] = useState<number[]>([])
    
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

        setDone(false)
        setTitle('Picking your movie…')
        setDesc('The wheel is spinning…')

        const randomId = allIds[Math.floor(Math.random() * allIds.length)]

        try {
            const res = await fetch(`https://api.themoviedb.org/3/movie/${randomId}?api_key=${process.env.NEXT_PUBLIC_TMDB_API_KEY}`)
            const data = await res.json()

            setPoster(`https://image.tmdb.org/t/p/w500${data.poster_path}`) 

            setTimeout(() => {
                setDesc('Your randomly selected movie')
                setTitle('Watch this!')
                setSelectedMovie(data)
                setDone(true)
            }, 2500)
        } catch (e) {
            console.error(e)
            setTitle('Error picking movie')
        }
    }, [allIds])

    useEffect(() => {
        fetchIds()
    }, [listId])

    useEffect(() => {
        if (allIds.length > 0) {
            pickRandomMovie()
        }
    }, [allIds, pickRandomMovie])

    useEffect(() => {
        if (!loading && allIds.length === 0) router.back()
    }, [loading, allIds.length])

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
                    ease: 'linear',
                },
                rotateY: {duration: 0.8, ease: 'easeInOut'},
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
                    ease: 'easeOut',
                },
                rotateY: {
                    duration: 2,
                    ease: 'easeInOut',
                },
                filter: {
                    duration: 1.5,
                    ease: 'easeOut',
                },
                backgroundColor: {duration: 1.5}
            },
        },
    }), [])

    if (allIds.length > 0) router.back

    return (
        <div className='bg-[#030712] h-full'>
            <header className='flex w-full justify-between bg-[#101828] border-b border-b-[#1e2939] p-4'>
                <div className='flex text-white gap-3 items-center'>
                    <div onClick={() => router.back()}>
                        <ArrowLeft className='cursor-pointer text-[#777f8d] hover:text-white transition-colors duration-300'/>
                    </div>
                    <h1>Random pick</h1>
                </div>
            </header>
            
            <div className='flex items-center flex-col gap-4 pt-4'>
                <div className='bg-[#1b0c41] p-4 rounded-full max-w-min'>
                    <Sparkles className='text-[#a684ff]'/>
                </div>
                <span className='text-white' key={title}>{title}</span>
                <span className='text-white' key={desc}>{desc}</span>
                {!loading ?
                    <div className='w-full flex justify-center perspective-1000 py-10'>
                        <motion.div
                            variants={cardVariants}
                            initial='spinning'
                            animate={done ? 'reveal' : 'spinning'}
                            className='relative overflow-hidden border-4 border-[#7f22fe] rounded-[15px] w-[280px] h-[420px] flex items-center justify-center bg-[#101828]'
                            style={{transformStyle: 'preserve-3d'}}
                        >
                            <motion.img
                                src={done 
                                    ? (selectedMovie?.poster_path ? `https://image.tmdb.org/t/p/w500${selectedMovie.poster_path}` : undefined)
                                    : (poster || undefined)
                                }
                                className='w-full h-full object-cover'
                                initial={{opacity: 0}}
                                animate={{opacity: done ? 1 : 0.2}}
                                transition={{duration: 1}}
                            />
                            
                            <motion.div 
                                className='absolute inset-0 bg-[#7f22fe] pointer-events-none'
                                animate={{opacity: done ? 0 : 0.7}}
                                transition={{duration: 1.5}}
                                style={{mixBlendMode: 'overlay'}}
                            />
                        </motion.div>
                    </div>
                : null}

                <SlideDown className='flex flex-col gap-2 w-full items-center' visibility={done}>
                    <h1 className='text-white text-center'>{selectedMovie?.title}</h1>
                    <div className='flex gap-2'>
                        <Button
                            className='bg-[#7f22fe] hover:bg-[#641aca] cursor-pointer'
                            onClick={pickRandomMovie}
                        >
                            Spin again
                        </Button>
                        <Button 
                            className='bg-[#1e2939] hover:bg-[#303844] cursor-pointer'
                            onClick={() => router.back()}
                        >
                            Back to list
                        </Button>
                    </div>
                </SlideDown>
            </div>
        </div>
    )
}