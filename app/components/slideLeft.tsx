'use client'

import {CSSTransition} from 'react-transition-group'
import {ReactNode, useRef} from 'react'

interface SlideLeftProps {
    in?: boolean
    visibility?: boolean
    children?: ReactNode
    duration?: number
    className?: string
    onClick?: () => void
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
                if (!nodeRef.current) return
                nodeRef.current.style.width = nodeRef.current.scrollWidth + 'px'
            }}
            onEntered={() => {
                if (!nodeRef.current) return
                nodeRef.current.style.width = 'auto'
            }}
            onExit={() => {
                if (!nodeRef.current) return
                nodeRef.current.style.width = nodeRef.current.scrollWidth + 'px'
            }}
            onExiting={() => {
                if (!nodeRef.current) return
                nodeRef.current.style.width = '0px'
            }}
        >
            <div
                className={`slide-left-enter-done ${className}`}
                style={{
                    overflow: 'hidden',
                    transition: `width ${duration}ms ease`
                }}
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