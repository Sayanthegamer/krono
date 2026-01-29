import React, { createContext, useContext, useState, useEffect } from 'react';
import type { TimeTableEntry, AppSettings } from '../types';
import { db } from '../lib/firebase';
import { collection, getDocs, addDoc, updateDoc, deleteDoc, doc, query, where } from 'firebase/firestore';
import { useAuth } from './AuthContext';
import { useToast } from './ToastContext';
import { getErrorMessage, logError, retryWithBackoff, isRetriableError } from '../lib/errors';

interface TimetableContextType {
    entries: TimeTableEntry[];
    settings: AppSettings;
    isLoading: boolean;
    isSaving: boolean;
    lastError: string | null;
    addEntry: (entry: Omit<TimeTableEntry, 'id'>) => Promise<void>;
    updateEntry: (entry: TimeTableEntry) => Promise<void>;
    deleteEntry: (id: string) => Promise<void>;
    updateSettings: (settings: Partial<AppSettings>) => void;
    clearError: () => void;
    retryLastOperation: () => void;
}

const TimetableContext = createContext<TimetableContextType | undefined>(undefined);

const ENTRIES_COLLECTION = 'entries';
const SETTINGS_KEY = 'timetable_settings';

export const TimetableProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const { user } = useAuth();
    const { showSuccess, showError, showInfo } = useToast();
    const [entries, setEntries] = useState<TimeTableEntry[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isSaving, setIsSaving] = useState(false);
    const [lastError, setLastError] = useState<string | null>(null);
    const [lastFailedOperation, setLastFailedOperation] = useState<(() => Promise<void>) | null>(null);

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
                setLastError(null);
            } catch (error) {
                const errorMessage = getErrorMessage(error);
                logError(error, 'Load Entries');
                setLastError(errorMessage);
                showError('Failed to load schedule', errorMessage);
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

    const clearError = () => setLastError(null);

    const retryLastOperation = () => {
        if (lastFailedOperation) {
            lastFailedOperation();
            setLastFailedOperation(null);
        }
    };

    const addEntry = async (entry: Omit<TimeTableEntry, 'id'>) => {
        if (!user) return;
        
        const operation = async () => {
            setIsSaving(true);
            showInfo('Saving...', 'Adding new class to your schedule');
            
            try {
                const entryWithUser = { ...entry, userId: user.uid };
                const docRef = await addDoc(collection(db, ENTRIES_COLLECTION), entryWithUser);
                const newEntry = { ...entry, id: docRef.id };
                setEntries(prev => [...prev, newEntry]);
                showSuccess('Class added', 'Successfully added to your schedule');
                setLastError(null);
            } catch (error) {
                const errorMessage = getErrorMessage(error);
                logError(error, 'Add Entry');
                setLastError(errorMessage);
                showError('Failed to save class', errorMessage);
                
                // Store operation for retry if it's retriable
                if (isRetriableError(error)) {
                    setLastFailedOperation(() => () => addEntry(entry));
                }
                throw error;
            } finally {
                setIsSaving(false);
            }
        };

        // Use retry logic for Firestore operations
        try {
            await retryWithBackoff(operation, 3, 1000);
        } catch (error) {
            // Error already handled in operation
        }
    };

    const updateEntry = async (updatedEntry: TimeTableEntry) => {
        const operation = async () => {
            setIsSaving(true);
            showInfo('Updating...', 'Saving changes to your class');
            
            try {
                const { id, ...data } = updatedEntry;
                await updateDoc(doc(db, ENTRIES_COLLECTION, id), data);
                setEntries(prev => prev.map(e => e.id === updatedEntry.id ? updatedEntry : e));
                showSuccess('Class updated', 'Changes saved successfully');
                setLastError(null);
            } catch (error) {
                const errorMessage = getErrorMessage(error);
                logError(error, 'Update Entry');
                setLastError(errorMessage);
                showError('Failed to update class', errorMessage);
                
                // Store operation for retry if it's retriable
                if (isRetriableError(error)) {
                    setLastFailedOperation(() => () => updateEntry(updatedEntry));
                }
                throw error;
            } finally {
                setIsSaving(false);
            }
        };

        try {
            await retryWithBackoff(operation, 3, 1000);
        } catch (error) {
            // Error already handled in operation
        }
    };

    const deleteEntry = async (id: string) => {
        const operation = async () => {
            setIsSaving(true);
            showInfo('Deleting...', 'Removing class from your schedule');
            
            try {
                await deleteDoc(doc(db, ENTRIES_COLLECTION, id));
                setEntries(prev => prev.filter(e => e.id !== id));
                showSuccess('Class deleted', 'Successfully removed from your schedule');
                setLastError(null);
            } catch (error) {
                const errorMessage = getErrorMessage(error);
                logError(error, 'Delete Entry');
                setLastError(errorMessage);
                showError('Failed to delete class', errorMessage);
                
                // Store operation for retry if it's retriable
                if (isRetriableError(error)) {
                    setLastFailedOperation(() => () => deleteEntry(id));
                }
                throw error;
            } finally {
                setIsSaving(false);
            }
        };

        try {
            await retryWithBackoff(operation, 3, 1000);
        } catch (error) {
            // Error already handled in operation
        }
    };

    const updateSettings = (newSettings: Partial<AppSettings>) => {
        setSettings(prev => ({ ...prev, ...newSettings }));
    };

    return (
        <TimetableContext.Provider value={{ 
            entries, 
            settings, 
            isLoading, 
            isSaving,
            lastError,
            addEntry, 
            updateEntry, 
            deleteEntry, 
            updateSettings,
            clearError,
            retryLastOperation
        }}>
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
