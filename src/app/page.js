'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';  
import Image from 'next/image';
import { useLogs } from "./(components)/LogContext";

export default function Home() {
    const [customMood, setCustomMood] = useState('');
    const router = useRouter();
    const { addLog } = useLogs(); 

    const navigateToMood = (moodValue) => {
        addLog(`Initiating search for mood: "${moodValue}"`);
        router.push(`/recommendations?mood=${encodeURIComponent(moodValue)}`);
    };

    const handleCustomSubmit = (e) => {
        e.preventDefault();
        if (!customMood.trim()) return;
        navigateToMood(customMood);
    };

    return (
        <section className="flex flex-col justify-center items-center h-screen w-full gap-[56px]">
            <h1 className="header text-4xl">How are you feeling today?</h1>
            
            <div className="presets flex gap-[70px]">
                {['happy', 'calm', 'gloomy', 'excited', 'anger', 'confused'].map(mood => (
                    <button 
                        key={mood} 
                        onClick={() => navigateToMood(mood)} 
                        className="bg-cover flex justify-start items-end p-3 text-2xl border-none outline-none cursor-pointer"
                        style={{ backgroundImage: `url(/bc/${mood}.png)`, width: '155px', height: '155px', borderRadius: '16px' }}
                    >
                        {mood.charAt(0).toUpperCase() + mood.slice(1)}
                    </button>
                ))}
            </div>

            <form onSubmit={handleCustomSubmit} className="mt-8 flex flex-col items-center gap-4">
                <div className="border rounded-full border-white px-5 py-2 flex gap-[10px] items-center bg-transparent w-[400px]">
                    <input 
                        type="text"
                        value={customMood}
                        onChange={(e) => setCustomMood(e.target.value)}
                        placeholder="...or just jot down whatever’s on your mind"
                        className="bg-transparent border-none outline-none text-white w-full placeholder:text-white/40"
                    />
                    <button type="submit">
                        <Image src="/return.svg" alt="return btn" width={20} height={20} />
                    </button>
                </div>
            </form>
        </section>
    );
}