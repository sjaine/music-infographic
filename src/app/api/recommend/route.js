import { NextResponse } from 'next/server';
import axios from 'axios';

const GEMINI_API_KEY = process.env.GEMINI_API_KEY;
const SPOTIFY_CLIENT_ID = process.env.SPOTIFY_CLIENT_ID;
const SPOTIFY_CLIENT_SECRET = process.env.SPOTIFY_CLIENT_SECRET;

let spotifyAccessToken = '';

function writeLog(controller, encoder, type, content) {
    const data = JSON.stringify({ type, content });
    controller.enqueue(encoder.encode(`data: ${data}\n\n`));
}

async function getSpotifyToken(controller, encoder) {
    const msg = "🔹 Requesting Spotify Token...";
    console.log(msg);
    writeLog(controller, encoder, 'log', msg);

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
        const successMsg = "✅ Spotify Token Received!";
        console.log(successMsg);
        writeLog(controller, encoder, 'log', successMsg);
    } catch (error) {
        const errorMsg = "❌ Spotify Token Error: " + (error.response?.data || error.message);
        console.error(errorMsg);
        writeLog(controller, encoder, 'log', errorMsg);
        throw new Error("Spotify authentication failed.");
    }
}

async function getMusicRecommendations(mood, controller, encoder) {
    const prompt = `
        The user is feeling: "${mood}".
        Based on this emotional state or description, recommend 10 classical music pieces that would resonate with them.
        Provide only the title and composer, each on a new line, without numbers, dots, or any extra text.
    `;

    const startMsg = `🔹 Fetching music recommendations for: ${mood}`;
    console.log(startMsg);
    writeLog(controller, encoder, 'log', startMsg);

    try {
        const response = await axios.post(
            `https://generativelanguage.googleapis.com/v1/models/gemini-2.5-flash:generateContent?key=${GEMINI_API_KEY}`,
            {
                contents: [{ parts: [{ text: prompt }] }] 
            },
            { headers: { "Content-Type": "application/json" } }
        );        
        
        if (!response.data || !response.data.candidates) {
            writeLog(controller, encoder, 'log', "❌ Gemini API returned an invalid response.");
            return [];
        }

        const textResponse = response.data.candidates[0]?.content?.parts[0]?.text;
        if (!textResponse) {
            writeLog(controller, encoder, 'log', "❌ Gemini API returned empty data.");
            return [];
        }

        const recommendations = textResponse.split('\n').map(line => line.trim()).filter(line => line);
        writeLog(controller, encoder, 'log', `✅ Gemini found ${recommendations.length} pieces.`);
        return recommendations;
    } catch (error) {
        writeLog(controller, encoder, 'log', "❌ Gemini API Error: " + error.message);
        return [];
    }
}

async function searchSpotify(track, controller, encoder) {
    const startMsg = `🔍 Searching for "${track}" on Spotify...`;
    console.log(startMsg);
    writeLog(controller, encoder, 'log', startMsg);

    try {
        const response = await axios.get(
            `https://api.spotify.com/v1/search?q=${encodeURIComponent(track)}&type=track&limit=1`,
            {
                headers: { Authorization: `Bearer ${spotifyAccessToken}` },
            }
        );

        if (response.data.tracks.items.length > 0) {
            const trackData = response.data.tracks.items[0];
            writeLog(controller, encoder, 'log', `✅ Found: ${trackData.name}`);
            return trackData;
        } else {
            writeLog(controller, encoder, 'log', `❌ No results found for: ${track}`);
            return null;
        }
    } catch (error) {
        writeLog(controller, encoder, 'log', `❌ Spotify Search Error for ${track}`);
        return null;
    }
}

export async function GET(req) {
    const { searchParams } = new URL(req.url);
    const mood = searchParams.get('mood');
    const encoder = new TextEncoder();

    const stream = new ReadableStream({
        async start(controller) {
            try {
                writeLog(controller, encoder, 'log', "🚀 API Process Started");

                if (!mood) {
                    writeLog(controller, encoder, 'error', 'Mood is required');
                    controller.close();
                    return;
                }

                // 1. Spotify Token
                await getSpotifyToken(controller, encoder);

                // 2. Gemini Recommendations
                const recommendations = await getMusicRecommendations(mood, controller, encoder);
                if (recommendations.length === 0) {
                    writeLog(controller, encoder, 'error', 'No recommendations found');
                    controller.close();
                    return;
                }

                // 3. Search Tracks
                const results = [];
                for (const track of recommendations) {
                    const spotifyData = await searchSpotify(track, controller, encoder);
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

                // 4. Final Result
                console.log("🎵 Final API Response ready");
                writeLog(controller, encoder, 'result', results);
                writeLog(controller, encoder, 'log', "✅ All processes completed successfully.");
                controller.close();

            } catch (error) {
                console.error("❌ API Error:", error);
                writeLog(controller, encoder, 'error', error.message);
                controller.close();
            }
        },
    });

    return new Response(stream, {
        headers: {
            'Content-Type': 'text/event-stream',
            'Cache-Control': 'no-cache',
            'Connection': 'keep-alive',
        },
    });
}