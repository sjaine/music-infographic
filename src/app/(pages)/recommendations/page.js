'use client';

import { useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';

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
                setRecommendations(data.length ? data : []);
            } catch (err) {
                setError(err.message);
                setRecommendations([]);
            } finally {
                setLoading(false);
            }
        }
        if (mood) fetchRecommendations();
    }, [mood]);

    const radius = 600; 
    const angleStep = recommendations.length > 1 ? Math.PI / (recommendations.length - 1) : 0;

    const handleNext = () => {
        setRotation((prev) => prev - (360 / recommendations.length)); 
        setSelectedIndex((prev) => (prev + 1) % recommendations.length);
    };

    const handlePrev = () => {
        setRotation((prev) => prev + (360 / recommendations.length)); 
        setSelectedIndex((prev) => (prev - 1 + recommendations.length) % recommendations.length);
    };

    return (
        <div className="recommendations-container">
            <h1>Recommendations for "{mood}"</h1>
            {loading && <p>Loading recommendations...</p>}
            {error && <p style={{ color: 'red' }}>{error}</p>}

            {recommendations.length > 0 && (
                <div className="carousel-wrapper">
                    <button className="arrow left" onClick={handlePrev}>◀</button>

                    <div className="circular-container">
                        <motion.div
                            className="circle"
                            animate={{ rotate: rotation }} // `circle` 자체를 회전
                            transition={{ duration: 0.5 }}
                        >
                            {recommendations.map((track, index) => {
                                const angle = index * angleStep - Math.PI / 1;
                                const x = Math.cos(angle) * radius;
                                const y = Math.sin(angle) * radius;
                                return (
                                    <motion.div
                                        key={index}
                                        className={`album ${selectedIndex === index ? 'selected' : ''}`}
                                        style={{
                                            position: 'absolute',
                                            left: `calc(50% + ${x}px)`,
                                            top: `calc(50% + ${y}px)`,
                                            transform: `translate(-50%, -50%) rotate(${-rotation}deg)`, // 개별 앨범이 회전 보정
                                            transformOrigin: 'center'
                                        }}
                                        onClick={() => setSelectedIndex(index)}
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

            <AnimatePresence>
                {recommendations.length > 0 && selectedIndex !== null && (
                    <motion.div 
                        className="info-box"
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: 20 }}
                    >
                        <h2>{recommendations[selectedIndex]?.title}</h2>
                        <p>{recommendations[selectedIndex]?.artist}</p>
                        <p>{recommendations[selectedIndex]?.album}</p>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}
