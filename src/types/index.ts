export type DayOfWeek = 'Monday' | 'Tuesday' | 'Wednesday' | 'Thursday' | 'Friday' | 'Saturday' | 'Sunday';

export interface TimeTableEntry {
    id: string;
    days: DayOfWeek[];
    startTime: string; // HH:mm
    endTime: string;   // HH:mm
    subject: string;
    location?: string;
    color?: string;
}

export interface AppSettings {
    theme: 'light' | 'dark' | 'system';
    notificationsEnabled: boolean;
}
