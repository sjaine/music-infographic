'use client';

import { useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import SpotifyEmbed from "@/app/(components)/SpotifyEmbed"

export default function RecommendationsPage() {
    const searchParams = useSearchParams();
    const mood = searchParams.get('mood');
    const [recommendations, setRecommendations] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [selectedIndex, setSelectedIndex] = useState(0);
    const [rotation, setRotation] = useState(0);

    useEffect(() => {
        async function fetchRecommendations() {
            setLoading(true);
            setError(null);
            try {
                const response = await fetch(`/api/recommend?mood=${mood}`);
                const data = await response.json();
                console.log("✅ Fetched Recommendations:", data);
                setRecommendations(data.length ? data.slice(0, 10) : []); 
            } catch (err) {
                setError(err.message);
                setRecommendations([]);
            } finally {
                setLoading(false);
            }
        }
        if (mood) fetchRecommendations();
    }, [mood]);

    const radius = 580; 
    const angleStep = (Math.PI * 2) / 10; 
    const initialRotation = -90; 

    const handleNext = () => {
        setRotation((prev) => prev - 36); 
        setSelectedIndex((prev) => (prev + 1) % recommendations.length);
    };

    const handlePrev = () => {
        setRotation((prev) => prev + 36);
        setSelectedIndex((prev) => (prev - 1 + recommendations.length) % recommendations.length);
    };

    return (
        <div className="recommendations-container">
            {loading && <p className="search">Searching for the classical music...</p>}
            {error && <p style={{ color: 'red' }}>{error}</p>}

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
                {selectedIndex !== null && (
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

