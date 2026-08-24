import { useEffect, useState, useRef } from 'react';
import { supabase } from '@/lib/supabaseClient';
import { clientsApi } from '@/lib/api/clients';

// Global channel to prevent conflicts across components
let globalClientsChannel = null;
let globalClientsSubscribers = new Set();

export function useRealtimeClients() {
  const [clients, setClients] = useState([]);
  const [loading, setLoading] = useState(true);
  const subscriberId = useRef(Math.random());

  useEffect(() => {
    let mounted = true;

    const loadClients = async () => {
      try {
        const data = await clientsApi.list();
        if (mounted) setClients(data || []);
      } catch (error) {
        console.error('Error loading clients:', error);
      } finally {
        if (mounted) setLoading(false);
      }
    };

    loadClients();

    // Add this component as a subscriber
    globalClientsSubscribers.add(subscriberId.current);

    // Create global channel if it doesn't exist
    if (!globalClientsChannel) {
      console.log('[useRealtimeClients] Creating global clients channel');
      globalClientsChannel = supabase
        .channel('global-clients-channel')
        .on(
          'postgres_changes',
          {
            event: '*',
            schema: 'public',
            table: 'clients',
          },
          (payload) => {
            console.log('[useRealtimeClients] Global payload received:', payload);
            if (payload.eventType === 'INSERT') {
              setClients((prev) => [payload.new, ...prev]);
            } else if (payload.eventType === 'UPDATE') {
              setClients((prev) =>
                prev.map((c) => (c.id === payload.new.id ? payload.new : c))
              );
            } else if (payload.eventType === 'DELETE') {
              setClients((prev) => prev.filter((c) => c.id !== payload.old.id));
            }
          }
        )
        .subscribe();
    }

    return () => {
      mounted = false;
      globalClientsSubscribers.delete(subscriberId.current);
      
      // Remove global channel if no more subscribers
      if (globalClientsSubscribers.size === 0 && globalClientsChannel) {
        console.log('[useRealtimeClients] Removing global channel (no subscribers)');
        supabase.removeChannel(globalClientsChannel);
        globalClientsChannel = null;
      }
    };
  }, []);

  return { clients, loading, setClients };
}
