'use client';
import { useLogs } from "./LogContext";

export default function ConsoleToggle() {
    const { showConsole, setShowConsole } = useLogs();

    return (
        <div className="flex items-center gap-3 bg-black/50 backdrop-blur-md border border-white/20 p-2 px-4 rounded-full shadow-lg">
            <span className="text-[10px] font-mono text-white/60 uppercase tracking-widest">Debug Mode</span>
            <button
                onClick={() => setShowConsole(!showConsole)}
                className={`w-10 h-5 rounded-full transition-all duration-300 relative cursor-pointer ${
                    showConsole ? 'bg-green-500' : 'bg-gray-600'
                }`}
            >
                <div className={`absolute top-1 w-3 h-3 bg-white rounded-full transition-all duration-300 cursor-pointer ${
                    showConsole ? 'left-6' : 'left-1'
                }`} />
            </button>
        </div>
    );
}