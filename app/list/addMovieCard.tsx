import {animationProps, stylesProps} from '../components/motionProps'
import {useRef, useState, useId, memo} from 'react'
import SlideDown from '../components/slideDown'
import {Plus, Check, Info} from 'lucide-react'
import {Button} from '@/components/ui/button'
import {AddMovieCardProps} from './listTypes'
import {Select} from 'react-animated-select'
import {motion} from 'framer-motion'

const AddMovieCard = ({delay, currentStatus, toggleFilm, statusChange, movie, index, added, addedLocally, alreadyInDb, statuses, url}: AddMovieCardProps) => {
    const cardRef = useRef<HTMLDivElement | null>(null)
    const [desc, setDesc] = useState<boolean>(false)
    const uid = useId()
    
    return (
       <motion.div
            className='outline-none h-fit mr-4 mt-4 flex bg-[#1e2939] rounded-xl p-4 border border-[#364153] transition-colors duration-300 hover:border-[#7f22fe] focus:border-[#7f22fe] cursor-pointer flex-col'
            {...animationProps('vertical', true, delay, index)}
            style={{...stylesProps}}
            layoutId={uid}
            ref={cardRef}
            tabIndex={0}
        >
            <div className='flex gap-4 h-fit'>
                {movie.poster_path ?
                    <img
                        src={`https://image.tmdb.org/t/p/w500${movie.poster_path || ''}`}
                        className='rounded-xl min-w-min h-50 max-md:aspect-[2/3]'
                        alt={movie.original_title}
                        key={`poster-${movie.id}`}
                        crossOrigin='anonymous'
                        decoding='async'
                        loading='lazy'
                    />
                    : null}
                <div className='flex flex-col gap-2 h-fit w-full'>
                    <div className='flex justify-between w-full'>
                        <h2 className='text-white'>{movie.original_title}</h2>
                        <a href={url} className='outline-none group'>
                            <Info className='text-[#99a1af] group-hover:text-white group-focus-within:text-white cursor-pointer transition-colors duration-300'/>
                        </a>
                    </div>
                    <div className='flex text-[#99a1af] gap-2 items-center flex-wrap'>
                        {movie.release_date ?
                            <span>
                                {movie.release_date}
                            </span>
                        : null}
                        {movie.genre_ids.length > 0 ?
                            <>
                                <div className='w-1 h-1 bg-[#99a1af] rounded-full'/>
                                <span>
                                    {movie.genre_ids}
                                </span>
                            </>
                        : null}
                        {movie.vote_average ?
                            <>
                                <div className='w-1 h-1 bg-[#99a1af] rounded-full'/>
                                <span>
                                    {movie.vote_average}
                                </span>
                            </>
                        : null}
                    </div>
                    <span className='text-[#99a1af] text-wrap max-w-150 max-md:hidden'>{movie.overview}</span>
                    <div className='flex gap-4 max-md:flex-col'>
                        <Select
                            offset={2}
                            disabled={alreadyInDb && !addedLocally}
                            disabledText='Already added'
                            style={{
                                '--rac-list-background': 'black',
                                '--rac-list-color': 'white',
                                '--rac-option-highlight': '#2c2c2c',
                                '--rac-option-hover': '#2c2c2c',
                                '--rac-option-selected': '#2c2c2c'
                            } as React.CSSProperties}
                            className={`${(alreadyInDb && !addedLocally) ? '!justify-center' : ''}
                                outline-none hover:!border-[#7f22fe] focus:!border-[#7f22fe]
                                [&_.rac-select-list]:!p-4
                                w-full rounded-md bg-[#1e2939!important] border border-[#364153!important] !text-white !min-h-9 !max-h-9 !items-center`}
                            placeholder='Choose status'
                            value={statuses.find(s => s.name === currentStatus) || null}
                            onChange={(val) => statusChange(movie, val)}
                            options={statuses}
                        />
                        <Button
                            disabled={alreadyInDb}
                            className={`outline-none focus-visible:ring-0 focus-visible:ring-offset-0 bg-[#7f22fe] ${!added ? 'hover:bg-[#641aca] focus:bg-[#641aca]' : 'hover:bg-[#900] focus:bg-[#900]'} cursor-pointer transition-colors duration-300`}
                            onClick={() => toggleFilm(movie)}
                        >
                            {added ? <><Check/> {alreadyInDb ? 'Already added' : 'Remove from list'}</> : <><Plus/> Add to list</>}
                        </Button>
                        {movie.overview ?
                            <Button
                                className='min-md:hidden bg-[#7f22fe] hover:bg-[#641aca] cursor-pointer transition-colors duration-300'
                                onClick={() => setDesc(!desc)}
                            >
                                {desc ? 'Hide' : 'Show'} description
                            </Button>
                        : null}
                    </div>
                </div>
            </div>
            <SlideDown visibility={desc}>
                <span className='block text-white'>
                    {movie.overview}
                </span>
            </SlideDown>
        </motion.div>
    )
}

export default memo(AddMovieCard)