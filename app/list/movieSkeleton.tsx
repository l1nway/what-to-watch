import {animationProps, stylesProps} from '../components/motionProps'
import {Calendar, Clock4, Trash2} from 'lucide-react'
import SlideDown from '../components/slideDown'
import {motion} from 'framer-motion'
import {useRef} from 'react'

export default function MovieSkeleton({loading, onClick}: {loading: boolean, onClick: (boolean: boolean) => void}) {
  const cardRef = useRef<HTMLDivElement | null>(null)
  return (
    <motion.div
      className={`
        ${loading ? 'cursor-wait' : 'cursor-pointer'}
        group mb-3 mr-3 movie-card-sizes
      `}
      style={{...stylesProps}}
      {...animationProps('both')}
      layoutId='skeleton'
      ref={cardRef}
    >
      <div 
        className={`
          relative w-full aspect-[2/3] aspect-[2/3] object-cover rounded-xl p-4 flex flex-col justify-between overflow-hidden border border-transparent hover:border-[#7f22fe] transition-colors duration-300
          ${loading ? 'animate-pulse' : ''}
          `}
        style={{
          backgroundColor: '#101828',
          backgroundImage: loading
            ? 'linear-gradient(135deg, #101828 0%, #641aca 50%, #101828 100%)'
            : 'none',
          backgroundSize: '200% 200%',
        }}
        onClick={loading ? undefined : () => onClick(true)}
      >
        <div className='absolute top-3 right-3 w-2.5 h-2.5 bg-[#7f22fe] rounded-full shadow-[0_0_10px_#7f22fe]' />

        <div className='flex-grow' />
        <SlideDown visibility={loading}>
          <div className='flex items-center justify-between text-white/70'>
            <div className='flex items-center gap-4'>
              <div className='flex items-center gap-1.5'>
                <Calendar className='text-[#959dab]' />
                <div className={`
                  ${loading ? 'animate-pulse' : ''}
                  h-4 w-20 bg-white/20 rounded
                `} />
              </div>
              
              <div className='flex items-center gap-1.5'>
                <Clock4 className='text-[#959dab]' />
                <div className={`
                  ${loading ? 'animate-pulse' : ''}
                  h-4 w-4 bg-white/20 rounded
                `} />
              </div>
            </div>

            <Trash2 className='text-[#959dab]' />
          </div>
        </SlideDown>
      </div>

      <div className='px-1 space-y-2 pt-2'>
        <div className={`
          ${loading ? 'animate-pulse bg-[#1e2939] mt-2' : ''}
          h-5 w-3/4 rounded text-white whitespace-nowrap
        `}>
          {loading ? null : 'Add a movie?'}
        </div>
        <div className={`
          h-4 w-full rounded text-[#777f8d] whitespace-nowrap
          ${loading ? 'animate-pulse bg-[#1e2939]/60' : ''}`
        }>
          {loading ? null : 'No movies have been added yet.'}
        </div>
      </div>
    </motion.div>
  )
}