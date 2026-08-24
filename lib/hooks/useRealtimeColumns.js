import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabaseClient';
import { columnsApi } from '@/lib/api/columns';

export function useRealtimeColumns(boardId) {
  const [columns, setColumns] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!boardId) {
      console.log('[useRealtimeColumns] No boardId provided');
      setLoading(false);
      setColumns([]);
      return;
    }

    let mounted = true;
    const channelName = `columns-${boardId}`;

    // Remove existing channel if any
    const existingChannel = supabase.getChannels().find(c => c.topic === channelName);
    if (existingChannel) {
      supabase.removeChannel(existingChannel);
    }

    const loadColumns = async () => {
      try {
        console.log('[useRealtimeColumns] Loading columns for board:', boardId);
        const data = await columnsApi.list(boardId);
        console.log('[useRealtimeColumns] Loaded columns:', data?.length);
        if (mounted) setColumns(data || []);
      } catch (error) {
        console.error('[useRealtimeColumns] Error loading columns:', error);
      } finally {
        if (mounted) setLoading(false);
      }
    };

    loadColumns();

    // Subscribe to realtime changes
    console.log('[useRealtimeColumns] Setting up realtime subscription for board:', boardId);
    const channel = supabase
      .channel(channelName)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'columns',
          filter: `board_id=eq.${boardId}`,
        },
        (payload) => {
          console.log('[useRealtimeColumns] Received payload:', payload);
          if (!mounted) return;

          if (payload.eventType === 'INSERT') {
            console.log('[useRealtimeColumns] INSERT column:', payload.new);
            setColumns((prev) => [...prev, payload.new]);
          } else if (payload.eventType === 'UPDATE') {
            console.log('[useRealtimeColumns] UPDATE column:', payload.new);
            setColumns((prev) =>
              prev.map((c) => (c.id === payload.new.id ? payload.new : c))
            );
          } else if (payload.eventType === 'DELETE') {
            console.log('[useRealtimeColumns] DELETE column:', payload.old.id);
            setColumns((prev) => prev.filter((c) => c.id !== payload.old.id));
          }
        }
      )
      .subscribe((status) => {
        console.log('[useRealtimeColumns] Subscription status:', status);
      });

    return () => {
      console.log('[useRealtimeColumns] Cleaning up subscription');
      mounted = false;
      supabase.removeChannel(channel);
    };
  }, [boardId]);

  return { columns, loading, setColumns };
}
