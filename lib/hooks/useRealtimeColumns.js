import { useEffect, useState, useRef } from 'react';
import { supabase } from '@/lib/supabaseClient';
import { columnsApi } from '@/lib/api/columns';

// Global channel to prevent conflicts across components
let globalColumnsChannel = null;
let globalColumnsSubscribers = new Set();

export function useRealtimeColumns(boardId) {
  const [columns, setColumns] = useState([]);
  const [loading, setLoading] = useState(true);
  const subscriberId = useRef(Math.random());
  const currentBoardId = useRef(boardId);

  useEffect(() => {
    if (!boardId) {
      console.log('[useRealtimeColumns] No boardId provided');
      setLoading(false);
      setColumns([]);
      return;
    }

    let mounted = true;
    currentBoardId.current = boardId;

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

    // Add this component as a subscriber
    globalColumnsSubscribers.add(subscriberId.current);

    // Create global channel if it doesn't exist
    if (!globalColumnsChannel) {
      console.log('[useRealtimeColumns] Creating global columns channel');
      globalColumnsChannel = supabase
        .channel('global-columns-channel')
        .on(
          'postgres_changes',
          {
            event: '*',
            schema: 'public',
            table: 'columns',
          },
          (payload) => {
            console.log('[useRealtimeColumns] Global payload received:', payload);
            // Only process if payload matches current board
            if (payload.new.board_id === currentBoardId.current || payload.old?.board_id === currentBoardId.current) {
              console.log('[useRealtimeColumns] Processing payload for board:', currentBoardId.current);
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
          }
        )
        .subscribe((status) => {
          console.log('[useRealtimeColumns] Global subscription status:', status);
        });
    }

    return () => {
      console.log('[useRealtimeColumns] Cleaning up subscription');
      mounted = false;
      globalColumnsSubscribers.delete(subscriberId.current);
      
      // Remove global channel if no more subscribers
      if (globalColumnsSubscribers.size === 0 && globalColumnsChannel) {
        console.log('[useRealtimeColumns] Removing global channel (no subscribers)');
        supabase.removeChannel(globalColumnsChannel);
        globalColumnsChannel = null;
      }
    };
  }, [boardId]);

  return { columns, loading, setColumns };
}
