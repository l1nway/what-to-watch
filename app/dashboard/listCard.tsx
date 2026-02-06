import {animationProps, stylesProps} from '../components/motionProps'
import {ListCardProps} from './dashboardTypes'
import {motion} from 'framer-motion'
import {Film} from 'lucide-react'
import {useRef} from 'react'

export function ListCard({router, list, delay, index}: ListCardProps) {
    const cardRef = useRef<HTMLDivElement | null>(null)

    return (
       <motion.div
            className='outline-none list-card-sizes flex bg-[#101828] border border-[#1e2939] rounded-[10px] flex-col p-6 max-md:p-3 cursor-pointer hover:border-[#7f22fe] focus:border-[#7f22fe] transition-colors duration-300 mb-3 mr-3'
            onClick={() => router.push(`/list?id=${encodeURIComponent(list.id)}`)}
            style={{...stylesProps, overflow: 'hidden'}}
            {...animationProps('both', true, delay, index)}
            layoutId={list?.id}
            ref={cardRef}
            tabIndex={0}
        >
            <div className='flex w-full justify-between gap-2 max-md:flex-col'>
                <div className='p-4 bg-[#1b183d] rounded-[10px] max-md:justify-center max-md:flex max-md:h-fit max-md:w-fit'>
                    <Film className='text-[#a684ff]'/>
                </div>
                <span className='text-[#6a7282]'>
                    {list?.movies?.length ? list.movies.length : 0} movies
                </span>
            </div>
            <div className='text-white text-[1.5em] break-all'>
                {list.name}
            </div>
            <span className='text-[#99a1af] min-h-6'>
                {list.desc}
            </span>
        </motion.div>
    )
}