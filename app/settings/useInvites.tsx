import {QuerySnapshot, DocumentData, query, collection, where, onSnapshot, getDocs, deleteDoc, Timestamp, getDoc} from 'firebase/firestore'
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

        const now = Timestamp.now()

        return query(
            collection(db, 'invites'),
            where('email', '==', user?.email.toLowerCase()),
            where('status', '==', 'pending'),
            where('expiresAt', '>', now)
    )}, [user])

    const invitesRequest = useCallback(async (snapshot: QuerySnapshot<DocumentData>) => {
        const invitesData = snapshot.docs.map(doc => ({id: doc.id, ...doc.data()})) as FirestoreInvite[]
        
        const now = new Date()
        
        const validInvites = invitesData.filter(inv => {
            const expiresAt = inv.expiresAt instanceof Timestamp ? inv.expiresAt.toDate() : inv.expiresAt
            return expiresAt > now
        })

        if (validInvites.length > 0) {
            try {
                const groupsPromises = validInvites.map(async (invite) => {
                    const groupRef = doc(db, 'groups', invite.groupId)
                    const groupSnap = await getDoc(groupRef)

                    if (groupSnap.exists()) {
                         const groupData = {id: groupSnap.id, ...groupSnap.data()} as FirestoreGroup
                         return {invite, group: groupData}
                    }
                    return {invite, group: null}
                })

                const results = await Promise.all(groupsPromises)
                
                let allListIds: string[] = []
                const validResults = results.filter(r => r.group !== null)
                
                validResults.forEach(r => {
                    if (r.group?.lists) {
                        allListIds = [...allListIds, ...r.group.lists]
                    }
                })

                let listsMap: Record<string, FirestoreList> = {}
                
                if (allListIds.length > 0) {
                     const uniqueListIds = [...new Set(allListIds)]
                     
                     const listPromises = uniqueListIds.map(async (listId) => {
                        try {
                            const listSnap = await getDoc(doc(db, 'lists', listId))
                            if (listSnap.exists()) {
                                return {id: listSnap.id, ...listSnap.data()} as FirestoreList
                            }
                        } catch (e) {
                            console.warn(`Cannot load list ${listId}`, e)
                        }
                        return null
                     })
                     
                     const loadedLists = await Promise.all(listPromises)
                     loadedLists.forEach(l => {
                        if (l) listsMap[l.id] = l
                     })
                }

                const mergedData = validResults.map(({invite, group}) => {
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

                setFullInvites(mergedData as FullInvite[])
            } catch (error) {
                console.error('Error fetching data for invites:', error)
            }
        } else {
            setFullInvites([])
        }
    }, [])

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