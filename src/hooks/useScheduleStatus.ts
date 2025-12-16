import { useState, useEffect } from 'react';
import type { TimeTableEntry, DayOfWeek } from '../types';
import { isWithinInterval, parse, getDay } from 'date-fns';

export function useScheduleStatus(entries: TimeTableEntry[]) {
    const [currentClass, setCurrentClass] = useState<TimeTableEntry | null>(null);
    const [nextClass, setNextClass] = useState<TimeTableEntry | null>(null);
    const [now, setNow] = useState(new Date());

    useEffect(() => {
        const timer = setInterval(() => setNow(new Date()), 1000);
        return () => clearInterval(timer);
    }, []);

    useEffect(() => {
        // 1. Get current day name
        const days: DayOfWeek[] = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
        const currentDayName = days[getDay(now)];

        // 2. Filter entries for today
        const todayEntries = entries.filter(e => e.days.includes(currentDayName));

        // 3. Find current class
        const current = todayEntries.find(entry => {
            const start = parse(entry.startTime, 'HH:mm', now);
            const end = parse(entry.endTime, 'HH:mm', now);
            return isWithinInterval(now, { start, end });
        });

        // 4. Find next class
        // Sort by start time first
        const sortedToday = [...todayEntries].sort((a, b) =>
            a.startTime.localeCompare(b.startTime)
        );

        const next = sortedToday.find(entry => {
            const start = parse(entry.startTime, 'HH:mm', now);
            return now < start;
        });

        setCurrentClass(current || null);
        setNextClass(next || null);

    }, [now, entries]);

    return { currentClass, nextClass, now };
}
