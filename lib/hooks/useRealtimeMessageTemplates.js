import { useEffect, useState, useRef } from 'react';
import { supabase } from '@/lib/supabaseClient';
import { messageTemplatesApi } from '@/lib/api/message-templates';

// Global channel to prevent conflicts across components
let globalMessageTemplatesChannel = null;
let globalMessageTemplatesSubscribers = new Set();

export function useRealtimeMessageTemplates() {
  const [templates, setTemplates] = useState([]);
  const [loading, setLoading] = useState(true);
  const subscriberId = useRef(Math.random());

  useEffect(() => {
    let mounted = true;

    const loadTemplates = async () => {
      try {
        const data = await messageTemplatesApi.list();
        if (mounted) setTemplates(data || []);
      } catch (error) {
        console.error('[useRealtimeMessageTemplates] Error loading templates:', error);
      } finally {
        if (mounted) setLoading(false);
      }
    };

    loadTemplates();

    // Add this component as a subscriber
    globalMessageTemplatesSubscribers.add(subscriberId.current);

    // Create global channel if it doesn't exist
    if (!globalMessageTemplatesChannel) {
      globalMessageTemplatesChannel = supabase
        .channel('global-message-templates-channel')
        .on(
          'postgres_changes',
          {
            event: '*',
            schema: 'public',
            table: 'message_templates',
          },
          (payload) => {
            if (payload.eventType === 'INSERT') {
              setTemplates((prev) => [...prev, payload.new]);
            } else if (payload.eventType === 'UPDATE') {
              setTemplates((prev) =>
                prev.map((t) => (t.id === payload.new.id ? payload.new : t))
              );
            } else if (payload.eventType === 'DELETE') {
              setTemplates((prev) => prev.filter((t) => t.id !== payload.old.id));
            }
          }
        )
        .subscribe((status) => {
          console.log('[useRealtimeMessageTemplates] Global subscription status:', status);
        });
    }

    return () => {
      mounted = false;
      globalMessageTemplatesSubscribers.delete(subscriberId.current);
      
      // Remove global channel if no more subscribers
      if (globalMessageTemplatesSubscribers.size === 0 && globalMessageTemplatesChannel) {
        supabase.removeChannel(globalMessageTemplatesChannel);
        globalMessageTemplatesChannel = null;
      }
    };
  }, []);

  return { templates, loading, setTemplates };
}
