import React from 'react';
import { Calendar, Plus, Timer, LayoutGrid, PieChart, LogOut } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../context/AuthContext';

interface LayoutProps {
    children: React.ReactNode;
    activeTab: 'dashboard' | 'week' | 'focus' | 'stats';
    onTabChange: (tab: 'dashboard' | 'week' | 'focus' | 'stats') => void;
    onAddClick: () => void;
}

export const Layout: React.FC<LayoutProps> = ({ children, activeTab, onTabChange, onAddClick }) => {
    const { user, logout } = useAuth();

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
                    <button
                        onClick={logout}
                        className="p-2 rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
                        title="Sign out"
                    >
                        <LogOut size={20} />
                    </button>
                )}
            </header>

            {/* Main Content */}
            <main className="flex-1 p-4 pb-28 overflow-y-auto w-full max-w-lg mx-auto z-0 scroll-smooth">
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
                        active={activeTab === 'dashboard'}
                        onClick={() => onTabChange('dashboard')}
                        icon={<LayoutGrid size={20} />}
                        label="Home"
                    />

                    <NavButton
                        active={activeTab === 'week'}
                        onClick={() => onTabChange('week')}
                        icon={<Calendar size={20} />}
                        label="Week"
                    />

                    {/* FAB */}
                    <motion.button
                        whileHover={{ scale: 1.1 }}
                        whileTap={{ scale: 0.9 }}
                        onClick={onAddClick}
                        className="mx-2 bg-gradient-to-r from-primary to-purple-600 text-white p-3.5 rounded-xl shadow-lg shadow-primary/40 border border-white/20"
                    >
                        <Plus size={24} />
                    </motion.button>

                    <NavButton
                        active={activeTab === 'focus'}
                        onClick={() => onTabChange('focus')}
                        icon={<Timer size={20} />}
                        label="Focus"
                    />

                    <NavButton
                        active={activeTab === 'stats'}
                        onClick={() => onTabChange('stats')}
                        icon={<PieChart size={20} />}
                        label="Stats"
                    />

                </div>
            </nav>
        </div>
    );
};

interface NavButtonProps {
    active: boolean;
    onClick: () => void;
    icon: React.ReactNode;
    label: string;
}

const NavButton: React.FC<NavButtonProps> = ({ active, onClick, icon }) => (
    <button
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
