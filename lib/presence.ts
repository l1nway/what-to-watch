import {ref, update, set, remove, push, onValue, onDisconnect, serverTimestamp, type DatabaseReference} from 'firebase/database'
import {rtdb, auth} from '@/lib/firebase'

export type UserActivity = 'idle' | 'creating_list' | 'creating_group' | 'editing_group' |'creating_invite' | 'adding_list_to_group' | 'deleting_group' | 'viewing_members' | 'leaving_group' | 'in_settings' | 'changing_avatar' | 'reading_privacy' | 'browsing_list' | 'adding_movie' | 'reading_movie_info' | 'using_random_picker' | 'deleting_list'

/**
* @param activity
*/
export const updateActivity = async (activity: UserActivity | 'idle') => {
    const user = auth.currentUser
    
    if (!user) return

    const statusRef = ref(rtdb, `/status/${user.uid}`)

    try {
        await update(statusRef, {
            activity: activity,
            last_changed: serverTimestamp(),
        })
    } catch (error) {
        console.error('Failed to update activity:', error)
    }
}

// Ref of this tab's own entry under status/{uid}/connections, so an explicit
// logout can remove just this connection instead of touching other devices'.
let activeConnectionRef: DatabaseReference | null = null

/**
 * Registers this connection under status/{uid}/connections and wires up
 * onDisconnect handlers so a dropped connection can't clobber other devices
 * logged into the same account. Returns a cleanup that stops listening for
 * new connections (call it before starting presence again, e.g. on
 * auth state changes).
 */
export const startPresence = (uid: string) => {
    const connectedRef = ref(rtdb, '.info/connected')
    const connectionsRef = ref(rtdb, `/status/${uid}/connections`)
    const lastChangedRef = ref(rtdb, `/status/${uid}/last_changed`)

    const unsubscribe = onValue(connectedRef, (snap) => {
        if (snap.val() !== true) return

        const connectionRef = push(connectionsRef)
        activeConnectionRef = connectionRef

        Promise.all([
            onDisconnect(connectionRef).remove(),
            onDisconnect(lastChangedRef).set(serverTimestamp()),
        ]).then(() => {
            set(connectionRef, true)
        }).catch((error) => {
            console.error('Failed to register presence connection:', error)
        })
    })

    return unsubscribe
}

/**
 * Explicit logout counterpart to startPresence: removes only this tab's own
 * connection entry (never overwrites the whole status/{uid} node, which
 * would wipe out other devices' connections) and cancels the matching
 * onDisconnect so it doesn't fire redundantly later.
 */
export const goOffline = async (uid: string) => {
    const connectionRef = activeConnectionRef
    activeConnectionRef = null

    if (!connectionRef) return

    try {
        await onDisconnect(connectionRef).cancel()
        await remove(connectionRef)
        await update(ref(rtdb, `/status/${uid}`), {
            last_changed: serverTimestamp(),
            activity: 'idle',
        })
    } catch (error) {
        console.error('Failed to clear presence on logout:', error)
    }
}