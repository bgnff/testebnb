import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabaseClient';
import { projectsApi } from '@/lib/api/projects';

export function useRealtimeProjects() {
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;

    const loadProjects = async () => {
      try {
        const data = await projectsApi.list();
        if (mounted) setProjects(data || []);
      } catch (error) {
        console.error('Error loading projects:', error);
      } finally {
        if (mounted) setLoading(false);
      }
    };

    loadProjects();

    // Subscribe to realtime changes
    const channel = supabase
      .channel('projects-changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'projects',
        },
        (payload) => {
          if (!mounted) return;

          if (payload.eventType === 'INSERT') {
            setProjects((prev) => [payload.new, ...prev]);
          } else if (payload.eventType === 'UPDATE') {
            setProjects((prev) =>
              prev.map((p) => (p.id === payload.new.id ? payload.new : p))
            );
          } else if (payload.eventType === 'DELETE') {
            setProjects((prev) => prev.filter((p) => p.id !== payload.old.id));
          }
        }
      )
      .subscribe();

    return () => {
      mounted = false;
      supabase.removeChannel(channel);
    };
  }, []);

  return { projects, loading, setProjects };
}
