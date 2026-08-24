import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabaseClient';
import { calendarNotesApi } from '@/lib/api/calendar-notes';

export function useRealtimeCalendarNotes(projectId) {
  const [notes, setNotes] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!projectId) {
      console.log('[useRealtimeCalendarNotes] No projectId provided');
      setLoading(false);
      setNotes([]);
      return;
    }

    let mounted = true;
    const channelName = `calendar-notes-${projectId}`;

    // Remove existing channel if any
    const existingChannel = supabase.getChannels().find(c => c.topic === channelName);
    if (existingChannel) {
      supabase.removeChannel(existingChannel);
    }

    const loadNotes = async () => {
      try {
        console.log('[useRealtimeCalendarNotes] Loading notes for project:', projectId);
        const data = await calendarNotesApi.list(projectId);
        console.log('[useRealtimeCalendarNotes] Loaded notes:', data?.length);
        if (mounted) setNotes(data || []);
      } catch (error) {
        console.error('[useRealtimeCalendarNotes] Error loading calendar notes:', error);
      } finally {
        if (mounted) setLoading(false);
      }
    };

    loadNotes();

    // Subscribe to realtime changes
    console.log('[useRealtimeCalendarNotes] Setting up realtime subscription for project:', projectId);
    const channel = supabase
      .channel(channelName)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'calendar_notes',
          filter: `project_id=eq.${projectId}`,
        },
        (payload) => {
          console.log('[useRealtimeCalendarNotes] Received payload:', payload);
          if (!mounted) return;

          if (payload.eventType === 'INSERT') {
            console.log('[useRealtimeCalendarNotes] INSERT note:', payload.new);
            setNotes((prev) => [...prev, payload.new]);
          } else if (payload.eventType === 'UPDATE') {
            console.log('[useRealtimeCalendarNotes] UPDATE note:', payload.new);
            setNotes((prev) =>
              prev.map((n) => (n.id === payload.new.id ? payload.new : n))
            );
          } else if (payload.eventType === 'DELETE') {
            console.log('[useRealtimeCalendarNotes] DELETE note:', payload.old.id);
            setNotes((prev) => prev.filter((n) => n.id !== payload.old.id));
          }
        }
      )
      .subscribe((status) => {
        console.log('[useRealtimeCalendarNotes] Subscription status:', status);
      });

    return () => {
      console.log('[useRealtimeCalendarNotes] Cleaning up subscription');
      mounted = false;
      supabase.removeChannel(channel);
    };
  }, [projectId]);

  return { notes, loading, setNotes };
}
