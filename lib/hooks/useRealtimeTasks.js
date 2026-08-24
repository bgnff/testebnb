import { useEffect, useState, useRef } from 'react';
import { supabase } from '@/lib/supabaseClient';
import { tasksApi } from '@/lib/api/tasks';

// Global channel to prevent conflicts across components
let globalTasksChannel = null;
let globalTasksSubscribers = new Set();

export function useRealtimeTasks(projectId) {
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const subscriberId = useRef(Math.random());

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

    // Add this component as a subscriber
    globalTasksSubscribers.add(subscriberId.current);

    // Create global channel if it doesn't exist
    if (!globalTasksChannel) {
      console.log('[useRealtimeTasks] Creating global tasks channel');
      globalTasksChannel = supabase
        .channel('global-tasks-channel')
        .on(
          'postgres_changes',
          {
            event: '*',
            schema: 'public',
            table: 'tasks',
          },
          (payload) => {
            console.log('[useRealtimeTasks] Global payload received:', payload);
            // Only process if payload matches current project
            if (payload.new.project_id === projectId || payload.old?.project_id === projectId) {
              console.log('[useRealtimeTasks] Processing payload for project:', projectId);
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
          }
        )
        .subscribe((status) => {
          console.log('[useRealtimeTasks] Global subscription status:', status);
        });
    }

    return () => {
      console.log('[useRealtimeTasks] Cleaning up subscription');
      mounted = false;
      globalTasksSubscribers.delete(subscriberId.current);
      
      // Remove global channel if no more subscribers
      if (globalTasksSubscribers.size === 0 && globalTasksChannel) {
        console.log('[useRealtimeTasks] Removing global channel (no subscribers)');
        supabase.removeChannel(globalTasksChannel);
        globalTasksChannel = null;
      }
    };
  }, [projectId]);

  return { tasks, loading, setTasks };
}
