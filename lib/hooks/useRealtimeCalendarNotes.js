import { useEffect, useState, useRef } from 'react';
import { supabase } from '@/lib/supabaseClient';
import { calendarNotesApi } from '@/lib/api/calendar-notes';

// Global channel to prevent conflicts across components
let globalCalendarNotesChannel = null;
let globalCalendarNotesSubscribers = new Set();

export function useRealtimeCalendarNotes(projectId) {
  const [notes, setNotes] = useState([]);
  const [loading, setLoading] = useState(true);
  const subscriberId = useRef(Math.random());
  const currentProjectId = useRef(projectId);

  useEffect(() => {
    if (!projectId) {
      console.log('[useRealtimeCalendarNotes] No projectId provided');
      setLoading(false);
      setNotes([]);
      return;
    }

    let mounted = true;
    currentProjectId.current = projectId;

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

    // Add this component as a subscriber
    globalCalendarNotesSubscribers.add(subscriberId.current);

    // Create global channel if it doesn't exist
    if (!globalCalendarNotesChannel) {
      console.log('[useRealtimeCalendarNotes] Creating global calendar notes channel');
      globalCalendarNotesChannel = supabase
        .channel('global-calendar-notes-channel')
        .on(
          'postgres_changes',
          {
            event: '*',
            schema: 'public',
            table: 'calendar_notes',
          },
          (payload) => {
            console.log('[useRealtimeCalendarNotes] Global payload received:', payload);
            // Only process if payload matches current project
            if (payload.new.project_id === currentProjectId.current || payload.old?.project_id === currentProjectId.current) {
              console.log('[useRealtimeCalendarNotes] Processing payload for project:', currentProjectId.current);
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
          }
        )
        .subscribe((status) => {
          console.log('[useRealtimeCalendarNotes] Global subscription status:', status);
        });
    }

    return () => {
      console.log('[useRealtimeCalendarNotes] Cleaning up subscription');
      mounted = false;
      globalCalendarNotesSubscribers.delete(subscriberId.current);
      
      // Remove global channel if no more subscribers
      if (globalCalendarNotesSubscribers.size === 0 && globalCalendarNotesChannel) {
        console.log('[useRealtimeCalendarNotes] Removing global channel (no subscribers)');
        supabase.removeChannel(globalCalendarNotesChannel);
        globalCalendarNotesChannel = null;
      }
    };
  }, [projectId]);

  return { notes, loading, setNotes };
}
