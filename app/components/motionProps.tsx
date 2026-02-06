import {HTMLMotionProps} from 'framer-motion'
import {CSSProperties} from 'react'

export const stylesProps: CSSProperties = {
    willChange: 'transform, opacity, width, height',
    WebkitBackfaceVisibility: 'hidden',
    backfaceVisibility: 'hidden',
    transform: 'translateZ(0)'
}
type AnimationMode = 'vertical' | 'horizontal' | 'both'

export const animationProps = (mode: AnimationMode, initial: boolean = false, delay: boolean = false, index: number = 0): HTMLMotionProps<'div'> => {
    const value = delay ? index * 0.08 : undefined
    const start = initial ? {opacity: 0, scale: 0.9} : false
    const exit = {
        both: {height: 0, width: 0},
        horizontal: {width: 0},
        vertical: {height: 0}
    }

    return {
    layout:'position',
    viewport: {
        margin: '-10px 0px -10px 0px',
        amount: 'some',
        once: false
    },
    initial: start,
    whileInView: {
        opacity: 1,
        scale: 1
    },
    transition: {
        layout: {
            stiffness: 300,
            type: 'spring',
            damping: 30
        }, default: {
            ease: 'easeInOut',
            duration: 0.3,
            delay: value
        }, opacity: {
            duration: 0.3,
            delay: value
        }
    },
    exit: {
        ...exit[mode],
        transition: {
            duration: 0.3
        },
        borderWidth: 0,
        scale: 0.8,
        padding: 0,
        opacity: 0,
        margin: 0
    }
}}