import React from 'react';
import type { TimeTableEntry } from '../types';
import { MapPin, Clock, Pencil, CheckCircle } from 'lucide-react';
import { motion } from 'framer-motion';
import { twMerge } from 'tailwind-merge';

interface ClassCardProps {
    entry: TimeTableEntry;
    status: 'past' | 'current' | 'next' | 'future';
    onClick: () => void;
}

export const ClassCard: React.FC<ClassCardProps> = ({ entry, status, onClick }) => {
    const getStatusStyles = () => {
        switch (status) {
            case 'current':
                return {
                    borderColor: 'border-primary',
                    glow: 'shadow-[0_0_20px_-5px_var(--primary)]',
                    badge: (
                        <div className="px-2 py-1 rounded-full bg-primary/20 border border-primary/50 text-[10px] font-bold text-primary uppercase tracking-wider animate-pulse-glow">
                            Now
                        </div>
                    ),
                };
            case 'next':
                return {
                    borderColor: 'border-secondary',
                    glow: 'shadow-[0_0_20px_-5px_var(--secondary)]',
                    badge: (
                        <div className="px-2 py-1 rounded-full bg-secondary/20 border border-secondary/50 text-[10px] font-bold text-secondary uppercase tracking-wider">
                            Next
                        </div>
                    ),
                };
            case 'past':
                return {
                    borderColor: 'border-border opacity-60',
                    glow: '',
                    badge: (
                        <div className="px-2 py-1 rounded-full bg-muted/20 border border-border text-[10px] font-bold text-muted-foreground uppercase tracking-wider">
                            Done
                        </div>
                    ),
                };
            default:
                return {
                    borderColor: 'border-border',
                    glow: '',
                    badge: null,
                };
        }
    };

    const { borderColor, glow, badge } = getStatusStyles();

    return (
        <motion.div
            whileHover={{ scale: status === 'past' ? 1 : 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={onClick}
            className={twMerge(
                "relative overflow-hidden rounded-xl p-5 border backdrop-blur-md transition-smooth cursor-pointer group",
                "glass-card hover:bg-black/5 dark:hover:bg-white/10",
                borderColor,
                glow,
                status === 'past' && 'grayscale-[0.5]'
            )}
        >
            {/* Sidebar Color Strip */}
            <motion.div
                className="absolute left-0 top-0 bottom-0 w-1.5"
                style={{ backgroundColor: entry.color || 'var(--primary)' }}
                initial={{ scaleY: 0 }}
                animate={{ scaleY: 1 }}
                transition={{ duration: 0.3, ease: 'easeOut' }}
            />

            <div className="flex justify-between items-start pl-3 gap-2">
                <div className="flex-1 min-w-0">
                    <h3 className={`text-lg font-bold tracking-tight mb-1.5 break-words ${status === 'past' ? 'text-muted-foreground' : 'text-foreground'}`}>
                        {entry.subject}
                    </h3>

                    <div className="flex items-center gap-4 text-sm text-muted-foreground">
                        <div className="flex items-center gap-1.5">
                            <Clock size={14} className={status === 'current' ? 'text-primary' : ''} />
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

                {badge && (
                    <motion.div
                        initial={{ opacity: 0, scale: 0.8 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ delay: 0.1 }}
                    >
                        {badge}
                    </motion.div>
                )}

                {/* Edit Indicator */}
                <motion.div
                    initial={{ opacity: 0 }}
                    whileHover={{ opacity: 1 }}
                    className="absolute top-4 right-4 bg-black/20 dark:bg-white/10 p-1.5 rounded-full opacity-0 group-hover:opacity-100 transition-smooth"
                >
                    <Pencil size={14} className="text-muted-foreground" />
                </motion.div>
            </div>
        </motion.div>
    );
};
