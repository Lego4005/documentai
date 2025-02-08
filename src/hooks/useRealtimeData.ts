import { useState, useEffect } from 'react';
import { supabase } from '../supabaseClient';
import { PostgrestError } from '@supabase/supabase-js';

export function useRealtimeData<T>(tableName: string) {
  const [data, setData] = useState<T[] | null>(null);
  const [error, setError] = useState<PostgrestError | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      const { data: initialData, error: initialError } = await supabase
        .from(tableName)
        .select('*');

      if (initialError) {
        setError(initialError);
        return;
      }

      setData(initialData as T[]);
    };

    fetchData();

    const subscription = supabase
      .channel('any')
      .on('postgres_changes', { event: '*', schema: 'public', table: tableName }, (payload) => {
          if (payload.eventType === 'INSERT' || payload.eventType === "UPDATE") {
            setData(prevData => {
                if (!prevData) {
                    return [payload.new] as T[];
                }
                const index = prevData.findIndex(item => (item as any).id === payload.new.id);

                if(index > -1) {
                    const newData = [...prevData];
                    newData[index] = payload.new;
                    return newData as T[];
                } else {
                    return [...prevData, payload.new] as T[];
                }
            })
          } else if (payload.eventType === 'DELETE') {
              setData(prevData => {
                if(!prevData) return null;

                return prevData.filter(item => (item as any).id !== payload.old.id) as T[];
              })
          }
      })
      .subscribe();

    return () => {
      subscription.unsubscribe();
    };
  }, [tableName]);

  return { data, error };
}