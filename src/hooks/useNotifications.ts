import { useEffect, useRef } from 'react';
import type { TimeTableEntry, DayOfWeek } from '../types';
import { parse, differenceInMinutes } from 'date-fns';

export function useNotifications(entries: TimeTableEntry[], enabled: boolean) {
  const lastNotifiedRef = useRef<string | null>(null);

  useEffect(() => {
    if (!enabled) return;
    if (!('Notification' in window)) return;

    if (Notification.permission === 'default') {
      Notification.requestPermission();
    }

    const checkSchedule = () => {
      if (Notification.permission !== 'granted') return;

      const now = new Date();

      const days: DayOfWeek[] = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
      const currentDayName = days[now.getDay()];

      const todayEntries = entries.filter(e => e.days.includes(currentDayName));

      todayEntries.forEach(entry => {
        const start = parse(entry.startTime, 'HH:mm', now);
        const diff = differenceInMinutes(start, now);

        if (diff >= 4 && diff <= 5) {
          const key = `${entry.id}-${now.getDate()}`;
          if (lastNotifiedRef.current !== key) {
            new Notification(`Upcoming: ${entry.subject}`, {
              body: `Starts at ${entry.startTime} in ${entry.location || 'Unknown location'}`,
              icon: '/logo.svg'
            });
            lastNotifiedRef.current = key;
          }
        }
      });
    };

    const interval = setInterval(checkSchedule, 30000); // Check every 30s
    return () => clearInterval(interval);

  }, [entries, enabled]);
}
