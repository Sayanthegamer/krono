import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, ChevronRight } from 'lucide-react';
import { createPortal } from 'react-dom';

interface Step {
    targetId: string;
    title: string;
    description: string;
    position?: 'top' | 'bottom' | 'left' | 'right';
}

const TOUR_STEPS: Step[] = [
    {
        targetId: 'welcome-step',
        title: 'Welcome to Timetable!',
        description: "Let's take a quick tour to show you around your new productivity hub.",
        position: 'bottom'
    },
    {
        targetId: 'nav-home',
        title: 'Dashboard',
        description: 'See upcoming classes and your focus schedule at a glance.',
        position: 'top'
    },
    {
        targetId: 'todo-widget',
        title: 'To-Do List',
        description: 'Manage daily tasks right here. Tap + to add, click circle to complete.',
        position: 'bottom'
    },
    {
        targetId: 'nav-add-btn',
        title: 'Quick Add',
        description: 'Tap this button anytime to add new Classes.',
        position: 'top'
    },
    {
        targetId: 'nav-focus',
        title: 'Focus Mode',
        description: 'Get in the zone with our built-in Pomodoro timer.',
        position: 'top'
    },
    {
        targetId: 'nav-stats',
        title: 'Statistics',
        description: 'Track your study hours and productivity trends.',
        position: 'top'
    },
    {
        targetId: 'user-profile-trigger',
        title: 'Settings & Data',
        description: 'Access account settings or securely reset all your data from here.',
        position: 'bottom'
    }
];

export const OnboardingTour: React.FC = () => {
    const [isVisible, setIsVisible] = useState(false);
    const [currentStep, setCurrentStep] = useState(0);
    const [targetRect, setTargetRect] = useState<DOMRect | null>(null);

    // Initial check
    useEffect(() => {
        // Check if tour has been seen
        const hasSeen = localStorage.getItem('has_seen_onboarding_v2');
        // Changed key to force re-show for update

        if (!hasSeen) {
            setTimeout(() => setIsVisible(true), 1000);
        }
    }, []);

    // Update rect on step change or resize
    useEffect(() => {
        if (!isVisible) return;

        const updateRect = () => {
            const step = TOUR_STEPS[currentStep];
            if (step.targetId === 'welcome-step') {
                // Virtual center for welcome
                setTargetRect({
                    top: window.innerHeight / 2 - 1,
                    left: window.innerWidth / 2 - 1,
                    width: 2,
                    height: 2,
                    bottom: window.innerHeight / 2 + 1,
                    right: window.innerWidth / 2 + 1,
                } as DOMRect);
                return;
            }

            const el = document.getElementById(step.targetId);
            if (el) {
                const rect = el.getBoundingClientRect();
                setTargetRect(rect);
                // Scroll into view if needed
                el.scrollIntoView({ behavior: 'smooth', block: 'center' });
            }
        };

        updateRect();
        window.addEventListener('resize', updateRect);
        return () => window.removeEventListener('resize', updateRect);
    }, [currentStep, isVisible]);

    const handleNext = () => {
        if (currentStep < TOUR_STEPS.length - 1) {
            setCurrentStep(prev => prev + 1);
        } else {
            finishTour();
        }
    };

    const finishTour = () => {
        setIsVisible(false);
        localStorage.setItem('has_seen_onboarding_v2', 'true');
    };

    if (!isVisible || !targetRect) return null;

    const step = TOUR_STEPS[currentStep];

    return createPortal(
        <div className="fixed inset-0 z-[100] touch-none">
            {/* SVG Mask for "Spotlight" effect */}
            <svg className="absolute inset-0 w-full h-full pointer-events-none">
                <defs>
                    <mask id="tour-mask">
                        <rect className="w-full h-full fill-white" />
                        <motion.rect
                            initial={false}
                            animate={{
                                x: targetRect.left - 10,
                                y: targetRect.top - 10,
                                width: targetRect.width + 20,
                                height: targetRect.height + 20,
                                rx: 12
                            }}
                            transition={{ type: "spring", stiffness: 300, damping: 30 }}
                            className="fill-black"
                        />
                    </mask>
                </defs>
                {/* Dark Overlay with Hole */}
                <rect
                    className="w-full h-full fill-black/60 backdrop-blur-[2px]"
                    mask="url(#tour-mask)"
                />
            </svg>

            {/* Tooltip Card */}
            <AnimatePresence mode="wait">
                <motion.div
                    key={currentStep}
                    initial={{ opacity: 0, scale: 0.9, y: 10 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.9 }}
                    style={{
                        position: 'absolute',
                        top: step.targetId === 'welcome-step'
                            ? '50%'
                            : step.position === 'top'
                                ? targetRect.top - 24 // 24px gap above
                                : targetRect.bottom + 24, // 24px gap below
                        left: step.targetId === 'welcome-step'
                            ? '50%'
                            : Math.max(20, Math.min(window.innerWidth - 320, targetRect.left + targetRect.width / 2 - 150)),
                        transform: step.targetId === 'welcome-step'
                            ? 'translate(-50%, -50%)'
                            : step.position === 'top'
                                ? 'translateY(-100%)' // Move up by its own height
                                : 'none'
                    }}
                    className="w-[90vw] max-w-[300px] bg-card border border-border rounded-xl shadow-2xl p-6 z-[101] text-card-foreground pointer-events-auto"
                >
                    <div className="flex justify-between items-start mb-2">
                        <h3 className="text-lg font-bold">{step.title}</h3>
                        <button onClick={finishTour} className="text-muted-foreground hover:text-foreground">
                            <X size={16} />
                        </button>
                    </div>
                    <p className="text-sm text-muted-foreground mb-4 leading-relaxed">
                        {step.description}
                    </p>
                    <div className="flex justify-between items-center">
                        <div className="flex gap-1">
                            {TOUR_STEPS.map((_, i) => (
                                <div
                                    key={i}
                                    className={`w-2 h-2 rounded-full transition-colors ${i === currentStep ? 'bg-primary' : 'bg-muted'}`}
                                />
                            ))}
                        </div>
                        <button
                            onClick={handleNext}
                            className="flex items-center gap-1 bg-primary text-primary-foreground px-4 py-2 rounded-lg text-sm font-medium hover:bg-primary/90 transition-colors"
                        >
                            {currentStep === TOUR_STEPS.length - 1 ? 'Finish' : 'Next'}
                            <ChevronRight size={14} />
                        </button>
                    </div>
                </motion.div>
            </AnimatePresence>
        </div>,
        document.body
    );
};
