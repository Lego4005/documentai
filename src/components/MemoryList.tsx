import React from 'react';
import { useRealtimeData } from '../hooks/useRealtimeData';

interface Memory {
  id: string;
  title: string;
  content: string;
}

const MemoryList: React.FC = () => {
  const { data: memories, error } = useRealtimeData<Memory>('memories');

  if (error) {
    return <div>Error: {error.message}</div>;
  }

  if (!memories) {
    return <div>Loading...</div>;
  }

  return (
    <div>
      <h1>Memories</h1>
      <ul>
        {memories.map((memory) => (
          <li key={memory.id}>
            <h2>{memory.title}</h2>
            <p>{memory.content}</p>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default MemoryList;