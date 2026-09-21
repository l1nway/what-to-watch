'use client'

import {createContext, useContext, useEffect, useState} from 'react'
import {onAuthStateChanged, User} from 'firebase/auth'
import {httpsCallable} from 'firebase/functions'
import {auth, functions} from '@/lib/firebase'

type AuthContextType = {
    user: User | null
    loading: boolean
}

const AuthContext = createContext<AuthContextType>({
    user: null,
    loading: true,
})

export function AuthProvider({children}: {children: React.ReactNode}) {
    const [user, setUser] = useState<User | null>(null)
    const [loading, setLoading] = useState<boolean>(true)

    useEffect(() => {
        const unsub = onAuthStateChanged(auth, (user) => {
            setUser(user)
            setLoading(false)
        })

        return () => unsub()
    }, [])

    // [DOC: email-sign-in-sync] rescue sync in case the email-change link was confirmed while signed out
    useEffect(() => {if (user) httpsCallable(functions, 'syncEmailOnSignIn')().catch(() => {})}, [user?.uid])

    return (
        <AuthContext.Provider value={{user, loading}}>
            {children}
        </AuthContext.Provider>
    )
}

export const useAuth = () => useContext(AuthContext)