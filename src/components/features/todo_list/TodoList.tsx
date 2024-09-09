'use client';

import { useState, useEffect } from 'react';
import Todo from './Todo';
import { useUser } from "@clerk/nextjs";
import { useAuth as useClerkAuth } from '@clerk/nextjs';
import { signInWithCustomToken } from 'firebase/auth';
import { auth, db } from '@/lib/firebase';
import { collection, query, where, onSnapshot, addDoc, updateDoc, deleteDoc, doc } from 'firebase/firestore';
import { formatDate } from '@/utils/dateFormat';

interface Todo {
  id: string;
  name: string;
  uid: string;
  done: boolean;
}

interface TodoListProps {
  initialTodos: Todo[];
  timestamp: string;
}

export default function TodoList({ initialTodos, timestamp }: TodoListProps) {
  const { user } = useUser();
  const { getToken } = useClerkAuth();
  const [isFirebaseInitialized, setIsFirebaseInitialized] = useState(false);
  const [newTodoName, setNewTodoName] = useState('');
  const [todos, setTodos] = useState<Todo[]>(initialTodos);

  useEffect(() => {
    console.log('Here')
    const initializeFirebase = async () => {
      if (user) {
        try {
          const token = await getToken({ template: 'integration_firebase' });
          if (token) {
            await signInWithCustomToken(auth, token);
            setIsFirebaseInitialized(true);
          }
        } catch (error) {
          console.error('Error initializing Firebase:', error);
        }
      }
    };

    initializeFirebase();
  }, [user, getToken]);

  useEffect(() => {
    if (isFirebaseInitialized && user) {
      const q = query(collection(db, 'todos'), where('uid', '==', user.id));
      const unsubscribe = onSnapshot(q, (querySnapshot) => {
        const updatedTodos = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Todo));
        setTodos(updatedTodos);
      });

      return () => unsubscribe();
    }
  }, [isFirebaseInitialized, user]);

  const handleToggleTodo = async (id: string, done: boolean) => {
    await updateDoc(doc(db, 'todos', id), { done });
  };

  const handleDeleteTodo = async (id: string) => {
    await deleteDoc(doc(db, 'todos', id));
  };

  const handleAddTodo = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTodoName.trim() || !user) return;

    const newTodo = {
      name: newTodoName,
      uid: user.id,
      done: false,
    };

    await addDoc(collection(db, 'todos'), newTodo);
    setNewTodoName('');
  };

  return (
    <div className="max-w-md mx-auto">
      <p className="mb-4 text-sm text-gray-600">Last fetched at: {formatDate(timestamp).toLocaleString()}</p>
      <form onSubmit={handleAddTodo} className="mb-4">
        <div className="flex">
          <input
            type="text"
            value={newTodoName}
            onChange={(e) => setNewTodoName(e.target.value)}
            placeholder="Add a new todo"
            className="flex-grow px-4 py-2 text-gray-700 bg-white border border-gray-300 rounded-l-lg focus:outline-none focus:border-blue-500"
          />
          <button
            type="submit"
            className="px-4 py-2 text-white bg-blue-500 rounded-r-lg hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50"
          >
            Add
          </button>
        </div>
      </form>
      <Todo todos={todos} onToggle={handleToggleTodo} onDelete={handleDeleteTodo} />
    </div>
  );
}
