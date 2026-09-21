import {onDocumentWritten} from 'firebase-functions/v2/firestore'
import {onCall, HttpsError} from 'firebase-functions/v2/https'
import {GoogleGenerativeAI} from '@google/generative-ai'
import * as authV1 from 'firebase-functions/v1/auth'
import {FieldValue} from 'firebase-admin/firestore'
import {getAuth} from 'firebase-admin/auth'
import {db} from './firebase'
import axios from 'axios'

export {onGroupActivityFeed, onListActivityFeed, onInviteActivityFeed, onUserActivityFeed} from './activity'

export const onUserCreate = authV1.user().onCreate(async (user) => {
    await db.collection('users').doc(user.uid).set({
        uid: user.uid,
        displayName: user.displayName || '',
        email: user.email || '',
        photoURL: user.photoURL || '',
        groups: [],
        online: false,
        createdAt: FieldValue.serverTimestamp()
      })
})

export const onGroupSync = onDocumentWritten({
    document: 'groups/{groupId}',
    region: 'europe-central2',
}, async (event) => {
    const groupId = event.params.groupId
    const beforeData = event.data?.before.data()
    const afterData = event.data?.after.data()

    const beforeMembers: string[] = beforeData?.members || []
    const afterMembers: string[] = afterData?.members || []

    const addedMembers = afterMembers.filter(uid => !beforeMembers.includes(uid))
    const removedMembers = beforeMembers.filter(uid => !afterMembers.includes(uid))

    if (addedMembers.length === 0 && removedMembers.length === 0) return

    const batch = db.batch()

    addedMembers.forEach(userId => {
        batch.update(db.collection('users').doc(userId), {
            groups: FieldValue.arrayUnion(groupId)
        })
    })

    removedMembers.forEach(userId => {
        batch.update(db.collection('users').doc(userId), {
            groups: FieldValue.arrayRemove(groupId)
        })
    })

    try {
        await batch.commit()
        console.log(`Sync complete for group ${groupId}`)
    } catch (err) {
        console.error('Sync error:', err)
    }
})

// [DOC: list-updated-tracking]
const trackedSignature = (data?: FirebaseFirestore.DocumentData) => {
    if (!data) return null
    const movies = Array.isArray(data.movies) ? data.movies : []
    return JSON.stringify({
        name: (data.name ?? '').toString().trim(),
        groupId: data.groupId ?? null,
        movies: movies.map((m: any) => `${m?.id}:${m?.type || 'movie'}:${m?.status || ''}`).sort()
    })
}

const touchList = async (listId: string) => {
    try {
        await db.collection('lists').doc(listId).update({updated: FieldValue.serverTimestamp()})
    } catch (err: any) {
        // NOT_FOUND means the list is already gone — nothing to stamp
        if (err?.code !== 5) throw err
    }
}

export const onListActivity = onDocumentWritten({
    document: 'lists/{listId}',
    region: 'europe-central2',
    retry: true
}, async (event) => {
    const before = event.data?.before.data()
    const after = event.data?.after.data()

    if (!after) return

    // Guards the self-write loop: our own `updated` stamp never changes the signature
    if (before && trackedSignature(before) === trackedSignature(after)) return

    await touchList(event.params.listId)
})

// Fallback for writes that only touch the group's `lists` array without rewriting list.groupId
export const onGroupListsActivity = onDocumentWritten({
    document: 'groups/{groupId}',
    region: 'europe-central2',
    retry: true
}, async (event) => {
    const before: string[] = event.data?.before.data()?.lists || []
    const after: string[] = event.data?.after.data()?.lists || []

    const changed = [
        ...after.filter(id => !before.includes(id)),
        ...before.filter(id => !after.includes(id))
    ]

    await Promise.all(changed.map(touchList))
})

// [DOC: invite-push]
const EXPO_PUSH_URL = 'https://exp.host/--/api/v2/push/send'

export const onInvitePush = onDocumentWritten({
    document: 'invites/{inviteId}',
    region: 'europe-central2',
}, async (event) => {
    const before = event.data?.before.data()
    const invite = event.data?.after.data()
    console.log('onInvitePush fired', {inviteId: event.params.inviteId, email: invite?.email, status: invite?.status})

    // generic-инвайты (без email) пушить некому
    if (!invite?.email || invite.status !== 'pending') {
        console.log('skip: no email or not pending', {email: invite?.email, status: invite?.status})
        return
    }

    // Повторная отправка приходит как merge-запись с новым createdAt; прочие правки не пушим
    const resent = before?.createdAt?.toMillis?.() !== invite.createdAt?.toMillis?.()
    if (before?.status === 'pending' && !resent) {
        console.log('skip: already pending, not resent')
        return
    }

    try {
        const users = await db.collection('users').where('email', '==', invite.email).limit(1).get()
        const user = users.docs[0]
        const pushToken = user?.get('pushToken')
        console.log('user lookup', {email: invite.email, found: !!user, pushToken: pushToken || null})
        if (!pushToken) {
            console.log('skip: no pushToken')
            return
        }

        console.log('sending expo push', {to: pushToken, groupId: invite.groupId})
        const {data} = await axios.post(EXPO_PUSH_URL, {
            to: pushToken,
            title: 'Group invitation',
            body: `You've been invited to join "${invite.groupName}"`,
            categoryId: 'invite',
            data: {type: 'invite', token: invite.token, groupId: invite.groupId},
            sound: 'default'
        }, {headers: {'Content-Type': 'application/json', 'Accept': 'application/json', 'Accept-Encoding': 'gzip, deflate'}})
        console.log('expo response', data)

        const tickets = Array.isArray(data?.data) ? data.data : [data?.data]

        for (const ticket of tickets) {
            if (ticket?.status !== 'error') continue
            console.error('Expo push error:', ticket.message, ticket.details)
            if (ticket.details?.error === 'DeviceNotRegistered') {
                console.log('clearing stale pushToken', {uid: user.id})
                await user.ref.set({pushToken: null}, {merge: true})
            }
        }
    } catch (err) {
        console.error('Invite push error:', err)
    }
})

export const searchMovies = onCall({
    cors: true,
    region: 'europe-central2',
    secrets: ['TMDB_KEY'],
    timeoutSeconds: 60,
    memory: '256MiB'
}, async (request: any) => {
    try {
        const apiKey = process.env.TMDB_KEY
        if (!apiKey) throw new Error('No API Key')

        const {query, types} = request.data as {query: string, types?: string[]}
        
        const activeTypes = (types && types.length > 0) ? types : ['movie']

        let results: any[] = []

        if (activeTypes.length === 1) {
            const target = activeTypes[0] === 'tv' ? 'tv' : 'movie';
            
            const response = await axios.get(`https://api.themoviedb.org/3/search/${target}`, {
                params: { 
                    api_key: apiKey, 
                    query: query, 
                    language: 'en-US',
                    include_adult: false 
                }
            })
            
            results = (response.data.results || []).map((item: any) => ({
                ...item,
                media_type: target
            }))
        } else {
            const response = await axios.get(`https://api.themoviedb.org/3/search/multi`, {
                params: { 
                    api_key: apiKey, 
                    query: query, 
                    language: 'en-US',
                    include_adult: false
                }
            })

            results = (response.data.results || []).filter((item: any) =>
                activeTypes.includes(item.media_type)
            )
        }

        return results.map((item: any) => ({
            ...item,
            id: item.id,
            title: item.title || item.name || 'Untitled',
            date: item.release_date || item.first_air_date || '',
            media_type: item.media_type
        }))

    } catch (err) {
        console.error('Search error:', err)
        throw new HttpsError('internal', 'Search failed')
    }
})

export const getMovieDetails = onCall({
    cors: true,
    region: 'europe-central2',
    secrets: ['TMDB_KEY'],
    timeoutSeconds: 60,
    memory: '256MiB'
}, async (request) => {
    const {id, type = 'movie'} = request.data

    if (!id) {throw new HttpsError('invalid-argument', 'Movie ID is required')}

    try {
        const apiKey = process.env.TMDB_KEY
        const response = await axios.get(`https://api.themoviedb.org/3/${type}/${id}`, {
            params: {api_key: apiKey, language: 'en-US'}
        })
        
        return response.data
    } catch (err) {
        console.error('TMDB Error:', err)
        throw new HttpsError('internal', 'Failed to fetch movie details')
    }
})

export const getAiRecommendations = onCall({
    cors: true,
    region: 'europe-central2',
    secrets: ['GEMINI_API_KEY'],
    timeoutSeconds: 60,
    memory: '256MiB'
}, async (request) => {
    if (!request.auth) {throw new HttpsError('unauthenticated', 'Нужна авторизация')}

    const apiKey = process.env.GEMINI_API_KEY
        if (!apiKey) {
            throw new HttpsError('internal', 'API Key is missing in runtime')
        }
        
    const genAI = new GoogleGenerativeAI(apiKey)
    const model = genAI.getGenerativeModel({model: 'gemini-3.1-flash-lite'})

    const {movieId, movieTitle, movieDescription} = request.data
    
    if (!movieId || !movieTitle) {throw new HttpsError('invalid-argument', 'Movie ID and Title are required')}

    const cacheRef = db.collection('movie_recommendations_cache').doc(String(movieId))
    const cacheDoc = await cacheRef.get()

    if (cacheDoc.exists) {
        const cacheData = cacheDoc.data()
        const lastUpdate = cacheData?.updatedAt?.toMillis() || 0
        const oneWeekAgo = Date.now() - 7 * 24 * 60 * 60 * 1000
        
        if (lastUpdate > oneWeekAgo) {
            console.log('Returning cached data for:', movieTitle)
            return cacheData?.similarMovieTitles
        }
    }

    try {
        const prompt = `
            You are a cinema expert. Based on the movie '${movieTitle}' (Plot: ${movieDescription}), 
            find 5 similar movies from TMDB. Focus on atmosphere and genre.
            Return ONLY a JSON array of strings: ['Title 1', 'Title 2']. 
            No explanations, no markdown blocks.
        `
        
        const result = await model.generateContent(prompt);
        const response = result.response;
        const text = response.text();

        const cleanJson = text.replace(/```json|```/g, '').trim();
        const similarTitles = JSON.parse(cleanJson);

        await cacheRef.set({
            similarMovieTitles: similarTitles,
            updatedAt: FieldValue.serverTimestamp(),
            sourceMovieTitle: movieTitle
        })

        return similarTitles

    } catch (error) {
        console.error('Gemini/DB Error:', error)
        throw new HttpsError('internal', 'AI recommendation failed')
    }
})

// [DOC: email-sign-in-sync]
export const syncEmailOnSignIn = onCall({
    cors: true,
    region: 'europe-central2',
}, async (request) => {
    if (!request.auth) throw new HttpsError('unauthenticated', 'Требуется авторизация')

    const uid = request.auth.uid
    const userRef = db.collection('users').doc(uid)

    // Auth email is read from Admin SDK, never trusted from the client request
    const [authUser, snap] = await Promise.all([getAuth().getUser(uid), userRef.get()])
    const data = snap.data()

    if (!data || data.email === authUser.email) return {synced: false}

    const settled = Boolean(data.pendingEmail) && data.pendingEmail === authUser.email

    await userRef.set({
        email: authUser.email || '',
        ...(settled ? {emailStatus: 'verified', pendingEmail: FieldValue.delete()} : {})
    }, {merge: true})

    return {synced: true}
})