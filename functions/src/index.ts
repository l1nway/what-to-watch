import {onCall, HttpsError} from 'firebase-functions/v2/https'
import axios from 'axios'

export const searchMovies = onCall({
    cors: true,
    region: 'europe-central2',
    secrets: ['TMDB_KEY'],
    timeoutSeconds: 60,
    memory: '256MiB'
}, async (request) => {
    try {
        const apiKey = process.env.TMDB_KEY;
        if (!apiKey) throw new Error('No API Key');

        const query = request.data.query;
        const response = await axios.get(`https://api.themoviedb.org/3/search/movie`, {
            params: { api_key: apiKey, query, language: 'en-US'}
        });
        return response.data.results || []
    } catch (err) {
        console.error('Critical start error:', err)
        throw new HttpsError('internal', 'Internal error')
    }
})