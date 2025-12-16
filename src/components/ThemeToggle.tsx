import React from 'react';
import { Moon, Sun, Smartphone } from 'lucide-react';
import { useTimetable } from '../context/TimetableContext';
import { clsx } from 'clsx';

export const ThemeToggle: React.FC = () => {
    const { settings, updateSettings } = useTimetable();

    return (
        <div className="flex bg-muted p-1 rounded-full">
            {(['light', 'system', 'dark'] as const).map((theme) => (
                <button
                    key={theme}
                    onClick={() => updateSettings({ theme })}
                    className={clsx(
                        "p-2 rounded-full transition-all",
                        settings.theme === theme ? "bg-background shadow text-foreground" : "text-muted-foreground"
                    )}
                >
                    {theme === 'light' && <Sun size={16} />}
                    {theme === 'dark' && <Moon size={16} />}
                    {theme === 'system' && <Smartphone size={16} />}
                </button>
            ))}
        </div>
    );
};
