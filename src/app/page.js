"use client";

import { useState } from "react";
import axios from "axios";

export default function Home() {
    const [mood, setMood] = useState("");
    const [results, setResults] = useState(null); // Store JSON response
    const [loading, setLoading] = useState(false);

    async function fetchMusic() {
        if (!mood) return;
        setLoading(true);
        try {
            const response = await axios.get(`/api/recommend?mood=${mood}`);
            setResults(response.data); // Store response as JSON
            console.log(results);
        } catch (error) {
            console.error("API Error:", error.response?.data || error.message);
            setResults({ error: "Failed to fetch data" });
        }
        setLoading(false);
    }

    return (
        <div style={{ textAlign: "center", padding: "20px" }}>
            <h1>Classical Music Recommendation (JSON View)</h1>
            <input
                type="text"
                placeholder="Enter a mood (e.g., lonely)"
                value={mood}
                onChange={(e) => setMood(e.target.value)}
                style={{ padding: "10px", fontSize: "16px", marginRight: "10px" }}
            />
            <button onClick={fetchMusic} style={{ padding: "10px", fontSize: "16px" }}>
                Search
            </button>

            {loading && <p>Loading...</p>}

            {results && (
                <pre
                    style={{
                        textAlign: "left",
                        backgroundColor: "#f4f4f4",
                        padding: "15px",
                        borderRadius: "5px",
                        marginTop: "20px",
                        overflowX: "auto",
                    }}
                >
                    {JSON.stringify(results, null, 2)}
                </pre>
            )}
        </div>
    );
}
