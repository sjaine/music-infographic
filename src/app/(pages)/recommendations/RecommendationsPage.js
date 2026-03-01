'use client';

import { useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import SpotifyEmbed from "../../(components)/SpotifyEmbed.js";
import { useLogs } from "../../(components)/LogContext";

export default function RecommendationsPage() {
    const { addLog, setLogs } = useLogs(); 
    const searchParams = useSearchParams();
    const mood = searchParams.get('mood');
    
    const [recommendations, setRecommendations] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [selectedIndex, setSelectedIndex] = useState(0);
    const [rotation, setRotation] = useState(0);

    useEffect(() => {
        if (!mood) return;

        setLoading(true);
        setError(null);
        setRecommendations([]);
        addLog(`🚀 Analyzing your mood: "${mood}"...`);

        const eventSource = new EventSource(`/api/recommend?mood=${encodeURIComponent(mood)}`);

        eventSource.onmessage = (event) => {
            const data = JSON.parse(event.data);

            if (data.type === 'log') {
                addLog(data.content);
            } 
            else if (data.type === 'result') {
                addLog("✅ Curated your personal playlist!");
                const results = data.content.length ? data.content.slice(0, 10) : [];
                setRecommendations(results);
                setLoading(false);
                eventSource.close(); 
            } 
            else if (data.type === 'error') {
                setError(data.content);
                addLog(`❌ Error: ${data.content}`);
                setLoading(false);
                eventSource.close();
            }
        };

        eventSource.onerror = (err) => {
            console.error("SSE Connection Error:", err);
            eventSource.close();
            setLoading(false);
        };

        return () => {
            eventSource.close();
        };
    }, [mood]);

    const radius = 580; 
    const angleStep = (Math.PI * 2) / 10; 
    const initialRotation = -90; 

    const handleNext = () => {
        if (recommendations.length === 0) return;
        setRotation((prev) => prev - 36); 
        setSelectedIndex((prev) => (prev + 1) % recommendations.length);
    };

    const handlePrev = () => {
        if (recommendations.length === 0) return;
        setRotation((prev) => prev + 36);
        setSelectedIndex((prev) => (prev - 1 + recommendations.length) % recommendations.length);
    };

    return (
        <div className="recommendations-container">
            {loading && recommendations.length === 0 && (
                <p className="search">Analyzing your mood and finding music...</p>
            )}
            
            {error && <p style={{ color: 'red', textAlign: 'center', marginTop: '20px' }}>{error}</p>}

            {recommendations.length > 0 && (
                <div className="carousel-wrapper">
                    <button className="arrow left" onClick={handlePrev}>◀</button>

                    <div className="circular-container">
                        <motion.div
                            className="circle"
                            animate={{ rotate: rotation + initialRotation }} 
                            transition={{ duration: 0.5 }}
                        >
                            {recommendations.map((track, index) => {
                                const angle = index * angleStep;
                                const x = Math.cos(angle) * radius;
                                const y = Math.sin(angle) * radius;
                                return (
                                    <motion.div
                                        key={index}
                                        className="album"
                                        style={{
                                            position: 'absolute',
                                            left: `calc(50% + ${x}px)`,
                                            top: `calc(50% + ${y}px)`,
                                            transform: `translate(-50%, -50%) rotate(${-rotation - initialRotation}deg)`, 
                                        }}
                                    >
                                        <img src={track.album_cover} alt={track.title} className="album-image" />
                                    </motion.div>
                                );
                            })}
                        </motion.div>
                    </div>

                    <button className="arrow right" onClick={handleNext}>▶</button>
                </div>
            )}

            <div className="black-screen"></div>

            <AnimatePresence>
                {(recommendations.length > 0 && selectedIndex !== null) && (
                    <motion.div 
                        className="info-box"
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: 20 }}
                    >
                        <h2 className="title">{recommendations[selectedIndex]?.title}</h2>
                        <br />
                        <p className="artist">{recommendations[selectedIndex]?.artist}</p>
                        <p className="artist">{recommendations[selectedIndex]?.album}</p>
                        <br />
                        <SpotifyEmbed spotifyUrl={recommendations[selectedIndex]?.spotify_url} />
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}