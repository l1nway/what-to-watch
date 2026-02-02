'use client'

import {useEffect, useState} from 'react'
import {useRouter, useSearchParams} from 'next/navigation'
import {collection, query, where, getDocs, updateDoc, doc, arrayUnion, deleteDoc} from 'firebase/firestore'
import {db, auth} from '@/lib/firebase'
import {onAuthStateChanged} from 'firebase/auth'

export default function InviteHandler() {
    const searchParams = useSearchParams()
    const router = useRouter()
    const token = searchParams.get('token')
    const [status, setStatus] = useState('Verifying invitation...')

    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, async (user) => {
            if (!token) return

            if (!user) {
                const returnUrl = encodeURIComponent(`/invite?token=${token}`)
                router.push(`/auth?mode=register&returnTo=${returnUrl}`)
                return
            }

            try {
                const q = query(collection(db, 'invites'), where('token', '==', token))
                const snap = await getDocs(q)

                if (snap.empty) {
                    setStatus('Invitation not found or already used.')
                    return
                }

                const inviteData = snap.docs[0].data()
                const inviteDocRef = snap.docs[0].ref

                if (inviteData.expiresAt.toDate() < new Date()) {
                    setStatus('Invitation has expired.')
                    return
                }

                if (user.email !== inviteData.email) {
                    setStatus(`This invite was sent to ${inviteData.email}, but you are logged in as ${user.email}`)
                    return
                }

                const groupRef = doc(db, 'groups', inviteData.groupId)
                await updateDoc(groupRef, {
                    members: arrayUnion(user.uid)
                })

                await deleteDoc(inviteDocRef)

                setStatus('Success! Joining the group...')
                router.push(`/dashboard/`)

            } catch (e) {
                console.error(e);
                setStatus('An error occurred.')
            }
        })

        return () => unsubscribe()
    }, [token, router])

    return (
        <div>
            aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa
        </div>
    )
}