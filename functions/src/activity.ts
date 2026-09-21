import {onDocumentWritten} from 'firebase-functions/v2/firestore'
import {FieldValue} from 'firebase-admin/firestore'
import {db, region} from './firebase'

type Details = Record<string, unknown>
type ActivityEvent = {groupId: string, userId: string, type: string, details: Details}
type Movie = {id: number | string, status?: string | null, type?: string}

// Триггер не знает автора записи: его приносит клиент в поле updatedBy — [DOC: activity-feed]
const actorOf = (...docs: (FirebaseFirestore.DocumentData | undefined)[]) =>
    docs.find(d => typeof d?.updatedBy === 'string')?.updatedBy as string ?? 'system'

// Для member_left/member_kicked в ленте нужен снимок профиля — на момент чтения ленты выбывшего может не быть ни в группе, ни в users
const profileOf = async (uid: string) => {
    const data = (await db.collection('users').doc(uid).get()).data()
    return {avatarUrl: data?.photoURL || null, name: data?.displayName || data?.name || data?.email || null}
}

const writeEvents = async (eventId: string, events: ActivityEvent[]) => {
    if (events.length === 0) return

    const ids = [...new Set(events.map(e => e.groupId))]
    const snaps = await db.getAll(...ids.map(id => db.collection('groups').doc(id)))
    const alive = new Set(snaps.filter(s => s.exists).map(s => s.id))

    const batch = db.batch()
    events.filter(e => alive.has(e.groupId)).forEach(({groupId, userId, type, details}, i) => {
        batch.set(db.collection('groups').doc(groupId).collection('activity').doc(`${eventId}_${i}`), {
            timestamp: FieldValue.serverTimestamp(), userId, type, details
        })
    })
    await batch.commit()
}

const arrayDiff = (before: string[] = [], after: string[] = []) => ({
    added: after.filter(id => !before.includes(id)),
    removed: before.filter(id => !after.includes(id))
})

export const onGroupActivityFeed = onDocumentWritten({
    document: 'groups/{groupId}',
    region,
    retry: true
}, async (event) => {
    const before = event.data?.before.data()
    const after = event.data?.after.data()

    const groupId = event.params.groupId
    const actor = actorOf(after, before)
    const events: ActivityEvent[] = []
    const push = (type: string, details: Details, userId = actor) => events.push({groupId, userId, type, details})

    if (!before && after) {
        push('group_created', {name: after.name ?? null})
        return writeEvents(event.id, events)
    }

    if (!before || !after) return

    if ((before.name ?? null) !== (after.name ?? null)) {
        push('group_renamed', {oldName: before.name ?? null, newName: after.name ?? null})
    }

    const members = arrayDiff(before.members, after.members)
    const editors = arrayDiff(before.editors, after.editors)

    members.added.forEach(uid => push('member_joined', {
        memberId: uid, role: editors.added.includes(uid) ? 'editor' : 'viewer'
    }, uid))

    const leavers = members.removed.filter(uid => uid === actor)
    const kicked = members.removed.filter(uid => uid !== actor)

    await Promise.all([
        ...leavers.map(async uid => push('member_left', {memberId: uid, ...await profileOf(uid)}, uid)),
        ...kicked.map(async uid => push('member_kicked', {memberId: uid, ...await profileOf(uid)}))
    ])

    // Вход и кик снимают/выдают роль тем же батчем — отдельным событием пишем только смену роли участника, оставшегося в группе
    editors.added.filter(uid => !members.added.includes(uid)).forEach(uid => push('member_role_changed', {memberId: uid, role: 'editor'}))
    editors.removed.filter(uid => !members.removed.includes(uid)).forEach(uid => push('member_role_changed', {memberId: uid, role: 'viewer'}))

    await writeEvents(event.id, events)
})

const profileSignature = (data?: FirebaseFirestore.DocumentData) => data && ({
    name: data.displayName || data.name || data.email || null,
    avatarUrl: data.photoURL || null
})

export const onUserActivityFeed = onDocumentWritten({
    document: 'users/{userId}',
    region,
    retry: true
}, async (event) => {
    const before = profileSignature(event.data?.before.data())
    const after = profileSignature(event.data?.after.data())
    if (!before || !after) return
    if (before.name === after.name && before.avatarUrl === after.avatarUrl) return

    const userId = event.params.userId
    const groups: string[] = event.data?.after.data()?.groups ?? []
    if (groups.length === 0) return

    await writeEvents(event.id, groups.map(groupId => ({
        groupId, userId, type: 'member_profile_updated', details: {memberId: userId, ...after}
    })))
})

export const onInviteActivityFeed = onDocumentWritten({
    document: 'invites/{inviteId}',
    region,
    retry: true
}, async (event) => {
    const before = event.data?.before.data()
    const after = event.data?.after.data()

    // Creation has no updatedBy yet — the sender is carried as senderId instead
    if (!before && after && after.status === 'pending') {
        return writeEvents(event.id, [{
            groupId: after.groupId, userId: after.senderId ?? 'system', type: 'invite_created',
            details: {email: after.email ?? null, role: after.role ?? null}
        }])
    }

    // Deletion alone doesn't say why the invite is gone (accept/reject/cleanup all look the same);
    // only a reject stamps status+updatedBy first (see useInvites.ts), so that's the only case we log here
    if (before && !after && before.status === 'rejected') {
        return writeEvents(event.id, [{
            groupId: before.groupId, userId: before.updatedBy ?? 'system', type: 'invite_rejected',
            details: {email: before.email ?? null}
        }])
    }
})

const movieKey = (m: Movie) => `${m.id}:${m.type || 'movie'}`
const moviesOf = (movies: unknown) =>
    new Map((Array.isArray(movies) ? movies : []).map((m: Movie) => [movieKey(m), m]))

export const onListActivityFeed = onDocumentWritten({
    document: 'lists/{listId}',
    region,
    retry: true
}, async (event) => {
    const before = event.data?.before.data()
    const after = event.data?.after.data()

    const listId = event.params.listId
    const beforeGroup: string | null = before?.groupId ?? null
    const afterGroup: string | null = after?.groupId ?? null
    const actor = actorOf(after, before)

    const events: ActivityEvent[] = []
    const push = (groupId: string, type: string, details: Details) =>
        events.push({groupId, userId: actor, type, details: {listId, ...details}})

    if (!before && after) {
        if (afterGroup) push(afterGroup, 'list_created', {listName: after.name ?? null})
        return writeEvents(event.id, events)
    }

    if (before && !after) {
        if (beforeGroup) push(beforeGroup, 'list_deleted', {listName: before.name ?? null})
        return writeEvents(event.id, events)
    }

    if (!before || !after) return

    // Привязка списка к группе: содержимое при переезде не диффим, иначе одни и те же фильмы попадут в обе ленты
    if (beforeGroup !== afterGroup) {
        if (beforeGroup) push(beforeGroup, 'list_removed', {listName: before.name ?? null})
        if (afterGroup) push(afterGroup, 'list_added', {listName: after.name ?? null})
        return writeEvents(event.id, events)
    }

    if (!afterGroup) return

    const listName = after.name ?? null
    if ((before.name ?? null) !== listName) {
        push(afterGroup, 'list_renamed', {oldName: before.name ?? null, newName: listName})
    }

    const wasMovies = moviesOf(before.movies)
    const nowMovies = moviesOf(after.movies)

    nowMovies.forEach((movie, key) => {
        if (!wasMovies.has(key)) push(afterGroup, 'movie_added', {listName, movieId: movie.id, status: movie.status ?? null})
    })

    wasMovies.forEach((movie, key) => {
        if (!nowMovies.has(key)) push(afterGroup, 'movie_removed', {listName, movieId: movie.id, status: movie.status ?? null})
    })

    await writeEvents(event.id, events)
})
