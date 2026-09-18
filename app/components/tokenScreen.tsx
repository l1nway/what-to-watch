'use client'

import {useEffect} from 'react'
import {useRouter} from 'next/navigation'
import {Film, Loader} from 'lucide-react'
import {useAuth} from './authProvider'

const REDIRECT_DELAY = 2000

// [DOC: auth/#token-guard]
export function useTokenGuard(invalid: boolean) {
    const {user, loading} = useAuth()
    const router = useRouter()

    useEffect(() => {
        if (!invalid || loading) return
        const id = setTimeout(() => router.replace(user ? '/dashboard' : '/auth?mode=login'), REDIRECT_DELAY)
        return () => clearTimeout(id)
    }, [invalid, loading, user, router])
}

export default function TokenScreen({error}: {error?: string}) {
    return (
        <div className='h-screen w-screen overflow-y-auto bg-gradient-to-br from-[#030712] to-[#2f0d68] flex max-md:flex-col items-center min-md:justify-center min-md:gap-24 max-md:gap-4'>
            <div className='flex flex-col items-center gap-4'>
                <div className='cursor-pointer login-logo'>
                    <Film className='text-[#a684ff] min-md:h-120 min-md:w-120 max-md:h-50 max-md:w-50 hover:scale-[1.05] hover:text-[#ffeafe] transition-[colors, transform] duration-300 cursor-pointer'/>
                </div>
                <h1 className='text-white text-2xl'>What to Watch</h1>
                {error
                    ? <span role='alert' className='text-[#a60000] text-center px-4'>{error}</span>
                    : <Loader className='text-[#959dab] animate-spin'/>
                }
            </div>
        </div>
    )
}
