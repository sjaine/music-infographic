import { NextResponse } from 'next/server';
import axios from 'axios';

const GEMINI_API_KEY = process.env.GEMINI_API_KEY;
const SPOTIFY_CLIENT_ID = process.env.SPOTIFY_CLIENT_ID;
const SPOTIFY_CLIENT_SECRET = process.env.SPOTIFY_CLIENT_SECRET;

let spotifyAccessToken = '';

// Get Spotify Access Token
async function getSpotifyToken() {
    console.log("🔹 Requesting Spotify Token...");
    try {
        const response = await axios.post(
            'https://accounts.spotify.com/api/token',
            new URLSearchParams({ grant_type: 'client_credentials' }),
            {
                headers: {
                    Authorization: `Basic ${Buffer.from(`${SPOTIFY_CLIENT_ID}:${SPOTIFY_CLIENT_SECRET}`).toString('base64')}`,
                    'Content-Type': 'application/x-www-form-urlencoded',
                },
            }
        );
        spotifyAccessToken = response.data.access_token;
        console.log("✅ Spotify Token Received!");
    } catch (error) {
        console.error("❌ Spotify Token Error:", error.response?.data || error.message);
        throw new Error("Spotify authentication failed.");
    }
}

// Fetch music recommendations from Google Gemini API
async function getMusicRecommendations(mood) {
    const prompt = `List 9 classical music pieces that evoke the mood '${mood}'. Only provide the title and composer, each on a new line, without numbers, dots, or extra formatting.`;

    console.log(`🔹 Fetching music recommendations for mood: ${mood}`);
    try {
        const response = await axios.post(
            `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${GEMINI_API_KEY}`,
            {
                contents: [{ parts: [{ text: prompt }] }] // ✅ Correct request format
            },
            { headers: { "Content-Type": "application/json" } }
        );        
        
        console.log("✅ Gemini API Response:", response.data);

        if (!response.data || !response.data.candidates) {
            console.log("❌ Gemini API returned an invalid response.");
            return [];
        }

        // Extract text response
        const textResponse = response.data.candidates[0]?.content?.parts[0]?.text;
        if (!textResponse) {
            console.log("❌ Gemini API returned empty data.");
            return [];
        }

        const recommendations = textResponse.split('\n').map(line => line.trim()).filter(line => line);
        console.log("🎵 Recommended Music:", recommendations);
        return recommendations;
    } catch (error) {
        console.error("❌ Gemini API Error:", error.response?.data || error.message);
        return [];
    }
}

// Search for a track on Spotify
async function searchSpotify(track) {
    console.log(`🔍 Searching for "${track}" on Spotify...`);
    try {
        const response = await axios.get(
            `https://api.spotify.com/v1/search?q=${encodeURIComponent(track)}&type=track&limit=1`,
            {
                headers: { Authorization: `Bearer ${spotifyAccessToken}` },
            }
        );

        if (response.data.tracks.items.length > 0) {
            console.log(`✅ Found: ${response.data.tracks.items[0].name}`);
            return response.data.tracks.items[0];
        } else {
            console.log(`❌ No results found for: ${track}`);
            return null;
        }
    } catch (error) {
        console.error("❌ Spotify Search Error:", error.response?.data || error.message);
        return null;
    }
}

// Next.js API Route
export async function GET(req) {
    try {
        console.log("🔹 API /api/recommend was hit!");

        await getSpotifyToken(); // Refresh Spotify Token

        const { searchParams } = new URL(req.url);
        const mood = searchParams.get('mood');

        if (!mood) {
            console.log("❌ Error: Mood is missing from the request.");
            return NextResponse.json({ error: 'Mood is required' }, { status: 400 });
        }

        console.log(`🌟 Mood received: ${mood}`);

        // Step 1: Get music recommendations
        const recommendations = await getMusicRecommendations(mood);
        if (recommendations.length === 0) {
            console.log("❌ No music recommendations found.");
            return NextResponse.json({ error: 'No recommendations found' }, { status: 500 });
        }

        // Step 2: Search for tracks on Spotify
        const results = [];
        for (const track of recommendations) {
            const spotifyData = await searchSpotify(track);
            if (spotifyData) {
                results.push({
                    title: spotifyData.name,
                    artist: spotifyData.artists.map(artist => artist.name).join(', '),
                    album: spotifyData.album.name,
                    album_cover: spotifyData.album.images[0]?.url,
                    spotify_url: spotifyData.external_urls.spotify
                });
            }
        }

        console.log("🎵 Final API Response:", results);
        return NextResponse.json(results, { status: 200 });
    } catch (error) {
        console.error("❌ API Error:", error);
        return NextResponse.json({ error: 'Something went wrong' }, { status: 500 });
    }
}
