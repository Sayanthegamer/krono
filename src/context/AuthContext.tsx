import React, { createContext, useContext, useState, useEffect } from 'react';
import { auth, googleProvider } from '../lib/firebase';
import {
    signInWithPopup,
    signInWithEmailAndPassword,
    createUserWithEmailAndPassword,
    signOut,
    onAuthStateChanged
} from 'firebase/auth';
import type { User } from 'firebase/auth';
import { getErrorMessage, logError } from '../lib/errors';
import { useToast } from './ToastContext';

interface AuthContextType {
    user: User | null;
    isLoading: boolean;
    lastError: string | null;
    isSigningIn: boolean;
    signInWithGoogle: () => Promise<void>;
    signInWithEmail: (email: string, password: string) => Promise<void>;
    signUpWithEmail: (email: string, password: string) => Promise<void>;
    logout: () => Promise<void>;
    clearError: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const { showError, showSuccess } = useToast();
    const [user, setUser] = useState<User | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [lastError, setLastError] = useState<string | null>(null);
    const [isSigningIn, setIsSigningIn] = useState(false);

    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, (user) => {
            setUser(user);
            setIsLoading(false);
        });
        return unsubscribe;
    }, []);

    const clearError = () => setLastError(null);

    const signInWithGoogle = async () => {
        try {
            setIsSigningIn(true);
            setLastError(null);
            await signInWithPopup(auth, googleProvider);
            showSuccess('Welcome back!', 'Successfully signed in with Google');
        } catch (error) {
            const errorMessage = getErrorMessage(error);
            
            logError(error, 'Google Sign In');
            setLastError(errorMessage);
            showError('Sign in failed', errorMessage);
            
            throw error;
        } finally {
            setIsSigningIn(false);
        }
    };

    const signInWithEmail = async (email: string, password: string) => {
        try {
            setIsSigningIn(true);
            setLastError(null);
            await signInWithEmailAndPassword(auth, email, password);
            showSuccess('Welcome back!', 'Successfully signed in');
        } catch (error) {
            const errorMessage = getErrorMessage(error);
            
            logError(error, 'Email Sign In');
            setLastError(errorMessage);
            showError('Sign in failed', errorMessage);
            
            throw error;
        } finally {
            setIsSigningIn(false);
        }
    };

    const signUpWithEmail = async (email: string, password: string) => {
        try {
            setIsSigningIn(true);
            setLastError(null);
            await createUserWithEmailAndPassword(auth, email, password);
            showSuccess('Welcome!', 'Account created successfully');
        } catch (error) {
            const errorMessage = getErrorMessage(error);
            
            logError(error, 'Email Sign Up');
            setLastError(errorMessage);
            showError('Sign up failed', errorMessage);
            
            throw error;
        } finally {
            setIsSigningIn(false);
        }
    };

    const logout = async () => {
        try {
            await signOut(auth);
            showSuccess('Goodbye!', 'Successfully signed out');
        } catch (error) {
            const errorMessage = getErrorMessage(error);
            
            logError(error, 'Logout');
            setLastError(errorMessage);
            showError('Logout failed', errorMessage);
            
            throw error;
        }
    };

    return (
        <AuthContext.Provider value={{ 
            user, 
            isLoading, 
            lastError,
            isSigningIn,
            signInWithGoogle, 
            signInWithEmail, 
            signUpWithEmail, 
            logout,
            clearError
        }}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (context === undefined) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
};
