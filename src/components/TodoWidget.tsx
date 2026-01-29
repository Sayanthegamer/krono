import React, { useState } from 'react';
import { useTodo } from '../context/TodoContext';
import { motion, AnimatePresence } from 'framer-motion';
import { Check, Plus, Trash2, Sparkles } from 'lucide-react';

export const TodoWidget: React.FC = () => {
    const { todos, addTodo, toggleTodo, deleteTodo } = useTodo();
    const [newItem, setNewItem] = useState('');

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (newItem.trim()) {
            addTodo(newItem.trim());
            setNewItem('');
        }
    };

    const sortedTodos = [...todos].sort((a, b) => {
        if (a.completed === b.completed) return b.createdAt - a.createdAt;
        return a.completed ? 1 : -1;
    });

    const remainingTodos = todos.filter(t => !t.completed).length;

    return (
        <div className="glass-card p-6 rounded-xl relative overflow-hidden group">
            {/* Decorative background element */}
            <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-smooth">
                <div className="w-24 h-24 bg-gradient-to-br from-green-400 to-emerald-600 rounded-full blur-2xl" />
            </div>

            {/* Header */}
            <div className="flex items-center justify-between mb-6">
                <h3 className="text-xl font-bold text-foreground flex items-center gap-2">
                    <span>Tasks</span>
                    <span className="text-xs bg-primary/20 px-2.5 py-1 rounded-full text-primary font-semibold">
                        {remainingTodos} remaining
                    </span>
                </h3>
                {remainingTodos === 0 && todos.length > 0 && (
                    <motion.div
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-green-500/20 border border-green-500/30"
                    >
                        <Sparkles className="text-green-400" size={14} />
                        <span className="text-xs font-semibold text-green-400">All done!</span>
                    </motion.div>
                )}
            </div>

            {/* Add Task Form */}
            <form onSubmit={handleSubmit} className="relative mb-6">
                <input
                    type="text"
                    value={newItem}
                    onChange={(e) => setNewItem(e.target.value)}
                    placeholder="Add a new task..."
                    className="w-full bg-black/5 dark:bg-black/20 border border-black/5 dark:border-white/10 rounded-xl px-4 py-3 pr-12 text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 transition-smooth font-medium"
                />
                <button
                    type="submit"
                    disabled={!newItem.trim()}
                    className={`absolute right-2 top-2 p-2 rounded-lg transition-smooth ${newItem.trim()
                        ? 'bg-gradient-to-br from-primary to-purple-600 text-white hover:shadow-lg hover:shadow-primary/30 hover:scale-105'
                        : 'bg-muted text-muted-foreground cursor-not-allowed'
                        }`}
                >
                    <Plus size={18} />
                </button>
            </form>

            {/* Todo List */}
            <div className="space-y-2 max-h-[280px] overflow-y-auto pr-2 custom-scrollbar">
                <AnimatePresence mode="popLayout">
                    {sortedTodos.map((todo, index) => (
                        <motion.div
                            key={todo.id}
                            layout
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, scale: 0.9, x: 20 }}
                            transition={{
                                duration: 0.2,
                                ease: 'easeOut',
                                delay: index * 0.03,
                            }}
                            className={`group/item flex items-center gap-3 p-3 rounded-xl transition-smooth border ${todo.completed
                                ? 'bg-black/5 dark:bg-white/5 border-transparent opacity-60'
                                : 'bg-white/40 dark:bg-white/10 border-black/5 dark:border-white/5 hover:bg-white/60 dark:hover:bg-white/15 hover:border-primary/20'
                                }`}
                        >
                            <motion.button
                                whileHover={{ scale: 1.1 }}
                                whileTap={{ scale: 0.9 }}
                                onClick={() => toggleTodo(todo.id)}
                                className={`flex-shrink-0 w-6 h-6 rounded-full border-2 flex items-center justify-center transition-smooth ${todo.completed
                                    ? 'bg-green-500 border-green-500 text-white'
                                    : 'border-muted-foreground/30 hover:border-muted-foreground/50 text-transparent hover:border-primary/50'
                                    }`}
                            >
                                <Check size={14} strokeWidth={3} />
                            </motion.button>

                            <span className={`flex-1 font-medium transition-smooth ${todo.completed ? 'text-muted-foreground line-through' : 'text-foreground'
                                }`}>
                                {todo.text}
                            </span>

                            <motion.button
                                whileHover={{ scale: 1.1 }}
                                whileTap={{ scale: 0.9 }}
                                onClick={() => deleteTodo(todo.id)}
                                className="opacity-0 group-hover/item:opacity-100 p-1.5 text-red-400 hover:bg-red-400/20 rounded-lg transition-smooth"
                            >
                                <Trash2 size={16} />
                            </motion.button>
                        </motion.div>
                    ))}

                    {todos.length === 0 && (
                        <motion.div
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="glass-card p-6 rounded-xl flex flex-col items-center justify-center text-center border-dashed border-border"
                        >
                            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-primary/20 to-secondary/20 flex items-center justify-center mb-3">
                                <Sparkles className="text-primary" size={24} />
                            </div>
                            <h4 className="font-semibold text-foreground mb-1">No tasks yet</h4>
                            <p className="text-sm text-muted-foreground">Create tasks to stay organized and focused</p>
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>
        </div>
    );
};
