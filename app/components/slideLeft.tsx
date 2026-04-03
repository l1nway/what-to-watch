'use client'

import {CSSTransition} from 'react-transition-group'
import {ReactNode, useRef} from 'react'

interface SlideLeftProps {
    onClick?: () => void
    visibility?: boolean
    children?: ReactNode
    className?: string
    duration?: number
    in?: boolean
}

function SlideLeft({in: inProp, visibility, children, duration = 300, className, onClick}: SlideLeftProps) {
    const nodeRef = useRef<HTMLDivElement>(null)

    return (
        <CSSTransition
            in={visibility ? visibility: inProp}
            timeout={300}
            classNames='slide-left'
            unmountOnExit
            nodeRef={nodeRef}
            onEnter={() => {
                if (!nodeRef.current) return
                nodeRef.current.style.width = '0px'
            }}
            onEntering={() => {
                requestAnimationFrame(() => {
                    requestAnimationFrame(() => {
                        if (nodeRef.current) {
                            nodeRef.current.style.transition = `width ${duration}ms, color ${duration}ms, background-color ${duration}ms`
                            nodeRef.current.style.width = nodeRef.current.scrollWidth + 'px'
                        }
                    })
                })
            }}
            onEntered={() => {
                if (!nodeRef.current) return
                nodeRef.current.style.width = 'auto'
            }}
            onExit={() => {
                if (!nodeRef.current) return
                nodeRef.current.style.width = nodeRef.current.scrollWidth + 'px'
                void nodeRef.current.offsetHeight
            }}
            onExiting={() => {
                if (!nodeRef.current) return
                nodeRef.current.style.width = '0px'
            }}
        >
            <div
                className={`${className} slide-left-enter-done overflow-hidden will-change-[width] transition-[width,color,background-color] duration-[${duration}ms]`}
                onClick={onClick}
                ref={nodeRef}
                tabIndex={-1}
            >
                {children}
            </div>
        </CSSTransition>
    )
}

export default SlideLeft