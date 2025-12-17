import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Play, Pause, RotateCcw, Settings2 } from 'lucide-react';
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
        customMinutes // Get the dynamic custom duration
    } = useFocus();

    const formatTime = (seconds: number) => {
        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    };

    // Circular Progress Calculation
    const currentTotalTime = (mode === 'custom')
        ? (customMinutes * 60) // Use dynamic state, NOT static constant
        : MODES[mode].minutes * 60;

    // Fix progress bar jumping for custom: Re-calculate based on initial timeLeft if needed, 
    // but simplified: Calculate progress based on max of timeLeft or set duration
    const progress = Math.max(0, Math.min(100, ((currentTotalTime - timeLeft) / currentTotalTime) * 100));

    const radius = 120;
    const circumference = 2 * Math.PI * radius;
    const strokeDashoffset = circumference - (progress / 100) * circumference;

    const handleModeSwitch = (newMode: TimerMode) => {
        // Warn if active OR if paused but not reset (progress made but not finished)
        const hasProgress = timeLeft < currentTotalTime && timeLeft > 0;

        if (isActive || hasProgress) {
            const confirmSwitch = window.confirm("Timer is in progress! Switching modes will reset the current timer. Continue?");
            if (!confirmSwitch) return;
        }
        setMode(newMode);
    };

    return (
        <div className="flex flex-col items-center justify-center p-6 space-y-8 h-full min-h-[70vh]">

            {/* Mode Selectors */}
            <div className="relative flex p-1 rounded-2xl bg-black/20 backdrop-blur-md border border-white/5 w-full max-w-sm mx-auto">
                {(Object.keys(MODES) as TimerMode[]).map((m) => {
                    const isActive = mode === m;
                    return (
                        <button
                            key={m}
                            onClick={() => handleModeSwitch(m)}
                            className={`relative flex-1 py-2 text-xs md:text-sm font-medium transition-colors z-10 ${isActive ? 'text-white font-bold' : 'text-muted-foreground hover:text-white/80'
                                }`}
                        >
                            {isActive && (
                                <motion.div
                                    layoutId="active-mode-pill"
                                    className="absolute inset-0 bg-white/10 rounded-xl border border-white/10 shadow-sm"
                                    transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
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
                        className="flex items-center gap-2"
                    >
                        <Settings2 size={16} className="text-muted-foreground" />
                        <input
                            type="number"
                            min="1"
                            max="180"
                            placeholder="Mins"
                            className="bg-muted text-foreground border border-border rounded-lg px-3 py-1 w-20 text-center focus:outline-none focus:ring-2 focus:ring-primary"
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
                <svg width="260" height="260" viewBox="0 0 280 280" className="transform -rotate-90">
                    <circle
                        cx="140"
                        cy="140"
                        r={radius}
                        stroke="currentColor"
                        strokeWidth="12"
                        fill="transparent"
                        className="text-muted/20"
                    />
                    <motion.circle
                        cx="140"
                        cy="140"
                        r={radius}
                        stroke="currentColor"
                        strokeWidth="12"
                        fill="transparent"
                        className={`${MODES[mode].color}`}
                        strokeDasharray={circumference}
                        initial={{ strokeDashoffset: circumference }}
                        animate={{ strokeDashoffset }}
                        transition={{ duration: 1, ease: 'linear' }}
                        strokeLinecap="round"
                    />
                </svg>

                {/* Time Text */}
                <div className="absolute inset-0 flex flex-col items-center justify-center">
                    <div className="text-5xl md:text-6xl font-bold font-mono tracking-tighter text-foreground">
                        {formatTime(timeLeft)}
                    </div>
                    <div className="text-muted-foreground mt-2 uppercase tracking-widest text-xs flex flex-col items-center gap-1">
                        <span>{isActive ? 'Running' : 'Paused'}</span>
                        <span className="text-[10px] opacity-50 lowercase py-1 px-2 border border-border rounded-full">
                            {isActive ? 'tap controls below' : 'select duration & press play'}
                        </span>
                    </div>
                </div>
            </div>

            {/* Controls */}
            <div className="flex items-center gap-6">
                <button
                    onClick={resetTimer}
                    className="p-4 rounded-full bg-muted text-foreground hover:bg-muted/80 transition-colors"
                >
                    <RotateCcw size={24} />
                </button>

                <button
                    onClick={toggleTimer}
                    className={`p-6 rounded-full shadow-lg transform transition-all active:scale-95 ${isActive
                        ? 'bg-amber-500 text-white hover:bg-amber-600'
                        : 'bg-primary text-primary-foreground hover:bg-primary/90'
                        }`}
                >
                    {isActive ? <Pause size={32} fill="currentColor" /> : <Play size={32} fill="currentColor" className="ml-1" />}
                </button>
            </div>
        </div>
    );
};
