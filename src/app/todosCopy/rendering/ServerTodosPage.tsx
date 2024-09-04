// app/todos/ServerTodosPage.tsx

import { db } from '@/lib/firebase_admin';
import TodoList from '@/components/features/todo_list/TodoList';

interface ServerTodosPageProps {
  isAuthenticated: boolean;
  userId: string | null;
}

async function getTodos(userId: string) {
  const todosSnapshot = await db.collection('todos').where('uid', '==', userId).get();
  return todosSnapshot.docs.map(doc => ({
    id: doc.id,
    name: doc.data().name,
    uid: doc.data().uid,
    done: doc.data().done
  }));
}

export default async function ServerTodosPage({ isAuthenticated, userId }: ServerTodosPageProps) {
  console.log('ServerTodosPage:', { isAuthenticated, userId });

  if (!isAuthenticated || !userId) {
    return (
      <div className="container mx-auto px-4">
        <h1 className="text-3xl font-bold mb-8 text-center text-black">All Todos (Server-side)</h1>
        <p>Please log in to view your todos.</p>
      </div>
    );
  }

  const todos = await getTodos(userId);

  return (
    <div className="container mx-auto px-4">
      <h1 className="text-3xl font-bold mb-8 text-center text-black">All Todos (Server-side)</h1>
      <TodoList todos={todos} />
    </div>
  );
}
