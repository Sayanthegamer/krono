import React from 'react';
import { useTimetable } from '../context/TimetableContext';
import { useScheduleStatus } from '../hooks/useScheduleStatus';
import { ClassCard } from '../components/ClassCard';
import type { TimeTableEntry, DayOfWeek } from '../types';
import { format } from 'date-fns';
import { motion } from 'framer-motion';
import { Clock, Sparkles } from 'lucide-react';

interface DashboardProps {
    onEntryClick: (entry: TimeTableEntry) => void;
}

export const Dashboard: React.FC<DashboardProps> = ({ onEntryClick }) => {
    const { entries } = useTimetable();
    const { currentClass, nextClass, now } = useScheduleStatus(entries);

    // Get all today's entries
    const days: DayOfWeek[] = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
    const currentDayName = days[now.getDay()];
    const todayEntries = entries
        .filter(e => e.days.includes(currentDayName))
        .sort((a, b) => a.startTime.localeCompare(b.startTime));

    // Dynamic Greeting
    const hour = now.getHours();
    let greeting = 'Good Morning';
    if (hour >= 12) greeting = 'Good Afternoon';
    if (hour >= 18) greeting = 'Good Evening';

    return (
        <div className="space-y-8">
            {/* Header Widget */}
            <header className="relative z-10">
                <div className="flex items-center gap-2 mb-1">
                    <Sparkles className="text-secondary w-5 h-5 animate-pulse" />
                    <span className="text-sm font-medium text-secondary uppercase tracking-widest">Today's Focus</span>
                </div>
                <h2 className="text-4xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-white to-white/50">{greeting}</h2>
                <p className="text-muted-foreground text-lg">{format(now, 'EEEE, MMMM do')}</p>
            </header>

            {/* UP NEXT WIDGET - Large & Prominent */}
            <section>
                {currentClass ? (
                    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
                        <h3 className="text-xl font-semibold mb-4 text-white">Happening Now</h3>
                        <ClassCard
                            entry={currentClass}
                            status="current"
                            onClick={() => onEntryClick(currentClass)}
                        />
                    </motion.div>
                ) : nextClass ? (
                    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
                        <h3 className="text-xl font-semibold mb-4 text-white">Up Next</h3>
                        <ClassCard
                            entry={nextClass}
                            status="next"
                            onClick={() => onEntryClick(nextClass)}
                        />
                    </motion.div>
                ) : (
                    <motion.div
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="glass-card p-8 rounded-3xl flex flex-col items-center justify-center text-center py-12 border-dashed border-white/20"
                    >
                        <div className="w-16 h-16 rounded-full bg-secondary/10 flex items-center justify-center mb-4">
                            <Clock className="text-secondary w-8 h-8" />
                        </div>
                        <h3 className="text-xl font-bold text-white mb-2">Caught up!</h3>
                        <p className="text-muted-foreground">No more classes for today.</p>
                    </motion.div>
                )}
            </section>

            {/* Timeline Widget */}
            {todayEntries.length > 0 && (
                <section>
                    <div className="flex items-center justify-between mb-4">
                        <h3 className="text-lg font-semibold text-white">Timeline</h3>
                        <span className="text-xs text-muted-foreground bg-white/5 px-3 py-1 rounded-full">{todayEntries.length} Classes</span>
                    </div>

                    <div className="space-y-4 pl-4 border-l border-white/10 ml-2 relative">
                        {todayEntries.map((entry, idx) => {
                            let status: 'past' | 'future' | 'current' = 'future';
                            if (currentClass?.id === entry.id) status = 'current';
                            else if (entry.endTime <= format(now, 'HH:mm')) status = 'past';

                            return (
                                <motion.div
                                    key={entry.id}
                                    initial={{ opacity: 0, x: -20 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    transition={{ delay: idx * 0.1 }}
                                    className="relative pl-6"
                                >
                                    {/* Timeline Dot */}
                                    <div className={`absolute left-[-5px] top-6 w-2.5 h-2.5 rounded-full ${status === 'current' ? 'bg-primary ring-4 ring-primary/20' : 'bg-white/20'}`} />

                                    <ClassCard
                                        entry={entry}
                                        status={status}
                                        onClick={() => onEntryClick(entry)}
                                    />
                                </motion.div>
                            );
                        })}
                    </div>
                </section>
            )}
        </div>
    );
};
