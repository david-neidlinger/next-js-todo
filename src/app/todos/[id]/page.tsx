"use client"

import { useParams } from 'next/navigation';
import { useEffect, useState } from 'react';
import { db } from '@/lib/firebase';
import { doc, getDoc } from 'firebase/firestore';

interface Todo {
  id: string;
  name: string;
  uid: string;
  done: boolean;
}

export default function TodoDetailsPage() {
  const { id } = useParams();
  const [todo, setTodo] = useState<Todo | null>(null);

  useEffect(() => {
    if (id) {
      const fetchTodo = async () => {
        const docRef = doc(db, 'todos', id as string);
        const docSnap = await getDoc(docRef);

        if (docSnap.exists()) {
          setTodo({ id: docSnap.id, ...docSnap.data() } as Todo);
        }
      };
      fetchTodo();
    }
  }, [id]);

  if (!todo) {
    return <div>Loading...</div>;
  }

  return (
    <div>
      <h1>{todo.name}</h1>
    </div>
  );
}