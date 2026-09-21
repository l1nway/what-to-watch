'use client'

import {doc, updateDoc, deleteDoc, arrayUnion, collection, query, where, getDocs} from 'firebase/firestore'
import TokenScreen, {useTokenGuard} from '../components/tokenScreen'
import {useRouter, useSearchParams} from 'next/navigation'
import {useAuth} from '../components/authProvider'
import {useEffect, useRef, useState} from 'react'
import {db} from '@/lib/firebase'

// [DOC: auth/#invite-route]
export default function Invite() {
    const searchParams = useSearchParams()
    const {user, loading} = useAuth()
    const router = useRouter()

    const token = searchParams.get('token')
    const [error, setError] = useState<string>('')
    const handled = useRef<boolean>(false)

    useEffect(() => {
        if (!token || loading || !user?.email || handled.current) return
        handled.current = true

        const accept = async () => {
            try {
                const snapshot = await getDocs(query(collection(db, 'invites'), where('token', '==', token)))
                if (snapshot.empty) return setError('This invite does not exist')

                const invite = snapshot.docs[0]
                const data = invite.data()

                if (data.expiresAt?.toDate() < new Date()) return setError('This invite has expired')
                if (data.email && data.email !== user.email!.toLowerCase()) return setError('This invite was issued for another account')

                await updateDoc(doc(db, 'groups', data.groupId), {
                    members: arrayUnion(user.uid),
                    ...(data.role === 'editor' ? {editors: arrayUnion(user.uid)} : {}),
                    updatedBy: user.uid
                })
                await deleteDoc(doc(db, 'invites', invite.id))

                router.replace(`/dashboard?groupId=${data.groupId}`)
            } catch {
                setError('Failed to accept the invite')
            }
        }

        accept()
    }, [token, user, loading, router])

    useTokenGuard(!token || Boolean(error))

    return <TokenScreen error={token ? error : 'The invite link is missing'}/>
}
