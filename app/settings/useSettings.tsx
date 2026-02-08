import {updateProfile, User, EmailAuthProvider, reauthenticateWithCredential, updatePassword, signOut} from 'firebase/auth'
import {validateName, validatePassword, validateConfirm} from '../components/validation'
import {useState, useEffect, useCallback, useRef} from 'react'
import {shake, clearShake} from '../components/shake'
import {authError} from '../components/authError'
import {doc, updateDoc} from 'firebase/firestore'
import {PasswordField} from './settingsTypes'
import {useRouter} from 'next/navigation'
import {auth} from '@/lib/firebase'
import {db} from '@/lib/firebase'

export default function useSettings(user: User | null, loading: boolean) {
    const router = useRouter()

    const logout = useCallback(async () => {
        await signOut(auth)
        await fetch('/api/logout', {method: 'POST'})
        router.push('/auth?mode=login')
    }, [router])

    // input fields for changing password
    const [passwords, setPasswords] = useState<PasswordField[]>([
        {
            password: 'old',
            title: 'Old password',
            placeholder: 'Enter your old password',
            error: false,
            message: '',
            value: ''
        },{
            password: 'new',
            title: 'New password',
            placeholder: 'Enter your new password',
            error: false,
            message: '',
            value: ''
        },{
            password: 'confirm',
            title: 'Confirm password',
            placeholder: 'Confirm your new password',
            error: false,
            message: '',
            value: ''
    }])

    const [passwordEdit, setPasswordEdit] = useState<boolean>(false)
    const [passwordSaving, setPasswordSaving] = useState<boolean>(false)

    const passwordsRefs = useRef<Record<string, HTMLInputElement | null>>({})

    const onPasswordChange = useCallback((index: number, newValue: string) => {
        clearShake(passwordsRefs.current[passwords[index].password])
        setPasswords(prev => prev.map((item, i) => 
            i === index ? {...item, value: newValue, error: false} : item
        ))
    }, [passwords])

    const savePassword = useCallback(async () => {
        if (!user || !user.email) return

        const oldPass = passwords.find(p => p.password === 'old')?.value || ''
        const newPass = passwords.find(p => p.password === 'new')?.value || ''
        const confirmPass = passwords.find(p => p.password === 'confirm')?.value || ''

        const validationResults = {
            old: validateName(oldPass) ? '' : 'Please enter your old password',
            new: validatePassword(newPass) ? '' : 'Password must be at least 8 characters',
            confirm: validateConfirm(newPass, confirmPass) ? '' : 'Passwords do not match'
        }

        const hasError = Object.values(validationResults).some(msg => msg !== '')
        
        setPasswords(prev => prev.map(field => ({
            ...field,
            error: validationResults[field.password] !== '',
            message: validationResults[field.password]
        })))

        if (hasError) {
            (Object.keys(validationResults) as Array<keyof typeof validationResults>).forEach(key => {
                if (validationResults[key] !== '') { 
                    const element = passwordsRefs.current[key]
                    if (element) shake(element)
                }
            })
            return
        }
        setPasswordSaving(true)
        try {
            const credential = EmailAuthProvider.credential(user.email, oldPass)
            await reauthenticateWithCredential(user, credential)

            await updatePassword(user, newPass)

            setPasswords(prev => prev.map(p => ({...p, value: '', error: false})))
            setPasswordEdit(false)
            setPasswordSaving(false)
        } catch (error: any) {
            const errorMessage = authError(error.code, {
                old: passwordsRefs.current['old'],
                new: passwordsRefs.current['new'],
            })

            setPasswords(prev => prev.map(p => {
                if (p.password === 'old' && (error.code.includes('password') || error.code.includes('credential'))) {
                    return {...p, error: true, message: errorMessage}
                }
                if (p.password === 'new' && error.code === 'auth/weak-password') {
                    return {...p, error: true, message: errorMessage}
                }
                return p
            }))
        } finally {
            setPasswordSaving(false)
        }
    }, [passwords, user, shake])

    // 

    const inputRefs = useRef<Record<string, HTMLInputElement | null>>({})

    // personal data input fields
    const [personal, setPersonal] = useState<{field: string, edited: boolean, value: string, loading: boolean}[]>([{
        field: 'name',
        edited: false,
        value: '',
        loading: false
    }, {
        field: 'email',
        edited: false,
        value: '',
        loading: false
    }])

    useEffect(() => {
        if (!loading && user) {
            setPersonal(prev => prev.map(item => {
                if (item.field === 'name') {
                    return {...item, value: user.displayName || ''}
                }
                if (item.field === 'email') {
                    return {...item, value: user.email || ''}
                }
                return item
            }))
        }
    }, [loading, user])

    useEffect(() => {
        if (passwordEdit) {
            const timeout = setTimeout(() => {
                const firstPasswordInput = passwordsRefs.current['old']
                if (firstPasswordInput) {
                    firstPasswordInput.focus()
                }
            }, 0)

            return () => clearTimeout(timeout)
        } else {
            setPasswords(prev => prev.map(p => ({...p, error: false, value: ''})))
        }
    }, [passwordEdit])

    const toggleEdit = useCallback((index: number) => {
        clearShake(inputRefs.current[personal[index].field])
        setPersonal(prev => prev.map((item, i) => {
            if (i === index) {
                const closing = item.edited
                let revertedValue = item.value

                if (closing) {
                    revertedValue = (item.field === 'name' ? user?.displayName : user?.email) || ''
                }

                return {...item, edited: !item.edited, value: revertedValue}
            }
            return item
        }))

        setTimeout(() => {
            const fieldName = personal[index].field
            const targetInput = inputRefs.current[fieldName]
            if (targetInput) targetInput.focus()
        }, 0)
    }, [user, personal])

    const onChange = useCallback((index: number, newValue: string) => {
        clearShake(inputRefs.current[personal[index].field])
        setPersonal(prev => prev.map((item, i) => 
            i === index ? {...item, value: newValue} : item
        ))
    }, [personal, inputRefs])

    const saveName = useCallback(async () => {
        if (!user) return

        const nameField = personal.find(f => f.field === 'name')
        const newName = nameField?.value.trim()
        
        if (!newName) {
            shake(inputRefs.current['name'])
            return
        }

        if (!newName || newName === user.displayName) return

        setPersonal(prev => prev.map(f => 
            f.field === 'name' ? {...f, loading: true} : f
        ))
        try {
            await updateProfile(user, {displayName: newName})

            const userDocRef = doc(db, 'users', user.uid)
            await updateDoc(userDocRef, {
                displayName: newName,
                updatedAt: new Date()
            })
            
            setPersonal(prev => prev.map(f => 
                f.field === 'name' ? {...f, edited: false, loading: false} : f
            ))
        } catch (error) {
            console.error('Failed to update name:', error)
            setPersonal(prev => prev.map(f => 
                f.field === 'name' ? {...f, loading: false} : f
            ))
        }
    }, [user, personal])

    return ({saveName, savePassword, router, user, inputRefs, passwordsRefs, personal, onChange, toggleEdit, passwords, onPasswordChange, setPasswordEdit, passwordEdit, passwordSaving, logout})
}