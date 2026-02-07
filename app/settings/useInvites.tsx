import {QuerySnapshot, DocumentData, query, collection, where, onSnapshot, getDocs, deleteDoc} from 'firebase/firestore'
import {FirestoreList, FirestoreGroup, FirestoreInvite, EnrichedGroup, FullInvite} from './settingsTypes'
import {useState, useEffect, useCallback, useMemo} from 'react'
import {writeBatch, doc, arrayUnion} from 'firebase/firestore'
import {User} from 'firebase/auth'
import {db} from '@/lib/firebase'

export default function useInvites(user: User | null) {

    const [fullInvites, setFullInvites] = useState<FullInvite[]>([])

    // specification of data that will be requested
    const q = useMemo(() => {
        if (!user?.email) return null    
        return query(
            collection(db, 'invites'),
            where('email', '==', user?.email.toLowerCase()),
            where('status', '==', 'pending')
    )}, [user])

    // request for invitation data
    const invitesRequest = useCallback(async (snapshot: QuerySnapshot<DocumentData>) => {
        const invitesData = snapshot.docs.map(doc => ({id: doc.id, ...doc.data()})) as FirestoreInvite[]
        const groupIds = [...new Set(invitesData.map(inv => inv.groupId))]

        if (groupIds.length > 0) {
            try {
                // underscores (__ __) are needed to refer directly to object key; name is unique key ID
                const groupsQuery = query(collection(db, 'groups'), where('__name__', 'in', groupIds))
                const groupsSnap = await getDocs(groupsQuery)
                const groupsMap: Record<string, FirestoreGroup> = {}
                
                let allListIds: string[] = []
                
                // unpacking and filtering data to desired
                groupsSnap.forEach(doc => {
                    const data = doc.data() as Omit<FirestoreGroup, 'id'>
                    groupsMap[doc.id] = {id: doc.id, ...data}
                    if (data.lists) {
                        allListIds = [...allListIds, ...data.lists]
                    }
                })

                let listsMap: Record<string, FirestoreList> = {}
                if (allListIds.length > 0) {
                    const uniqueListIds = [...new Set(allListIds)]
                    const listsQuery = query(collection(db, 'lists'), where('__name__', 'in', uniqueListIds))
                    const listsSnap = await getDocs(listsQuery)
                    listsSnap.forEach(doc => {
                        listsMap[doc.id] = {id: doc.id, ...doc.data()} as FirestoreList
                    })
                }

                const mergedData = invitesData.map(invite => {
                    const group = groupsMap[invite.groupId] || null
                    
                    if (group && group.lists) {
                        const enrichedGroup = {
                            ...group,
                            lists: group.lists
                                .map(id => listsMap[id])
                                .filter(((l): l is FirestoreList => Boolean(l)))
                        }

                        return {
                            ...invite,
                            groupData: enrichedGroup
                        }
                    }

                    return {
                        ...invite,
                        groupData: group ? {...group, lists: []} as EnrichedGroup : null
                    }
                })

                setFullInvites(mergedData)
            } catch (error) {
                console.error('Error fetching data for invites:', error)
            }
        } else {
            setFullInvites([])
        }
    }, [setFullInvites])

    // agree to join a group
    const acceptInvite = useCallback(async (invite: FullInvite) => {
        if (!user) return
        const batch = writeBatch(db)

        const groupRef = doc(db, 'groups', invite.groupId)

        const updateData: any = {
            members: arrayUnion(user.uid)
        }

        if (invite.role === 'editor') {
            updateData.editors = arrayUnion(user.uid)
        }

        batch.update(groupRef, updateData)

        const inviteRef = doc(db, 'invites', invite.id)
        batch.delete(inviteRef)

        try {
            await batch.commit()
        } catch (e) {
            console.error('Error accepting invite:', e)
        }
    }, [user])

    // refusal to join a group
    const rejectInvite = useCallback(async (inviteId: string) => {
        try {
            const inviteRef = doc(db, 'invites', inviteId)
            await deleteDoc(inviteRef)
        } catch (e) {
            console.error('Error rejecting invite:', e)
        }
    }, [user])

    useEffect(() => {
        if (!q) return

        const unsub = onSnapshot(q, (snapshot) => {
            invitesRequest(snapshot)
        })

        return () => unsub()
    }, [q, invitesRequest])

    return {fullInvites, acceptInvite, rejectInvite}
}