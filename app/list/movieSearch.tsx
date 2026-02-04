'use client'

import {useState, useCallback, useEffect, useLayoutEffect, useRef} from 'react'
import {FilmItem, MovieSearchProps} from './listTypes'
import {AnimatePresence, motion} from 'framer-motion'
import ShowClarify from '../components/showClarify'
import {doc, updateDoc} from 'firebase/firestore'
import SlideDown from '../components/slideDown'
import {Button} from '@/components/ui/button'
import {Input} from '@/components/ui/input'
import {AddMovieCard} from './addMovieCard'
import debounce from 'lodash.debounce'
import {db} from '@/lib/firebase'
import {X} from 'lucide-react'

const TMDB_API_KEY = process.env.NEXT_PUBLIC_TMDB_API_KEY
const TMDB_SEARCH_URL = 'https://api.themoviedb.org/3/search/movie'
const TMDB_MOVIE_URL = 'https://api.themoviedb.org/3/movie'

export default function MovieSearch({visibility, onClose, id, movies, setMoviesData, onRefresh}: MovieSearchProps) {

    const [films, setFilms] = useState<FilmItem[]>([])
    const [suggestions, setSuggestions] = useState<any[]>([])
    const [search, setSearch] = useState<string>('')
    const [text, setText] = useState<string>('')

    const statuses = [{
        name: 'Plan to watch',
        checked: false
    },{
        name: 'Watched',
        checked: false
    },{
        name: 'Dropped',
        checked: false
    }]

    const [loading, setLoading] = useState<boolean>(false)

    const fetchSuggestions = useCallback(
        debounce(async (query: string) => {
            if (!query.trim()) {
                setSuggestions([])
                return
            }
            try {
                setLoading(true)
                setText('Searching…')
                const res = await fetch(`${TMDB_SEARCH_URL}?api_key=${TMDB_API_KEY}&query=${encodeURIComponent(query)}`)
                const data = await res.json()
                
                const enrichedResults = (data.results || []).map((movie: any) => {
                    const existingMovie = movies?.find((m: any) => m.id === movie.id)
                    return {
                        ...movie,
                        status: existingMovie ? existingMovie.status : null,
                        isSavedInDb: !!existingMovie 
                    }
                })

                setSuggestions(enrichedResults)
                enrichedResults.length === 0 && setText('Nothing found')
                setLoading(false)
            } catch (e) {
                console.error(e)
                setText('Error while searching')
                setLoading(false)
            }
        }, 500), [movies]
    )

    useEffect(() => {
        fetchSuggestions(search)
    }, [search, fetchSuggestions])

    const save = useCallback(async () => {
        if (!id || films.length === 0) return

        const newMoviesForDb = films.map(f => ({
            id: f.id, 
            status: f.status || 'Plan to watch' 
        }))

        try {
            const optimisticMovies = films.map(f => ({
                id: f.id,
                title: f.name || (f as any).original_title,
                poster_path: f.poster_path,
                release_date: (f as any).release_date,
                vote_average: (f as any).vote_average,
                status: f.status || 'Plan to watch',
                genres: []
            }))

            setMoviesData(prev => [...optimisticMovies, ...prev])
            
            onClose()
            setFilms([])

            const listRef = doc(db, 'lists', id)
            
            const currentMoviesInDb = movies.map((m: any) => ({id: m.id, status: m.status}))
            
            await updateDoc(listRef, {
                movies: [...newMoviesForDb, ...currentMoviesInDb]
            })

            await onRefresh()
        } catch (e) {
            console.error('Error during save:', e)
            await onRefresh()
        }
    }, [films, id, onClose, movies, setMoviesData])

    const statusChange = (element: any, newStatus: any) => {
        const statusValue = newStatus?.name

        if (films.some(f => f.id === element.id)) {
            setFilms(prev => prev.map(f => 
                f.id === element.id ? {...f, status: statusValue} : f
            ))
        } 
        else {
            setSuggestions(prev => prev.map(s => 
                s.id === element.id ? {...s, status: statusValue} : s
            ))
        }
    }

    const toggleFilm = (element: FilmItem) => {
        setFilms(prev => {
            const isAdded = prev.some(f => f.id === element.id)
            if (isAdded) {
                return prev.filter(f => f.id !== element.id)
            } else {
                return [...prev, {...element, status: element.status || null}]
            }
        })
    }

    const combinedList = [
        ...films,
        ...suggestions.filter(s => !films.some(f => f.id === s.id))
    ]

    const renderFilms = combinedList.map((movie, index) => {
        const addedLocally = films.some(f => f.id === movie.id)
        const alreadyInDb = movies?.some((m: any) => m.id === movie.id)
        const added = addedLocally || alreadyInDb

        const currentStatus = addedLocally 
            ? films.find(f => f.id === movie.id)?.status 
            : movie.status
        return (
            <AddMovieCard
                currentStatus={currentStatus}
                statusChange={statusChange}
                addedLocally={addedLocally}
                alreadyInDb={alreadyInDb}
                toggleFilm={toggleFilm}
                statuses={statuses}
                loading={loading}
                key={movie.id}
                movie={movie}
                index={index}
                added={added}
            />
        )
    })
    
    const [height, setHeight] = useState<number>(0)

    const contentRef = useRef<HTMLDivElement>(null)

    const measureHeight = () => {
        if (!contentRef.current) return

        requestAnimationFrame(() => {
            requestAnimationFrame(() => {
                const MAX_HEIGHT = 150 * 4
                const nextHeight = Math.min(
                    contentRef.current!.scrollHeight,
                    MAX_HEIGHT
                )

                setHeight(nextHeight)
            })
        })
    }

    useLayoutEffect(() => {
        measureHeight()
    }, [combinedList.length])

    const onChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
        setSearch(e.target.value)
        search == '' ? setText('Enter movie title') : setText('Searching…')
    }, [search])

    return (
        <ShowClarify visibility={visibility} onClose={onClose}>
            <div className='flex justify-between text-white border-b border-[#1e2939] pb-4'>
                <h1>
                    Add movie
                </h1>
                <X onClick={onClose} className='text-[#99a1af] hover:text-white cursor-pointer transition-colors duration-300'/>
            </div>
            <div className='flex gap-2 my-4'>
                <Input
                    value={search}
                    onChange={onChange}
                    placeholder='Search for movies on TMTB…'
                    className='
                        bg-[#1e2939]
                        text-[#6a7282]
                        border-[#364153]
                        placeholder:text-[#4b5563]

                        hover:border-[#7f22fe]

                        focus:border-[#7f22fe]
                        focus:outline-none
                        focus:ring-0
                        focus:ring-offset-0

                        focus-visible:outline-none
                        focus-visible:border-[#7f22fe]
                        focus-visible:ring-0
                        focus-visible:ring-offset-0

                        transition-colors
                        duration-300
                    '
                />
                <Button className='bg-[#7f22fe] hover:bg-[#641aca] cursor-pointer'>Search</Button>
            </div>
            <span className='text-[#6a7282] border-b border-[#1e2939] pb-4'>Powered by TMDB API (The Movie Database)</span>
            <div
                className='w-250 mb-4 max-md:w-full'
            >
                <motion.div
                    className='overflow-hidden'
                    transition={{duration: 0.3, ease: 'easeInOut'}}
                    animate={{height}}
                >
                    <div
                        className='flex flex-col w-250 max-h-150 overflow-y-auto overflow-x-hidden [scrollbar-gutter:stable] [scrollbar-width:thin] [scrollbar-color:#641aca_#1e2939] max-md:w-full'
                        ref={contentRef}
                    >
                        <AnimatePresence
                            onExitComplete={measureHeight}
                            mode='popLayout'
                            initial={false}
                        >
                            {renderFilms}
                        </AnimatePresence>
                    </div>
                </motion.div>
            </div>
            <SlideDown
                visibility={!combinedList.length}
            >
                <span
                    className='mb-4 text-white w-full flex items-center justify-center'
                >
                    {(search == '' && !combinedList.length) ? 'Enter movie title' : text}
                </span>
            </SlideDown>
            <SlideDown visibility={films.length > 0}>
                <Button
                    className='w-full bg-[#7f22fe] hover:bg-[#641aca] cursor-pointer'
                    onClick={() => save()}
                >
                    Save changes
                </Button>
            </SlideDown>
        </ShowClarify>
    )
}