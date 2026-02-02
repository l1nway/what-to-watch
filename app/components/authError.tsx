import {shake} from './shake'

interface AuthRefs {
    login?: HTMLInputElement | null
    password?: HTMLInputElement | null
    old?: HTMLInputElement | null
    new?: HTMLInputElement | null
    confirm?: HTMLInputElement | null
}

export const authError = (
    code: string,
    refs: AuthRefs
) => {
    let message = 'An error occurred. Please try again.'

    switch (code) {
        case 'auth/invalid-credential':
            message = 'Incorrect login or password' 
            if (refs.login) shake(refs.login)
            if (refs.password) shake(refs.password)
            if (refs.old) shake(refs.old)
        break

        case 'auth/user-not-found':
            message = 'Such user does not exist'
            if (refs.login) shake(refs.login)
        break

        case 'auth/wrong-password':
            message = 'Incorrect password'
            if (refs.password) shake(refs.password)
            if (refs.old) shake(refs.old)
        break

        case 'auth/user-disabled':
            message = 'Account was blocked'
            if (refs.login) shake(refs.login)
        break

        case 'auth/email-already-in-use':
            message = 'Email is already in use'
            if (refs.login) shake(refs.login)
        break

        case 'auth/invalid-email':
            message = 'Invalid email'
            if (refs.login) shake(refs.login)
        break

        case 'auth/weak-password':
            message = 'Password is too simple'
            if (refs.new) shake(refs.new)
            if (refs.password) shake(refs.password)
        break

        case 'auth/too-many-requests':
            message = 'Too many requests'
        break

        case 'auth/network-request-failed':
            message = 'Network error'
        break

        default:
            message = 'An error occurred. Please try again.'
        break
    }

    return message
}