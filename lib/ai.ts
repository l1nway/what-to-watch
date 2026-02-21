'use server'

import {GoogleGenerativeAI} from '@google/generative-ai'

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!)

export async function getSimilar(movieTitle: string, movieDescription: string) {

    if (!process.env.GEMINI_API_KEY) {
        console.error('Gemini API Key is missing!')
        return []
    }

    const model = genAI.getGenerativeModel({model: 'gemini-3-flash-preview'})

    const prompt = `
        You are a professional cinema expert. 
        Based on the movie '${movieTitle}' (Plot: ${movieDescription}), find 5 similar movies that are available in the TMDB database.
        Focus on similar plot, atmosphere, and genre.
        Return ONLY a JSON array of strings: ['Title', 'Another Title'].
        Do not include the year unless it's necessary to distinguish the movie.
        No prose, no explanations.
    `

    try {
        const result = await model.generateContent(prompt)
        const response = await result.response
        const text = response.text()
        
        const cleanJson = text.replace(/```json|```/g, '').trim()
        return JSON.parse(cleanJson) as string[]
    } catch (error) {
        console.error('AI Error:', error)
        return []
    }
}