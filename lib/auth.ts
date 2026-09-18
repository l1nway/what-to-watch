import {createUserWithEmailAndPassword, signInWithEmailAndPassword, updateProfile, sendPasswordResetEmail, verifyPasswordResetCode, confirmPasswordReset, sendEmailVerification, verifyBeforeUpdateEmail, applyActionCode, User} from "firebase/auth"
import {auth} from "./firebase"

const origin = () => typeof window === 'undefined' ? '' : window.location.origin

export const signUp = (email: string, password: string) => {
    return createUserWithEmailAndPassword(auth, email, password)
}

export const signIn = (email: string, password: string) => {
    return signInWithEmailAndPassword(auth, email, password)
}

export const updateUser = async (name: string) => {
    if (!auth.currentUser) return
    await updateProfile(auth.currentUser, {displayName: name})
}

// firebase allows a single action url for every template, so all three land on /reset [DOC: app/reset/#action-modes]
const action = () => ({url: `${origin()}/reset`, handleCodeInApp: false})

export const sendReset = (email: string) => sendPasswordResetEmail(auth, email, action())

export const verifyReset = (oobCode: string) => verifyPasswordResetCode(auth, oobCode)

export const confirmReset = (oobCode: string, password: string) => confirmPasswordReset(auth, oobCode, password)

// verification of the address the account already has (mode=verifyEmail)
export const sendVerification = (user: User) => sendEmailVerification(user, action())

// the new address only replaces the old one once its owner follows the link (mode=verifyAndChangeEmail)
export const sendEmailChange = (user: User, email: string) => verifyBeforeUpdateEmail(user, email, action())

export const applyCode = (oobCode: string) => applyActionCode(auth, oobCode)

// exchanges the firebase id token for the httpOnly session cookie the middleware reads
export const createSession = async (user: User) => {
    const idToken = await user.getIdToken()
    await fetch('/api/login', {method: 'POST', body: JSON.stringify({idToken})})
}
