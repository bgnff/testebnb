import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabaseClient';
import { notificationsApi } from '@/lib/api/notifications';

export function useRealtimeNotifications() {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;

    const loadNotifications = async () => {
      try {
        console.log('[useRealtimeNotifications] Loading notifications');
        const data = await notificationsApi.list();
        console.log('[useRealtimeNotifications] Loaded notifications:', data?.length);
        if (mounted) setNotifications(data || []);
      } catch (error) {
        console.error('[useRealtimeNotifications] Error loading notifications:', error);
      } finally {
        if (mounted) setLoading(false);
      }
    };

    loadNotifications();

    console.log('[useRealtimeNotifications] Setting up realtime subscription');
    const channel = supabase
      .channel('notifications-changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'notifications',
        },
        (payload) => {
          console.log('[useRealtimeNotifications] Received payload:', payload);
          if (!mounted) return;

          if (payload.eventType === 'INSERT') {
            console.log('[useRealtimeNotifications] INSERT notification:', payload.new);
            setNotifications((prev) => [payload.new, ...prev]);
          } else if (payload.eventType === 'UPDATE') {
            console.log('[useRealtimeNotifications] UPDATE notification:', payload.new);
            setNotifications((prev) =>
              prev.map((n) => (n.id === payload.new.id ? payload.new : n))
            );
          } else if (payload.eventType === 'DELETE') {
            console.log('[useRealtimeNotifications] DELETE notification:', payload.old.id);
            setNotifications((prev) => prev.filter((n) => n.id !== payload.old.id));
          }
        }
      )
      .subscribe((status) => {
        console.log('[useRealtimeNotifications] Subscription status:', status);
      });

    return () => {
      console.log('[useRealtimeNotifications] Cleaning up subscription');
      mounted = false;
      supabase.removeChannel(channel);
    };
  }, []);

  return { notifications, loading, setNotifications };
}
