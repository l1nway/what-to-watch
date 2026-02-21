import {ref, update, serverTimestamp} from 'firebase/database'
import {rtdb, auth} from '@/lib/firebase'

export type UserActivity = 'idle' | 'creating_list' | 'creating_group' | 'creating_invite' | 'adding_list_to_group' | 'deleting_group' | 'viewing_members' | 'leaving_group' | 'in_settings' | 'changing_avatar' | 'reading_privacy' | 'browsing_list' | 'adding_movie' | 'reading_movie_info' | 'using_random_picker'

/**
* @param activity
*/
export const updateActivity = async (activity: UserActivity | 'idle') => {
    const user = auth.currentUser
    
    if (!user) return

    const statusRef = ref(rtdb, `/status/${user.uid}`);

    try {
        await update(statusRef, {
            activity: activity,
            last_changed: serverTimestamp(),
        })
    } catch (error) {
        console.error('Failed to update activity:', error)
    }
}