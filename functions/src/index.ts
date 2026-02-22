import {onDocumentWritten} from 'firebase-functions/v2/firestore'
import {getFirestore, FieldValue} from 'firebase-admin/firestore'
import {onCall, HttpsError} from 'firebase-functions/v2/https'
import {GoogleGenerativeAI} from '@google/generative-ai'
import * as admin from 'firebase-admin'
import axios from 'axios'

if (admin.apps.length === 0) {admin.initializeApp()}

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
    const model = genAI.getGenerativeModel({model: 'gemini-3-flash-preview'})

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