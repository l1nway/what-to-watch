'use client'

import {ArrowLeft, Pencil, Save, Check, X, Loader} from 'lucide-react'
import {useCallback, useMemo, useRef, useState} from 'react'
import {MovieClarifyProps, AnimationKeys} from './listTypes'
import {MovieSearch, TMDB_MOVIE_URL} from './movieSearch'
import {AnimatePresence, motion} from 'framer-motion'
import {useSearchParams} from 'next/navigation'
import SlideDown from '../components/slideDown'
import SlideLeft from '../components/slideLeft'
import {Slider} from '@/components/ui/slider'
import {Button} from '@/components/ui/button'
import MovieSkeleton from './movieSkeleton'
import {useList, statuses} from './useList'
import {useRouter} from 'next/navigation'
import Delete from '../dashboard/delete'
import MovieCard from './movieCard'
import Dropdown from './dropdown'
import Film from './movieClarify'

export default function List() {
    
    const headerRef = useRef<HTMLElement>(null)
    const [menu, setMenu] = useState<boolean>(false)

    const router = useRouter()
    const searchParams = useSearchParams()
    const listId = searchParams.get('id')

    const {delay, setFilter, owner, user, loading, delClarify, setDelClarify, inputWidth, setMoviesData, delWarning, setDelWarning, deleteMovie, updateName, inputRef, spanRef, onChange, edit, setEdit, selectedGenres, setSelected, setSelectedGenres, toggleCheck, filteredMovies, status, genres, film, setFilm, selected, movie, setMovie, buttons, filter, fetchListAndMovies, moviesData, setRuntime, runtime, name, deleteList} = useList(listId)

    const renderButtons = useCallback((mobile: boolean) => {
        return buttons.map((element, index) => {
            const visible = user?.uid === owner || (filteredMovies.length > 0 && (element.text === 'Filter' || element.text === 'Random pick'))

            const button = (
                <Button
                    disabled={(!filteredMovies.length && element.text !== 'Delete' && element.text !== 'Add movie') || element.disabled}
                    onClick={element.onClick}
                    style={{backgroundColor: element.color}}
                    onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = element.hover)}
                    onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = element.color)}
                    onFocus={(e) => (e.currentTarget.style.backgroundColor = element.hover)}
                    onBlur={(e) => (e.currentTarget.style.backgroundColor = element.color)}
                    className={`outline-none focus-visible:ring-0 focus-visible:ring-offset-0 max-md:w-[100%] max-md:h-9 max-md:text-xl bg-[${element.color}] hover:bg-[${element.hover}] focus:bg-[${element.hover}] cursor-pointer transition-colors duration-300`}
                >
                    {element.icon} {element.text}
                </Button>
            )

            return mobile ? (
                <SlideDown key={element.text} visibility={visible}>
                    {button}
                </SlideDown>
            ) : (
                <SlideLeft key={element.text} visibility={visible}>
                    {button}
                </SlideLeft>
            )
        })
    }, [buttons, filteredMovies, user?.uid, owner])

    const movieCard = useMemo(() => {
        return filteredMovies.map((movie, index) => {
        const currentStatus = status.find(s => s.name === movie.status)
        const statusColor = currentStatus ? currentStatus.color : 'white'

        return (
            <MovieCard
                onClick={() => setMenu(false)}
                setDelWarning={setDelWarning}
                setSelected={setSelected}
                statusColor={statusColor}
                setFilm={setFilm}
                key={movie.id}
                index={index}
                delay={delay}
                movie={movie}
            />)
    })}, [filteredMovies, status, delay])

    const renderStatuses = useMemo(() => {
        return status.map((element, index) => {
            return (
                <label
                    className='outline-none group flex gap-3 cursor-pointer'
                    key={element.name}
                    tabIndex={0}
                >
                    <div
                        className={`${element.checked ? 'border-[#641aca] group-hover:border-[#7f22fe] group-focus-within:border-[#7f22fe]' : 'border-[#99a1af] group-hover:border-white group-focus-within:border-white'} border rounded-[5px] min-h-7 min-w-7 flex items-center text-center duration-300 transition-colors`}
                    >
                        <input
                            onChange={() => toggleCheck(index)}
                            className='cursor-pointer hidden'
                            checked={element.checked}
                            type='checkbox'
                        />
                        <Check 
                            className={`
                                text-[#641aca] group-hover:text-[#7f22fe] group-focus-within:text-[#7f22fe] w-full h-full 
                                transition-all duration-300 ease-in-out
                                ${element.checked ? 'scale-100 opacity-100' : 'scale-50 opacity-0'}
                            `}
                        />
                    </div>
                    <span className='whitespace-nowrap'>{element.name}</span>
                </label>
            )
    })}, [status, toggleCheck])

    const renderGenres = useMemo(() => {
        return genres?.map((element, index) => {
            const selected = selectedGenres.includes(element.name)
            return (
                <Button
                    key={element.id}
                    onClick={() => {
                        setSelectedGenres(prev => 
                            prev.includes(element.name) 
                                ? prev.filter(g => g !== element.name) 
                                : [...prev, element.name]
                        )
                    }}
                    className=
                        {`${selected ? 'bg-[#7f22fe] hover:bg-[#641aca] focus:bg-[#641aca]' : 'bg-[#1e2939] hover:bg-[#303844] focus:bg-[#303844]'} text-white cursor-pointer transition-colors duration-300 outline-none focus-visible:ring-0 focus-visible:ring-offset-0`}
                >
                    {element.name}
                </Button>
            )
    })}, [genres, selectedGenres, setSelectedGenres])

    const animationMap = useMemo(() => ({
        loading: {
            key: 'loader',
            Component: Loader,
            props: {
                className: 'text-[#959dab] animate-spin'
            }},
        view: {
            key: 'edit',
            Component: Pencil,
            props: {
                className: 'group-focus-within:text-white outline-none ml-1 text-[#99a1af] cursor-pointer hover:text-white focus:text-white transition-colors duration-300',
                onClick: () => setEdit(true)
            }},
        edit: {
            key: 'save',
            Component: Save,
            props: {
                className: 'group-focus-within:text-white outline-none ml-1 text-[#99a1af] cursor-pointer hover:text-white focus:text-white transition-colors duration-300',
                onClick: updateName
            }},
    }), [setEdit, updateName])

    let currentState: AnimationKeys = loading ? 'loading' : edit ? 'edit' : 'view'
    let {key, Component, props} = animationMap[currentState]

    const [back, setBack] = useState(false)

    const bck = useCallback(() => {
        router.back()
        setBack(true)
    }, [])

    return (
        <div className='bg-[#030712] h-screen flex flex-col overflow-hidden'>
            <Film
                onClose={() => {setFilm(false); setDelWarning(false)}}
                selected={selected as MovieClarifyProps['selected']}
                url={`${TMDB_MOVIE_URL}/${selected?.id}`}
                setDelWarning={setDelWarning}
                deleteMovie={deleteMovie}
                delWarning={delWarning}
                statuses={statuses}
                visibility={film}
                listId={listId}
            />
            <MovieSearch
                onClose={() => setMovie(false)}
                onRefresh={fetchListAndMovies}
                setMoviesData={setMoviesData}
                movies={moviesData}
                visibility={movie}
                delay={delay}
                id={listId}
            />
            <Delete
                action={delClarify}
                onClose={() => setDelClarify(false)}
                deleteGroup={() => deleteList(listId)}
            />
            <header
                className='flex w-full justify-between bg-[#101828] border-b border-b-[#1e2939] p-4 items-center mb-4'
                ref={headerRef}
            >
                <div className='flex text-white gap-3 items-center'>
                    <AnimatePresence mode='wait'>
                        {!back ?
                            <motion.div
                                animate={{opacity: 1, scale: 1, rotate: 0}}
                                exit={{opacity: 0, scale: 0.5, rotate: 45}}
                                transition={{duration: 0.15}}
                                key='settings'
                            >
                                <ArrowLeft
                                    className='cursor-pointer text-[#777f8d] hover:text-white focus:text-white outline-none transition-colors duration-300 w-8 h-8'
                                    onClick={bck}
                                    tabIndex={0}
                                />
                            </motion.div>
                            :
                            <motion.div
                                initial={{opacity: 0, scale: 0.5}}
                                animate={{opacity: 1, scale: 1}}
                                exit={{opacity: 0, scale: 0.5}}
                                transition={{duration: 0.15}}
                                key='loader'
                            >
                                <Loader
                                    className='text-[#959dab] animate-spin w-8 h-8'
                                />
                            </motion.div>
                        }
                    </AnimatePresence>
                    <h1 className='whitespace-nowrap flex items-center relative'>
                        <span
                            ref={spanRef}
                            className='absolute invisible whitespace-pre text-xl pl-2 pr-4 py-2.5'
                        >
                            {name}
                        </span>
                        <input
                            className='border border-[#7f22fe] text-xl pl-2 pr-4 py-2.5 rounded-[10px] outline-none bg-[#7f22fe] disabled:bg-[#101828] disabled:border-[#101828] transition-colors duration-300'
                            style={{width: inputWidth}}
                            onChange={onChange}
                            disabled={!edit}
                            ref={inputRef}
                            value={name}
                        />
                        <AnimatePresence mode='wait'>
                            <motion.div
                                initial={currentState === 'loading' ? undefined : {opacity: 0, scale: 0.5}}
                                tabIndex={currentState === 'loading' ? -1 : 0}
                                animate={{opacity: 1, scale: 1, rotate: 0}}
                                exit={{opacity: 0, scale: 0.5, rotate: 45}}
                                className='group outline-none'
                                transition={{duration: 0.15}}
                                key={key}
                            >
                                <Component {...props}/>
                            </motion.div>
                        </AnimatePresence>
                    </h1>
                </div>
                <div
                    className='h-full flex items-center cursor-pointer min-md:hidden'
                    onClick={() => setMenu(!menu)}
                >
                    <div
                        className={`transition-colors duration-300 w-9 h-6 hamburger-icon ${menu ? 'open' : ''}`}
                    >
                        <span/>
                        <span/>
                        <span/>
                        <span/>
                    </div>
                </div>
                <Dropdown
                    className='flex gap-3 flex-col p-2 md:hidden'
                    toggle={() => setMenu(!menu)}
                    visibility={menu}
                    ref={headerRef}
                >
                    {renderButtons(true)}
                </Dropdown>
                <div className='flex gap-3 max-md:hidden'>
                    {renderButtons(false)}
                </div>
            </header>
            <SlideDown
                visibility={filter}
            >
                <div className='mx-4 text-white border border-[#1e2939] bg-[#101828] rounded-[10px] mb-4 mb-0 p-4 flex gap-2 flex-col'>
                    <div className='flex justify-between'>
                        <h2>
                            Filters
                        </h2>
                        <X
                            className='outline-none text-[#99a1af] cursor-pointer hover:text-white focus:text-white transition-colors duration-300'
                            onClick={() => setFilter(false)}
                            tabIndex={0}
                        />
                    </div>
                    <div className='flex justify-between max-md:flex-col-reverse max-md:gap-2'>
                        <div className='flex flex-col gap-2 pr-4 min-md:w-[20%]'>
                            <span>
                                Status
                            </span>
                            <div className='flex gap-2 max-md:justify-between min-md:flex-col'>
                                {renderStatuses}
                            </div>
                        </div>
                        <div className='flex flex-col gap-2 min-md:w-[55%]'>
                            <span>
                                Genre
                            </span>
                            <div className='[scrollbar-width:thin] flex gap-2 flex-wrap min-md:max-w-185 max-md:overflow-x-auto max-md:max-h-11 max-md:flex max-md:flex-col'>
                                {renderGenres}
                            </div>
                        </div>
                        <div className='flex flex-col gap-2 min-md:w-[25%]'>
                            <span>
                                Max runtime: {runtime} min
                            </span>
                            <Slider
                                onValueChange={([v]) => setRuntime(v)}
                                value={[runtime]}
                                max={600}
                                min={10}
                                step={1}
                            />
                        </div>
                    </div>
                </div>
            </SlideDown>
            <SlideDown visibility={!loading || filteredMovies.length}>
                <span className='pb-4 px-4 text-[#777f8d] block'>
                    Showing {filteredMovies.length} of {moviesData.length} movies
                </span>
            </SlideDown>
            <div
                className='pb-2 px-4 flex flex-wrap flex-1 overflow-y-auto [scrollbar-gutter:stable] [scrollbar-width:thin] [scrollbar-color:#641aca_#1e2939]'
                tabIndex={-1}
            >
                <AnimatePresence mode='popLayout'>
                    {!filteredMovies.length ?
                        <MovieSkeleton
                            loading={loading}
                            onClick={setMovie}
                        />
                    : null}
                    {movieCard}
                </AnimatePresence>
            </div>
        </div>
    )
}