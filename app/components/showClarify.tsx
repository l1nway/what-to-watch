'use client'

import {useState, useEffect} from 'react'

type ShowClarifyProps = {
    visibility?: boolean | string | Record<string, any> | null | undefined
    onClose?: () => void
    children?: React.ReactNode
    className?: string
}

export default function ShowClarify({visibility, onClose, children, className}: ShowClarifyProps) {
    const [mounted, setMounted] = useState(false)
    const [show, setShow] = useState(false)

    useEffect(() => {
        if (visibility) {
            setMounted(true)
            setTimeout(() => setShow(true), 10)
        } else {
            setShow(false)
            const timer = setTimeout(() => setMounted(false), 300)
            return () => clearTimeout(timer)
        }
    }, [visibility])

    if (!mounted) return null

    return (
        <div 
            className={`
                fixed inset-0 z-50 flex items-center justify-center p-4
                transition-all duration-300 ease-in-out
                ${show ? 'opacity-100 backdrop-blur-md bg-black/50' : 'opacity-0 backdrop-blur-0 bg-transparent'}
            `}
            onClick={onClose}
        >
            <div 
                className={`relative w-full min-w-fit max-w-md transform transition-transform duration-300 ${show ? 'scale-100' : 'scale-50'}`}
                onClick={e => e.stopPropagation()}
            >
                <div className={`bg-[#101828] rounded-xl p-4 flex flex-col w-full ${className}`}>
                    {children}
                </div>
            </div>
        </div>
    )
}