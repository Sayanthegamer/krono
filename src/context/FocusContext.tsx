import React, { createContext, useContext, useState, useEffect } from 'react';
import type { FocusSession } from '../types';
import { db } from '../lib/firebase';
import { collection, addDoc, query, where, getDocs, orderBy } from 'firebase/firestore';
import { useAuth } from './AuthContext';

interface FocusContextType {
    isFocusMode: boolean;
    toggleFocusMode: () => void;
    timeLeft: number;
    isActive: boolean;
    toggleTimer: () => void;
    resetTimer: () => void;
    sessionHistory: FocusSession[];
}

const FocusContext = createContext<FocusContextType | undefined>(undefined);

const FOCUS_DURATION = 25 * 60; // 25 minutes in seconds
const HISTORY_COLLECTION = 'focus_history';

export const FocusProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const { user } = useAuth();
    const [isFocusMode, setIsFocusMode] = useState(false);
    const [timeLeft, setTimeLeft] = useState(FOCUS_DURATION);
    const [isActive, setIsActive] = useState(false);
    const [sessionHistory, setSessionHistory] = useState<FocusSession[]>([]);

    // Load history from Firestore
    useEffect(() => {
        if (!user) return;

        const loadHistory = async () => {
            try {
                const q = query(
                    collection(db, HISTORY_COLLECTION),
                    where('userId', '==', user.uid),
                    orderBy('startTime', 'desc')
                );
                const snapshot = await getDocs(q);
                const data = snapshot.docs.map(doc => ({
                    ...doc.data(),
                    id: doc.id
                })) as FocusSession[];
                setSessionHistory(data);
            } catch (error) {
                console.error('Error loading focus history:', error);
            }
        };
        loadHistory();
    }, [user]);

    useEffect(() => {
        let interval: any;

        if (isActive && timeLeft > 0) {
            interval = setInterval(() => {
                setTimeLeft((prev) => prev - 1);
            }, 1000);
        } else if (timeLeft === 0) {
            setIsActive(false);
            // Record session
            if (user) {
                const newSession: Omit<FocusSession, 'id'> & { userId: string } = {
                    startTime: Date.now(),
                    duration: 25,
                    completed: true,
                    userId: user.uid
                };

                addDoc(collection(db, HISTORY_COLLECTION), newSession)
                    .then(docRef => {
                        setSessionHistory(prev => [{ ...newSession, id: docRef.id }, ...prev]);
                    })
                    .catch(e => console.error('Error saving session:', e));
            }
        }

        return () => clearInterval(interval);
    }, [isActive, timeLeft, user]);

    const toggleFocusMode = () => setIsFocusMode(prev => !prev);

    const toggleTimer = () => setIsActive(prev => !prev);

    const resetTimer = () => {
        setIsActive(false);
        setTimeLeft(FOCUS_DURATION);
    };

    return (
        <FocusContext.Provider value={{
            isFocusMode,
            toggleFocusMode,
            timeLeft,
            isActive,
            toggleTimer,
            resetTimer,
            sessionHistory
        }}>
            {children}
        </FocusContext.Provider>
    );
};

export const useFocus = () => {
    const context = useContext(FocusContext);
    if (context === undefined) {
        throw new Error('useFocus must be used within a FocusProvider');
    }
    return context;
};
