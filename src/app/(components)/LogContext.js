'use client';

import React, { createContext, useContext, useState } from 'react';

const LogContext = createContext();

export function LogProvider({ children }) {
    const [logs, setLogs] = useState([]);
    const [showConsole, setShowConsole] = useState(false);

    const addLog = (message) => {
        const timestamp = new Date().toLocaleTimeString();
        setLogs(prev => [...prev, `[${timestamp}] ${message}`]);
    };

    const clearLogs = () => setLogs([]);

    return (
        <LogContext.Provider value={{ logs, setLogs, addLog, showConsole, setShowConsole, clearLogs }}>
            {children}
        </LogContext.Provider>
    );
}

export const useLogs = () => {
    const context = useContext(LogContext);
    if (!context) {
        throw new Error("useLogs must be used within a LogProvider");
    }
    return context;
};