import { unstable_cache as cache } from "next/cache";
import { auth } from "@clerk/nextjs/server";
import TodoList from '@/components/features/todo_list/TodoList';
import { db } from '@/lib/firebase_admin';

interface Todo {
  id: string;
  name: string;
  uid: string;
  done: boolean;
}

const getTodosFromFirebase = async (userId: string) => {
  console.log('Fetching todos from Firebase');
  const todosSnapshot = await db.collection('todos').where('uid', '==', userId).get();
  const todos = todosSnapshot.docs.map(doc => ({
    id: doc.id,
    name: doc.data().name,
    uid: doc.data().uid,
    done: doc.data().done
  }));
  return { todos, timestamp: new Date().toISOString(), source: 'firebase' };
};

const getTodos = cache(
  getTodosFromFirebase,
  ["getTodos"],
  {
    tags: ["getTodos"],
    revalidate: 30 // Revalidate every minute
  }
);

export default async function TodosPage() {
  const { userId } = auth();

  if (!userId) {
    return (
      <div className="container mx-auto px-4 flex justify-center min-h-screen">
        <div className="text-center">
          <h1 className="text-3xl font-bold mb-4 text-black">All Todos</h1>
          <p>Please log in to view your todos.</p>
        </div>
      </div>
    );
  }

  const { todos, timestamp, source } = await getTodos(userId);
  console.log('Data fetched at:', timestamp);
  console.log('Data source:', source || 'cache');

  return (
    <div className="container mx-auto px-4 flex justify-center min-h-screen">
      <div className="w-full max-w-md">
        <h2 className="text-2xl font-bold mb-4 text-center">Your Todos</h2>
        <TodoList initialTodos={todos} timestamp={timestamp} />
      </div>
    </div>
  );
}
