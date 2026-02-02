import {createUserWithEmailAndPassword, signInWithEmailAndPassword, updateProfile} from "firebase/auth"
import {auth} from "./firebase"

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