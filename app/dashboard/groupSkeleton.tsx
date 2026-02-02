import {Pencil, UserPlus, Plus, Trash2, Film} from 'lucide-react'
import {GroupSkeletonProps} from './dashboardTypes'
import SlideDown from '../components/slideDown'
import SlideLeft from '../components/slideLeft'

export const GroupSkeleton = ({loading, onClick, lists}: GroupSkeletonProps) => {
  return (
    <div className={`
      ${loading ? 'cursor-wait' : 'cursor-pointer'}
      relative w-full p-6 rounded-[10px] bg-[#101828] border border-[#1e2939] overflow-hidden mb-4 hover:border-[#7f22fe] transition-colors duration-300`}
      onClick={loading ? undefined : () => onClick(true)}
    >
      <div className={`
        absolute inset-0 opacity-10
        ${loading ? 'animate-pulse bg-gradient-to-r from-[#641aca] via-[#101828] to-[#641aca] bg-[length:200%_100%]' : 'bg-[#101828]'}
      `}/>

      <div className='relative z-10 flex justify-between'>
        
        <div className='flex flex-col gap-4 w-full'>
          
          <div className='flex items-center gap-2'>
            <div className={`
              h-7 w-48 rounded-[10px] text-white text-[1.5em] whitespace-nowrap
              ${loading ? 'animate-pulse bg-[#1e2939]' : null}
            `}>
              {loading ? null : 'Create a group?'}
            </div>
            <SlideLeft visibility={loading}>
              <Pencil className='w-6 h-6 text-[#364153]' />
            </SlideLeft>
          </div>

          <div className={`h-4 w-24 rounded-[10px] text-[#99a1af] whitespace-nowrap
            ${loading ? 'animate-pulse bg-[#1e2939]' : null}
          `}>
            {loading ? null : 'No groups have been created yet.'}
          </div>
            <div className='flex gap-3 mt-2 overflow-y-hidden overflow-x-auto [scrollbar-width:thin] [scrollbar-gutter:stable]'>
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

        <SlideDown visibility={loading}>
          <div className='flex flex-col gap-4 min-w-[140px]'>
            
            <div className='flex items-center justify-center gap-2 h-10 w-full bg-[#1e2939] rounded-[10px] animate-pulse'>
              <UserPlus className='w-4 h-4 text-[#6a7282]' />
              <div className='h-3 w-12 bg-[#364153] rounded-[10px]' />
            </div>

            <div className='flex items-center justify-center gap-2 h-10 w-full bg-[#7f22fe]/20 rounded-[10px] animate-pulse'>
              <Plus className='w-4 h-4 text-[#7f22fe]' />
              <div className='h-3 w-14 bg-[#7f22fe]/40 rounded-[10px]' />
            </div>

            <div className='flex items-center justify-center gap-2 h-10 w-full bg-[#ef4444]/10 rounded-[10px] animate-pulse'>
              <Trash2 className='w-4 h-4 text-[#ef4444]' />
              <div className='h-3 w-12 bg-[#ef4444]/30 rounded-[10px]' />
            </div>

          </div>
        </SlideDown>
      </div>
    </div>
  )
}