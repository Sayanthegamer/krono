import React, { useMemo } from 'react';
import { useFocus } from '../context/FocusContext';
import { useTimetable } from '../context/TimetableContext';
import { motion } from 'framer-motion';
import { PieChart, Clock, Zap, TrendingUp, Flame, Sunrise, Sunset, Moon } from 'lucide-react';
import { differenceInMinutes, parse, startOfDay, endOfDay, isWithinInterval, subDays, format, startOfWeek, endOfWeek, isToday } from 'date-fns';

export const StatsWidget: React.FC = () => {
    const { sessionHistory } = useFocus();
    const { entries } = useTimetable();

    // Calculate Stats
    const stats = useMemo(() => {
        const now = new Date();
        const todayStart = startOfDay(now);
        const todayEnd = endOfDay(now);
        const weekStart = startOfWeek(now);
        const weekEnd = endOfWeek(now);

        // Today's Stats
        const todaySessions = sessionHistory.filter(s =>
            isWithinInterval(new Date(s.startTime), { start: todayStart, end: todayEnd })
        );
        const todayFocusMinutes = todaySessions.reduce((acc, s) => acc + s.duration, 0);

        // Today's Class Time
        const dayName = format(now, 'EEEE') as any;
        const todayClasses = entries.filter(e => e.days.includes(dayName));
        let classMinutes = 0;
        todayClasses.forEach(e => {
            const s = parse(e.startTime, 'HH:mm', now);
            const en = parse(e.endTime, 'HH:mm', now);
            classMinutes += differenceInMinutes(en, s);
        });

        // Weekly Stats
        const weekSessions = sessionHistory.filter(s =>
            isWithinInterval(new Date(s.startTime), { start: weekStart, end: weekEnd })
        );
        const weekFocusMinutes = weekSessions.reduce((acc, s) => acc + s.duration, 0);

        // Streak (consecutive days with focus sessions)
        let streak = 0;
        let checkDate = now;
        while (true) {
            const dayStart = startOfDay(checkDate);
            const dayEnd = endOfDay(checkDate);
            const hasSession = sessionHistory.some(s =>
                isWithinInterval(new Date(s.startTime), { start: dayStart, end: dayEnd })
            );
            if (hasSession) {
                streak++;
                checkDate = subDays(checkDate, 1);
            } else {
                break;
            }
        }

        // Best Focus Time (morning/afternoon/evening)
        const hourCounts: Record<number, number> = {};
        sessionHistory.forEach(s => {
            const hour = new Date(s.startTime).getHours();
            hourCounts[hour] = (hourCounts[hour] || 0) + s.duration;
        });

        let bestTime = 'No data';
        let maxMinutes = 0;
        Object.entries(hourCounts).forEach(([hour, minutes]) => {
            if (minutes > maxMinutes) {
                maxMinutes = minutes;
                const h = parseInt(hour);
                if (h >= 5 && h < 12) bestTime = 'Morning';
                else if (h >= 12 && h < 17) bestTime = 'Afternoon';
                else bestTime = 'Evening';
            }
        });

        // Weekly Trend
        const lastWeekSessions = sessionHistory.filter(s => {
            const lastWeekStart = subDays(weekStart, 7);
            const lastWeekEnd = subDays(weekEnd, 7);
            return isWithinInterval(new Date(s.startTime), { start: lastWeekStart, end: lastWeekEnd });
        });
        const lastWeekMinutes = lastWeekSessions.reduce((acc, s) => acc + s.duration, 0);
        const trend = lastWeekMinutes > 0 ? ((weekFocusMinutes - lastWeekMinutes) / lastWeekMinutes) * 100 : 0;

        return {
            todayFocus: todayFocusMinutes,
            classTime: classMinutes,
            todaySessions: todaySessions.length,
            weekFocus: weekFocusMinutes,
            weekSessions: weekSessions.length,
            streak,
            bestTime,
            trend,
            totalSessions: sessionHistory.length,
        };
    }, [sessionHistory, entries]);

    const formatTime = (mins: number) => {
        const h = Math.floor(mins / 60);
        const m = mins % 60;
        if (h > 0) return `${h}h ${m}m`;
        return `${m}m`;
    };

    const getBestTimeIcon = () => {
        switch (stats.bestTime) {
            case 'Morning': return <Sunrise className="text-yellow-400" />;
            case 'Afternoon': return <Sunset className="text-orange-400" />;
            case 'Evening': return <Moon className="text-purple-400" />;
            default: return <Zap className="text-muted-foreground" />;
        }
    };

    return (
        <div className="glass-card p-6 rounded-xl relative overflow-hidden">
            {/* Header */}
            <h3 className="text-xl font-bold text-foreground mb-6 flex items-center gap-2">
                <PieChart className="text-secondary" />
                <span>Productivity Stats</span>
            </h3>

            {/* Today's Quick Stats */}
            <div className="grid grid-cols-2 gap-4 mb-6">
                {/* Focus Time */}
                <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.1 }}
                    className="bg-black/5 dark:bg-white/5 p-4 rounded-xl border border-black/5 dark:border-white/5"
                >
                    <div className="flex items-center gap-2 mb-2 text-muted-foreground text-xs font-medium">
                        <Zap size={12} className="text-yellow-400" />
                        <span>Focus Today</span>
                    </div>
                    <div className="text-2xl font-bold text-foreground">
                        {formatTime(stats.todayFocus)}
                    </div>
                    <div className="text-xs text-muted-foreground mt-1">
                        {stats.todaySessions} sessions
                    </div>
                </motion.div>

                {/* Class Time */}
                <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2 }}
                    className="bg-black/5 dark:bg-white/5 p-4 rounded-xl border border-black/5 dark:border-white/5"
                >
                    <div className="flex items-center gap-2 mb-2 text-muted-foreground text-xs font-medium">
                        <Clock size={12} className="text-blue-400" />
                        <span>Class Time</span>
                    </div>
                    <div className="text-2xl font-bold text-foreground">
                        {formatTime(stats.classTime)}
                    </div>
                    <div className="text-xs text-muted-foreground mt-1">
                        today's schedule
                    </div>
                </motion.div>
            </div>

            {/* Weekly Insights */}
            <div className="space-y-3">
                {/* Streak */}
                <motion.div
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.3 }}
                    className="flex items-center justify-between p-3 rounded-xl bg-gradient-to-r from-orange-500/10 to-red-500/10 border border-orange-500/20"
                >
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-lg bg-orange-500/20 flex items-center justify-center">
                            <Flame className="text-orange-400" size={20} />
                        </div>
                        <div>
                            <div className="text-sm font-semibold text-foreground">
                                {stats.streak} Day Streak
                            </div>
                            <div className="text-xs text-muted-foreground">
                                Keep it going!
                            </div>
                        </div>
                    </div>
                </motion.div>

                {/* Best Time */}
                <motion.div
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.4 }}
                    className="flex items-center justify-between p-3 rounded-xl bg-black/5 dark:bg-white/5 border border-black/5 dark:border-white/5"
                >
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-lg bg-black/10 dark:bg-white/10 flex items-center justify-center">
                            {getBestTimeIcon()}
                        </div>
                        <div>
                            <div className="text-sm font-semibold text-foreground">
                                Best Time
                            </div>
                            <div className="text-xs text-muted-foreground">
                                {stats.bestTime}
                            </div>
                        </div>
                    </div>
                </motion.div>

                {/* Weekly Trend */}
                <motion.div
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.5 }}
                    className="flex items-center justify-between p-3 rounded-xl bg-black/5 dark:bg-white/5 border border-black/5 dark:border-white/5"
                >
                    <div className="flex items-center gap-3">
                        <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${stats.trend >= 0 ? 'bg-green-500/20' : 'bg-red-500/20'}`}>
                            <TrendingUp className={stats.trend >= 0 ? 'text-green-400' : 'text-red-400'} size={20} />
                        </div>
                        <div>
                            <div className="text-sm font-semibold text-foreground">
                                This Week
                            </div>
                            <div className="text-xs text-muted-foreground">
                                {formatTime(stats.weekFocus)} · {stats.weekSessions} sessions
                            </div>
                        </div>
                    </div>
                    {stats.trend !== 0 && (
                        <div className={`text-sm font-bold ${stats.trend >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                            {stats.trend >= 0 ? '+' : ''}{stats.trend.toFixed(0)}%
                        </div>
                    )}
                </motion.div>
            </div>

            {/* Progress Bar */}
            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.6 }}
                className="mt-6"
            >
                <div className="flex justify-between text-xs text-muted-foreground mb-2">
                    <span>Daily Goal (6h)</span>
                    <span>{Math.min(100, Math.round(((stats.todayFocus + stats.classTime) / 360) * 100))}%</span>
                </div>
                <div className="h-2 bg-black/5 dark:bg-white/10 rounded-full overflow-hidden">
                    <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: `${Math.min(100, ((stats.todayFocus + stats.classTime) / 360) * 100)}%` }}
                        transition={{ duration: 1, ease: 'easeOut' }}
                        className="h-full bg-gradient-to-r from-secondary to-primary rounded-full"
                    />
                </div>
            </motion.div>
        </div>
    );
};
