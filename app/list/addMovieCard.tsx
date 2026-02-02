import {useEffect, useRef, useState, useId} from 'react'
import {Button} from '@/components/ui/button'
import {Select} from 'react-animated-select'
import {Plus, Check} from 'lucide-react'
import {motion} from 'framer-motion'

export function AddMovieCard({currentStatus, toggleFilm, statusChange, movie, index, added, addedLocally, alreadyInDb, statuses, loading}: any) {
    const cardRef = useRef<HTMLDivElement | null>(null)
    const uid = useId()

    const [delay, setDelay] = useState(true)

    useEffect(() => {
        if (!loading) {
            const timer = setTimeout(() => {
            setDelay(false)
            }, 1000)

            return () => clearTimeout(timer)
        } else {
            setDelay(true)
        }
    }, [loading])

    return (
       <motion.div
            className='max-h-150 mr-4 mb-4 flex gap-4 bg-[#1e2939] rounded-xl p-4 border border-[#364153] transition-colors duration-300 hover:border-[#7f22fe] cursor-pointer'
            key={movie.id}
            tabIndex={0}
            style={{ 
                willChange: 'transform, opacity',
                backfaceVisibility: 'hidden',
                transform: 'translateZ(0)'
            }}
            ref={cardRef}
            layout='position'
            layoutId={uid}
            viewport={{once: false, amount: 'some', margin: '-10px 0px -10px 0px'}}
            initial={{opacity: 0, scale: 0.9}}
            whileInView={{opacity: 1, scale: 1}}
            transition={{
                layout: { 
                    type: 'spring', 
                    stiffness: 300, 
                    damping: 30
                },
                default: { 
                    duration: 0.3, 
                    ease: 'easeInOut',
                    delay: (delay && !alreadyInDb) ? index * 0.08 : undefined
                },
                opacity: {
                    duration: 0.3,
                    delay: (delay && !alreadyInDb) ? index * 0.08 : undefined
                }
            }}
            exit={{opacity: 0, scale: 0.8, transition: {duration: 0.3}}}
        >
            <img
                src={`https://image.tmdb.org/t/p/w500${movie.poster_path || ''}`}
                className='rounded-xl min-w-min h-50'
                alt={movie.original_title}
                key={`poster-${movie.id}`}
                crossOrigin='anonymous'
                loading='lazy'
            />
            <div className='flex flex-col gap-4 w-full'>
                <h2 className='text-white'>{movie.original_title}</h2>
                <div className='flex text-[#99a1af] gap-2 items-center'>
                    <span>
                        {movie.release_date}
                    </span>
                    <div className='w-1 h-1 bg-[#99a1af] rounded-full'/>
                    <span>
                        {movie.genre_ids}
                    </span>
                    <div className='w-1 h-1 bg-[#99a1af] rounded-full'/>
                    <span>
                        {movie.vote_average}
                    </span>
                </div>
                <span className='text-[#99a1af] text-wrap max-w-150'>{movie.overview}</span>
                <div className='flex gap-4'>
                    <Select
                        disabled={alreadyInDb && !addedLocally}
                        disabledText='Already added'
                        style={{
                            '--rac-list-background': '#1e2939',
                            '--rac-list-color': 'white',
                            '--rac-option-highlight': '#2c2c2c',
                            '--rac-option-hover': '#2c2c2c',
                            '--rac-option-selected': '#2c2c2c'
                        } as React.CSSProperties}
                        className='
                            w-full rounded-md bg-[#1e2939!important] border border-[#364153!important] !text-white'
                        placeholder='Choose status'
                        value={statuses.find(s => s.name === currentStatus) || null}
                        onChange={(val) => statusChange(movie, val)}
                        options={statuses}
                    />
                    <Button
                        disabled={alreadyInDb}
                        className={`bg-[#7f22fe] ${!added ? 'hover:bg-[#641aca]' : 'hover:bg-[#900]'} cursor-pointer transition-colors duration-300`}
                        onClick={() => toggleFilm(movie)}
                    >
                        {added ? <><Check/> {alreadyInDb ? 'Already added' : 'Remove from list'}</> : <><Plus/> Add to list</>}
                    </Button>
                </div>
            </div>
        </motion.div>
    )
}