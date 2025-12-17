import React from 'react';

import { useScheduleStatus } from '../hooks/useScheduleStatus';
import { ClassCard } from '../components/ClassCard';
import { TodoWidget } from '../components/TodoWidget';
import type { TimeTableEntry } from '../types';
import { format } from 'date-fns';
import { motion } from 'framer-motion';
import { Clock, Sparkles } from 'lucide-react';

import { useAuth } from '../context/AuthContext';

interface DashboardProps {
    onEntryClick: (entry: TimeTableEntry) => void;
}

export const Dashboard: React.FC<DashboardProps> = ({ onEntryClick }) => {
    const { user } = useAuth();
    const { currentClass, nextClass, now } = useScheduleStatus();

    // Dynamic Greeting
    const hour = now.getHours();
    let timeGreeting = 'Good Morning';
    if (hour >= 12) timeGreeting = 'Good Afternoon';
    if (hour >= 18) timeGreeting = 'Good Evening';

    const displayName = user?.displayName ? user.displayName.split(' ')[0] : 'Friend';

    return (
        <div className="space-y-6 md:space-y-8">
            {/* Header Widget */}
            <header className="relative z-10">
                <div className="flex items-center gap-2 mb-1">
                    <Sparkles className="text-secondary w-5 h-5 animate-pulse" />
                    <span className="text-sm font-medium text-secondary uppercase tracking-widest">{timeGreeting}</span>
                </div>
                <h2 className="text-3xl md:text-4xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-primary to-secondary">
                    Hi, {displayName}
                </h2>
                <p className="text-muted-foreground text-lg">{format(now, 'EEEE, MMMM do')}</p>
            </header>

            {/* UP NEXT WIDGET - Large & Prominent */}
            <section>
                {currentClass ? (
                    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
                        <h3 className="text-xl font-semibold mb-4 text-foreground">Happening Now</h3>
                        <ClassCard
                            entry={currentClass}
                            status="current"
                            onClick={() => onEntryClick(currentClass)}
                        />
                    </motion.div>
                ) : nextClass ? (
                    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
                        <h3 className="text-xl font-semibold mb-4 text-foreground">Up Next</h3>
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
                        className="glass-card p-8 rounded-3xl flex flex-col items-center justify-center text-center py-12 border-dashed border-border"
                    >
                        <div className="w-16 h-16 rounded-full bg-secondary/10 flex items-center justify-center mb-4">
                            <Clock className="text-secondary w-8 h-8" />
                        </div>
                        <h3 className="text-xl font-bold text-foreground mb-2">Caught up!</h3>
                        <p className="text-muted-foreground">No more classes for today.</p>
                    </motion.div>
                )}
            </section>

            {/* PRODUCTIVITY WIDGETS */}
            <section>
                <TodoWidget />
            </section>


        </div>
    );
};
