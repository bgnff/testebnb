import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabaseClient';
import { tasksApi } from '@/lib/api/tasks';

export function useRealtimeTasks(projectId) {
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!projectId) {
      console.log('[useRealtimeTasks] No projectId provided');
      setLoading(false);
      setTasks([]);
      return;
    }

    let mounted = true;

    const loadTasks = async () => {
      try {
        console.log('[useRealtimeTasks] Loading tasks for project:', projectId);
        const data = await tasksApi.getByProject(projectId);
        console.log('[useRealtimeTasks] Loaded tasks:', data?.length);
        if (mounted) setTasks(data || []);
      } catch (error) {
        console.error('[useRealtimeTasks] Error loading tasks:', error);
      } finally {
        if (mounted) setLoading(false);
      }
    };

    loadTasks();

    // Subscribe to realtime changes
    console.log('[useRealtimeTasks] Setting up realtime subscription for project:', projectId);
    const channel = supabase
      .channel(`tasks-${projectId}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'tasks',
          filter: `project_id=eq.${projectId}`,
        },
        (payload) => {
          console.log('[useRealtimeTasks] Received payload:', payload);
          if (!mounted) return;

          if (payload.eventType === 'INSERT') {
            console.log('[useRealtimeTasks] INSERT task:', payload.new);
            setTasks((prev) => [...prev, payload.new]);
          } else if (payload.eventType === 'UPDATE') {
            console.log('[useRealtimeTasks] UPDATE task:', payload.new);
            setTasks((prev) =>
              prev.map((t) => (t.id === payload.new.id ? payload.new : t))
            );
          } else if (payload.eventType === 'DELETE') {
            console.log('[useRealtimeTasks] DELETE task:', payload.old.id);
            setTasks((prev) => prev.filter((t) => t.id !== payload.old.id));
          }
        }
      )
      .subscribe((status) => {
        console.log('[useRealtimeTasks] Subscription status:', status);
      });

    return () => {
      console.log('[useRealtimeTasks] Cleaning up subscription');
      mounted = false;
      supabase.removeChannel(channel);
    };
  }, [projectId]);

  return { tasks, loading, setTasks };
}
