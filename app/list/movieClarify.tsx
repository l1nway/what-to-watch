import {doc, getDoc, updateDoc} from 'firebase/firestore'
import {useState, useEffect, useCallback} from 'react'
import ShowClarify from '../components/showClarify'
import SlideLeft from '../components/slideLeft'
import SlideDown from '../components/slideDown'
import {updateActivity} from '@/lib/presence'
import {MovieClarifyProps} from './listTypes'
import {Button} from '@/components/ui/button'
import {Select} from 'react-animated-select'
import {Info, Trash2, X} from 'lucide-react'
import {Gemini} from '../components/gemini'
import {db} from '@/lib/firebase'

export default function MovieClarify({url, visibility, onClose, statuses, selected, listId, onRefresh, deleteMovie, delWarning, setDelWarning, setSimilar, setMovie}: MovieClarifyProps) {
    const [status, setStatus] = useState<MovieClarifyProps['statuses'][number] | undefined>(undefined)

    useEffect(() => {
        visibility && updateActivity('reading_movie_info')
        
        return () => {updateActivity('browsing_list')}
    }, [visibility])

    useEffect(() => {selected?.status && setStatus(statuses.find(s => s.name === selected.status))}, [selected, statuses])

    const updateStatus = useCallback(async () => {
        if (!listId || !selected?.id || !status?.name) return

        try {
            const listRef = doc(db, 'lists', listId)
            const listSnap = await getDoc(listRef)

            if (listSnap.exists()) {
                const currentMovies = listSnap.data().movies || []
                
                const updatedMovies = currentMovies.map((m: any) => 
                    m.id === selected.id ? {...m, status: status.name} : m
                )

                await updateDoc(listRef, {
                    movies: updatedMovies
                })
                
                onRefresh?.()
                onClose()
            }
        } catch (e) {
            console.error('Error updating status:', e)
        }
    }, [listId, selected?.id, status?.name])

    return (
        <ShowClarify
            visibility={visibility}
            className='h-full'
            onClose={onClose}
        >
            <div className='relative mb-4'>
                <img
                    src={`https://image.tmdb.org/t/p/w500${selected?.poster_path}`}
                    className='w-full aspect-[9/5] object-cover min-h-150 max-h-150 max-md:max-h-120 max-md:min-h-120'
                />
                <div
                    className='absolute inset-0 bg-gradient-to-t from-[#101828] via-black/40 to-transparent opacity-100'
                />
                <div
                    className='absolute top-0 right-0 bg-gradient-to-bl from-[#101828]/90 to-transparent backdrop-blur-sm [mask-image:linear-gradient(to_bottom_left,black,transparent)]'
                    onClick={onClose}
                >
                    <X className='w-15 h-15 cursor-pointer text-[#777f8d] hover:text-white transition-colors duration-300'/>
                </div>
            </div>
            <div className='text-white flex justify-between mb-2'>
                <h2>{selected?.title}</h2>
                <div className='flex gap-2'>
                    <Trash2
                        className='text-[#99a1af] hover:text-[#fb2933] transition-colors duration-300 cursor-pointer'
                        onClick={() => setDelWarning(!delWarning)}
                    />
                    <a href={url}>
                        <Info className='text-[#99a1af] hover:text-white cursor-pointer transition-colors duration-300'/>
                    </a>
                    <Gemini
                        className='text-[#99a1af] hover:text-white cursor-pointer transition-colors duration-300 w-6 h-6'
                        onClick={() => {onClose(); setSimilar(true); setMovie(selected)}}
                    />
                </div>
            </div>
            <SlideDown visibility={delWarning}>
                <span className='text-white w-full justify-center flex pb-4'>Are you sure want remove the movie from the list?</span>
                <div className='flex pb-2 gap-2'>
                    <Button
                        onClick={(e: React.MouseEvent<HTMLButtonElement>) => deleteMovie(e, selected?.id)}
                        className='bg-red-500 hover:bg-red-700 cursor-pointer w-[49%]'
                    >
                        Confirm delete
                    </Button>
                    <Button
                        className='cursor-pointer w-[49%] bg-[#7f22fe] hover:bg-[#641aca]'
                        onClick={() => setDelWarning(!delWarning)}
                    >
                        Cancel
                    </Button>
                </div>
            </SlideDown>
            <div className='flex text-[#99a1af] gap-2 items-center mb-4'>
                <span>
                    {selected?.release_date}
                </span>
                <div className='w-1 h-1 bg-[#99a1af] rounded-full'/>
                <span>
                    {selected?.genres?.[0]?.name}
                </span>
                <div className='w-1 h-1 bg-[#99a1af] rounded-full'/>
                <span>
                    {selected?.vote_average}
                </span>
            </div>
            <div className='text-[#99a1af] mb-4 max-w-200'>
                {selected?.overview}
            </div>
            <div className='text-white flex flex-col gap-2'>
                <span>
                    Status
                </span>
                <div className='flex'>
                    <Select
                        style={{
                            '--rac-list-background': '#1e2939',
                            '--rac-list-color': 'white',
                            '--rac-option-highlight': '#2c2c2c',
                            '--rac-option-hover': '#2c2c2c',
                            '--rac-option-selected': '#2c2c2c',
                            '--rac-arrow-width': '2em',
                            '--rac-cancel-height': '1.75em',
                            '--rac-arrow-height': '2em',
                            '--rac-cancel-width': '1.75em',
                        } as React.CSSProperties}
                        className='h-9 w-full rounded-md bg-[#1e2939!important] border border-[#364153!important] !text-white items-center'
                        placeholder='Choose status'
                        onChange={setStatus}
                        options={statuses}
                        value={status}
                    />
                    <SlideLeft visibility={status != statuses.find(s => s?.name == selected?.status)}>
                        <Button
                            className='w-25 ml-4 mr-10 bg-[#7f22fe] hover:bg-[#641aca] cursor-pointer'
                            onClick={() => updateStatus()}
                        >Save</Button>
                    </SlideLeft>
                </div>
            </div>
        </ShowClarify>
    )
}