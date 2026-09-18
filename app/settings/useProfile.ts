'use client'

import {validateEmail, validateName} from '../components/validation'
import {doc, setDoc, updateDoc, onSnapshot, deleteField} from 'firebase/firestore'
import {useCallback, useEffect, useMemo, useReducer, useRef} from 'react'
import {sendEmailChange, sendVerification} from '@/lib/auth'
import {useRouter, useSearchParams} from 'next/navigation'
import {shake, clearShake} from '../components/shake'
import {authError} from '../components/authError'
import {EmailStatus, PersonalField} from './settingsTypes'
import {updateProfile, User} from 'firebase/auth'
import {merge} from '@/utils/reducer'
import {db} from '@/lib/firebase'

const RESEND_DELAY = 60

type State = {
    name: string
    email: string
    nameEdit: boolean
    emailEdit: boolean
    nameSaving: boolean
    emailSaving: boolean
    emailStatus: EmailStatus
    pendingEmail: string
    error: string
    cooldown: number
}

const initialState: State = {
    name: '', email: '', nameEdit: false, emailEdit: false,
    nameSaving: false, emailSaving: false,
    emailStatus: 'verified', pendingEmail: '', error: '', cooldown: 0,
}

export default function useProfile(user: User | null, loading: boolean) {
    const [state, dispatch] = useReducer(merge<State>, initialState)
    const emailError = useSearchParams().get('emailError')
    const router = useRouter()

    const refs = useRef<Partial<Record<PersonalField, HTMLInputElement | null>>>({})
    const refCallbacks = useRef<Partial<Record<PersonalField, (el: HTMLInputElement | null) => void>>>({})

    // [DOC: auth/#stable-field-refs]
    const registerField = useCallback((field: PersonalField) => {
        refCallbacks.current[field] ??= (el) => {refs.current[field] = el}
        return refCallbacks.current[field]!
    }, [])

    // a field the user is editing must never be overwritten by an auth state re-emit
    useEffect(() => {
        if (loading || !user) return
        dispatch((prev) => ({
            ...(prev.nameEdit ? {} : {name: user.displayName || ''}),
            ...(prev.emailEdit ? {} : {email: user.email || ''}),
        }))
    }, [loading, user])

    // [DOC: #email-status]
    useEffect(() => {
        if (!user) return
        const userDoc = doc(db, 'users', user.uid)
        return onSnapshot(userDoc, (snapshot) => {
            const data = snapshot.data()
            // a change can land on the account without ever reaching the mirror, if the tab that
            // applied it lost its own session as a side effect; a signed-in session already on the
            // matching address is proof enough to self-heal instead of staying "pending" forever
            const settled = Boolean(data?.pendingEmail) && data?.pendingEmail === user.email
            const pendingEmail: string = settled ? '' : data?.pendingEmail ?? ''
            const status: EmailStatus = pendingEmail ? 'pending'
                : user.emailVerified ? 'verified'
                : data?.emailStatus === 'pending' ? 'pending' : 'unverified'
            dispatch({emailStatus: status, pendingEmail})
            if (!pendingEmail && (data?.emailStatus !== status || settled)) {
                setDoc(userDoc, {emailStatus: status, pendingEmail: deleteField(), ...(settled ? {email: user.email} : {})}, {merge: true}).catch(() => {})
            }
        }, () => dispatch({emailStatus: user.emailVerified ? 'verified' : 'unverified', pendingEmail: ''}))
    }, [user])

    // [DOC: #email-failure]
    useEffect(() => {
        if (!emailError) return
        dispatch({error: authError(emailError, {}), emailEdit: false, email: user?.email || ''})
        shake(refs.current.email ?? null)
        router.replace('/settings', {scroll: false})
    }, [emailError, user, router])

    useEffect(() => {
        if (state.cooldown <= 0) return
        const id = setTimeout(() => dispatch({cooldown: state.cooldown - 1}), 1000)
        return () => clearTimeout(id)
    }, [state.cooldown])

    const setValue = useCallback((field: PersonalField, value: string) => {
        clearShake(refs.current[field] ?? null)
        dispatch({[field]: value, ...(field === 'email' ? {error: ''} : {})} as Partial<State>)
    }, [])

    const toggleEdit = useCallback((field: PersonalField) => {
        clearShake(refs.current[field] ?? null)
        const initial = (field === 'name' ? user?.displayName : user?.email) || ''
        dispatch((prev) => prev[`${field}Edit`]
            ? {[`${field}Edit`]: false, [field]: initial} as Partial<State>
            : {[`${field}Edit`]: true, error: ''} as Partial<State>)
        setTimeout(() => refs.current[field]?.focus(), 0)
    }, [user])

    // [DOC: #email-change]
    const save = useCallback(async () => {
        if (!user) return

        const name = state.name.trim()
        const email = state.email.trim()
        const nameChanged = state.nameEdit && name !== (user.displayName || '')
        const emailChanged = state.emailEdit && email !== (user.email || '')

        if (nameChanged && !validateName(name)) return shake(refs.current.name ?? null)
        if (emailChanged && !validateEmail(email)) {
            shake(refs.current.email ?? null)
            return dispatch({error: 'Email address is entered incorrectly'})
        }

        if (nameChanged) {
            dispatch({nameSaving: true})
            try {
                await updateProfile(user, {displayName: name})
                await updateDoc(doc(db, 'users', user.uid), {displayName: name, updatedAt: new Date()})
                dispatch({nameEdit: false, nameSaving: false})
            } catch {
                dispatch({nameSaving: false})
                shake(refs.current.name ?? null)
            }
        }

        if (!emailChanged) return

        dispatch({emailSaving: true, error: ''})
        try {
            await sendEmailChange(user, email)
            await setDoc(doc(db, 'users', user.uid), {emailStatus: 'pending', pendingEmail: email}, {merge: true})
            dispatch({emailEdit: false, emailSaving: false})
        } catch (e) {
            dispatch({emailSaving: false, email: user.email || '', error: authError((e as {code?: string}).code ?? '', {login: refs.current.email})})
        }
    }, [user, state])

    // [DOC: #confirm-button]
    const confirmEmail = useCallback(async () => {
        if (!user || state.cooldown > 0) return
        dispatch({cooldown: RESEND_DELAY, error: ''})
        try {
            await sendVerification(user)
            await setDoc(doc(db, 'users', user.uid), {emailStatus: 'pending', pendingEmail: deleteField()}, {merge: true})
        } catch (e) {
            dispatch({cooldown: 0, error: authError((e as {code?: string}).code ?? '', {})})
        }
    }, [user, state.cooldown])

    const notice = useMemo(() => state.emailStatus !== 'pending'
        ? ''
        : `A confirmation link was sent to ${state.pendingEmail || user?.email || 'your email'}, follow it to finish`,
    [state.emailStatus, state.pendingEmail, user])

    // the address change stays in flight until its link is followed, so the spinner outlives this tab
    const emailPending = state.emailSaving || Boolean(state.pendingEmail)
    const changed = !loading && ((state.nameEdit && state.name !== (user?.displayName || '')) || (state.emailEdit && state.email !== (user?.email || '')))

    return useMemo(() => ({state, notice, emailPending, changed, registerField, setValue, toggleEdit, save, confirmEmail}),
        [state, notice, emailPending, changed, registerField, setValue, toggleEdit, save, confirmEmail])
}
