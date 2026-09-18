'use client'

import TokenScreen, {useTokenGuard} from '../components/tokenScreen'
import {useEffect, useReducer} from 'react'
import {merge} from '@/utils/reducer'
import {verifyReset} from '@/lib/auth'
import Auth from '../auth/auth'

type State = {email: string; error: string}

// [DOC: auth/#reset-route]
export default function PasswordReset({oobCode}: {oobCode: string}) {
    const [state, dispatch] = useReducer(merge<State>, {email: '', error: ''})

    useEffect(() => {
        let active = true
        verifyReset(oobCode)
            .then((email) => {if (active) dispatch({email})})
            .catch(() => {if (active) dispatch({error: 'The recovery link is invalid or has expired'})})
        return () => {active = false}
    }, [oobCode])

    useTokenGuard(Boolean(state.error))

    if (state.error) return <TokenScreen error={state.error}/>
    if (!state.email) return <TokenScreen/>

    return <Auth reset={{oobCode, email: state.email}}/>
}
