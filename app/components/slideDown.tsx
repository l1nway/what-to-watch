'use client'

import {CSSTransition} from 'react-transition-group'
import {ReactNode, useRef} from 'react'

interface SlideDownProps {
    in?: boolean
    visibility?: boolean | number
    children?: ReactNode
    duration?: number
    className?: string
    onClick?: () => void
    unmountOnExit?: boolean
    ref?: any
}

function SlideDown({in: transitionIn, visibility, children, duration = 300, className, onClick, unmountOnExit = true, ref}: SlideDownProps) {
    const nodeRef = useRef<HTMLDivElement>(null)
    const active = Boolean(transitionIn ?? visibility)

    return(
        <CSSTransition
            in={active}
            timeout={duration}
            classNames='slideDown'
            unmountOnExit={unmountOnExit}
            nodeRef={ref? ref : nodeRef}
            onEnter={() => {
                if (!nodeRef.current) return
                nodeRef.current.style.height = '0px'
            }}
            onEntering={() => {
                if (!nodeRef.current) return
                nodeRef.current.style.height = nodeRef.current.scrollHeight + 'px'
            }}
            onEntered={() => {
                if (!nodeRef.current) return
                nodeRef.current.style.height = 'auto'
            }}
            onExit={() => {
                if (!nodeRef.current) return
                nodeRef.current.style.height = nodeRef.current.scrollHeight + 'px'
            }}
            onExiting={() => {
                if (!nodeRef.current) return
                nodeRef.current.style.height = '0px'
            }}
        >
            <div
                onClick={onClick}
                ref={nodeRef}
                style={{
                    overflow: 'hidden',
                    transition: `height ${duration}ms ease`
                }}
                className={`slide-down-enter-done ${className}`}
                tabIndex={-1}
            >
                {children}
            </div>
        </CSSTransition>
    )
}

export default SlideDown