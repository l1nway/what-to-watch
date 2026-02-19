import {onDocumentWritten} from 'firebase-functions/v2/firestore'
import {getFirestore, FieldValue} from 'firebase-admin/firestore'
import {onCall, HttpsError} from 'firebase-functions/v2/https'
import * as admin from 'firebase-admin'
import axios from 'axios'

if (admin.apps.length === 0) {
  admin.initializeApp()
}

const db = getFirestore()

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

export const searchMovies = onCall({
    cors: true,
    region: 'europe-central2',
    secrets: ['TMDB_KEY'],
    timeoutSeconds: 60,
    memory: '256MiB'
}, async (request) => {
    try {
        const apiKey = process.env.TMDB_KEY
        if (!apiKey) throw new Error('No API Key')

        const query = request.data.query
        const response = await axios.get(`https://api.themoviedb.org/3/search/movie`, {
            params: {api_key: apiKey, query, language: 'en-US'}
        })
        return response.data.results || []
    } catch (err) {
        console.error('Critical start error:', err)
        throw new HttpsError('internal', 'Internal error')
    }
})

export const getMovieDetails = onCall({
    cors: true,
    region: 'europe-central2',
    secrets: ['TMDB_KEY'],
    timeoutSeconds: 60,
    memory: '256MiB'
}, async (request) => {
    const movieId = request.data.id

    if (!movieId) {
        throw new HttpsError('invalid-argument', 'Movie ID is required')
    }

    try {
        const apiKey = process.env.TMDB_KEY
        const response = await axios.get(`https://api.themoviedb.org/3/movie/${movieId}`, {
            params: {api_key: apiKey, language: 'en-US'}
        })
        
        return response.data
    } catch (err) {
        console.error('TMDB Error:', err)
        throw new HttpsError('internal', 'Failed to fetch movie details')
    }
})