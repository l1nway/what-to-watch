'use client'

import TokenScreen, {useTokenGuard} from '../components/tokenScreen'
import {useSearchParams} from 'next/navigation'
import PasswordReset from './passwordReset'
import EmailAction from './emailAction'

const MODES = ['resetPassword', 'verifyEmail', 'verifyAndChangeEmail', 'recoverEmail']

// [DOC: #action-modes]
export default function Reset() {
    const params = useSearchParams()
    const oobCode = params.get('oobCode')
    const mode = params.get('mode')

    const invalid = !oobCode || !mode || !MODES.includes(mode)
    useTokenGuard(invalid)

    if (!oobCode || !mode) return <TokenScreen error='The link is missing its action code'/>
    if (invalid) return <TokenScreen error='The link is invalid or has expired'/>

    switch (mode) {
        case 'resetPassword':
            return <PasswordReset oobCode={oobCode}/>
        case 'verifyEmail':
            return <EmailAction oobCode={oobCode}/>
        // both replace the address on the account: one moves to the new one, the other reverts
        default:
            return <EmailAction oobCode={oobCode} change/>
    }
}
