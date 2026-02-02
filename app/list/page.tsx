'use client'

import {ArrowLeft, Pencil, PencilOff} from 'lucide-react'
import {useSearchParams} from 'next/navigation'
import {Button} from '@/components/ui/button'
import {useList, statuses} from './useList'
import {useRouter} from 'next/navigation'
import MovieSkeleton from './movieSkeleton'

import SlideDown from '../components/slideDown'
import Film from './movieClarify'
import Movie from './movieSearch'
import SlideLeft from '../components/slideLeft'
import Delete from '../dashboard/delete'
import {MovieCard} from './movieCard'

export default function List() {
        
    const router = useRouter()
    const searchParams = useSearchParams()
    const listId = searchParams.get('id')

    const {owner, user, loading, delClarify, setDelClarify, inputWidth, setMoviesData, delWarning, setDelWarning, deleteMovie, updateName, inputRef, spanRef, onChange, edit, setEdit, selectedGenres, setSelected, setSelectedGenres, toggleCheck, filteredMovies, status, genres, film, setFilm, selected, movie, setMovie, buttons, filter, fetchListAndMovies, moviesData, setRuntime, runtime, name, deleteList} = useList(listId)

    const renderButtons = buttons.map((element, index) => {
        return (
            <SlideLeft
                visibility={
                    filteredMovies.length > 0 ||
                    (user?.uid === owner && element.text == 'Delete') ||
                    element.text == 'Add movie'
                }
                key={element.text}
            >
                <Button
                    disabled={!filteredMovies.length && element.text !== 'Delete' && element.text !== 'Add movie'}
                    onClick={element.onClick}
                    style={{backgroundColor: element.color}}
                    onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = element.hover)}
                    onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = element.color)}
                    className={`bg-[${element.color}] hover:bg-[${element.hover}] cursor-pointer transition-colors duration-300`}
                >
                    {element.icon} {element.text}
                </Button>
            </SlideLeft>
        )
    })

    const movieCard = filteredMovies.map((movie, index) => {
        const currentStatus = status.find(s => s.name === movie.status)
        const statusColor = currentStatus ? currentStatus.color : 'white'

        return (
            <MovieCard
                index={index}
                setDelWarning={setDelWarning}
                setSelected={setSelected}
                statusColor={statusColor}
                setFilm={setFilm}
                loading={loading}
                key={movie.id}
                movie={movie}
            />
        )
    })

    const renderStatuses = status.map((element, index) => {
        return (
            <div key={element.name} className='flex gap-2'>
                <input type='checkbox' checked={element.checked} onChange={() => toggleCheck(index)}/>
                <span>{element.name}</span>
            </div>
        )
    })

    const renderGenres = genres?.map((element, index) => {
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
    })

    return (
        <div className='bg-[#030712] h-screen flex flex-col overflow-hidden'>
            <Film
                visibility={film} 
                onClose={() => {setFilm(false); setDelWarning(false)}}
                statuses={statuses}
                listId={listId}
                selected={selected}
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
            <header className='flex w-full justify-between bg-[#101828] border-b border-b-[#1e2939] p-4'>
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
                        <div className='absolute h-full flex items-center right-[-30] top-0'>
                            <SlideLeft visibility={edit}>
                                <PencilOff
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
                    </h1>
                </div>
                <div className='flex gap-3'>
                    {renderButtons}
                </div>
            </header>
            <SlideDown
                visibility={filter}
            >
                <div className='mx-4 text-white border border-[#1e2939] bg-[#101828] rounded-[10px] mt-4 mb-0 p-4'>
                    <h2>
                        Filters
                    </h2>
                    <div className='flex justify-around'>
                        <div className='flex flex-col gap-2'>
                            <span>
                                Status
                            </span>
                            <div>
                                {renderStatuses}
                            </div>
                        </div>
                        <div className='flex flex-col gap-2'>
                            <span>
                                Genre
                            </span>
                            <div className='flex gap-2'>
                                {renderGenres}
                            </div>
                        </div>
                        <div className='flex flex-col gap-2'>
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