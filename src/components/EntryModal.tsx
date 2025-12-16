import React, { useState, useEffect } from 'react';
import type { TimeTableEntry, DayOfWeek } from '../types';
import { X, Trash2 } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface EntryModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSave: (entry: Omit<TimeTableEntry, 'id'> | TimeTableEntry) => void;
    onDelete?: (id: string) => void;
    initialData?: TimeTableEntry | null;
    defaultDay?: DayOfWeek;
}

const DAYS: DayOfWeek[] = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];

export const EntryModal: React.FC<EntryModalProps> = ({ isOpen, onClose, onSave, onDelete, initialData, defaultDay }) => {
    const [formData, setFormData] = useState<Partial<TimeTableEntry>>({
        days: defaultDay ? [defaultDay] : ['Monday'],
        startTime: '09:00',
        endTime: '10:00',
        subject: '',
        location: '',
        color: '#3b82f6'
    });

    useEffect(() => {
        if (initialData) {
            setFormData(initialData);
        } else {
            setFormData({
                days: defaultDay ? [defaultDay] : ['Monday'],
                startTime: '09:00',
                endTime: '10:00',
                subject: '',
                location: '',
                color: '#3b82f6'
            });
        }
    }, [initialData, defaultDay, isOpen]);

    const toggleDay = (day: DayOfWeek) => {
        setFormData(prev => {
            const currentDays = prev.days || [];
            if (currentDays.includes(day)) {
                return { ...prev, days: currentDays.filter(d => d !== day) };
            } else {
                return { ...prev, days: [...currentDays, day] };
            }
        });
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!formData.subject || !formData.days?.length || !formData.startTime || !formData.endTime) return;
        onSave(formData as TimeTableEntry);
        onClose();
    };

    return (
        <AnimatePresence>
            {isOpen && (
                <>
                    {/* Backdrop */}
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={onClose}
                        className="fixed inset-0 bg-black/50 z-40 backdrop-blur-sm"
                    />

                    {/* Sheet */}
                    <motion.div
                        initial={{ y: "100%" }}
                        animate={{ y: 0 }}
                        exit={{ y: "100%" }}
                        transition={{ type: "spring", damping: 25, stiffness: 300 }}
                        className="fixed bottom-0 left-0 right-0 bg-card z-50 rounded-t-2xl p-6 shadow-xl max-w-md mx-auto max-h-[90vh] overflow-y-auto"
                    >
                        <div className="flex justify-between items-center mb-6">
                            <h2 className="text-xl font-bold">{initialData ? 'Edit Class' : 'Add Class'}</h2>
                            <button onClick={onClose} className="p-2 rounded-full hover:bg-muted">
                                <X size={20} />
                            </button>
                        </div>

                        <form onSubmit={handleSubmit} className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium mb-1">Subject</label>
                                <input
                                    type="text"
                                    required
                                    value={formData.subject}
                                    onChange={e => setFormData(prev => ({ ...prev, subject: e.target.value }))}
                                    className="w-full p-3 rounded-lg bg-muted border-transparent focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none"
                                    placeholder="e.g. Mathematics"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium mb-2">Repeats On</label>
                                <div className="flex flex-wrap gap-2">
                                    {DAYS.map(day => {
                                        const isSelected = formData.days?.includes(day);
                                        return (
                                            <button
                                                key={day}
                                                type="button"
                                                onClick={() => toggleDay(day)}
                                                className={`px-3 py-2 text-xs rounded-full font-medium transition-colors border ${isSelected
                                                        ? 'bg-primary text-primary-foreground border-primary'
                                                        : 'bg-muted text-muted-foreground border-transparent hover:border-border'
                                                    }`}
                                            >
                                                {day.slice(0, 3)}
                                            </button>
                                        );
                                    })}
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium mb-1">Color</label>
                                    <input
                                        type="color"
                                        value={formData.color}
                                        onChange={e => setFormData(prev => ({ ...prev, color: e.target.value }))}
                                        className="w-full h-[46px] p-1 rounded-lg bg-muted cursor-pointer"
                                    />
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium mb-1">Start Time</label>
                                    <input
                                        type="time"
                                        required
                                        value={formData.startTime}
                                        onChange={e => setFormData(prev => ({ ...prev, startTime: e.target.value }))}
                                        className="w-full p-3 rounded-lg bg-muted outline-none"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium mb-1">End Time</label>
                                    <input
                                        type="time"
                                        required
                                        value={formData.endTime}
                                        onChange={e => setFormData(prev => ({ ...prev, endTime: e.target.value }))}
                                        className="w-full p-3 rounded-lg bg-muted outline-none"
                                    />
                                </div>
                            </div>

                            <div>
                                <label className="block text-sm font-medium mb-1">Location (Optional)</label>
                                <input
                                    type="text"
                                    value={formData.location}
                                    onChange={e => setFormData(prev => ({ ...prev, location: e.target.value }))}
                                    className="w-full p-3 rounded-lg bg-muted outline-none"
                                    placeholder="e.g. Room 101"
                                />
                            </div>

                            <div className="pt-4 flex gap-3">
                                {initialData && onDelete && (
                                    <button
                                        type="button"
                                        onClick={() => { onDelete(initialData.id!); onClose(); }}
                                        className="p-4 rounded-xl bg-destructive/10 text-destructive hover:bg-destructive/20 transition-colors"
                                    >
                                        <Trash2 size={20} />
                                    </button>
                                )}
                                <button
                                    type="submit"
                                    className="flex-1 p-4 rounded-xl bg-primary text-primary-foreground font-semibold shadow-lg hover:opacity-90 transition-opacity"
                                >
                                    {initialData ? 'Save Changes' : 'Create Class'}
                                </button>
                            </div>
                        </form>
                    </motion.div>
                </>
            )}
        </AnimatePresence>
    );
};
