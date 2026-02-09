import {animationProps, stylesProps} from '../components/motionProps'
import {GroupSkeletonProps} from './dashboardTypes'
import {motion} from 'framer-motion'
import {Film} from 'lucide-react'
import {useRef} from 'react'

export const ListSkeleton = ({loading, onClick}: GroupSkeletonProps) => {
    const listRef = useRef<HTMLDivElement | null>(null)
  return (
    <motion.div
      className={`
        ${loading ? 'cursor-wait' : 'cursor-pointer'}
        list-card-sizes flex flex-col p-6 max-md:p-3 relative
        border border-[#1e2939] rounded-[10px]
        bg-[#101828]
        hover:border-[#7f22fe]
        transition-colors duration-300 mb-3 mr-3
      `}
      onClick={loading ? undefined : () => onClick(true)}
      style={{...stylesProps, overflow: 'hidden'}}
      {...animationProps('both')}
      layoutId='list-skeleton'
      ref={listRef}
    >
      <div className={`absolute inset-0 opacity-10
        ${loading ? 'animate-pulse bg-gradient-to-br from-[#641aca] via-[#101828] to-[#641aca] bg-[length:200%_200%]' : 'bg-[#101828]'}
      `}/>
      <div className={`relative z-10 flex flex-col h-full ${loading ? 'gap-2' : 'gap-0'}`}>
        <div className='flex justify-between items-start w-full gap-2 max-md:flex-col'>
          <div className='p-4 bg-[#1b183d] rounded-[10px] max-md:justify-center max-md:flex max-md:h-fit max-md:w-fit'>
            <Film className='text-[#364153] w-6 h-6' />
          </div>

          <div className='h-4 w-20 bg-[#1e2939] rounded-[10px]' />
        </div>

        <div className={`flex flex-col ${loading ? 'gap-2' : 'gap-2 max-md:gap-4'}`}>
          <div className={`${loading ? 'bg-[#1e2939]' : ''} h-7 max-md:h-4 text-nowrap w-1/3 rounded-[10px] text-white text-[1.5em] min-w-25`}>
            {loading ? null : 'Create a list?'}
          </div>
          <div
            className={
              `${loading ? 'bg-[#1e2939]' : 'w-full text-wrap'} 
              text-[#99a1af] h-5 max-md:h-4 w-2/3 rounded-[10px] min-w-15 break-all`
            }>
            {loading ? null : 'No lists created yet'}
          </div>
        </div>
      </div>
    </motion.div>
  )
}
