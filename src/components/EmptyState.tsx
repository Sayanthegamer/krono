import React from 'react';
import { motion } from 'framer-motion';
import { Calendar, CheckSquare, BarChart3, Clock, Plus, Sparkles } from 'lucide-react';

interface EmptyStateProps {
  type: 'timetable' | 'todos' | 'stats' | 'focus' | 'dashboard';
  title?: string;
  description?: string;
  action?: {
    label: string;
    onClick: () => void;
  };
}

const illustrations = {
  timetable: {
    icon: Calendar,
    title: 'No classes scheduled',
    description: 'Add your first class to get started with your schedule',
    actionLabel: 'Add Class',
  },
  todos: {
    icon: CheckSquare,
    title: 'No tasks yet',
    description: 'Create tasks to stay organized and focused',
    actionLabel: 'Add Task',
  },
  stats: {
    icon: BarChart3,
    title: 'No stats available',
    description: 'Complete focus sessions to see your productivity insights',
    actionLabel: 'Start Focusing',
  },
  focus: {
    icon: Clock,
    title: 'Ready to focus?',
    description: 'Start a focus session to boost your productivity',
    actionLabel: 'Start Session',
  },
  dashboard: {
    icon: Sparkles,
    title: 'All caught up!',
    description: 'No more classes for today. Enjoy your free time!',
  },
};

export const EmptyState: React.FC<EmptyStateProps> = ({
  type,
  title,
  description,
  action,
}) => {
  const config = illustrations[type];
  const Icon = config.icon;

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.3, ease: 'easeOut' }}
      className="glass-card p-8 md:p-12 rounded-xl flex flex-col items-center justify-center text-center border-dashed border-border"
    >
      {/* Icon Container */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="w-20 h-20 rounded-2xl bg-gradient-to-br from-primary/20 to-secondary/20 flex items-center justify-center mb-6"
      >
        <Icon className="text-primary w-10 h-10" />
      </motion.div>

      {/* Text Content */}
      <motion.h3
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="text-xl font-bold text-foreground mb-3"
      >
        {title || config.title}
      </motion.h3>

      <motion.p
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className="text-muted-foreground max-w-md mb-6"
      >
        {description || config.description}
      </motion.p>

      {/* Action Button */}
      {(action || config.actionLabel) && (
        <motion.button
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          onClick={action?.onClick}
          className="flex items-center gap-2 px-6 py-3 rounded-xl bg-primary text-primary-foreground font-semibold shadow-lg hover:bg-primary/90 transition-smooth hover:scale-105 active:scale-95"
        >
          <Plus size={18} />
          <span>{action?.label || config.actionLabel}</span>
        </motion.button>
      )}
    </motion.div>
  );
};
