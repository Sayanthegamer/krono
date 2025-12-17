import React from 'react';
import type { TimeTableEntry } from '../types';
import { MapPin, Clock, Pencil } from 'lucide-react';
import { motion } from 'framer-motion';
import { twMerge } from 'tailwind-merge';

interface ClassCardProps {
    entry: TimeTableEntry;
    status: 'past' | 'current' | 'next' | 'future';
    onClick: () => void;
}

export const ClassCard: React.FC<ClassCardProps> = ({ entry, status, onClick }) => {
    // Dynamic border color based on status
    const borderColor = status === 'current' ? 'border-primary' : 'border-border';
    const glow = status === 'current' ? 'shadow-[0_0_30px_-5px_var(--primary)]' : '';

    return (
        <motion.div
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={onClick}
            className={twMerge(
                "relative overflow-hidden rounded-2xl p-5 border backdrop-blur-md transition-all duration-300",
                "glass-card hover:bg-black/5 dark:hover:bg-white/10 cursor-pointer group",
                borderColor,
                glow
            )}
        >
            {/* Sidebar Color Strip */}
            <div
                className="absolute left-0 top-0 bottom-0 w-1.5"
                style={{ backgroundColor: entry.color || 'var(--primary)' }}
            />

            <div className="flex justify-between items-start pl-3">
                <div>
                    <h3 className="text-lg font-bold tracking-tight text-foreground mb-1.5">{entry.subject}</h3>

                    <div className="flex items-center gap-4 text-sm text-muted-foreground">
                        <div className="flex items-center gap-1.5">
                            <Clock size={14} className="text-primary" />
                            <span className={status === 'current' ? 'text-primary font-semibold' : ''}>
                                {entry.startTime} - {entry.endTime}
                            </span>
                        </div>
                        {entry.location && (
                            <div className="flex items-center gap-1.5">
                                <MapPin size={14} />
                                <span>{entry.location}</span>
                            </div>
                        )}
                    </div>
                </div>

                {status === 'current' && (
                    <div className="px-2 py-1 rounded-full bg-primary/20 border border-primary/50 text-[10px] font-bold text-primary uppercase tracking-wider animate-pulse">
                        Now
                    </div>
                )}

                {/* Edit Indicator */}
                <div className="absolute top-5 right-5 opacity-0 group-hover:opacity-100 transition-opacity bg-black/20 p-1.5 rounded-full">
                    <Pencil size={14} className="text-muted-foreground" />
                </div>
            </div>
        </motion.div>
    );
};
