import {writeBatch, doc, addDoc, updateDoc, collection, serverTimestamp, arrayUnion, query, where, getDocs, deleteDoc, arrayRemove} from 'firebase/firestore'
import {useCallback, useState, useEffect, useRef} from 'react'
import {ListItem, Group, Data} from './dashboardTypes'
import {useAuth} from '../components/authProvider'
import {shake} from '../components/shake'
import {useRouter} from 'next/navigation'
import {signOut} from 'firebase/auth'
import {auth} from '@/lib/firebase'
import {db} from '@/lib/firebase'

export default function UseDashboard() {
    const router = useRouter()

    const logout = useCallback(async () => {
        setLoading(true)
        await signOut(auth)
        await fetch('/api/logout', {method: 'POST'})
        router.push('/auth?mode=login')
    }, [router])

    const {user} = useAuth()

    const [delClarify, setDelClarify] = useState<boolean | 'delete' | 'leave'>(false)

    const [selectedGroup, setSelectedGroup] = useState<string | number>('')

    const [inviteEmail, setInviteEmail] = useState<string>('')

    const [groupName, setGroupName] = useState<string>('')
    const [groupDesc, setGroupDesc] = useState<string>('')
    const [group, setGroup] = useState<boolean>(false)

    const [listName, setListName] = useState<string>('')
    const [listDesc, setListDesc] = useState<string>('')
    const [list, setList] = useState<boolean>(false)

    const [invite, setInvite] = useState<Data>(false)

    const [lists, setLists] = useState<ListItem[]>([])
    const [groups, setGroups] = useState<Group[]>([])
    const [groupLists, setGroupLists] = useState<string[]>([])

    const groupRef = useRef<HTMLInputElement | null>(null)

    const [loading, setLoading] = useState<boolean>(true)

    // executing query to server for data on lists and groups
    const getDashboard = useCallback(async () => {
        if (!user) return
        try {
            setLoading(true)
            // query groups and lists
            const [groupsSnap, personalSnap] = await Promise.all([
                getDocs(query(collection(db, 'groups'), where('members', 'array-contains', user.uid))),
                getDocs(query(collection(db, 'lists'), where('ownerId', '==', user.uid)))
            ])

            const groupIds = groupsSnap.docs.map(d => d.id)
            const personalLists = personalSnap.docs.map(d => ({id: d.id, ...d.data()} as ListItem))

            // loading lists in groups to which user is invited 
            let allLists = personalLists
            if (groupIds.length > 0) {
                const groupsListsSnap = await getDocs(query(collection(db, 'lists'), where('groupId', 'in', groupIds)))
                const groupLists = groupsListsSnap.docs.map(d => ({id: d.id, ...d.data()} as ListItem))
                
                allLists = Array.from(new Map([...personalLists, ...groupLists].map(l => [l.id, l])).values())
            }

            setLists(personalLists)
            setGroups(groupsSnap.docs.map(doc => ({
                id: doc.id,
                ...doc.data(),
                lists: allLists.filter(l => l.groupId === doc.id)
            } as Group)))
        } catch (e) {
            console.error('Data loading error:', e)
        } finally {
            setLoading(false)
        }
    }, [user])

    const newGroupRef = useRef<HTMLInputElement | null>(null)

    const createGroup = useCallback(async (name: string, listIds: string[] = []) => {
        if (!user) return
        if (!name.trim()) {
            shake(newGroupRef.current)
            return
        }
        try {
            setLoading(true)
            const batch = writeBatch(db)
            const newGroupRef = doc(collection(db, 'groups'))
            
            const newGroupData = {
                name: name.trim(),
                ownerId: user.uid,
                editors: [user.uid],
                members: [user.uid],
                lists: listIds,
                public: false,
                created: serverTimestamp(),
            }

            batch.set(newGroupRef, newGroupData)

            listIds.forEach((listId) => {
                const listRef = doc(db, 'lists', listId)
                batch.update(listRef, {groupId: newGroupRef.id})
            })

            await batch.commit()

            setLists(prev =>
                prev.map(l =>
                    listIds.includes(l.id)
                    ? { ...l, groupId: newGroupRef.id }
                    : l
                )
            )

            const optimisticLists = lists.filter(l => listIds.includes(l.id))
                .map(l => ({...l, groupId: newGroupRef.id}))

            const optimisticGroup: Group = {
                id: newGroupRef.id,
                ...newGroupData,
                lists: optimisticLists,
                created: new Date(),
                edit: false,
                tempName: name.trim()
            } as Group

            setGroups(prev => [...prev, optimisticGroup])

            setGroup(false)
            setGroupName('')
            setGroupLists([])
            return newGroupRef
        } catch (e) {
            console.error('Create group error:', e)
        } finally {
            setLoading(false)
        }
    }, [user, lists, groupLists])

    const deleteGroup = useCallback(async (id: string | number) => {
        try {
            setLoading(true)
            await deleteDoc(doc(db, 'groups', String(id)))
            setGroups(prev => prev.filter(g => g.id !== id))
            setDelClarify(false)
        } catch (e) {
            console.log(e)
        } finally {
            setLoading(false)
        }
    }, [])

    const updateGroup = useCallback(async (id: string, newName: string | undefined) => {
        if (!newName) {
            setGroups(prev => prev.map(g => g.id === id ? {...g, edit: false} : g))
            return
        }

        try {
            setLoading(true)
            setGroups(prev => prev.map(g => 
                g.id === id ? {...g, edit: false, name: newName, tempName: newName} : g
            ))

            await updateDoc(doc(db, 'groups', id), {name: newName})
            
        } catch (e) {
            console.error(e)
        } finally {
            setLoading(false)
        }
    }, [])

    const leaveGroup = useCallback(async (groupId: string | number) => {
        if (!user) return

        try {
            setLoading(true)
            const groupRef = doc(db, 'groups', String(groupId))

            await updateDoc(groupRef, {
                members: arrayRemove(user.uid),
                editors: arrayRemove(user.uid)
            })

            setGroups(prev => prev.filter(g => g.id !== groupId))
            setDelClarify(false)
        } catch (e) {
            console.error('Error leaving group:', e)
        } finally {
            setLoading(false)
        }
    }, [user])

    const newListRef = useRef<HTMLInputElement>(null)

    const createList = useCallback(async () => {
        if (!user) return

        if (!listName.trim()) {
            shake(newListRef.current)
            return
        }

        const targetGroupId = groupLists.length > 0 ? groupLists[0] : null

        try {
            setLoading(true)
            const newListData = {
                name: listName,
                ownerId: user.uid,
                groupId: targetGroupId, 
                desc: listDesc,
                created: serverTimestamp(),
                movies: []
            }
            const res = await addDoc(collection(db, 'lists'), newListData);

            if (targetGroupId) {
                await updateDoc(doc(db, 'groups', targetGroupId), {
                    lists: arrayUnion(res.id)
                })
            }

            const newList = {id: res.id, ...newListData} as ListItem
            setLists(prev => [...prev, newList])

            if (targetGroupId) {
                setGroups(prev => prev.map(g => 
                    g.id === targetGroupId 
                    ? {...g, lists: [...(g.lists || []), newList]} 
                    : g
                ))
            }
            
            setList(false)
            setListName('')
        } catch (e) {
            console.error(e)
        } finally {
            setLoading(false)
        }
    }, [user, listName, listDesc, groupLists])

    const updateGroups = useCallback(async (
        groupId: string,
        originalOptions: ListItem[],
        selectedIds: string[]
    ) => {
        const previousGroups = [...groups]

        setGroups(prevGroups => prevGroups.map(group => 
            group.id === groupId ? {...group, lists: originalOptions} : group
        ))

        try {
            const batch = writeBatch(db)
            
            const groupRef = doc(db, 'groups', groupId)
            batch.update(groupRef, {lists: selectedIds})

            const listsToRemove = lists.filter(l => l.groupId === groupId && !selectedIds.includes(l.id))
            
            listsToRemove.forEach(list => {
                const listRef = doc(db, 'lists', list.id)
                batch.update(listRef, { groupId: null })
            })

            selectedIds.forEach((listId) => {
                const listRef = doc(db, 'lists', listId)
                batch.update(listRef, {groupId: groupId})
            })

            await batch.commit()

        } catch (e) {
            console.error('Firebase Batch Error:', e)
            setGroups(previousGroups)
        }
    }, [groups, lists])

    useEffect(() => {
        if (!user) return
        getDashboard()
    }, [user])

    const [delay, setDelay] = useState<boolean>(true)
    
    useEffect(() => {
        if (!loading) {
            const timer = setTimeout(() => {
            setDelay(false)
            }, 1000)

            return () => clearTimeout(timer)
        } else {
            setDelay(true)
        }
    }, [loading])

    return ({logout, delay, newGroupRef, newListRef, groupRef, setGroups, updateGroup, delClarify, setDelClarify, selectedGroup, setSelectedGroup, deleteGroup, leaveGroup, router, lists, groups, user, loading, list, setList, group, setGroup, invite, setInvite, listName, setListName, listDesc, setListDesc, groupName, setGroupName, groupDesc, setGroupDesc, inviteEmail, setInviteEmail, groupLists, setGroupLists, createList, createGroup, updateGroups})
}