import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabaseClient';
import { columnsApi } from '@/lib/api/columns';

export function useRealtimeColumns(boardId) {
  const [columns, setColumns] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!boardId) {
      setLoading(false);
      return;
    }

    let mounted = true;

    const loadColumns = async () => {
      try {
        const data = await columnsApi.list(boardId);
        if (mounted) setColumns(data || []);
      } catch (error) {
        console.error('Error loading columns:', error);
      } finally {
        if (mounted) setLoading(false);
      }
    };

    loadColumns();

    // Subscribe to realtime changes
    const channel = supabase
      .channel('columns-changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'columns',
          filter: `board_id=eq.${boardId}`,
        },
        (payload) => {
          if (!mounted) return;

          if (payload.eventType === 'INSERT') {
            setColumns((prev) => [...prev, payload.new]);
          } else if (payload.eventType === 'UPDATE') {
            setColumns((prev) =>
              prev.map((c) => (c.id === payload.new.id ? payload.new : c))
            );
          } else if (payload.eventType === 'DELETE') {
            setColumns((prev) => prev.filter((c) => c.id !== payload.old.id));
          }
        }
      )
      .subscribe();

    return () => {
      mounted = false;
      supabase.removeChannel(channel);
    };
  }, [boardId]);

  return { columns, loading, setColumns };
}
