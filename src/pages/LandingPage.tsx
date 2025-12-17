import React from 'react';
import { motion } from 'framer-motion';
import { ArrowRight, Clock, Calendar, BarChart3 } from 'lucide-react';

interface LandingPageProps {
    onGetStarted: () => void;
}

export const LandingPage: React.FC<LandingPageProps> = ({ onGetStarted }) => {
    return (
        <div className="min-h-screen bg-background text-foreground flex flex-col relative overflow-hidden">

            {/* Background Gradients */}
            <div className="absolute inset-0 overflow-hidden pointer-events-none">
                <div className="absolute top-[-10%] right-[-5%] w-[500px] h-[500px] bg-primary/20 rounded-full blur-[120px]" />
                <div className="absolute bottom-[-10%] left-[-5%] w-[500px] h-[500px] bg-purple-500/10 rounded-full blur-[120px]" />
            </div>

            {/* Navbar */}
            <nav className="relative z-10 w-full p-6 flex justify-between items-center max-w-7xl mx-auto">
                <div className="flex items-center gap-2 font-bold text-xl tracking-tight">
                    <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-primary to-purple-500 flex items-center justify-center shadow-lg shadow-primary/20">
                        <span className="text-white text-sm">K</span>
                    </div>
                    Krono
                </div>
                <button
                    onClick={onGetStarted}
                    className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
                >
                    Sign In
                </button>
            </nav>

            {/* Hero Section */}
            <main className="flex-1 flex flex-col items-center justify-center text-center p-6 relative z-10 max-w-4xl mx-auto mt-8 md:mt-0">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6 }}
                >
                    <span className="inline-block py-1 px-3 rounded-full bg-white/5 border border-white/10 text-xs font-medium text-primary mb-6">
                        v2.0 Now Available
                    </span>
                    <h1 className="text-4xl md:text-6xl lg:text-7xl font-bold tracking-tight mb-6 bg-clip-text text-transparent bg-gradient-to-br from-white via-white/90 to-white/50">
                        Master your time with <span className="text-primary">Krono</span>.
                    </h1>
                    <p className="text-lg md:text-xl text-muted-foreground/80 max-w-2xl mx-auto mb-10 leading-relaxed">
                        The ultimate student companion. Organize classes, track focus sessions, and manage tasks in a beautifully focused interface.
                    </p>

                    <motion.button
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={onGetStarted}
                        className="group relative px-8 py-4 bg-primary text-primary-foreground font-bold rounded-2xl shadow-xl shadow-primary/20 overflow-hidden"
                    >
                        <div className="absolute inset-0 bg-white/20 translate-y-[100%] group-hover:translate-y-0 transition-transform duration-300" />
                        <span className="relative flex items-center gap-2">
                            Get Started Now <ArrowRight size={18} />
                        </span>
                    </motion.button>
                </motion.div>

                {/* Features Grid */}
                <motion.div
                    initial={{ opacity: 0, y: 40 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.3, duration: 0.6 }}
                    className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-20 md:mt-32 w-full text-left"
                >
                    <FeatureCard
                        icon={<Clock size={24} />}
                        title="Focus Timer"
                        desc="Stay in flow with customizable Pomodoro sessions and analytics."
                        delay={0.1}
                    />
                    <FeatureCard
                        icon={<Calendar size={24} />}
                        title="Smart Schedule"
                        desc="Visualize your week with a dynamic, responsive timetable."
                        delay={0.2}
                    />
                    <FeatureCard
                        icon={<BarChart3 size={24} />}
                        title="Sync & Insights"
                        desc="Track your progress with detailed charts and cloud sync."
                        delay={0.3}
                    />
                </motion.div>
            </main>

            {/* Footer / Credits */}
            <footer className="relative z-10 w-full p-6 text-center mt-12 mb-4">
                <p className="text-sm text-muted-foreground">
                    Designed & Built by <span className="text-foreground font-medium">Sayan</span>.
                </p>
                <div className="text-[10px] text-muted-foreground/50 mt-2">
                    © 2025 Krono. All rights reserved.
                </div>
            </footer>
        </div>
    );
};

const FeatureCard: React.FC<{ icon: React.ReactNode, title: string, desc: string, delay: number }> = ({ icon, title, desc, delay }) => {
    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 + delay, duration: 0.5 }}
            className="p-6 rounded-2xl bg-white/5 border border-white/5 backdrop-blur-sm hover:bg-white/10 transition-colors"
        >
            <div className="mb-4 text-primary">{icon}</div>
            <h3 className="text-lg font-bold mb-2 text-white">{title}</h3>
            <p className="text-sm text-muted-foreground leading-relaxed">{desc}</p>
        </motion.div>
    );
};
