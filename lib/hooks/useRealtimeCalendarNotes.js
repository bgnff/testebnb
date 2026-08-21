import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabaseClient';
import { calendarNotesApi } from '@/lib/api/calendar-notes';

export function useRealtimeCalendarNotes(projectId) {
  const [notes, setNotes] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!projectId) {
      setLoading(false);
      return;
    }

    let mounted = true;

    const loadNotes = async () => {
      try {
        const data = await calendarNotesApi.list(projectId);
        if (mounted) setNotes(data || []);
      } catch (error) {
        console.error('Error loading calendar notes:', error);
      } finally {
        if (mounted) setLoading(false);
      }
    };

    loadNotes();

    // Subscribe to realtime changes
    const channel = supabase
      .channel('calendar-notes-changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'calendar_notes',
          filter: `project_id=eq.${projectId}`,
        },
        (payload) => {
          if (!mounted) return;

          if (payload.eventType === 'INSERT') {
            setNotes((prev) => [...prev, payload.new]);
          } else if (payload.eventType === 'UPDATE') {
            setNotes((prev) =>
              prev.map((n) => (n.id === payload.new.id ? payload.new : n))
            );
          } else if (payload.eventType === 'DELETE') {
            setNotes((prev) => prev.filter((n) => n.id !== payload.old.id));
          }
        }
      )
      .subscribe();

    return () => {
      mounted = false;
      supabase.removeChannel(channel);
    };
  }, [projectId]);

  return { notes, loading, setNotes };
}
