import React from 'react';
import { useTimetable } from '../context/TimetableContext';
import type { TimeTableEntry, DayOfWeek } from '../types';
import { ClassCard } from './ClassCard';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronRight, ChevronLeft, Calendar } from 'lucide-react';
import { format, isToday, addDays } from 'date-fns';

interface WeekViewProps {
    onEntryClick: (entry: TimeTableEntry) => void;
}

const DAYS: DayOfWeek[] = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];

export const WeekView: React.FC<WeekViewProps> = ({ onEntryClick }) => {
    const { entries } = useTimetable();
    const [selectedDay, setSelectedDay] = React.useState<DayOfWeek>('Monday');
    const scrollRef = React.useRef<HTMLDivElement>(null);
    const [canScrollLeft, setCanScrollLeft] = React.useState(false);
    const [canScrollRight, setCanScrollRight] = React.useState(true);

    // Get current day on mount to auto-select
    React.useEffect(() => {
        const today = new Date().toLocaleDateString('en-US', { weekday: 'long' }) as DayOfWeek;
        if (DAYS.includes(today)) {
            setSelectedDay(today);
        }
    }, []);

    const checkScroll = React.useCallback(() => {
        if (scrollRef.current) {
            const { scrollLeft, scrollWidth, clientWidth } = scrollRef.current;
            setCanScrollLeft(scrollLeft > 0);
            setCanScrollRight(scrollLeft < scrollWidth - clientWidth - 5);
        }
    }, []);

    React.useEffect(() => {
        checkScroll();
        const ref = scrollRef.current;
        if (ref) {
            ref.addEventListener('scroll', checkScroll, { passive: true });
        }
        window.addEventListener('resize', checkScroll, { passive: true });

        return () => {
            if (ref) {
                ref.removeEventListener('scroll', checkScroll);
            }
            window.removeEventListener('resize', checkScroll);
        };
    }, [checkScroll]);

    // Get date for selected day
    const getDayDate = (day: DayOfWeek) => {
        const today = new Date();
        const dayIndex = DAYS.indexOf(day);
        const todayIndex = DAYS.indexOf(format(today, 'EEEE') as DayOfWeek);
        const diff = dayIndex - todayIndex;
        return addDays(today, diff);
    };

    const dayEntries = entries
        .filter(e => e.days.includes(selectedDay))
        .sort((a, b) => a.startTime.localeCompare(b.startTime));

    const selectedDate = getDayDate(selectedDay);
    const isTodaySelected = isToday(selectedDate);

    return (
        <div className="space-y-6 h-full flex flex-col">
            {/* Horizontal Day Selector */}
            <div className="relative group">
                <div
                    ref={scrollRef}
                    className="flex overflow-x-auto pb-4 gap-3 no-scrollbar snap-x px-1"
                >
                    {DAYS.map((day) => {
                        const dayDate = getDayDate(day);
                        const isSelected = selectedDay === day;
                        const isDayToday = isToday(dayDate);

                        return (
                            <button
                                key={day}
                                onClick={() => setSelectedDay(day)}
                                className={`
                                    relative whitespace-nowrap px-4 py-3 rounded-xl text-sm font-semibold transition-all snap-center
                                    ${isSelected
                                        ? 'bg-primary text-white shadow-lg shadow-primary/25 scale-105'
                                        : 'bg-black/5 dark:bg-white/5 text-muted-foreground hover:bg-black/10 dark:hover:bg-white/10'}
                                `}
                            >
                                <div className="flex flex-col items-center gap-0.5">
                                    <span className="text-xs opacity-70 uppercase tracking-wide">
                                        {day.slice(0, 3)}
                                    </span>
                                    <span className="text-lg font-bold">
                                        {format(dayDate, 'd')}
                                    </span>
                                </div>
                                {isDayToday && !isSelected && (
                                    <div className="absolute -bottom-1 left-1/2 transform -translate-x-1/2 w-1 h-1 rounded-full bg-primary" />
                                )}
                            </button>
                        );
                    })}
                </div>

                {/* Left Scroll Hint */}
                <AnimatePresence>
                    {canScrollLeft && (
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            className="absolute left-0 top-0 bottom-4 w-12 bg-gradient-to-r from-background to-transparent pointer-events-none flex items-center justify-start pl-1"
                        >
                            <motion.div
                                animate={{ x: [0, -5, 0] }}
                                transition={{ repeat: Infinity, duration: 1.5 }}
                                className="text-primary"
                            >
                                <ChevronLeft size={20} />
                            </motion.div>
                        </motion.div>
                    )}
                </AnimatePresence>

                {/* Right Scroll Hint */}
                <AnimatePresence>
                    {canScrollRight && (
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            className="absolute right-0 top-0 bottom-4 w-12 bg-gradient-to-l from-background to-transparent pointer-events-none flex items-center justify-end pr-1"
                        >
                            <motion.div
                                animate={{ x: [0, 5, 0] }}
                                transition={{ repeat: Infinity, duration: 1.5 }}
                                className="text-primary"
                            >
                                <ChevronRight size={20} />
                            </motion.div>
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>

            {/* Content Area */}
            <div className="flex-1 min-h-[300px]">
                {/* Header with date */}
                <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="flex items-center justify-between mb-6 px-1"
                >
                    <div>
                        <h3 className="text-2xl font-bold text-foreground flex items-center gap-2">
                            {selectedDay}
                            {isTodaySelected && (
                                <span className="px-2 py-0.5 text-xs font-bold uppercase tracking-wider bg-primary/20 text-primary rounded-full">
                                    Today
                                </span>
                            )}
                        </h3>
                        <p className="text-sm text-muted-foreground mt-0.5 flex items-center gap-1.5">
                            <Calendar size={14} />
                            {format(selectedDate, 'MMMM d, yyyy')}
                        </p>
                    </div>
                    <div className="text-right">
                        <div className="text-2xl font-bold text-foreground">
                            {dayEntries.length}
                        </div>
                        <div className="text-xs text-muted-foreground uppercase tracking-wide">
                            Classes
                        </div>
                    </div>
                </motion.div>

                {/* Entries List */}
                <div className="space-y-3 pb-24">
                    <AnimatePresence mode="popLayout">
                        {dayEntries.length > 0 ? (
                            dayEntries.map((entry, index) => (
                                <motion.div
                                    key={`${entry.id}-${selectedDay}`}
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    exit={{ opacity: 0, y: -10 }}
                                    transition={{
                                        duration: 0.2,
                                        delay: index * 0.05,
                                        ease: 'easeOut',
                                    }}
                                >
                                    <ClassCard
                                        entry={entry}
                                        status="future"
                                        onClick={() => onEntryClick(entry)}
                                    />
                                </motion.div>
                            ))
                        ) : (
                            <motion.div
                                initial={{ opacity: 0, scale: 0.95 }}
                                animate={{ opacity: 1, scale: 1 }}
                                exit={{ opacity: 0, scale: 0.95 }}
                                transition={{ duration: 0.3, ease: 'easeOut' }}
                                className="glass-card p-8 md:p-12 rounded-xl flex flex-col items-center justify-center text-center border-dashed border-border"
                            >
                                <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-primary/20 to-secondary/20 flex items-center justify-center mb-4">
                                    <Calendar className="text-primary w-8 h-8" />
                                </div>
                                <h3 className="text-lg font-bold text-foreground mb-2">
                                    No classes scheduled
                                </h3>
                                <p className="text-sm text-muted-foreground">
                                    Enjoy your free time!
                                </p>
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>
            </div>
        </div>
    );
};
