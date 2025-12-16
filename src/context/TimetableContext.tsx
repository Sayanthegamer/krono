import React, { createContext, useContext, useState, useEffect } from 'react';
import type { TimeTableEntry, AppSettings } from '../types';

interface TimetableContextType {
    entries: TimeTableEntry[];
    settings: AppSettings;
    addEntry: (entry: Omit<TimeTableEntry, 'id'>) => void;
    updateEntry: (entry: TimeTableEntry) => void;
    deleteEntry: (id: string) => void;
    updateSettings: (settings: Partial<AppSettings>) => void;
}

const TimetableContext = createContext<TimetableContextType | undefined>(undefined);

const STORAGE_KEY = 'timetable_data';
const SETTINGS_KEY = 'timetable_settings';

export const TimetableProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [entries, setEntries] = useState<TimeTableEntry[]>(() => {
        const saved = localStorage.getItem(STORAGE_KEY);
        return saved ? JSON.parse(saved) : [];
    });

    const [settings, setSettings] = useState<AppSettings>(() => {
        const saved = localStorage.getItem(SETTINGS_KEY);
        return saved ? JSON.parse(saved) : { theme: 'system', notificationsEnabled: true };
    });

    useEffect(() => {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(entries));
    }, [entries]);

    useEffect(() => {
        localStorage.setItem(SETTINGS_KEY, JSON.stringify(settings));
        // Apply theme
        const root = window.document.documentElement;
        root.classList.remove('light', 'dark');

        if (settings.theme === 'system') {
            const systemTheme = window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
            root.classList.add(systemTheme);
        } else {
            root.classList.add(settings.theme);
        }
    }, [settings]);

    const addEntry = (entry: Omit<TimeTableEntry, 'id'>) => {
        const newEntry = { ...entry, id: crypto.randomUUID() };
        setEntries(prev => [...prev, newEntry]);
    };

    const updateEntry = (updatedEntry: TimeTableEntry) => {
        setEntries(prev => prev.map(e => e.id === updatedEntry.id ? updatedEntry : e));
    };

    const deleteEntry = (id: string) => {
        setEntries(prev => prev.filter(e => e.id !== id));
    };

    const updateSettings = (newSettings: Partial<AppSettings>) => {
        setSettings(prev => ({ ...prev, ...newSettings }));
    };

    return (
        <TimetableContext.Provider value={{ entries, settings, addEntry, updateEntry, deleteEntry, updateSettings }}>
            {children}
        </TimetableContext.Provider>
    );
};

export const useTimetable = () => {
    const context = useContext(TimetableContext);
    if (context === undefined) {
        throw new Error('useTimetable must be used within a TimetableProvider');
    }
    return context;
};
