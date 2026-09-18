'use client'

import {useCallback, useEffect, useMemo, useReducer, useRef} from 'react'
import {validateEmail, validateName, validatePassword, validateConfirm} from '../components/validation'
import {signIn, signUp, updateUser, sendReset, confirmReset, createSession} from '@/lib/auth'
import {useRouter, useSearchParams} from 'next/navigation'
import {shake, clearShake} from '../components/shake'
import {authError} from '../components/authError'
import {merge} from '@/utils/reducer'

export type Mode = 'login' | 'register' | 'forgot' | 'reset'
export type FieldName = 'name' | 'email' | 'password' | 'confirm'

export type State = {
    name: string
    email: string
    password: string
    confirm: string
    showPassword: boolean
    showConfirm: boolean
    errorStatus: boolean
    errorMessage: string
    infoStatus: boolean
    infoMessage: string
    loading: boolean
    switching: boolean
    cooldown: number
}

const initialState: State = {
    name: '', email: '', password: '', confirm: '',
    showPassword: false, showConfirm: false,
    errorStatus: false, errorMessage: '',
    infoStatus: false, infoMessage: '',
    loading: false, switching: false, cooldown: 0,
}

export const MODE_FIELDS: Record<Mode, FieldName[]> = {
    login: ['email', 'password'],
    register: ['name', 'email', 'password', 'confirm'],
    forgot: ['email'],
    reset: ['password', 'confirm'],
}

export const SUBMIT_TEXT: Record<Mode, string> = {
    login: 'Sign in',
    register: 'Create account',
    forgot: 'Send mail',
    reset: 'Save password',
}

const RESEND_DELAY = 60
const SWITCH_SPINNER_DELAY = 250

const parseMode = (value: string | null): Mode =>
    value === 'register' || value === 'forgot' || value === 'reset' ? value : 'login'

const validate = (mode: Mode, state: State): {field: FieldName; message: string} | null => {
    if (mode !== 'reset' && !validateEmail(state.email)) return {field: 'email', message: 'Email address is entered incorrectly'}
    if (mode === 'forgot') return null
    if (mode === 'register' && !validateName(state.name)) return {field: 'name', message: 'Please enter your name'}
    if (!validatePassword(state.password)) return {field: 'password', message: 'Password is too simple'}
    if (mode !== 'login' && !validateConfirm(state.password, state.confirm)) return {field: 'confirm', message: 'Passwords do not match'}
    return null
}

export function useAuthForm(reset?: {oobCode: string; email: string}) {
    const [state, dispatch] = useReducer(merge<State>, initialState, (base) => ({...base, email: reset?.email ?? ''}))
    const searchParams = useSearchParams()
    const router = useRouter()

    const returnTo = searchParams.get('returnTo')
    const emailChanged = searchParams.get('emailChanged')
    const mode: Mode = reset ? 'reset' : parseMode(searchParams.get('mode'))

    const refs = useRef<Partial<Record<FieldName, HTMLInputElement | null>>>({})
    const switchTimer = useRef<NodeJS.Timeout | null>(null)

    useEffect(() => () => {if (switchTimer.current) clearTimeout(switchTimer.current)}, [])

    // the tab spinner only makes sense while the mode navigation is still pending
    useEffect(() => {
        if (switchTimer.current) clearTimeout(switchTimer.current)
        dispatch({switching: false})
    }, [mode])

    useEffect(() => {
        if (state.cooldown <= 0) return
        const id = setTimeout(() => dispatch({cooldown: state.cooldown - 1}), 1000)
        return () => clearTimeout(id)
    }, [state.cooldown])

    // an address change signs the tab out (settings/README.md#email-status), so it hands off the news here
    useEffect(() => {
        if (!emailChanged) return
        dispatch({infoStatus: true, infoMessage: 'Your email has been changed, sign in with your new address'})
        router.replace('/auth?mode=login', {scroll: false})
    }, [emailChanged, router])

    // [DOC: #stable-field-refs]
    const refCallbacks = useRef<Partial<Record<FieldName, (el: HTMLInputElement | null) => void>>>({})
    const registerField = useCallback((field: FieldName) => {
        refCallbacks.current[field] ??= (el) => {refs.current[field] = el}
        return refCallbacks.current[field]!
    }, [])

    const setField = useCallback((field: FieldName, value: string) => {
        clearShake(refs.current[field] ?? null)
        dispatch({[field]: value, errorStatus: false} as Partial<State>)
    }, [])

    const toggleVisibility = useCallback((field: 'showPassword' | 'showConfirm') =>
        dispatch((prev) => ({[field]: !prev[field]}) as Partial<State>), [])

    const switchMode = useCallback((next: Mode) => {
        Object.values(refs.current).forEach((el) => clearShake(el ?? null))
        dispatch({errorStatus: false, infoStatus: false})
        if (switchTimer.current) clearTimeout(switchTimer.current)
        switchTimer.current = setTimeout(() => dispatch({switching: true}), SWITCH_SPINNER_DELAY)
        router.replace(`/auth?mode=${next}`, {scroll: false})
    }, [router])

    const submit = useCallback(async () => {
        const invalid = validate(mode, state)
        if (invalid) {
            shake(refs.current[invalid.field] ?? null)
            dispatch({errorStatus: true, errorMessage: invalid.message, loading: false})
            return
        }

        dispatch({loading: true, errorStatus: false, infoStatus: false})

        try {
            // [DOC: #forgot-flow]
            if (mode === 'forgot') {
                await sendReset(state.email)
                dispatch({loading: false, infoStatus: true, infoMessage: 'Check your email and follow the link', cooldown: RESEND_DELAY})
                return
            }

            // [DOC: #reset-flow]
            if (mode === 'reset') {
                await confirmReset(reset!.oobCode, state.password)
                const credential = await signIn(reset!.email, state.password)
                await createSession(credential.user)
                router.push('/dashboard')
                return
            }

            const credential = mode === 'register' ? await signUp(state.email, state.password) : await signIn(state.email, state.password)
            if (mode === 'register') await updateUser(state.name)
            await createSession(credential.user)

            router.push(returnTo || '/dashboard')
        } catch (e) {
            const code = (e as {code?: string}).code ?? ''
            dispatch({
                loading: false,
                errorStatus: true,
                errorMessage: authError(code, {login: refs.current.email, password: refs.current.password, new: refs.current.password, confirm: refs.current.confirm}),
            })
        }
    }, [mode, state, reset, returnTo, router])

    return useMemo(
        () => ({mode, state, fields: MODE_FIELDS[mode], registerField, setField, toggleVisibility, switchMode, submit}),
        [mode, state, registerField, setField, toggleVisibility, switchMode, submit]
    )
}
