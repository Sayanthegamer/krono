import React from 'react';

import { useScheduleStatus } from '../hooks/useScheduleStatus';
import { ClassCard } from '../components/ClassCard';
import { TodoWidget } from '../components/TodoWidget';
import type { TimeTableEntry } from '../types';
import { format, isWithinInterval, parse, getDay } from 'date-fns';
import { motion, AnimatePresence } from 'framer-motion';
import { Clock, Sparkles, Plus, ChevronRight } from 'lucide-react';

import { useAuth } from '../context/AuthContext';
import { useTimetable } from '../context/TimetableContext';

interface DashboardProps {
    onEntryClick: (entry: TimeTableEntry) => void;
    onAddEntry: () => void;
}

export const Dashboard: React.FC<DashboardProps> = ({ onEntryClick, onAddEntry }) => {
    const { user } = useAuth();
    const { entries } = useTimetable();
    const { currentClass, nextClass, now } = useScheduleStatus();

    // Dynamic Greeting
    const hour = now.getHours();
    let timeGreeting = 'Good Morning';
    if (hour >= 12) timeGreeting = 'Good Afternoon';
    if (hour >= 18) timeGreeting = 'Good Evening';

    const displayName = user?.displayName ? user.displayName.split(' ')[0] : 'Friend';

    // Get all today's classes sorted by time
    const todayEntries = React.useMemo(() => {
        const days: string[] = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
        const currentDayName = days[getDay(now)];
        return entries
            .filter(e => e.days.includes(currentDayName))
            .sort((a, b) => a.startTime.localeCompare(b.startTime));
    }, [entries, now]);

    // Categorize classes
    const pastClasses = todayEntries.filter(entry => {
        const end = parse(entry.endTime, 'HH:mm', now);
        return end < now;
    });

    const upcomingClasses = todayEntries.filter(entry => {
        const start = parse(entry.startTime, 'HH:mm', now);
        const end = parse(entry.endTime, 'HH:mm', now);
        return start >= now || isWithinInterval(now, { start, end });
    });

    return (
        <div className="space-y-6 md:space-y-8">
            {/* Header Widget */}
            <header className="relative z-10">
                <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                >
                    <div className="flex items-center gap-2 mb-1">
                        <Sparkles className="text-secondary w-5 h-5 animate-pulse-glow" />
                        <span className="text-sm font-medium text-secondary uppercase tracking-widest">{timeGreeting}</span>
                    </div>
                    <h2 className="text-3xl md:text-4xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-primary to-secondary">
                        Hi, {displayName}
                    </h2>
                    <p className="text-muted-foreground text-lg">{format(now, 'EEEE, MMMM d, yyyy')}</p>
                </motion.div>
            </header>

            {/* UP NEXT WIDGET - Large & Prominent */}
            <section>
                <AnimatePresence mode="wait">
                    {currentClass ? (
                        <motion.div
                            key="current"
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -20 }}
                            transition={{ duration: 0.3, ease: 'easeOut' }}
                        >
                            <div className="flex items-center justify-between mb-4">
                                <h3 className="text-xl font-semibold text-foreground">Happening Now</h3>
                                <span className="px-3 py-1 rounded-full bg-primary/20 text-primary text-xs font-bold uppercase tracking-wider animate-pulse-glow">
                                    Live
                                </span>
                            </div>
                            <ClassCard
                                entry={currentClass}
                                status="current"
                                onClick={() => onEntryClick(currentClass)}
                            />
                        </motion.div>
                    ) : nextClass ? (
                        <motion.div
                            key="next"
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -20 }}
                            transition={{ duration: 0.3, ease: 'easeOut' }}
                        >
                            <div className="flex items-center justify-between mb-4">
                                <h3 className="text-xl font-semibold text-foreground">Up Next</h3>
                                <span className="text-sm text-muted-foreground">
                                    in {format(parse(nextClass.startTime, 'HH:mm', now), 'h:mm a')}
                                </span>
                            </div>
                            <ClassCard
                                entry={nextClass}
                                status="next"
                                onClick={() => onEntryClick(nextClass)}
                            />
                        </motion.div>
                    ) : (
                        <motion.div
                            key="empty"
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.95 }}
                            transition={{ duration: 0.3, ease: 'easeOut' }}
                            className="glass-card p-8 rounded-xl flex flex-col items-center justify-center text-center py-12 border-dashed border-border"
                        >
                            <div className="w-16 h-16 rounded-full bg-gradient-to-br from-green-500/20 to-emerald-500/20 flex items-center justify-center mb-4">
                                <Clock className="text-green-400 w-8 h-8" />
                            </div>
                            <h3 className="text-xl font-bold text-foreground mb-2">All caught up!</h3>
                            <p className="text-muted-foreground">No more classes for today. Enjoy your free time!</p>
                        </motion.div>
                    )}
                </AnimatePresence>
            </section>

            {/* TODAY'S SCHEDULE */}
            {todayEntries.length > 0 && (
                <section>
                    <div className="flex items-center justify-between mb-4">
                        <h3 className="text-xl font-semibold text-foreground">Today's Schedule</h3>
                        <button
                            onClick={onAddEntry}
                            className="flex items-center gap-2 px-4 py-2 rounded-xl bg-primary text-primary-foreground text-sm font-semibold hover:bg-primary/90 transition-smooth hover:scale-105 active:scale-95"
                        >
                            <Plus size={16} />
                            <span>Add Class</span>
                        </button>
                    </div>

                    <div className="space-y-3">
                        {upcomingClasses.map((entry, index) => (
                            <motion.div
                                key={entry.id}
                                initial={{ opacity: 0, x: -10 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{ delay: index * 0.05, ease: 'easeOut' }}
                            >
                                <ClassCard
                                    entry={entry}
                                    status={entry === currentClass ? 'current' : entry === nextClass ? 'next' : 'future'}
                                    onClick={() => onEntryClick(entry)}
                                />
                            </motion.div>
                        ))}
                        {pastClasses.length > 0 && upcomingClasses.length > 0 && (
                            <div className="py-2 flex items-center gap-3">
                                <div className="flex-1 h-px bg-border" />
                                <span className="text-xs text-muted-foreground uppercase tracking-wider">Past</span>
                                <div className="flex-1 h-px bg-border" />
                            </div>
                        )}
                        {pastClasses.map((entry, index) => (
                            <motion.div
                                key={entry.id}
                                initial={{ opacity: 0, x: -10 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{ delay: (upcomingClasses.length + index) * 0.05, ease: 'easeOut' }}
                            >
                                <ClassCard
                                    entry={entry}
                                    status="past"
                                    onClick={() => onEntryClick(entry)}
                                />
                            </motion.div>
                        ))}
                    </div>
                </section>
            )}

            {/* PRODUCTIVITY WIDGETS */}
            <section id="todo-widget">
                <TodoWidget />
            </section>
        </div>
    );
};
