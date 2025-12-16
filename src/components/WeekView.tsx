import React from 'react';
import { useTimetable } from '../context/TimetableContext';
import type { TimeTableEntry, DayOfWeek } from '../types';
import { ClassCard } from './ClassCard';
import { motion } from 'framer-motion';

interface WeekViewProps {
    onEntryClick: (entry: TimeTableEntry) => void;
}

const DAYS: DayOfWeek[] = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];

export const WeekView: React.FC<WeekViewProps> = ({ onEntryClick }) => {
    const { entries } = useTimetable();

    return (
        <div className="space-y-6">
            {DAYS.map((day, index) => {
                const dayEntries = entries
                    .filter(e => e.days.includes(day))
                    .sort((a, b) => a.startTime.localeCompare(b.startTime));

                if (dayEntries.length === 0) return null;

                return (
                    <motion.div
                        key={day}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: index * 0.05 }}
                    >
                        <h3 className="font-bold text-lg mb-2 text-muted-foreground sticky top-0 bg-background/95 backdrop-blur py-2 z-10">
                            {day}
                        </h3>
                        <div className="space-y-3">
                            {dayEntries.map(entry => (
                                <ClassCard
                                    key={entry.id}
                                    entry={entry}
                                    status="future" // In week view, everything is just 'listed'
                                    onClick={() => onEntryClick(entry)}
                                />
                            ))}
                        </div>
                    </motion.div>
                );
            })}

            {entries.length === 0 && (
                <div className="text-center py-20 text-muted-foreground">
                    <p>No classes scheduled yet.</p>
                    <p className="text-sm">Tap + to add your first class.</p>
                </div>
            )}
        </div>
    );
};
