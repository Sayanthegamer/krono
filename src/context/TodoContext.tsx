import React, { createContext, useContext, useState, useEffect } from 'react';
import type { TodoItem } from '../types';
import { db } from '../lib/firebase';
import { collection, getDocs, addDoc, updateDoc, deleteDoc, doc, query, where } from 'firebase/firestore';
import { useAuth } from './AuthContext';

interface TodoContextType {
    todos: TodoItem[];
    isLoading: boolean;
    addTodo: (text: string) => void;
    toggleTodo: (id: string) => void;
    deleteTodo: (id: string) => void;
}

const TodoContext = createContext<TodoContextType | undefined>(undefined);

const TODOS_COLLECTION = 'todos';

export const TodoProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const { user } = useAuth();
    const [todos, setTodos] = useState<TodoItem[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    // Load todos from Firestore scoped to current user
    useEffect(() => {
        if (!user) return;

        const loadTodos = async () => {
            try {
                const q = query(
                    collection(db, TODOS_COLLECTION),
                    where('userId', '==', user.uid)
                );
                const snapshot = await getDocs(q);
                const data = snapshot.docs.map(doc => ({
                    ...doc.data(),
                    id: doc.id
                })) as TodoItem[];
                data.sort((a, b) => b.createdAt - a.createdAt);
                setTodos(data);
            } catch (error) {
                console.error('Error loading todos from Firestore:', error);
            } finally {
                setIsLoading(false);
            }
        };
        loadTodos();
    }, [user]);

    const addTodo = async (text: string) => {
        if (!user) return;
        try {
            const newTodo: Omit<TodoItem, 'id'> & { userId: string } = {
                text,
                completed: false,
                createdAt: Date.now(),
                userId: user.uid
            };
            const docRef = await addDoc(collection(db, TODOS_COLLECTION), newTodo);
            setTodos(prev => [{ text, completed: false, createdAt: Date.now(), id: docRef.id }, ...prev]);
        } catch (error) {
            console.error('Error adding todo:', error);
        }
    };

    const toggleTodo = async (id: string) => {
        try {
            const todo = todos.find(t => t.id === id);
            if (todo) {
                await updateDoc(doc(db, TODOS_COLLECTION, id), { completed: !todo.completed });
                setTodos(prev => prev.map(t => t.id === id ? { ...t, completed: !t.completed } : t));
            }
        } catch (error) {
            console.error('Error toggling todo:', error);
        }
    };

    const deleteTodo = async (id: string) => {
        try {
            await deleteDoc(doc(db, TODOS_COLLECTION, id));
            setTodos(prev => prev.filter(t => t.id !== id));
        } catch (error) {
            console.error('Error deleting todo:', error);
        }
    };

    return (
        <TodoContext.Provider value={{ todos, isLoading, addTodo, toggleTodo, deleteTodo }}>
            {children}
        </TodoContext.Provider>
    );
};

export const useTodo = () => {
    const context = useContext(TodoContext);
    if (context === undefined) {
        throw new Error('useTodo must be used within a TodoProvider');
    }
    return context;
};
