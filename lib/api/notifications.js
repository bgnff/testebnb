import { supabase } from '@/lib/supabaseClient';

export const notificationsApi = {
  async list() {
    const { data, error } = await supabase
      .from('notifications')
      .select('*')
      .order('created_at', { ascending: false });
    if (error) throw error;
    return data;
  },

  async get(id) {
    const { data, error } = await supabase
      .from('notifications')
      .select('*')
      .eq('id', id)
      .single();
    if (error) throw error;
    return data;
  },

  async create(data) {
    const { data: result, error } = await supabase
      .from('notifications')
      .insert(data)
      .select()
      .single();
    if (error) throw error;
    return result;
  },

  async update(id, data) {
    const { data: result, error } = await supabase
      .from('notifications')
      .update(data)
      .eq('id', id)
      .select()
      .single();
    if (error) throw error;
    return result;
  },

  async delete(id) {
    const { error } = await supabase
      .from('notifications')
      .delete()
      .eq('id', id);
    if (error) throw error;
  },

  async markAsRead(id) {
    return this.update(id, { read: true });
  },

  async markAllAsRead() {
    const { error } = await supabase
      .from('notifications')
      .update({ read: true })
      .eq('read', false);
    if (error) throw error;
  },
};
