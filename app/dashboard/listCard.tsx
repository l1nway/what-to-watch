import {ListCardProps} from './dashboardTypes'
import {motion} from 'framer-motion'
import {Film} from 'lucide-react'
import {useRef} from 'react'

export function ListCard({router, list, delay, index}: ListCardProps) {
    const cardRef = useRef<HTMLDivElement | null>(null)

    return (
       <motion.div
            className='min-w-153 flex bg-[#101828] border border-[#1e2939] rounded-[10px] flex-col p-6 cursor-pointer hover:border-[#7f22fe] transition-colors duration-300'
            onClick={() => router.push(`/list?id=${encodeURIComponent(list.id)}`)}
            tabIndex={0}
            key={list?.id}
            style={{ 
                willChange: 'transform, opacity, height',
                backfaceVisibility: 'hidden',
                transform: 'translateZ(0)'
            }}
            ref={cardRef}
            layoutId={list?.id}
            layout='position'
            viewport={{once: false, amount: 'some', margin: '-10px 0px -10px 0px'}}
            initial={{opacity: 0, scale: 0.9}}
            whileInView={{opacity: 1, scale: 1}}
            transition={{
                layout: { 
                    type: 'spring', 
                    stiffness: 300, 
                    damping: 30
                },
                default: { 
                    duration: 0.3, 
                    ease: 'easeInOut',
                    delay: delay ? index * 0.08 : undefined
                },
                opacity: {
                    duration: 0.3,
                    delay: delay ? index * 0.08 : undefined
                }
            }}
            exit={{opacity: 0, scale: 0.8, transition: {duration: 0.3}}}
        >
            <div className='flex w-full justify-between'>
                <div className='p-4 bg-[#1b183d] rounded-[10px]'>
                    <Film className='text-[#a684ff]'/>
                </div>
                <span className='text-[#6a7282]'>
                    {list?.movies?.length ? list.movies.length : 0} movies
                </span>
            </div>
            <div className='text-white text-[1.5em]'>
                {list.name}
            </div>
            <span className='text-[#99a1af]'>
                {list.desc}
            </span>
        </motion.div>
    )
}