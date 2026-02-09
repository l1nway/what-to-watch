import {animationProps, stylesProps} from '../components/motionProps'
import {Pencil, UserPlus, Plus, Trash2, Film} from 'lucide-react'
import {GroupSkeletonProps} from './dashboardTypes'
import SlideDown from '../components/slideDown'
import SlideLeft from '../components/slideLeft'
import {motion} from 'framer-motion'
import {useRef} from 'react'

export const GroupSkeleton = ({loading, onClick, lists}: GroupSkeletonProps) => {
  const groupRef = useRef(null)
  return (
    <motion.div className={`
      ${loading ? 'cursor-wait' : 'cursor-pointer'}
      relative w-full p-6 rounded-[10px] bg-[#101828] border border-[#1e2939] overflow-hidden mb-4 hover:border-[#7f22fe] transition-colors duration-300 mb-3`}
      onClick={loading ? undefined : () => onClick(true)}
      style={{...stylesProps, overflow: 'hidden'}}
      {...animationProps('vertical')}
      layoutId='group-skeleton'
      ref={groupRef}
    >
      <div className={`absolute inset-0 opacity-10
        ${loading ? 'animate-pulse bg-gradient-to-br from-[#641aca] via-[#101828] to-[#641aca] bg-[length:200%_200%]' : 'bg-[#101828]'}
      `}/>

      <div className='relative z-10 flex justify-between w-full'>
        
        <div
          className={`flex flex-col gap-4 ${loading ? 'max-md:max-w-[70%] min-md:max-w-[85%]' : 'min-w-[100%]'}`}
        >
          <div className='flex items-center'>
            <div className={`
              h-7 w-48 rounded-[10px] text-white text-[1.5em] whitespace-nowrap
              ${loading ? 'animate-pulse bg-[#1e2939]' : null}
            `}>
              {loading ? null : 'Create a group?'}
            </div>
            <SlideLeft className='ml-2 pr-2' visibility={loading}>
              <Pencil className='w-6 h-6 text-[#364153]' />
            </SlideLeft>
          </div>

          <div className={`h-4 w-24 rounded-[10px] text-[#99a1af] whitespace-nowrap
            ${loading ? 'animate-pulse bg-[#1e2939]' : null}
          `}>
            {loading ? null : 'No groups have been created yet.'}
          </div>
            <div className={`flex gap-3 mt-2 overflow-y-hidden overflow-x-auto [scrollbar-width:thin] [scrollbar-gutter:stable] min-h-20 pb-2 w-full pb-2 
            ${loading ? '[mask-image:linear-gradient(to_right,black_calc(100%-60px),transparent)] [-webkit-mask-image:linear-gradient(to_right,black_calc(100%-60px),transparent)]' : ''}`}>
              {lists &&
                Array.from({length: Math.max(lists.length, 1)}).map((e, i) => (
                  <div key={i} className={`
                    min-w-25 min-h-20 rounded-[5px] border border-[#1e2939] bg-[#101828] p-2 flex flex-col justify-between
                    ${loading ? 'animate-pulse' : null}
                  `}>
                    <div className='flex justify-between items-start'>
                      <Film className='w-7 h-7 text-[#364153]' />
                      <div className='h-3 w-6 bg-[#1e2939] rounded-[10px]' />
                    </div>
                    <div className='h-3 w-full bg-[#1e2939] rounded-[10px]' />
                  </div>
                ))
              }
            </div>
        </div>

        <SlideDown
          className='w-full flex items-end flex-col'
          visibility={loading}
        >
          <div className='flex flex-col gap-4 max-md:w-fit min-md:w-full'>
            
            <div className='flex items-center justify-center gap-2 h-10 w-full bg-[#1e2939] rounded-[10px] animate-pulse'>
              <UserPlus className='w-4 h-4 text-[#6a7282]'/>
              <div className='h-3 w-8 bg-[#364153] rounded-[10px]'/>
            </div>

            <div className='flex items-center justify-center gap-2 h-10 w-full bg-[#7f22fe]/20 rounded-[10px] animate-pulse p-2'>
              <Plus className='w-4 h-4 text-[#7f22fe]'/>
              <div className='h-3 w-10 bg-[#7f22fe]/40 rounded-[10px]'/>
            </div>

            <div className='flex items-center justify-center gap-2 h-10 w-full bg-[#ef4444]/10 rounded-[10px] animate-pulse'>
              <Trash2 className='w-4 h-4 text-[#ef4444]'/>
              <div className='h-3 w-8 bg-[#ef4444]/30 rounded-[10px]'/>
            </div>

          </div>
        </SlideDown>
      </div>
    </motion.div>
  )
}