import React, { createContext, useContext, useState, useEffect } from 'react';
import type { TimeTableEntry, AppSettings } from '../types';
import { db } from '../lib/firebase';
import { collection, getDocs, addDoc, updateDoc, deleteDoc, doc, query, where } from 'firebase/firestore';
import { useAuth } from './AuthContext';

interface TimetableContextType {
    entries: TimeTableEntry[];
    settings: AppSettings;
    isLoading: boolean;
    addEntry: (entry: Omit<TimeTableEntry, 'id'>) => void;
    updateEntry: (entry: TimeTableEntry) => void;
    deleteEntry: (id: string) => void;
    updateSettings: (settings: Partial<AppSettings>) => void;
}

const TimetableContext = createContext<TimetableContextType | undefined>(undefined);

const ENTRIES_COLLECTION = 'entries';
const SETTINGS_KEY = 'timetable_settings';

export const TimetableProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const { user } = useAuth();
    const [entries, setEntries] = useState<TimeTableEntry[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    const [settings, setSettings] = useState<AppSettings>(() => {
        const saved = localStorage.getItem(SETTINGS_KEY);
        return saved ? { ...JSON.parse(saved), theme: 'dark' } : { theme: 'dark', notificationsEnabled: true };
    });

    // Load entries from Firestore scoped to current user
    useEffect(() => {
        if (!user) return;

        const loadEntries = async () => {
            try {
                const q = query(
                    collection(db, ENTRIES_COLLECTION),
                    where('userId', '==', user.uid)
                );
                const snapshot = await getDocs(q);
                const data = snapshot.docs.map(doc => ({
                    ...doc.data(),
                    id: doc.id
                })) as TimeTableEntry[];
                setEntries(data);
            } catch (error) {
                console.error('Error loading entries from Firestore:', error);
            } finally {
                setIsLoading(false);
            }
        };
        loadEntries();
    }, [user]);

    useEffect(() => {
        localStorage.setItem(SETTINGS_KEY, JSON.stringify(settings));
        document.documentElement.classList.add('dark');
        document.documentElement.classList.remove('light');
    }, [settings]);

    const addEntry = async (entry: Omit<TimeTableEntry, 'id'>) => {
        if (!user) return;
        try {
            const entryWithUser = { ...entry, userId: user.uid };
            const docRef = await addDoc(collection(db, ENTRIES_COLLECTION), entryWithUser);
            const newEntry = { ...entry, id: docRef.id };
            setEntries(prev => [...prev, newEntry]);
        } catch (error) {
            console.error('Error adding entry:', error);
        }
    };

    const updateEntry = async (updatedEntry: TimeTableEntry) => {
        try {
            const { id, ...data } = updatedEntry;
            await updateDoc(doc(db, ENTRIES_COLLECTION, id), data);
            setEntries(prev => prev.map(e => e.id === updatedEntry.id ? updatedEntry : e));
        } catch (error) {
            console.error('Error updating entry:', error);
        }
    };

    const deleteEntry = async (id: string) => {
        try {
            await deleteDoc(doc(db, ENTRIES_COLLECTION, id));
            setEntries(prev => prev.filter(e => e.id !== id));
        } catch (error) {
            console.error('Error deleting entry:', error);
        }
    };

    const updateSettings = (newSettings: Partial<AppSettings>) => {
        setSettings(prev => ({ ...prev, ...newSettings }));
    };

    return (
        <TimetableContext.Provider value={{ entries, settings, isLoading, addEntry, updateEntry, deleteEntry, updateSettings }}>
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
