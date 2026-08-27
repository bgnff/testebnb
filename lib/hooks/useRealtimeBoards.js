import { useEffect, useState, useRef } from 'react';
import { supabase } from '@/lib/supabaseClient';
import { boardsApi } from '@/lib/api/boards';

// Global channel to prevent conflicts across components
let globalBoardsChannel = null;
let globalBoardsSubscribers = new Set();

export function useRealtimeBoards() {
  const [boards, setBoards] = useState([]);
  const [loading, setLoading] = useState(true);
  const subscriberId = useRef(Math.random());

  useEffect(() => {
    let mounted = true;

    const loadBoards = async () => {
      try {
        const data = await boardsApi.list();
        if (mounted) setBoards(data || []);
      } catch (error) {
        console.error('[useRealtimeBoards] Error loading boards:', error);
      } finally {
        if (mounted) setLoading(false);
      }
    };

    loadBoards();

    // Add this component as a subscriber
    globalBoardsSubscribers.add(subscriberId.current);

    // Create global channel if it doesn't exist
    if (!globalBoardsChannel) {
      globalBoardsChannel = supabase
        .channel('global-boards-channel')
        .on(
          'postgres_changes',
          {
            event: '*',
            schema: 'public',
            table: 'boards',
          },
          (payload) => {
            if (payload.eventType === 'INSERT') {
              setBoards((prev) => [...prev, payload.new]);
            } else if (payload.eventType === 'UPDATE') {
              setBoards((prev) =>
                prev.map((b) => (b.id === payload.new.id ? payload.new : b))
              );
            } else if (payload.eventType === 'DELETE') {
              setBoards((prev) => prev.filter((b) => b.id !== payload.old.id));
            }
          }
        )
        .subscribe((status) => {
          console.log('[useRealtimeBoards] Global subscription status:', status);
        });
    }

    return () => {
      mounted = false;
      globalBoardsSubscribers.delete(subscriberId.current);
      
      // Remove global channel if no more subscribers
      if (globalBoardsSubscribers.size === 0 && globalBoardsChannel) {
        supabase.removeChannel(globalBoardsChannel);
        globalBoardsChannel = null;
      }
    };
  }, []);

  return { boards, loading, setBoards };
}
