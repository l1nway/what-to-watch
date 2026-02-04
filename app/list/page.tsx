'use client'

import {ArrowLeft, Pencil, Save, Check, X, Loader} from 'lucide-react'
import {MovieClarifyProps} from './listTypes'
import {useSearchParams} from 'next/navigation'
import {Button} from '@/components/ui/button'
import {useList, statuses} from './useList'
import {useRouter} from 'next/navigation'
import MovieSkeleton from './movieSkeleton'
import Dropdown from './dropdown'

import SlideDown from '../components/slideDown'
import Film from './movieClarify'
import Movie from './movieSearch'
import SlideLeft from '../components/slideLeft'
import Delete from '../dashboard/delete'
import {MovieCard} from './movieCard'
import {useCallback, useMemo, useRef, useState} from 'react'

export default function List() {
    
    const headerRef = useRef<HTMLElement>(null)
    const [menu, setMenu] = useState<boolean>(false)

    const router = useRouter()
    const searchParams = useSearchParams()
    const listId = searchParams.get('id')

    const {setFilter, owner, user, loading, delClarify, setDelClarify, inputWidth, setMoviesData, delWarning, setDelWarning, deleteMovie, updateName, inputRef, spanRef, onChange, edit, setEdit, selectedGenres, setSelected, setSelectedGenres, toggleCheck, filteredMovies, status, genres, film, setFilm, selected, movie, setMovie, buttons, filter, fetchListAndMovies, moviesData, setRuntime, runtime, name, deleteList} = useList(listId)

    const renderButtons = useCallback((mobile: boolean) => {
        return buttons.map((element, index) => {
            const visible = user?.uid === owner || (filteredMovies.length > 0 && (element.text === 'Filter' || element.text === 'Random pick'))

            const button = (
                <Button
                    disabled={!filteredMovies.length && element.text !== 'Delete' && element.text !== 'Add movie'}
                    onClick={element.onClick}
                    style={{backgroundColor: element.color}}
                    onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = element.hover)}
                    onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = element.color)}
                    className={`max-md:w-[100%] max-md:h-15 max-md:text-2xl bg-[${element.color}] hover:bg-[${element.hover}] cursor-pointer transition-colors duration-300`}
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
                index={index}
                setDelWarning={setDelWarning}
                setSelected={setSelected}
                statusColor={statusColor}
                setFilm={setFilm}
                loading={loading}
                key={movie.id}
                movie={movie}
            />)
    })}, [filteredMovies, status, loading])

    const renderStatuses = useMemo(() => {
        return status.map((element, index) => {
        return (
            <label key={element.name} className='flex gap-2 cursor-pointer'>
                <div className={`${element.checked ? 'border-[#641aca] hover:border-[#7f22fe]' : 'border-[#99a1af] hover:border-white'} border rounded-[5px] min-h-7 min-w-7 flex items-center text-center duration-300 transition-colors`}>
                    <input className='cursor-pointer hidden' type='checkbox' checked={element.checked} onChange={() => toggleCheck(index)}/>
                    <Check 
                        className={`
                            text-[#641aca] hover:text-[#7f22fe] w-full h-full 
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
                        {`${selected ? 'bg-[#7f22fe] hover:bg-[#641aca]' : 'bg-[#1e2939] hover:bg-[#303844]'} text-white cursor-pointer transition-colors duration-300`}
                >
                    {element.name}
                </Button>
            )
    })}, [genres, selectedGenres, setSelectedGenres])

    return (
        <div className='bg-[#030712] h-screen flex flex-col overflow-hidden'>
            <Film
                visibility={film} 
                onClose={() => {setFilm(false); setDelWarning(false)}}
                statuses={statuses}
                listId={listId}
                selected={selected as MovieClarifyProps['selected']}
                deleteMovie={deleteMovie}
                delWarning={delWarning}
                setDelWarning={setDelWarning}
            />
            <Movie
                visibility={movie}
                onClose={() => setMovie(false)}
                movies={moviesData}
                setMoviesData={setMoviesData}
                onRefresh={fetchListAndMovies}
                id={listId}
            />
            <Delete
                action={delClarify}
                onClose={() => setDelClarify(false)}
                deleteGroup={() => deleteList(listId)}
            />
            <header
                className='flex w-full justify-between bg-[#101828] border-b border-b-[#1e2939] p-4 items-center'
                ref={headerRef}
            >
                <div className='flex text-white gap-3 items-center'>
                    <div onClick={() => router.back()}>
                        <ArrowLeft className='cursor-pointer text-[#777f8d] hover:text-white transition-colors duration-300'/>
                    </div>
                    <h1 className='whitespace-nowrap flex items-center relative'>
                        <span
                            ref={spanRef}
                            className='absolute invisible whitespace-pre text-xl px-4 py-2.5'
                        >
                            {name}
                        </span>
                        <input
                            style={{width: inputWidth}}
                            ref={inputRef}
                            disabled={!edit}
                            value={name}
                            onChange={onChange}
                            className='border border-[#7f22fe] text-xl px-4 py-2.5 rounded-[10px] outline-none bg-[#7f22fe] disabled:bg-[#101828] disabled:border-[#101828] transition-colors duration-300'
                        />
                        <SlideLeft visibility={loading}>
                            <Loader className='text-[#959dab] animate-spin'/>
                        </SlideLeft>
                        <SlideLeft visibility={!loading}>
                            <div className='absolute h-full flex items-center right-[-30] top-0'>
                                <SlideLeft visibility={edit}>
                                    <Save
                                        className='ml-1 text-[#99a1af] cursor-pointer hover:text-white transition-colors duration-300'
                                        onClick={updateName}
                                    />
                                </SlideLeft>
                                <SlideLeft visibility={!edit}>
                                    <Pencil
                                        className='ml-1 text-[#99a1af] cursor-pointer hover:text-white transition-colors duration-300'
                                        onClick={() => setEdit(true)}
                                    />
                                </SlideLeft>
                            </div>
                        </SlideLeft>
                    </h1>
                </div>
                <div
                    className='h-full flex items-center cursor-pointer min-md:hidden'
                    onClick={() => setMenu(!menu)}
                >
                    <div
                        className={`
                            transition-colors duration-300 w-15 h-7
                            hamburger-icon ${menu ? 'open' : ''}
                        `}
                    >
                        <span/>
                        <span/>
                        <span/>
                        <span/>
                    </div>
                </div>
                <Dropdown
                    className='flex gap-3 flex-col p-2'
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
                <div className='mx-4 text-white border border-[#1e2939] bg-[#101828] rounded-[10px] mt-4 mb-0 p-4 flex gap-2 flex-col'>
                    <div className='flex justify-between'>
                        <h2>
                            Filters
                        </h2>
                        <X
                            className='text-[#99a1af] cursor-pointer hover:text-white transition-colors duration-300'
                            onClick={() => setFilter(false)}
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
                            <input
                                className='w-full h-2 rounded-lg bg-[#7f22fe] accent-[#7f22fe]'
                                type='range'
                                value={runtime}
                                step={1}
                                min={10}
                                max={180}
                                onChange={e => setRuntime(e.target.value)}
                            />
                        </div>
                    </div>
                </div>
            </SlideDown>
            <SlideDown visibility={!loading && filteredMovies.length}>
                <span className='pt-4 px-4 text-[#777f8d] block'>
                    Showing {filteredMovies.length} of {moviesData.length} movies
                </span>
            </SlideDown>
            <div
                className='px-4 pt-4 flex flex-wrap flex-1 overflow-y-auto [scrollbar-gutter:stable] [scrollbar-width:thin] [scrollbar-color:#641aca_#1e2939]'
            >
                <SlideLeft visibility={loading || !filteredMovies.length}>
                    <MovieSkeleton
                        loading={loading}
                        onClick={setMovie}
                    />
                </SlideLeft>
                {movieCard}
            </div>
        </div>
    )
}