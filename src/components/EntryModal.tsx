import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import type { TimeTableEntry, DayOfWeek } from '../types';
import { X, Trash2, AlertCircle } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useTimetable } from '../context/TimetableContext';

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
    const { isSaving } = useTimetable();
    const [formData, setFormData] = useState<Partial<TimeTableEntry>>({
        days: defaultDay ? [defaultDay] : ['Monday'],
        startTime: '09:00',
        endTime: '10:00',
        subject: '',
        location: '',
        color: '#3b82f6'
    });

    const [errors, setErrors] = useState<Record<string, string>>({});
    const [touched, setTouched] = useState<Record<string, boolean>>({});

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
        setErrors({});
        setTouched({});
    }, [initialData, defaultDay, isOpen]);

    const validateField = (name: string, value: any) => {
        switch (name) {
            case 'subject':
                if (!value || value.trim().length === 0) return 'Subject is required';
                if (value.trim().length < 2) return 'Subject must be at least 2 characters';
                return '';
            case 'days':
                if (!value || value.length === 0) return 'Select at least one day';
                return '';
            case 'startTime':
                if (!value) return 'Start time is required';
                return '';
            case 'endTime':
                if (!value) return 'End time is required';
                if (formData.startTime && value <= formData.startTime) {
                    return 'End time must be after start time';
                }
                return '';
            default:
                return '';
        }
    };

    const handleBlur = (name: string, value: any) => {
        setTouched(prev => ({ ...prev, [name]: true }));
        const error = validateField(name, value);
        setErrors(prev => ({ ...prev, [name]: error }));
    };

    const handleChange = (name: string, value: any) => {
        setFormData(prev => ({ ...prev, [name]: value }));
        if (touched[name]) {
            const error = validateField(name, value);
            setErrors(prev => ({ ...prev, [name]: error }));
        }
    };

    const toggleDay = (day: DayOfWeek) => {
        setFormData(prev => {
            const currentDays = prev.days || [];
            const newDays = currentDays.includes(day)
                ? currentDays.filter(d => d !== day)
                : [...currentDays, day];
            return { ...prev, days: newDays };
        });
        if (touched.days) {
            const newDays = (formData.days || []).includes(day)
                ? (formData.days || []).filter(d => d !== day)
                : [...(formData.days || []), day];
            const error = validateField('days', newDays);
            setErrors(prev => ({ ...prev, days: error }));
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        // Validate all fields
        const newErrors: Record<string, string> = {};
        newErrors.subject = validateField('subject', formData.subject);
        newErrors.days = validateField('days', formData.days);
        newErrors.startTime = validateField('startTime', formData.startTime);
        newErrors.endTime = validateField('endTime', formData.endTime);

        setErrors(newErrors);
        setTouched({ subject: true, days: true, startTime: true, endTime: true });

        const hasErrors = Object.values(newErrors).some(error => error);
        if (hasErrors) return;

        try {
            await onSave(formData as TimeTableEntry);
            onClose();
        } catch (error) {
            // Error is handled by the context
            console.error('Save failed:', error);
        }
    };

    const hasError = (name: string) => touched[name] && errors[name];
    const errorBorder = (name: string) => hasError(name) ? 'border-red-400 focus:ring-red-400/20' : 'focus:border-primary focus:ring-primary/20';

    return createPortal(
        <AnimatePresence>
            {isOpen && (
                <>
                    {/* Backdrop */}
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        transition={{ duration: 0.2, ease: 'easeOut' }}
                        onClick={onClose}
                        className="fixed inset-0 bg-black/60 z-[200] backdrop-blur-sm"
                    />

                    {/* Sheet */}
                    <motion.div
                        initial={{ y: "100%" }}
                        animate={{ y: 0 }}
                        exit={{ y: "100%" }}
                        transition={{ type: "tween", ease: "circOut", duration: 0.3 }}
                        className="fixed bottom-0 left-0 right-0 bg-card z-[201] rounded-t-2xl p-6 shadow-2xl max-w-md mx-auto max-h-[90vh] overflow-y-auto will-change-transform"
                    >
                        <div className="flex justify-between items-center mb-6">
                            <h2 className="text-xl font-bold text-foreground">{initialData ? 'Edit Class' : 'Add Class'}</h2>
                            <button
                                onClick={onClose}
                                className="p-2 rounded-full hover:bg-muted transition-smooth"
                            >
                                <X size={20} className="text-muted-foreground" />
                            </button>
                        </div>

                        <form onSubmit={handleSubmit} className="space-y-5">
                            {/* Subject */}
                            <div>
                                <label htmlFor="subject" className="block text-sm font-medium text-foreground mb-1.5">Subject</label>
                                <input
                                    id="subject"
                                    type="text"
                                    value={formData.subject}
                                    onChange={e => handleChange('subject', e.target.value)}
                                    onBlur={() => handleBlur('subject', formData.subject)}
                                    className={`w-full p-3 rounded-lg bg-muted border transition-smooth outline-none focus:ring-2 ${errorBorder('subject')}`}
                                    placeholder="e.g. Mathematics"
                                />
                                <AnimatePresence>
                                    {hasError('subject') && (
                                        <motion.div
                                            initial={{ opacity: 0, y: -5 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            exit={{ opacity: 0, y: -5 }}
                                            className="flex items-center gap-1.5 mt-1.5 text-xs text-red-400"
                                        >
                                            <AlertCircle size={12} />
                                            <span>{errors.subject}</span>
                                        </motion.div>
                                    )}
                                </AnimatePresence>
                            </div>

                            {/* Days */}
                            <div>
                                <label className="block text-sm font-medium text-foreground mb-2">Repeats On</label>
                                <div className="flex flex-wrap gap-2">
                                    {DAYS.map(day => {
                                        const isSelected = formData.days?.includes(day);
                                        const hasDayError = hasError('days') && !isSelected;
                                        return (
                                            <button
                                                key={day}
                                                type="button"
                                                onClick={() => toggleDay(day)}
                                                className={`px-3 py-2 text-xs rounded-full font-semibold transition-smooth border ${
                                                    isSelected
                                                        ? 'bg-primary text-primary-foreground border-primary shadow-lg shadow-primary/25'
                                                        : 'bg-muted text-muted-foreground border-transparent hover:border-border'
                                                } ${hasDayError ? 'border-red-400' : ''}`}
                                            >
                                                {day.slice(0, 3)}
                                            </button>
                                        );
                                    })}
                                </div>
                                <AnimatePresence>
                                    {hasError('days') && (
                                        <motion.div
                                            initial={{ opacity: 0, y: -5 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            exit={{ opacity: 0, y: -5 }}
                                            className="flex items-center gap-1.5 mt-1.5 text-xs text-red-400"
                                        >
                                            <AlertCircle size={12} />
                                            <span>{errors.days}</span>
                                        </motion.div>
                                    )}
                                </AnimatePresence>
                            </div>

                            {/* Color */}
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label htmlFor="color" className="block text-sm font-medium text-foreground mb-1.5">Color</label>
                                    <input
                                        id="color"
                                        type="color"
                                        value={formData.color}
                                        onChange={e => setFormData(prev => ({ ...prev, color: e.target.value }))}
                                        className="w-full h-[46px] p-1 rounded-lg bg-muted cursor-pointer transition-smooth"
                                    />
                                </div>
                            </div>

                            {/* Time */}
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label htmlFor="startTime" className="block text-sm font-medium text-foreground mb-1.5">Start Time</label>
                                    <input
                                        id="startTime"
                                        type="time"
                                        value={formData.startTime}
                                        onChange={e => {
                                            handleChange('startTime', e.target.value);
                                            if (errors.endTime) {
                                                const endError = validateField('endTime', formData.endTime);
                                                setErrors(prev => ({ ...prev, endTime: endError }));
                                            }
                                        }}
                                        onBlur={() => handleBlur('startTime', formData.startTime)}
                                        className={`w-full p-3 rounded-lg bg-muted border transition-smooth outline-none focus:ring-2 ${errorBorder('startTime')}`}
                                    />
                                    <AnimatePresence>
                                        {hasError('startTime') && (
                                            <motion.div
                                                initial={{ opacity: 0, y: -5 }}
                                                animate={{ opacity: 1, y: 0 }}
                                                exit={{ opacity: 0, y: -5 }}
                                                className="flex items-center gap-1.5 mt-1.5 text-xs text-red-400"
                                            >
                                                <AlertCircle size={12} />
                                                <span>{errors.startTime}</span>
                                            </motion.div>
                                        )}
                                    </AnimatePresence>
                                </div>
                                <div>
                                    <label htmlFor="endTime" className="block text-sm font-medium text-foreground mb-1.5">End Time</label>
                                    <input
                                        id="endTime"
                                        type="time"
                                        value={formData.endTime}
                                        onChange={e => handleChange('endTime', e.target.value)}
                                        onBlur={() => handleBlur('endTime', formData.endTime)}
                                        className={`w-full p-3 rounded-lg bg-muted border transition-smooth outline-none focus:ring-2 ${errorBorder('endTime')}`}
                                    />
                                    <AnimatePresence>
                                        {hasError('endTime') && (
                                            <motion.div
                                                initial={{ opacity: 0, y: -5 }}
                                                animate={{ opacity: 1, y: 0 }}
                                                exit={{ opacity: 0, y: -5 }}
                                                className="flex items-center gap-1.5 mt-1.5 text-xs text-red-400"
                                            >
                                                <AlertCircle size={12} />
                                                <span>{errors.endTime}</span>
                                            </motion.div>
                                        )}
                                    </AnimatePresence>
                                </div>
                            </div>

                            {/* Location */}
                            <div>
                                <label htmlFor="location" className="block text-sm font-medium text-foreground mb-1.5">Location (Optional)</label>
                                <input
                                    id="location"
                                    type="text"
                                    value={formData.location}
                                    onChange={e => setFormData(prev => ({ ...prev, location: e.target.value }))}
                                    className="w-full p-3 rounded-lg bg-muted border border-border transition-smooth outline-none focus:ring-2 focus:border-primary focus:ring-primary/20"
                                    placeholder="e.g. Room 101"
                                />
                            </div>

                            {/* Actions */}
                            <div className="pt-4 flex gap-3">
                                {initialData && onDelete && (
                                    <motion.button
                                        whileHover={{ scale: 1.05 }}
                                        whileTap={{ scale: 0.95 }}
                                        type="button"
                                        disabled={isSaving}
                                        onClick={async () => { 
                                            try {
                                                await onDelete(initialData.id!); 
                                                onClose();
                                            } catch (error) {
                                                console.error('Delete failed:', error);
                                            }
                                        }}
                                        className={`p-4 rounded-xl bg-destructive/10 text-destructive hover:bg-destructive/20 transition-smooth ${isSaving ? 'opacity-50 cursor-not-allowed' : ''}`}
                                    >
                                        {isSaving ? (
                                            <div className="w-5 h-5 border-2 border-destructive border-t-transparent rounded-full animate-spin" />
                                        ) : (
                                            <Trash2 size={20} />
                                        )}
                                    </motion.button>
                                )}
                                <motion.button
                                    whileHover={{ scale: 1.02 }}
                                    whileTap={{ scale: 0.98 }}
                                    type="submit"
                                    disabled={isSaving}
                                    className={`flex-1 p-4 rounded-xl bg-gradient-to-r from-primary to-purple-600 text-primary-foreground font-semibold shadow-lg shadow-primary/25 hover:shadow-primary/40 transition-smooth ${isSaving ? 'opacity-50 cursor-not-allowed' : ''}`}
                                >
                                    {isSaving ? (
                                        <div className="flex items-center justify-center gap-2">
                                            <div className="w-4 h-4 border-2 border-primary-foreground border-t-transparent rounded-full animate-spin" />
                                            {initialData ? 'Saving...' : 'Creating...'}
                                        </div>
                                    ) : (
                                        initialData ? 'Save Changes' : 'Create Class'
                                    )}
                                </motion.button>
                            </div>
                        </form>
                    </motion.div>
                </>
            )}
        </AnimatePresence>,
        document.body
    );
};
