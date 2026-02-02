import {GroupSkeletonProps} from './dashboardTypes'
import {Film} from 'lucide-react'

export const ListSkeleton = ({loading, onClick}: GroupSkeletonProps) => {
  return (
    <div
      className={`
        ${loading ? 'cursor-wait' : 'cursor-pointer'}
        max-w-153 flex flex-col p-6 w-full relative
        border border-[#1e2939] rounded-[10px]
        ${loading ? 'bg-gradient-to-br from-[#7f22fe]/20 to-[#101828]' : 'bg-[#101828]'}
        ${loading ? 'animate-pulse' : null}
        hover:border-[#7f22fe]
        transition-colors duration-300
      `}
      onClick={loading ? undefined : () => onClick(true)}
    >
      <div className='relative z-10 flex flex-col h-full justify-between'>
        <div className='flex justify-between items-start w-full'>
          <div className='bg-[#1e2939] rounded-[10px] p-3'>
            <Film className='text-[#364153] w-6 h-6' />
          </div>

          <div className='h-4 w-20 bg-[#1e2939] rounded-[10px]' />
        </div>

        <div className='mt-3'>
          <div className={`${loading ? 'bg-[#1e2939]' : null} h-7 w-1/3 rounded-[10px] mb-3 text-white text-[1.5em]`}>
            {loading ? null : 'Create a list?'}
          </div>
          <div
            className={
              `${loading ? 'bg-[#1e2939]' : null} 
              text-[#99a1af] h-4 w-2/3 rounded-[10px]`
            }>
            {loading ? null : 'No lists have been created yet.'}
          </div>
        </div>
      </div>
    </div>
  )
}
