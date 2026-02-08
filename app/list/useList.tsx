import {useCallback, useState, useMemo, useEffect, useRef, useLayoutEffect} from 'react'
import {doc, getDoc, updateDoc, arrayRemove, deleteDoc} from 'firebase/firestore'
import {Funnel, Plus, Shuffle, Trash2} from 'lucide-react'
import {ButtonItem, Status, TMDBMovie} from './listTypes'
import {shake, clearShake} from '../components/shake'
import {useAuth} from '../components/authProvider'
import {useRouter} from 'next/navigation'
import {db} from '@/lib/firebase'

export const statuses = [{
    name: 'Plan to watch',
    checked: false,
    color: '#ffff00'
},{
    name: 'Watched',
    checked: false,
    color: '#01ff00'
},{
    name: 'Dropped',
    checked: false,
    color: '#ff0000'
}]

export function useList(listId: string | null) {
    const router = useRouter()
    const {user} = useAuth()

    const [moviesData, setMoviesData] = useState<TMDBMovie[]>([])
    const [loading, setLoading] = useState<boolean>(true)
    const [name, setName] = useState<string>('Loading…')
    const [originalName, setOriginalName] = useState<string>('')
    const [edit, setEdit] = useState<boolean>(false)
    const [inputWidth, setInputWidth] = useState<number | string>(119)
    const [filter, setFilter] = useState<boolean>(false)
    const [film, setFilm] = useState<boolean>(false)
    const [movie, setMovie] = useState<boolean>(false)

    const [runtime, setRuntime] = useState<string>('600')
    const [selected, setSelected] = useState<TMDBMovie | null>()
    const [selectedGenres, setSelectedGenres] = useState<string[]>([])

    const [owner, setOwner] = useState<string>('')

    const buttons = useMemo<ButtonItem[]>(() => [
        {
            icon: <Plus className='max-md:h-6! max-md:w-6!'/>,
            text: 'Add movie',
            color: movie ? '#7f22fe' : '#1e2939',
            hover: movie ? '#641aca': '#303844',
            onClick: () => setMovie(!movie)
        },{
            icon: <Funnel className='max-md:h-6! max-md:w-6!'/>,
            text: 'Filter',
            color: filter ? '#7f22fe' : '#1e2939',
            hover: filter ? '#641aca': '#303844',
            onClick: () => setFilter(!filter)
        },{
            icon: <Shuffle className='max-md:h-6! max-md:w-6!'/>,
            text: 'Random pick',
            color: '#7f22fe',
            hover: '#641aca',
            onClick: () => router.push(`./random?id=${listId}`)
        },{
            icon: <Trash2 className='max-md:h-6! max-md:w-6!'/>,
            text: 'Delete',
            color: '#fb2c36',
            hover: '#c10007',
            onClick: () => setDelClarify(true)

        }
    ], [filter, movie, listId])

    const fetchListAndMovies = useCallback(async () => {
        if (!listId) return
        setLoading(true)
        try {
            const listRef = doc(db, 'lists', listId)
            const listSnap = await getDoc(listRef)

            if (listSnap.exists()) {
                const data = listSnap.data()
                setOwner(data.ownerId)
                const storedMovies = listSnap.data().movies || []
                const fetchedName = data.name || 'Untitled List'
                setName(fetchedName)
                setOriginalName(fetchedName)

                const moviePromises = storedMovies.map(async (movieObj: {id: number, status: string}) => {
                    const res = await fetch(
                        `https://api.themoviedb.org/3/movie/${movieObj.id}?api_key=${process.env.NEXT_PUBLIC_TMDB_API_KEY}`
                    )
                    const tmdbData = await res.json()
                    
                    return {
                        ...tmdbData,
                        status: movieObj.status
                    }
                })

                const results = await Promise.all(moviePromises)
                setMoviesData(results)
                const allGenres = results
                    .flatMap(movie => movie.genres || [])
                const uniqueGenres = Array.from(
                    new Map(allGenres.map(g => [g.name, g])).values()
                )
                setGenres(uniqueGenres)
            }
        } catch (e) {
            console.error("Error fetching movies:", e)
        } finally {
            setLoading(false)
        }
    }, [listId])

    useEffect(() => {
        fetchListAndMovies()
    }, [fetchListAndMovies])

    const [status, setStatus] = useState<Status[]>(statuses)

    const deleteList = useCallback(async (listId: string | null) => {
        try {
            const listRef = doc(db, 'lists', String(listId))

            await deleteDoc(listRef)
            router.push('/dashboard')
            setDelClarify(false)
        } catch (e) {
            console.error('Failed to delete list:', e)
        }
    }, [db])

    const [delClarify, setDelClarify] = useState(false)

    const filteredMovies = useMemo(() => {
        return moviesData.filter(movie => {
            const activeStatuses = status.filter(s => s.checked).map(s => s.name)
            const matchesStatus = activeStatuses.length === 0 || activeStatuses.includes(movie.status || '')

            const matchesGenre = selectedGenres.length === 0 || 
                movie.genres?.some(g => selectedGenres.includes(g.name))

            const matchesRuntime = movie.runtime ? movie.runtime <= parseInt(runtime) : true

            return matchesStatus && matchesGenre && matchesRuntime
        })
    }, [moviesData, status, selectedGenres, runtime])

    const toggleCheck = useCallback((index: number) => {
        setStatus(prev =>
            prev.map((s, i) => i === index ? {...s, checked: !s.checked} : s)
        )
    }, [setStatus])
    
    const onChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
        setName(e.target.value)
        clearShake(inputRef.current)
    }, [name])

    const inputRef = useRef<HTMLInputElement>(null)
    const spanRef = useRef<HTMLSpanElement>(null)
    
    useEffect(() => {
        if (edit) inputRef.current?.focus()
    }, [edit])

    useLayoutEffect(() => {
        if (!spanRef.current) return
        setInputWidth(spanRef.current.offsetWidth + 1)
    }, [name])

    const updateName = useCallback(async () => {
        if (!listId || !name.trim()) {
            shake(inputRef.current)
            return
        }

        if (name.trim() == originalName) {
            setEdit(false)
            return
        }
        
        try {
            const listRef = doc(db, 'lists', listId)
            await updateDoc(listRef, {
                name: name.trim()
            })
            setEdit(false)
            setOriginalName(name.trim())
        } catch (e) {
            console.error(e)
        }
    }, [listId, name, originalName])

    const [delWarning, setDelWarning] = useState<boolean>(false)

    const deleteMovie = useCallback(async (e: React.MouseEvent, movieId: string | number | undefined) => {
        e.stopPropagation()
        if (!listId || !movieId) return

        try {
            const movieToDelete = moviesData.find(m => m.id === movieId)
            if (!movieToDelete) return

            const listRef = doc(db, 'lists', listId)

            await updateDoc(listRef, {
                movies: arrayRemove({
                    id: movieToDelete.id,
                    status: movieToDelete.status
                })
            })

            setMoviesData(prev => prev.filter(m => m.id !== movieId))
            setDelWarning(false)
            setFilm(false)
        } catch (error) {
            
        }
    }, [listId, moviesData])

    const [genres, setGenres] = useState<{name: string, id: string}[]>([])

    const [delay, setDelay] = useState<boolean>(true)

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
    
    useEffect(() => {
        if (name && name !== 'Loading…') {
            document.title = `${name} | What to Watch`
        }
    }, [name])

    return {delay, setFilter, owner, user, loading, delClarify, setDelClarify, deleteList, setMoviesData, delWarning, setDelWarning, deleteMovie, updateName, inputRef, spanRef, inputWidth, onChange, edit, setEdit, name, selectedGenres, setSelected, setSelectedGenres, toggleCheck, filteredMovies, status, genres, film, setFilm, selected, movie, setMovie, buttons, filter, fetchListAndMovies, moviesData, setRuntime, runtime}
}