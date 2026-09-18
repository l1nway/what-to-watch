'use client'

import {validateName, validatePassword, validateConfirm} from '../components/validation'
import {EmailAuthProvider, reauthenticateWithCredential, updatePassword, User} from 'firebase/auth'
import {useCallback, useEffect, useMemo, useReducer, useRef} from 'react'
import {shake, clearShake} from '../components/shake'
import {authError} from '../components/authError'
import {PasswordField} from './settingsTypes'
import {merge} from '@/utils/reducer'

export const PASSWORD_FIELDS: {field: PasswordField; title: string; placeholder: string}[] = [
    {field: 'old', title: 'Old password', placeholder: 'Enter your old password'},
    {field: 'new', title: 'New password', placeholder: 'Enter your new password'},
    {field: 'confirm', title: 'Confirm password', placeholder: 'Confirm your new password'},
]

type State = {
    old: string
    new: string
    confirm: string
    oldError: string
    newError: string
    confirmError: string
    edit: boolean
    saving: boolean
}

const initialState: State = {old: '', new: '', confirm: '', oldError: '', newError: '', confirmError: '', edit: false, saving: false}

export default function usePassword(user: User | null) {
    const [state, dispatch] = useReducer(merge<State>, initialState)

    const refs = useRef<Partial<Record<PasswordField, HTMLInputElement | null>>>({})
    const refCallbacks = useRef<Partial<Record<PasswordField, (el: HTMLInputElement | null) => void>>>({})

    // [DOC: auth/#stable-field-refs]
    const registerField = useCallback((field: PasswordField) => {
        refCallbacks.current[field] ??= (el) => {refs.current[field] = el}
        return refCallbacks.current[field]!
    }, [])

    useEffect(() => {
        if (!state.edit) return
        const id = setTimeout(() => refs.current.old?.focus(), 0)
        return () => clearTimeout(id)
    }, [state.edit])

    const setEdit = useCallback((edit: boolean) => dispatch(edit ? {edit} : initialState), [])

    const setValue = useCallback((field: PasswordField, value: string) => {
        clearShake(refs.current[field] ?? null)
        dispatch({[field]: value, [`${field}Error`]: ''} as Partial<State>)
    }, [])

    const save = useCallback(async () => {
        if (!user?.email) return

        const errors = {
            oldError: validateName(state.old) ? '' : 'Please enter your old password',
            newError: validatePassword(state.new) ? '' : 'Password must be at least 8 characters',
            confirmError: validateConfirm(state.new, state.confirm) ? '' : 'Passwords do not match',
        }

        // validation always runs before the dispatch that stores its outcome
        if (Object.values(errors).some(Boolean)) {
            dispatch(errors)
            PASSWORD_FIELDS.forEach(({field}) => {if (errors[`${field}Error`]) shake(refs.current[field] ?? null)})
            return
        }

        dispatch({saving: true, ...errors})
        try {
            await reauthenticateWithCredential(user, EmailAuthProvider.credential(user.email, state.old))
            await updatePassword(user, state.new)
            dispatch(initialState)
        } catch (e) {
            const code = (e as {code?: string}).code ?? ''
            const message = authError(code, {old: refs.current.old, new: refs.current.new})
            dispatch({
                saving: false,
                ...(code === 'auth/weak-password' ? {newError: message} : {oldError: message}),
            })
        }
    }, [user, state])

    const empty = !state.old.trim() || !state.new.trim() || !state.confirm.trim()

    return useMemo(() => ({state, empty, registerField, setEdit, setValue, save}), [state, empty, registerField, setEdit, setValue, save])
}
