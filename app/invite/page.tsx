'use client'

import {doc, updateDoc, deleteDoc, arrayUnion, collection, query, where, getDocs} from 'firebase/firestore'
import {useRouter, useSearchParams} from 'next/navigation'
import {getAuth, onAuthStateChanged} from 'firebase/auth'
import {useEffect, useState, useCallback} from 'react'
import {Film, Loader} from 'lucide-react'
import {User} from 'firebase/auth'
import {db} from '@/lib/firebase'

const auth = getAuth()

type InviteData = {
    id: string
    groupId: string
    role?: 'editor' | 'viewer'
}

export default function InvitePage() {
    const searchParams = useSearchParams()
    const navigate = useRouter()
    
    const [status, setStatus] = useState<string>('loading')
    const [user, setUser] = useState<User | null>(null)

    const token = searchParams.get('token')

    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
            setUser(currentUser)
            if (!currentUser) {
                setStatus('unauthorized')
            }
        })
        return () => unsubscribe()
    }, [])

    const handleAcceptInvite = useCallback(async (inviteData: InviteData, currentUser: User) => {
        setStatus('processing')

        try {
            const groupRef = doc(db, 'groups', inviteData.groupId)
            
            const updateData: any = {
                members: arrayUnion(currentUser.uid)
            }

            if (inviteData.role === 'editor') {
                updateData.editors = arrayUnion(currentUser.uid)
            }

            await updateDoc(groupRef, updateData)

            const inviteRef = doc(db, 'invites', inviteData.id)
            await deleteDoc(inviteRef)

            setStatus('success')
            
            navigate.push(`/dashboard?groupId=${inviteData.groupId}`)
        } catch (e) {
            console.error('Error', e)
            setStatus('error')
        }
    }, [navigate])

    useEffect(() => {
        if (!user || !token || status === 'processing' || status === 'success') return

        const findAndAccept = async () => {
            setStatus('loading')
            if (!user.email) {
                setStatus('error')
                return
            }
            try {
                const q = query(
                    collection(db, 'invites'), 
                    where('token', '==', token),
                    where('email', '==', user.email.toLowerCase())
                )
                const snapshot = await getDocs(q)

                if (snapshot.empty) {
                    setStatus('error')
                    return
                }

                const docSnapshot = snapshot.docs[0]
                const docData = docSnapshot.data()

                if (docData.expiresAt?.toDate() < new Date()) {
                    setStatus('error')
                    return
                }

                const inviteFullData: InviteData = {
                    id: docSnapshot.id,
                    groupId: docData.groupId,
                    role: docData.role,
                }
                await handleAcceptInvite(inviteFullData, user)

            } catch (e) {
                console.error(e)
                setStatus('error')
            }
        }

        findAndAccept()
    }, [user, token, handleAcceptInvite])

    if (status === 'unauthorized') {
        () => navigate.push('/auth?mode=login')
    }

    return (
        <div className='h-screen w-screen overflow-y-auto bg-gradient-to-br from-[#030712] to-[#2f0d68] flex max-md:flex-col items-center min-md:justify-center min-md:gap-24 max-md:gap-4'>
            <div className='flex flex-col items-center gap-4'>
                <div className='cursor-pointer login-logo'>
                    <Film className='text-[#a684ff] min-md:h-120 min-md:w-120 max-md:h-50 max-md:w-50 hover:scale-[1.05] hover:text-[#ffeafe] transition-[colors, transform] duration-300 cursor-pointer'/>
                </div>
                <h1 className='text-white text-2xl'>What to Watch</h1> <Loader className='text-[#959dab] animate-spin'/>
            </div>
        </div>
    )
}