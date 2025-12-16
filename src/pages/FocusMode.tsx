import React, { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import { Play, Pause, RotateCcw } from 'lucide-react';

type TimerMode = 'focus' | 'short' | 'long';

const MODES: Record<TimerMode, { label: string; minutes: number; color: string }> = {
    focus: { label: 'Focus', minutes: 25, color: 'text-primary' },
    short: { label: 'Short Break', minutes: 5, color: 'text-teal-500' },
    long: { label: 'Long Break', minutes: 15, color: 'text-indigo-500' },
};

export const FocusMode: React.FC = () => {
    const [mode, setMode] = useState<TimerMode>('focus');
    const [timeLeft, setTimeLeft] = useState(MODES.focus.minutes * 60);
    const [isActive, setIsActive] = useState(false);
    const audioRef = useRef<HTMLAudioElement | null>(null);

    // Initialize audio
    useEffect(() => {
        audioRef.current = new Audio('https://actions.google.com/sounds/v1/alarms/beep_short.ogg');
    }, []);

    useEffect(() => {
        let interval: ReturnType<typeof setInterval>;

        if (isActive && timeLeft > 0) {
            interval = setInterval(() => {
                setTimeLeft((time) => time - 1);
            }, 1000);
        } else if (timeLeft === 0) {
            setIsActive(false);
            if (audioRef.current) {
                audioRef.current.play().catch(e => console.log('Audio play failed', e));
            }
            // Optional: Send a notification if permission granted
            if (Notification.permission === 'granted') {
                new Notification("Timer Complete!", {
                    body: `${MODES[mode].label} finished.`,
                    icon: '/logo.svg'
                });
            }
        }

        return () => clearInterval(interval);
    }, [isActive, timeLeft, mode]);

    const toggleTimer = () => setIsActive(!isActive);

    const resetTimer = () => {
        setIsActive(false);
        setTimeLeft(MODES[mode].minutes * 60);
    };

    const switchMode = (newMode: TimerMode) => {
        setMode(newMode);
        setIsActive(false);
        setTimeLeft(MODES[newMode].minutes * 60);
    };

    const formatTime = (seconds: number) => {
        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    };

    // Circular Progress Calculation
    const totalTime = MODES[mode].minutes * 60;
    const progress = ((totalTime - timeLeft) / totalTime) * 100;
    const circleSize = 280;
    const radius = 120;
    const circumference = 2 * Math.PI * radius;
    const strokeDashoffset = circumference - (progress / 100) * circumference;

    return (
        <div className="flex flex-col items-center justify-center p-6 space-y-8 h-full min-h-[70vh]">

            {/* Mode Selectors */}
            <div className="flex bg-muted p-1 rounded-xl">
                {(Object.keys(MODES) as TimerMode[]).map((m) => (
                    <button
                        key={m}
                        onClick={() => switchMode(m)}
                        className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${mode === m
                            ? 'bg-background shadow-sm text-foreground'
                            : 'text-muted-foreground hover:text-foreground'
                            }`}
                    >
                        {MODES[m].label}
                    </button>
                ))}
            </div>

            {/* Timer Display */}
            <div className="relative flex items-center justify-center">
                {/* SVG Ring */}
                <svg width={circleSize} height={circleSize} className="transform -rotate-90">
                    <circle
                        cx={circleSize / 2}
                        cy={circleSize / 2}
                        r={radius}
                        stroke="currentColor"
                        strokeWidth="12"
                        fill="transparent"
                        className="text-muted/20"
                    />
                    <motion.circle
                        cx={circleSize / 2}
                        cy={circleSize / 2}
                        r={radius}
                        stroke="currentColor"
                        strokeWidth="12"
                        fill="transparent"
                        className={`${MODES[mode].color}`}
                        strokeDasharray={circumference}
                        animate={{ strokeDashoffset }}
                        transition={{ duration: 1, ease: 'linear' }}
                        strokeLinecap="round"
                    />
                </svg>

                {/* Time Text */}
                <div className="absolute inset-0 flex flex-col items-center justify-center">
                    <div className="text-6xl font-bold font-mono tracking-tighter">
                        {formatTime(timeLeft)}
                    </div>
                    <p className="text-muted-foreground mt-2 uppercase tracking-widest text-xs">
                        {isActive ? 'Running' : 'Paused'}
                    </p>
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
