import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabaseClient';
import { tasksApi } from '@/lib/api/tasks';

export function useRealtimeTasks(projectId) {
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!projectId) {
      setLoading(false);
      return;
    }

    let mounted = true;

    const loadTasks = async () => {
      try {
        const data = await tasksApi.getByProject(projectId);
        if (mounted) setTasks(data || []);
      } catch (error) {
        console.error('Error loading tasks:', error);
      } finally {
        if (mounted) setLoading(false);
      }
    };

    loadTasks();

    // Subscribe to realtime changes
    const channel = supabase
      .channel('tasks-changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'tasks',
          filter: `project_id=eq.${projectId}`,
        },
        (payload) => {
          if (!mounted) return;

          if (payload.eventType === 'INSERT') {
            setTasks((prev) => [...prev, payload.new]);
          } else if (payload.eventType === 'UPDATE') {
            setTasks((prev) =>
              prev.map((t) => (t.id === payload.new.id ? payload.new : t))
            );
          } else if (payload.eventType === 'DELETE') {
            setTasks((prev) => prev.filter((t) => t.id !== payload.old.id));
          }
        }
      )
      .subscribe();

    return () => {
      mounted = false;
      supabase.removeChannel(channel);
    };
  }, [projectId]);

  return { tasks, loading, setTasks };
}
