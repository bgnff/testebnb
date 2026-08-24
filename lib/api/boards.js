import { supabase } from '@/lib/supabaseClient';

export const boardsApi = {
  async list() {
    const { data, error } = await supabase
      .from('boards')
      .select('*')
      .order('created_at', { ascending: false });
    
    if (error) throw error;
    return data;
  },

  async get(id) {
    const { data, error } = await supabase
      .from('boards')
      .select('*')
      .eq('id', id)
      .single();
    
    if (error) throw error;
    return data;
  },

  async create(data) {
    const { data: created, error } = await supabase
      .from('boards')
      .insert({
        name: data.name,
      })
      .select()
      .single();
    
    if (error) throw error;
    return created;
  },

  async update(id, data) {
    const { data: updated, error } = await supabase
      .from('boards')
      .update({
        name: data.name,
      })
      .eq('id', id)
      .select()
      .single();
    
    if (error) throw error;
    return updated;
  },

  async delete(id) {
    const { error } = await supabase
      .from('boards')
      .delete()
      .eq('id', id);
    
    if (error) throw error;
  },
};
