import {Calendar, Clock4, Trash2} from 'lucide-react'
import {useEffect, useRef, useState} from 'react'
import {MovieCardProps} from './listTypes'
import {motion} from 'framer-motion'

export function MovieCard({setDelWarning, setSelected, setFilm, movie, statusColor, index, loading}: MovieCardProps) {
    const cardRef = useRef<HTMLDivElement | null>(null)

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
            tabIndex={0}
            className='mb-4 mr-4'
            style={{ 
                willChange: 'transform, opacity',
                backfaceVisibility: 'hidden',
                transform: 'translateZ(0)'
            }}
            ref={cardRef}
            layout='position'
            layoutId={movie.id}
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
                    delay: delay ? index * 0.08 : undefined
                },
                opacity: {
                    duration: 0.3,
                    delay: delay ? index * 0.08 : undefined
                }
            }}
            exit={{opacity: 0, scale: 0.8, transition: {duration: 0.3}}}
        >
            <div>
                <div className='cursor-pointer group movieCard relative max-w-min flex rounded-xl overflow-hidden' onClick={() => {setSelected(movie), setFilm(true)}}>
                    <img src={`https://image.tmdb.org/t/p/w500${movie.poster_path}`} className='min-w-min aspect-[2/3] object-cover h-100 block transition-transform duration-300 ease-out group-hover:scale-110'/>
                    <div
                        className='w-2 h-2 absolute right-2 top-2 rounded-full'
                        style={{backgroundColor: statusColor}}
                    />
                    <div className='absolute inset-0 bg-gradient-to-t from-black/90 via-black/40 to-transparent opacity-0 transition-[opacity, colors] duration-300 group-hover:opacity-100'/>
                    <div className='w-[90%] flex justify-between absolute text-[#777f8d] bottom-3 left-3 opacity-0 transition-opacity duration-300 group-hover:opacity-100'>
                        <div className='flex gap-2'>
                            <span className='flex gap-2 text-sm flex items-center'><Calendar className='text-[#777f8d] max-w-5'/> {movie.release_date}</span>
                            <span className='flex gap-2 text-sm flex items-center'><Clock4 className='text-[#777f8d] max-w-5'/> {movie.vote_average}</span>
                        </div>
                        <Trash2
                            className='max-w-5 text-[#777f8d] hover:text-[#fb2933] transition-colors duration-300 text-sm'
                            onClick={() => {setFilm(true); setDelWarning(true)}}
                        />
                    </div>
                </div>
                <div className='flex flex-col gap-1'>
                    <h2 className='text-white max-w-64 whitespace-nowrap overflow-hidden text-ellipsis'>
                        {movie.title}
                    </h2>
                    <span className='text-[#777f8d]'>
                        {movie.genres?.[0]?.name}
                    </span>
                </div>
            </div>
        </motion.div>
    )
}