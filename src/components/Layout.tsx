import React, { useState } from 'react';
import { Calendar, Plus, Timer, LayoutGrid, PieChart, LogOut } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../context/AuthContext';
import { SettingsModal } from './SettingsModal';

interface LayoutProps {
    children: React.ReactNode;
    activeTab: 'dashboard' | 'week' | 'focus' | 'stats';
    onTabChange: (tab: 'dashboard' | 'week' | 'focus' | 'stats') => void;
    onAddClick: () => void;
}

export const Layout: React.FC<LayoutProps> = ({ children, activeTab, onTabChange, onAddClick }) => {
    const { user, logout } = useAuth();

    const [isSettingsOpen, setIsSettingsOpen] = useState(false);

    return (
        <div className="min-h-screen bg-background text-foreground flex flex-col relative overflow-hidden">
            {/* Ambient Background Glows */}
            {/* Ambient Background Glows */}
            <motion.div
                animate={{
                    opacity: activeTab === 'focus' ? 0.6 : 0.3,
                    scale: activeTab === 'focus' ? 1.1 : 1,
                }}
                transition={{ duration: 4, repeat: Infinity, repeatType: "mirror" }}
                className="fixed top-[-10%] left-[-10%] w-[60%] h-[60%] bg-primary/20 rounded-full blur-[80px] md:blur-[120px] pointer-events-none will-change-transform"
            />
            <motion.div
                animate={{
                    opacity: activeTab === 'focus' ? 0.6 : 0.2,
                    scale: activeTab === 'focus' ? 1.05 : 1,
                    background: activeTab === 'focus' ? 'var(--secondary)' : 'var(--secondary)'
                }}
                transition={{ duration: 5, delay: 1, repeat: Infinity, repeatType: "mirror" }}
                className="fixed bottom-[-10%] right-[-10%] w-[60%] h-[60%] bg-secondary/10 rounded-full blur-[80px] md:blur-[120px] pointer-events-none will-change-transform"
            />

            {/* Header */}
            <header className="px-6 py-4 flex justify-between items-center sticky top-0 z-10">
                <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-primary to-secondary flex items-center justify-center shadow-lg shadow-primary/20">
                        <Calendar className="text-white w-5 h-5" />
                    </div>
                    <h1 className="text-xl font-bold tracking-tight">Timetable</h1>
                </div>
                {user && (
                    <div className="flex items-center gap-3 bg-muted/50 p-1.5 pr-1.5 rounded-full border border-white/5">
                        {/* User Profile Trigger for Settings */}
                        <div
                            id="user-profile-trigger"
                            onClick={() => setIsSettingsOpen(true)}
                            className="flex items-center gap-3 cursor-pointer hover:bg-white/5 rounded-full pl-2 pr-2 py-1 transition-colors"
                        >
                            <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-indigo-500 to-purple-500 flex items-center justify-center text-white font-bold text-xs shadow-inner">
                                {user.displayName ? user.displayName[0].toUpperCase() : user.email?.[0].toUpperCase()}
                            </div>
                            <div className="flex flex-col items-start hidden sm:flex">
                                <span className="text-xs font-semibold leading-none">{user.displayName || 'User'}</span>
                                <span className="text-xs text-muted-foreground leading-none scale-90 origin-left mt-0.5">Settings</span>
                            </div>
                        </div>
                        <div className="w-px h-6 bg-border mx-1" />
                        <button
                            onClick={logout}
                            className="p-1.5 rounded-full hover:bg-red-500/10 hover:text-red-500 text-muted-foreground transition-all"
                            title="Sign out"
                        >
                            <LogOut size={16} />
                        </button>
                    </div>
                )}
            </header>

            {/* Main Content */}
            <main className="flex-1 p-3 md:p-6 pb-28 overflow-y-auto w-full max-w-lg mx-auto z-0 scroll-smooth">
                <AnimatePresence mode="wait">
                    <motion.div
                        key={activeTab}
                        initial={{ opacity: 0, y: 10, scale: 0.98 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: -10, scale: 0.98 }}
                        transition={{ duration: 0.2 }}
                    >
                        {children}
                    </motion.div>
                </AnimatePresence>
            </main>

            {/* Floating Dock Navigation */}
            <nav className="fixed bottom-6 left-0 right-0 z-50 flex justify-center pointer-events-none">
                <div className="bg-black/40 backdrop-blur-2xl border border-white/10 rounded-2xl p-2 shadow-2xl flex items-center gap-2 pointer-events-auto">

                    <NavButton
                        id="nav-home"
                        active={activeTab === 'dashboard'}
                        onClick={() => onTabChange('dashboard')}
                        icon={<LayoutGrid size={20} />}
                        label="Home"
                    />

                    <NavButton
                        id="nav-week"
                        active={activeTab === 'week'}
                        onClick={() => onTabChange('week')}
                        icon={<Calendar size={20} />}
                        label="Week"
                    />

                    {/* FAB */}
                    <motion.button
                        id="nav-add-btn"
                        whileHover={{ scale: 1.1 }}
                        whileTap={{ scale: 0.9 }}
                        onClick={onAddClick}
                        className="mx-2 bg-gradient-to-r from-primary to-purple-600 text-white p-3.5 rounded-xl shadow-lg shadow-primary/40 border border-white/20"
                    >
                        <Plus size={24} />
                    </motion.button>

                    <NavButton
                        id="nav-focus"
                        active={activeTab === 'focus'}
                        onClick={() => onTabChange('focus')}
                        icon={<Timer size={20} />}
                        label="Focus"
                    />

                    <NavButton
                        id="nav-stats"
                        active={activeTab === 'stats'}
                        onClick={() => onTabChange('stats')}
                        icon={<PieChart size={20} />}
                        label="Stats"
                    />

                </div>
            </nav>
            <SettingsModal isOpen={isSettingsOpen} onClose={() => setIsSettingsOpen(false)} />
        </div>
    );
};

interface NavButtonProps {
    id?: string;
    active: boolean;
    onClick: () => void;
    icon: React.ReactNode;
    label: string;
}

const NavButton: React.FC<NavButtonProps> = ({ id, active, onClick, icon }) => (
    <button
        id={id}
        onClick={onClick}
        className={`relative p-3 rounded-xl transition-all duration-300 group flex items-center justify-center ${active ? 'text-white' : 'text-muted-foreground hover:text-white'
            }`}
    >
        {active && (
            <motion.div
                layoutId="nav-pill"
                className="absolute inset-0 bg-white/10 rounded-xl"
                transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
            />
        )}
        <div className="relative z-10 flex flex-col items-center gap-1">
            {icon}
        </div>
    </button>
);
