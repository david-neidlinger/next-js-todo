'use client';

import Link from 'next/link';

interface Todo {
  id: string;
  name: string;
  uid: string;
  done: boolean;
}

interface TodoProps {
  todos: Todo[];
  onToggle: (id: string, done: boolean) => void;
  onDelete: (id: string) => void;
}

export default function Todo({ todos, onToggle, onDelete }: TodoProps) {
  return (
    <div className="max-w-md mx-auto">
      <ul className="space-y-2">
        {todos.map((todo) => (
          <li key={todo.id} className="flex items-center bg-white p-3 rounded-md shadow">
            <input
              type="checkbox"
              checked={todo.done}
              onChange={() => onToggle(todo.id, todo.done)}
              className="mr-2"
            />
            <Link href={`/todosCopy`} className={`flex-grow ${todo.done ? 'line-through text-gray-500' : ''}`}>
              {todo.name}
            </Link>
            <button
              onClick={() => onDelete(todo.id)}
              className="ml-2 text-red-500 hover:text-red-700"
            >
              Delete
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
}
