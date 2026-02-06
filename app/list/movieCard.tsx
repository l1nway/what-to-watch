import {animationProps, stylesProps} from '../components/motionProps'
import {Calendar, Clock4, Trash2} from 'lucide-react'
import {MovieCardProps} from './listTypes'
import {useRef, useCallback} from 'react'
import {motion} from 'framer-motion'
import {memo} from 'react'

const MovieCard = memo(function MovieCard({delay, setDelWarning, setSelected, setFilm, movie, statusColor, index, onClick}: MovieCardProps) {
    const cardRef = useRef<HTMLDivElement | null>(null)

    const del = useCallback(() => {
        setFilm(true)
        setDelWarning(true)
    }, [setFilm, setDelWarning])

    const open = useCallback(() => {
        setSelected(movie)
        setFilm(true)
    }, [movie, setSelected, setFilm])
    return (
       <motion.div
            style={{...stylesProps, overflow: 'hidden'}}
            {...animationProps('both', true, delay, index)}
            className='mb-3 mr-3 movie-card-sizes'
            layoutId={movie.id}
            onClick={onClick}
            ref={cardRef}
        >
            <div className='max-md:w-full'>
                <div
                    className='outline-none max-md:w-full cursor-pointer group movieCard relative flex rounded-xl overflow-hidden'
                    onClick={open}
                    tabIndex={0}
                >
                    <img
                        src={`https://image.tmdb.org/t/p/w500${movie.poster_path}`}
                        className='max-md:w-full h-full aspect-[2/3] object-cover block transition-transform duration-300 ease-out group-hover:scale-110 group-focus-within:scale-110'
                    />
                    <div
                        className='w-2 h-2 absolute right-2 top-2 rounded-full'
                        style={{backgroundColor: statusColor}}
                    />
                    <div className='max-md:w-full absolute inset-0 bg-gradient-to-t from-black/90 via-black/40 to-transparent opacity-0 transition-[opacity, colors] duration-300 group-hover:opacity-100 group-focus-within:opacity-100'/>
                    <div className='w-[90%] flex justify-between absolute text-[#777f8d] bottom-3 left-3 opacity-0 transition-opacity duration-300 group-hover:opacity-100 group-focus-within:opacity-100'>
                        <div className='flex gap-2'>
                            <span className='flex gap-2 text-sm flex items-center'><Calendar className='text-[#777f8d] max-w-5'/> {movie.release_date}</span>
                            <span className='flex gap-2 text-sm flex items-center'><Clock4 className='text-[#777f8d] max-w-5'/> {movie.vote_average}</span>
                        </div>
                        <Trash2
                            className='max-w-5 text-[#777f8d] hover:text-[#fb2933] transition-colors duration-300 text-sm'
                            onClick={del}
                        />
                    </div>
                </div>
                <div className='flex flex-col gap-1 pt-2'>
                    <h2 className='max-md:max-w-40 text-white max-w-64 whitespace-nowrap overflow-hidden text-ellipsis'>
                        {movie.title}
                    </h2>
                    <span className='text-[#777f8d]'>
                        {movie.genres?.[0]?.name}
                    </span>
                </div>
            </div>
        </motion.div>
)})

export default MovieCard