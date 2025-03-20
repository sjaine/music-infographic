'use client';

import { useEffect, useState } from 'react';
import Image from 'next/image';

export default function Home() {
    const [moodCounts, setMoodCounts] = useState({});

    useEffect(() => {
        async function fetchMoodCounts() {
            try {
                const response = await fetch('/api/recommend');
                const data = await response.json();
                setMoodCounts(data.moodCounter || {});
            } catch (error) {
                console.error("❌ Failed to fetch mood counts:", error);
            }
        }
        fetchMoodCounts();
    }, []);

    return (
        <section className="flex flex-col justify-center items-center h-screen w-full gap-[56px]">
            <h1 className="header text-4xl">How are you feeling today?</h1>

            <div className="presets flex gap-[70px]">
                {['happy', 'calm', 'gloomy', 'excited', 'anger', 'confused'].map(mood => (
                    <a key={mood} href={`/recommendations?mood=${mood}`} className="bg-cover flex justify-start items-end p-3 text-2xl"
                       style={{ backgroundImage: `url(/bc/${mood}.png)`, width: '155px', height: '155px', borderRadius: '16px' }}>
                        {mood.charAt(0).toUpperCase() + mood.slice(1)}
                    </a>
                ))}
            </div>

            <button className="mt-8 border rounded-full border-white px-5 py-2 flex gap-[10px]">
                <p>...or just jot down whatever’s on your mind</p>
                <Image src="/return.svg" alt="return btn" width={20} height={20} />
            </button>
        </section>
    );
}
