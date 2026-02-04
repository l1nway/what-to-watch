import {motion, AnimatePresence, HTMLMotionProps} from 'framer-motion'
import {useState, useLayoutEffect} from 'react'
import {DropdownCoords, DropdownProps} from './listTypes'

function Dropdown({toggle, visibility, ref, children, offset = 8, duration = 300, className = ''}: DropdownProps) {
    const [coords, setCoords] = useState<DropdownCoords>({top: 0, bottom: 0, right: 0, isUpward: false})

    useLayoutEffect(() => {
        if (visibility && ref.current) {
        const rect = ref.current.getBoundingClientRect()
        const windowHeight = window.innerHeight
        const dropdownEstimatedHeight = 250

        const spaceBelow = windowHeight - rect.bottom
        const showUpward = spaceBelow < dropdownEstimatedHeight && rect.top > spaceBelow

        setCoords({
            top: rect.top,
            bottom: rect.bottom,
            right: window.innerWidth - rect.right, 
            isUpward: showUpward
        })
        }
    }, [visibility, ref])

    const motionProps: HTMLMotionProps<'div'> = {
        initial: {opacity: 0, height: 0, scale: 0.95},
        animate: {opacity: 1, height: 'auto', scale: 1},
        exit: {opacity: 0, height: 0, scale: 0.95},
        transition: {duration: duration / 1000, ease: [0.4, 0, 0.2, 1]},
    }

    return (
        <AnimatePresence>
            {visibility && (
                <motion.div
                    {...motionProps}
                    style={{
                        position: 'fixed',
                        right: coords.right,
                        ...(coords.isUpward 
                            ? {bottom: window.innerHeight - coords.top + offset} 
                            : {top: coords.bottom + offset}),
                        zIndex: 1000,
                        overflow: 'hidden',
                        transformOrigin: coords.isUpward ? 'bottom right' : 'top right',
                    }}
                    className='flex w-full justify-center'
                >
                    <div
                        className={`${className} w-[95%] bg-[#101828] border border-[#1e2939] rounded-lg shadow-xl`}
                        onClick={toggle}
                    >
                        {children}
                    </div>
                </motion.div>
            )}
        </AnimatePresence>
  )
}

export default Dropdown