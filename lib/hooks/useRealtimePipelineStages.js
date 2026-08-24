import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabaseClient';
import { pipelineStagesApi } from '@/lib/api/pipeline-stages';

export function useRealtimePipelineStages(projectId) {
  const [stages, setStages] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!projectId) {
      console.log('[useRealtimePipelineStages] No projectId provided');
      setLoading(false);
      setStages([]);
      return;
    }

    let mounted = true;

    const loadStages = async () => {
      try {
        console.log('[useRealtimePipelineStages] Loading stages for project:', projectId);
        const data = await pipelineStagesApi.list(projectId);
        console.log('[useRealtimePipelineStages] Loaded stages:', data?.length);
        if (mounted) setStages(data || []);
      } catch (error) {
        console.error('[useRealtimePipelineStages] Error loading stages:', error);
      } finally {
        if (mounted) setLoading(false);
      }
    };

    loadStages();

    console.log('[useRealtimePipelineStages] Setting up realtime subscription for project:', projectId);
    const channel = supabase
      .channel(`pipeline-stages-${projectId}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'pipeline_stages',
          filter: `project_id=eq.${projectId}`,
        },
        (payload) => {
          console.log('[useRealtimePipelineStages] Received payload:', payload);
          if (!mounted) return;

          if (payload.eventType === 'INSERT') {
            console.log('[useRealtimePipelineStages] INSERT stage:', payload.new);
            setStages((prev) => [...prev, payload.new]);
          } else if (payload.eventType === 'UPDATE') {
            console.log('[useRealtimePipelineStages] UPDATE stage:', payload.new);
            setStages((prev) =>
              prev.map((s) => (s.id === payload.new.id ? payload.new : s))
            );
          } else if (payload.eventType === 'DELETE') {
            console.log('[useRealtimePipelineStages] DELETE stage:', payload.old.id);
            setStages((prev) => prev.filter((s) => s.id !== payload.old.id));
          }
        }
      )
      .subscribe((status) => {
        console.log('[useRealtimePipelineStages] Subscription status:', status);
      });

    return () => {
      console.log('[useRealtimePipelineStages] Cleaning up subscription');
      mounted = false;
      supabase.removeChannel(channel);
    };
  }, [projectId]);

  return { stages, loading, setStages };
}
