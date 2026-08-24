import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabaseClient';
import { pipelineCardsApi } from '@/lib/api/pipeline-cards';

export function useRealtimePipelineCards(projectId) {
  const [cards, setCards] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!projectId) {
      console.log('[useRealtimePipelineCards] No projectId provided');
      setLoading(false);
      setCards([]);
      return;
    }

    let mounted = true;

    const loadCards = async () => {
      try {
        console.log('[useRealtimePipelineCards] Loading cards for project:', projectId);
        const data = await pipelineCardsApi.list(projectId);
        console.log('[useRealtimePipelineCards] Loaded cards:', data?.length);
        if (mounted) setCards(data || []);
      } catch (error) {
        console.error('[useRealtimePipelineCards] Error loading cards:', error);
      } finally {
        if (mounted) setLoading(false);
      }
    };

    loadCards();

    console.log('[useRealtimePipelineCards] Setting up realtime subscription for project:', projectId);
    const channel = supabase
      .channel(`pipeline-cards-${projectId}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'pipeline_cards',
          filter: `project_id=eq.${projectId}`,
        },
        (payload) => {
          console.log('[useRealtimePipelineCards] Received payload:', payload);
          if (!mounted) return;

          if (payload.eventType === 'INSERT') {
            console.log('[useRealtimePipelineCards] INSERT card:', payload.new);
            setCards((prev) => [...prev, payload.new]);
          } else if (payload.eventType === 'UPDATE') {
            console.log('[useRealtimePipelineCards] UPDATE card:', payload.new);
            setCards((prev) =>
              prev.map((c) => (c.id === payload.new.id ? payload.new : c))
            );
          } else if (payload.eventType === 'DELETE') {
            console.log('[useRealtimePipelineCards] DELETE card:', payload.old.id);
            setCards((prev) => prev.filter((c) => c.id !== payload.old.id));
          }
        }
      )
      .subscribe((status) => {
        console.log('[useRealtimePipelineCards] Subscription status:', status);
      });

    return () => {
      console.log('[useRealtimePipelineCards] Cleaning up subscription');
      mounted = false;
      supabase.removeChannel(channel);
    };
  }, [projectId]);

  return { cards, loading, setCards };
}
