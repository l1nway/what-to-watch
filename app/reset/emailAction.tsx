'use client'

import TokenScreen, {useTokenGuard} from '../components/tokenScreen'
import {doc, getDoc, setDoc, deleteField} from 'firebase/firestore'
import {useEffect, useReducer, useRef} from 'react'
import {useAuth} from '../components/authProvider'
import {useRouter} from 'next/navigation'
import {merge} from '@/utils/reducer'
import {applyCode} from '@/lib/auth'
import {signOut} from 'firebase/auth'
import {auth, db} from '@/lib/firebase'

type State = {error: string}

// [DOC: #email-modes]
export default function EmailAction({oobCode, change}: {oobCode: string; change?: boolean}) {
    const [state, dispatch] = useReducer(merge<State>, {error: ''})
    const {user, loading} = useAuth()
    const router = useRouter()
    const handled = useRef(false)

    useEffect(() => {
        if (loading || handled.current) return
        handled.current = true

        const apply = async () => {
            const userDoc = user && doc(db, 'users', user.uid)
            const pendingEmail = userDoc && (await getDoc(userDoc).catch(() => null))?.data()?.pendingEmail

            let failed = ''
            try {
                await applyCode(oobCode)
            } catch (e) {
                failed = (e as {code?: string}).code ?? 'auth/invalid-action-code'
            }

            // [DOC: #already-applied] a change mode can invalidate this very tab's own session as a
            // side effect of applying the code, so a pending record from before the call is the only
            // proof a retry has left; verifyEmail never loses its session, but the SDK's cached
            // `user` object still needs a reload to pick up `emailVerified` — otherwise /settings
            // renders off the stale value until something else happens to reload it
            if (failed === 'auth/invalid-action-code' && change && pendingEmail) failed = ''
            if (!change && user) {
                await user.reload().catch(() => {})
                if (failed === 'auth/invalid-action-code' && user.emailVerified) failed = ''
            }

            if (failed) {
                if (userDoc) await setDoc(userDoc, {emailStatus: user?.emailVerified ? 'verified' : 'unverified', pendingEmail: deleteField()}, {merge: true}).catch(() => {})
                if (!user) return dispatch({error: failed})
                return router.replace(`/settings?emailError=${encodeURIComponent(failed)}`)
            }

            // [DOC: #email-modes] written from the address read before applying: a change mode can
            // revoke this tab's own token as a side effect of the very call above, so neither a
            // reload nor `user.email` can be trusted for the write that follows
            if (userDoc) await setDoc(userDoc, {
                emailStatus: 'verified',
                pendingEmail: deleteField(),
                ...(change && pendingEmail ? {email: pendingEmail} : {}),
            }, {merge: true}).catch(() => {})

            if (change && user) {
                await signOut(auth).catch(() => {})
                await fetch('/api/logout', {method: 'POST'}).catch(() => {})
                return router.replace('/auth?mode=login&emailChanged=1')
            }

            router.replace(user ? '/settings' : '/auth?mode=login')
        }

        apply()
    }, [oobCode, loading, user, change, router])

    useTokenGuard(Boolean(state.error))

    if (state.error) return <TokenScreen error='The link is invalid or has expired'/>
    return <TokenScreen/>
}
