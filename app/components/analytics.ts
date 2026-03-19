'use client'

import {usePathname, useSearchParams} from 'next/navigation'
import {analyticsPromise} from '@/lib/firebase'
import {logEvent} from 'firebase/analytics'
import {useEffect} from 'react'

export default function Analytics() {
    const pathname = usePathname()
    const searchParams = useSearchParams()

    useEffect(() => {
        if (process.env.NODE_ENV === 'development') return

        analyticsPromise.then((analytics) => {
        if (analytics) {
            const url = pathname + searchParams.toString()
            logEvent(analytics, 'page_view', {
                page_path: url,
                page_location: window.location.href,
                page_title: document.title,
            })
        }
        })
    }, [pathname, searchParams])

  return null
}