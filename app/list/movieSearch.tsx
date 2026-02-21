import {useState, useCallback, useEffect, useRef, useMemo} from 'react'
import {useDynamicHeight} from '../components/useDynamicHeight'
import {FilmItem, MovieSearchProps} from './listTypes'
import {AnimatePresence, motion} from 'framer-motion'
import ShowClarify from '../components/showClarify'
import {httpsCallable} from 'firebase/functions'
import {doc, updateDoc} from 'firebase/firestore'
import SlideDown from '../components/slideDown'
import SlideLeft from '../components/slideLeft'
import {Loader, Search, X} from 'lucide-react'
import {updateActivity} from '@/lib/presence'
import {Button} from '@/components/ui/button'
import {Input} from '@/components/ui/input'
import AddMovieCard from './addMovieCard'
import {functions} from '@/lib/firebase'
import debounce from 'lodash.debounce'
import {getSimilar} from '@/lib/ai'
import {statuses} from './useList'
import {db} from '@/lib/firebase'

export const TMDB_MOVIE_URL = 'https://themoviedb.org/movie/'

export const MovieSearch = ({delay, visibility, onClose, id, movies, setMoviesData, onRefresh, similar}: MovieSearchProps) => {

    useEffect(() => {
        visibility && updateActivity('adding_movie')
        
        return () => {updateActivity('browsing_list')}
    }, [visibility])

    const contentRef = useRef<HTMLDivElement>(null)

    const [films, setFilms] = useState<FilmItem[]>([])
    const [suggestions, setSuggestions] = useState<any[]>([])

    const [search, setSearch] = useState<string>('')
    const [text, setText] = useState<string>('Enter movie title')

    const [loading, setLoading] = useState<boolean>(false)

    const fetchSuggestions = useMemo(() => debounce(async (query: string) => {
        if (!query.trim()) {
            setSuggestions([])
            return
        }
        
        try {
            setText('Searching…')
            setLoading(true)

            const searchMovies = httpsCallable(functions, 'searchMovies')

            const response = await searchMovies({query})
            
            const tmdbResults = response.data as any[] 

            const enrichedResults = tmdbResults.map((movie: any) => {
                const existingMovie = movies?.find((m: any) => m.id === movie.id)
                return {
                    ...movie,
                    status: existingMovie ? existingMovie.status : null,
                    isSavedInDb: !!existingMovie 
                }
            })

            setSuggestions(enrichedResults)
            if (enrichedResults.length === 0) setText('Nothing found')
            setLoading(false)
            
        } catch (e: any) {
            console.error('Cloud Function Error:', e)
            
            setText('Error while searching')
            setLoading(false)
        }
    }, 500), [movies])

    const combinedList = useMemo(() => 
        [...films, ...suggestions.filter(s => !films.some(f => f.id === s.id))],
        [films, suggestions]
    )

    const statusChange = useCallback((element: any, newStatus: any) => {
        const statusValue = newStatus?.name

        setFilms(prev => prev.some(f => f.id === element.id)
            ? prev.map(f => f.id === element.id ? {...f, status: statusValue} : f)
            : prev
        )
        setSuggestions(prev => prev.map(s => s.id === element.id ? {...s, status: statusValue} : s))
    }, [setSuggestions, setFilms])

    const toggleFilm = useCallback((element: FilmItem) => {
        setFilms(prev => {
            const isAdded = prev.some(f => f.id === element.id)
            if (isAdded) {
                return prev.filter(f => f.id !== element.id)
            } else {
                return [...prev, {...element, status: element.status || null}]
            }
        })
    }, [setFilms])

    const renderFilms = useMemo(() => {
        return combinedList.map((movie, index) => {
        const addedLocally = films.some(f => f.id === movie.id)
        const alreadyInDb = movies?.some((m: any) => m.id === movie.id)
        const added = addedLocally || alreadyInDb

        const currentStatus = addedLocally 
            ? films.find(f => f.id === movie.id)?.status 
            : movie.status
        return (
            <AddMovieCard
                url={`${TMDB_MOVIE_URL}/${movie.id}`}
                currentStatus={currentStatus}
                statusChange={statusChange}
                addedLocally={addedLocally}
                alreadyInDb={alreadyInDb}
                toggleFilm={toggleFilm}
                statuses={statuses}
                key={movie.id}
                delay={delay}
                movie={movie}
                index={index}
                added={added}
            />
    )})}, [combinedList, delay, onClose])

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

    const {height, measureHeight} = useDynamicHeight({contentRef, dependency: combinedList, visibility, staticOffsets: 280})

    const onChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
        setSearch(e.target.value)
        search == '' ? setText('Enter movie title') : setText('Searching…')
    }, [search])

    useEffect(() => {fetchSuggestions(search)}, [search, fetchSuggestions])

    const fetchAiSuggestions = useCallback(async () => {
        if (!similar || !visibility) return

        try {
            setLoading(true)
            setText('AI is thinking…')

            const movieNames = await getSimilar(
                visibility.title || visibility.name, 
                visibility.overview
            )

            if (movieNames.length === 0) {
                setText('AI could not find anything')
                setLoading(false)
                return
            }

            const searchMovies = httpsCallable(functions, 'searchMovies')
            const enrichedResults = []

            for (const name of movieNames) {
                const response = await searchMovies({query: name})
                const results = response.data as any[]
                
                if (results && results.length > 0) {
                    const movie = results[0]
                    const existingMovie = movies?.find((m: any) => m.id === movie.id)
                    
                    enrichedResults.push({
                        ...movie,
                        status: existingMovie ? existingMovie.status : null,
                        isSavedInDb: !!existingMovie 
                    })
                }
            }

            setSuggestions(enrichedResults)
            setLoading(false)
        } catch (e) {
            console.error('AI Integration Error:', e)
            setText('Error with AI recommendations')
            setLoading(false)
        }
    }, [similar, visibility, movies])

    useEffect(() => {
        if (visibility && similar) {
            fetchAiSuggestions()
        } else {
            setText('Enter movie title')
        }
    }, [visibility, similar, fetchAiSuggestions])

    const close = useCallback(() => {
        setSuggestions([])
        onClose()
    }, [])

    return (
        <ShowClarify
            parentClassName='min-md:min-w-[90%] min-2xl:min-w-[75%] flex max-h-full'
            visibility={visibility}
            className='w-full'
            onClose={close}
        >
            <div className={`flex justify-between text-white ${!similar ? 'border-b border-[#1e2939] pb-4' : 'pb-2'}`}>
                <div className='flex'>
                    <h1>
                        {!similar ? 'Add movie' : 'Similar movies'}
                    </h1>
                    <SlideLeft className='ml-2' visibility={loading}>
                        <Loader className='text-[#959dab] animate-spin'/>
                    </SlideLeft>
                </div>
                <X
                    className='text-[#99a1af] outline-none hover:text-white focus:text-white cursor-pointer transition-colors duration-300'
                    onClick={close}
                    tabIndex={0}
                />
            </div>
            {!similar ?
                <>
                    <label
                        className='group items-center rounded-[10px] flex gap-2 my-4 bg-[#1e2939] border border-[#364153] hover:border-[#7f22fe] focus:border-[#7f22fe] focus-within:border-[#7f22fe] transition-colors duration-300 outline-none'
                        tabIndex={0}
                    >
                        <Search className='ml-2 text-[#99a1af] cursor-pointer group-hover:text-white group-focus:text-white group-focus-within:text-white transition-colors duration-300'/>
                        <Input
                            className='p-0 border-0 text-white outline-none placeholder:text-[#4b5563] ring-0 ring-offset-0 focus-visible:ring-0 focus-visible:ring-offset-0 transition-colors duration-300'
                            placeholder='Search for movies on TMTB…'
                            onChange={onChange}
                            value={search}
                            tabIndex={-1}
                        />
                        <SlideLeft visibility={search.length > 0}>
                            <X
                                className='mr-2 text-[#99a1af] hover:text-red-500 cursor-pointer transition-colors duration-300 outline-none'
                                onClick={() => setSearch('')}
                                tabIndex={0}
                            />
                        </SlideLeft>
                    </label>
                    <span className='text-[#6a7282] border-b border-[#1e2939] pb-4'>Powered by TMDB API (The Movie Database)</span>
                </>
            :
                <span className='text-[#6a7282] border-b border-[#1e2939] pb-4'>
                    Powered by Gemini 3 Flash
                </span>
            }
            <div className='w-full mb-4 max-lg:w-full'>
                <motion.div
                    transition={{duration: 0.3, ease: 'easeInOut'}}
                    className='overflow-hidden max-h-full w-full'
                    animate={{height}}
                >
                    <div
                        className='flex flex-col w-full max-h-full overflow-y-auto overflow-x-hidden [scrollbar-gutter:stable] [scrollbar-width:thin] [scrollbar-color:#641aca_#1e2939] max-lg:w-full pb-1'
                        ref={contentRef}
                        tabIndex={-1}
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
                    {(search == '' && !similar) ? 'Enter movie title' : text}
                </span>
            </SlideDown>
            <SlideDown visibility={films.length > 0}>
                <Button
                    className='outline-none focus-visible:ring-0 focus-visible:ring-offset-0 w-full bg-[#7f22fe] hover:bg-[#641aca] cursor-pointer'
                    onClick={save}
                >
                    Save changes
                </Button>
            </SlideDown>
        </ShowClarify>
    )
}