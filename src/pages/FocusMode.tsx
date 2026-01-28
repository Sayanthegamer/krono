import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Play, Pause, RotateCcw, Settings2, Trophy, CheckCircle, ArrowRight } from 'lucide-react';
import { useFocus, MODES } from '../context/FocusContext';
import type { TimerMode } from '../context/FocusContext';

export const FocusMode: React.FC = () => {
    const {
        mode,
        setMode,
        timeLeft,
        isActive,
        toggleTimer,
        resetTimer,
        setCustomDuration,
        customMinutes,
        sessionHistory
    } = useFocus();

    const [showCelebration, setShowCelebration] = useState(false);
    const [completedSessionTime, setCompletedSessionTime] = useState(0);

    // Show celebration when timer completes
    useEffect(() => {
        if (timeLeft === 0 && !isActive && !showCelebration) {
            setShowCelebration(true);
            setCompletedSessionTime(mode === 'custom' ? customMinutes : MODES[mode].minutes);

            // Auto-hide after 3 seconds
            const timer = setTimeout(() => {
                setShowCelebration(false);
            }, 3000);
            return () => clearTimeout(timer);
        }
    }, [timeLeft, isActive, showCelebration, mode, customMinutes]);

    const formatTime = (seconds: number) => {
        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    };

    // Circular Progress Calculation
    const currentTotalTime = (mode === 'custom')
        ? (customMinutes * 60)
        : MODES[mode].minutes * 60;

    const progress = Math.max(0, Math.min(100, ((currentTotalTime - timeLeft) / currentTotalTime) * 100));

    const radius = 120;
    const circumference = 2 * Math.PI * radius;
    const strokeDashoffset = circumference - (progress / 100) * circumference;

    const handleModeSwitch = (newMode: TimerMode) => {
        const hasProgress = timeLeft < currentTotalTime && timeLeft > 0;

        if (isActive || hasProgress) {
            const confirmSwitch = window.confirm("Timer is in progress! Switching modes will reset the current timer. Continue?");
            if (!confirmSwitch) return;
        }
        setMode(newMode);
    };

    return (
        <div className="flex flex-col items-center justify-center p-6 space-y-8 h-full min-h-[70vh] relative">

            {/* Celebration Overlay */}
            <AnimatePresence>
                {showCelebration && (
                    <motion.div
                        initial={{ opacity: 0, scale: 0.8 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.8 }}
                        className="absolute inset-0 z-20 flex items-center justify-center bg-background/95 backdrop-blur-xl"
                    >
                        <motion.div
                            initial={{ y: 50, opacity: 0 }}
                            animate={{ y: 0, opacity: 1 }}
                            transition={{ delay: 0.2 }}
                            className="text-center"
                        >
                            <motion.div
                                animate={{ rotate: [0, 360], scale: [1, 1.2, 1] }}
                                transition={{ duration: 1.5, ease: 'easeInOut' }}
                                className="w-24 h-24 rounded-full bg-gradient-to-br from-yellow-400 to-orange-500 flex items-center justify-center mx-auto mb-6 shadow-lg shadow-orange-500/30"
                            >
                                <Trophy className="text-white w-12 h-12" />
                            </motion.div>
                            <h2 className="text-3xl font-bold text-foreground mb-2">Session Complete!</h2>
                            <p className="text-muted-foreground text-lg mb-6">
                                Great job! You focused for {completedSessionTime} minutes.
                            </p>
                            <motion.button
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                transition={{ delay: 0.5 }}
                                onClick={() => setShowCelebration(false)}
                                className="flex items-center gap-2 px-6 py-3 rounded-xl bg-primary text-primary-foreground font-semibold hover:bg-primary/90 transition-smooth"
                            >
                                Continue
                                <ArrowRight size={18} />
                            </motion.button>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Session Counter */}
            <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="flex items-center gap-2 text-sm text-muted-foreground bg-black/5 dark:bg-white/5 px-4 py-2 rounded-full border border-black/5 dark:border-white/5"
            >
                <CheckCircle className="text-green-400" size={16} />
                <span className="font-medium">{sessionHistory.length}</span>
                <span>sessions completed</span>
            </motion.div>

            {/* Mode Selectors */}
            <div className="relative flex p-1 rounded-xl bg-black/20 backdrop-blur-md border border-white/5 w-full max-w-sm mx-auto">
                {(Object.keys(MODES) as TimerMode[]).map((m) => {
                    const isActiveMode = mode === m;
                    return (
                        <button
                            key={m}
                            onClick={() => handleModeSwitch(m)}
                            className={`relative flex-1 py-2.5 text-sm font-semibold transition-all z-10 ${isActiveMode ? 'text-white' : 'text-muted-foreground hover:text-white/80'
                                }`}
                        >
                            {isActiveMode && (
                                <motion.div
                                    layoutId="active-mode-pill"
                                    className="absolute inset-0 bg-white/10 rounded-lg border border-white/10 shadow-sm"
                                    transition={{ type: "spring", bounce: 0.2, duration: 0.5, ease: 'easeOut' }}
                                />
                            )}
                            <span className="relative z-10">{MODES[m].label}</span>
                        </button>
                    );
                })}
            </div>

            {/* Custom Input (Only visible in Custom Mode) */}
            <AnimatePresence>
                {mode === 'custom' && !isActive && (
                    <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        exit={{ opacity: 0, height: 0 }}
                        className="flex items-center gap-2 bg-black/5 dark:bg-white/5 px-4 py-2 rounded-xl border border-black/5 dark:border-white/5"
                    >
                        <Settings2 size={16} className="text-muted-foreground" />
                        <input
                            type="number"
                            min="1"
                            max="180"
                            placeholder="Mins"
                            className="bg-transparent text-foreground border-none focus:outline-none focus:ring-0 w-16 text-center font-semibold"
                            onChange={(e) => {
                                const val = parseInt(e.target.value);
                                if (!isNaN(val) && val > 0) setCustomDuration(val);
                            }}
                        />
                        <span className="text-sm text-muted-foreground">min</span>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Timer Display */}
            <div className="relative flex items-center justify-center scale-90 md:scale-100 transition-transform">
                {/* SVG Ring */}
                <svg width="280" height="280" viewBox="0 0 280 280" className="transform -rotate-90">
                    {/* Background Ring */}
                    <circle
                        cx="140"
                        cy="140"
                        r={radius}
                        stroke="currentColor"
                        strokeWidth="14"
                        fill="transparent"
                        className="text-muted/10"
                    />
                    {/* Progress Ring */}
                    <motion.circle
                        cx="140"
                        cy="140"
                        r={radius}
                        stroke="currentColor"
                        strokeWidth="14"
                        fill="transparent"
                        className={`${MODES[mode].color}`}
                        strokeDasharray={circumference}
                        initial={{ strokeDashoffset: circumference }}
                        animate={{ strokeDashoffset }}
                        transition={{ duration: 1, ease: 'linear' }}
                        strokeLinecap="round"
                        style={{
                            filter: `drop-shadow(0 0 8px ${mode === 'focus' ? 'var(--primary)' : mode === 'short' ? '#14b8a6' : mode === 'long' ? '#6366f1' : '#ec4899'})`,
                        }}
                    />
                </svg>

                {/* Time Text */}
                <div className="absolute inset-0 flex flex-col items-center justify-center">
                    <motion.div
                        key={timeLeft}
                        initial={{ scale: 0.95, opacity: 0.8 }}
                        animate={{ scale: 1, opacity: 1 }}
                        className="text-6xl md:text-7xl font-bold font-mono tracking-tighter text-foreground"
                    >
                        {formatTime(timeLeft)}
                    </motion.div>
                    <div className="text-muted-foreground mt-3 uppercase tracking-widest text-xs flex flex-col items-center gap-1.5">
                        <span className={`font-semibold ${isActive ? 'text-primary' : ''}`}>
                            {isActive ? 'Focusing...' : 'Paused'}
                        </span>
                        <span className="text-[10px] opacity-50 lowercase py-1 px-3 border border-border rounded-full bg-black/5 dark:bg-white/5">
                            {isActive ? 'tap controls below' : 'select duration & press play'}
                        </span>
                    </div>
                </div>
            </div>

            {/* Controls */}
            <div className="flex items-center gap-6">
                <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={resetTimer}
                    className="p-4 rounded-full bg-muted text-foreground hover:bg-muted/80 transition-smooth"
                >
                    <RotateCcw size={24} />
                </motion.button>

                <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={toggleTimer}
                    className={`p-7 rounded-2xl shadow-xl transform transition-all ${isActive
                        ? 'bg-gradient-to-br from-amber-500 to-orange-500 text-white hover:shadow-amber-500/30'
                        : 'bg-gradient-to-br from-primary to-purple-600 text-white hover:shadow-primary/30'
                        }`}
                    style={{
                        boxShadow: isActive
                            ? '0 10px 40px -10px rgba(251, 146, 60, 0.5)'
                            : '0 10px 40px -10px rgba(139, 47, 201, 0.5)',
                    }}
                >
                    {isActive ? <Pause size={32} fill="currentColor" /> : <Play size={32} fill="currentColor" className="ml-1" />}
                </motion.button>
            </div>
        </div>
    );
};
