import React, { useState } from 'react';
import { createPortal } from 'react-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { X, AlertTriangle, Loader2 } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { collection, query, where, getDocs, deleteDoc, doc } from 'firebase/firestore';
import { db } from '../lib/firebase';

interface SettingsModalProps {
    isOpen: boolean;
    onClose: () => void;
}

export const SettingsModal: React.FC<SettingsModalProps> = ({ isOpen, onClose }) => {
    const { user } = useAuth();
    const [status, setStatus] = useState<'idle' | 'confirming' | 'deleting' | 'success'>('idle');
    const [confirmPhrase, setConfirmPhrase] = useState('');
    const [error, setError] = useState('');

    const REQUIRED_PHRASE = 'DELETE-MY-DATA';

    const handleResetData = async () => {
        if (!user) return;
        if (confirmPhrase !== REQUIRED_PHRASE) {
            setError('Incorrect confirmation phrase');
            return;
        }

        // Final confirmation prompt
        if (!window.confirm("FINAL WARNING: This action cannot be undone. Are you absolutely sure?")) {
            return;
        }

        setStatus('deleting');
        setError('');

        try {
            const collections = ['entries', 'todos', 'focus_history'];

            // Note: Firestore batch limit is 500. For a real app with huge data, we'd need to chunk this.
            // For this personal app, fetching and deleting is feasible, but let's do it safely.

            for (const colName of collections) {
                const q = query(collection(db, colName), where('userId', '==', user.uid));
                const snapshot = await getDocs(q);

                snapshot.docs.forEach((document) => {
                    deleteDoc(doc(db, colName, document.id));
                });
            }

            setStatus('success');
            setTimeout(() => {
                onClose();
                setStatus('idle');
                setConfirmPhrase('');
                window.location.reload(); // Refresh to clear local state/cache quirks
            }, 2000);

        } catch (err) {
            console.error('Error resetting data:', err);
            setError('Failed to delete data. Please try again.');
            setStatus('idle');
        }
    };

    return createPortal(
        <AnimatePresence>
            {isOpen && (
                <>
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={onClose}
                        className="fixed inset-0 bg-black/60 z-[300] backdrop-blur-sm"
                    />
                    <motion.div
                        initial={{ opacity: 0, scale: 0.95, y: 20 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.95, y: 20 }}
                        className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-md bg-card border border-border rounded-2xl shadow-2xl z-[301] p-6"
                    >
                        <div className="flex justify-between items-center mb-6">
                            <h2 className="text-xl font-bold">Settings</h2>
                            <button onClick={onClose} className="p-2 hover:bg-muted rounded-full transition-colors">
                                <X size={20} />
                            </button>
                        </div>

                        {/* Account Info */}
                        <div className="mb-8 p-4 bg-muted/50 rounded-xl flex items-center gap-4">
                            <div className="w-12 h-12 rounded-full bg-gradient-to-tr from-primary to-purple-500 flex items-center justify-center text-white font-bold text-lg">
                                {user?.displayName?.[0] || user?.email?.[0]?.toUpperCase()}
                            </div>
                            <div>
                                <h3 className="font-semibold">{user?.displayName || 'User'}</h3>
                                <p className="text-sm text-muted-foreground">{user?.email}</p>
                            </div>
                        </div>

                        {/* Danger Zone */}
                        <div className="border border-destructive/20 bg-destructive/5 rounded-xl p-4">
                            <div className="flex items-center gap-2 text-destructive mb-2">
                                <AlertTriangle size={18} />
                                <h3 className="font-semibold text-sm uppercase tracking-wider">Danger Zone</h3>
                            </div>

                            {status === 'success' ? (
                                <div className="text-green-500 text-center py-4 font-bold">
                                    Data Successfully Reset! Reloading...
                                </div>
                            ) : status === 'idle' || status === 'confirming' ? (
                                <div className="space-y-4">
                                    <p className="text-sm text-muted-foreground">
                                        Permanently delete all timetable entries, tasks, and focus history. This cannot be undone.
                                    </p>

                                    {status === 'idle' ? (
                                        <button
                                            onClick={() => setStatus('confirming')}
                                            className="w-full py-2.5 bg-background border-2 border-destructive/20 text-destructive font-semibold rounded-lg hover:bg-destructive hover:text-white transition-all"
                                        >
                                            Reset All Data
                                        </button>
                                    ) : (
                                        <div className="space-y-3 animate-in fade-in slide-in-from-top-2">
                                            <label className="block text-xs font-semibold text-destructive">
                                                Type <span className="font-mono bg-destructive/10 px-1 rounded">{REQUIRED_PHRASE}</span> to confirm
                                            </label>
                                            <input
                                                type="text"
                                                value={confirmPhrase}
                                                onChange={(e) => setConfirmPhrase(e.target.value)}
                                                placeholder={REQUIRED_PHRASE}
                                                className="w-full p-2 text-sm bg-background border border-destructive/30 rounded-lg text-destructive placeholder:text-destructive/30 focus:outline-none focus:ring-2 focus:ring-destructive/50"
                                            />
                                            {error && <p className="text-xs text-destructive font-semibold">{error}</p>}
                                            <div className="flex gap-2">
                                                <button
                                                    onClick={() => setStatus('idle')}
                                                    className="flex-1 py-2 text-sm font-medium text-muted-foreground hover:bg-muted rounded-lg"
                                                >
                                                    Cancel
                                                </button>
                                                <button
                                                    onClick={handleResetData}
                                                    disabled={confirmPhrase !== REQUIRED_PHRASE}
                                                    className="flex-1 py-2 text-sm font-bold bg-destructive text-white rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-destructive/90"
                                                >
                                                    Delete Everything
                                                </button>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            ) : (
                                <div className="flex flex-col items-center justify-center py-6 text-destructive">
                                    <Loader2 className="w-8 h-8 animate-spin mb-2" />
                                    <span className="font-semibold text-sm">Deleting Data...</span>
                                </div>
                            )}
                        </div>
                    </motion.div>
                </>
            )}
        </AnimatePresence>,
        document.body
    );
};
