'use client';

import { useEffect, useRef } from 'react'; 
import { useLogs } from "./LogContext";

export default function ConsolePanel() {
    const { logs, showConsole, setShowConsole } = useLogs();
    
    const scrollRef = useRef(null);

    useEffect(() => {
        if (scrollRef.current) {
            scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
        }
    }, [logs]); 

    if (!showConsole) return null;

    return (
        <div 
            ref={scrollRef} 
            className="fixed bottom-10 right-10 w-[400px] h-[300px] bg-black/80 border border-green-500/50 rounded-lg p-4 pt-0 font-mono text-xs text-green-400 overflow-y-auto z-[9999] shadow-2xl backdrop-blur-md no-scrollbar scroll-smooth"
        >
            <div className="sticky top-0 pt-4 bg-black/80 backdrop-blur-sm flex justify-between items-center mb-2 border-b border-green-500/30 pb-1">
                <span className="flex items-center gap-2">
                    <span className="w-2 h-2 bg-green-500 rounded-full animate-ping"></span>
                    SYSTEM CONSOLE
                </span>
                <button 
                    onClick={() => setShowConsole(false)} 
                    className="hover:text-white underline cursor-pointer"
                >
                    CLOSE [X]
                </button>
            </div>
            <div className="flex flex-col">
                {logs.map((log, i) => (
                    <div key={i} className="mb-1 break-all animate-in fade-in slide-in-from-bottom-1 duration-200">
                        <span className="text-gray-500 mr-2">{'>'}</span>
                        {log}
                    </div>
                ))}
            </div>
        </div>
    );
}