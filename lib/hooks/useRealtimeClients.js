import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabaseClient';
import { clientsApi } from '@/lib/api/clients';

export function useRealtimeClients() {
  const [clients, setClients] = useState([]);
  const [loading, setLoading] = useState(true);

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

    // Subscribe to realtime changes
    const channel = supabase
      .channel('clients-changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'clients',
        },
        (payload) => {
          if (!mounted) return;

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

    return () => {
      mounted = false;
      supabase.removeChannel(channel);
    };
  }, []);

  return { clients, loading, setClients };
}
