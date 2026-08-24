import { supabase } from '@/lib/supabaseClient';

export const calendarNotesApi = {
  async list() {
    const { data, error } = await supabase
      .from('calendar_notes')
      .select('*')
      .order('date', { ascending: true });
    
    if (error) throw error;
    return data;
  },

  async get(id) {
    const { data, error } = await supabase
      .from('calendar_notes')
      .select('*')
      .eq('id', id)
      .single();
    
    if (error) throw error;
    return data;
  },

  async create(data) {
    const { data: created, error } = await supabase
      .from('calendar_notes')
      .insert({
        date: data.date,
        content: data.content,
        color: data.color,
      })
      .select()
      .single();
    
    if (error) throw error;
    return created;
  },

  async update(id, data) {
    const { data: updated, error } = await supabase
      .from('calendar_notes')
      .update({
        date: data.date,
        content: data.content,
        color: data.color,
      })
      .eq('id', id)
      .select()
      .single();
    
    if (error) throw error;
    return updated;
  },

  async delete(id) {
    const { error } = await supabase
      .from('calendar_notes')
      .delete()
      .eq('id', id);
    
    if (error) throw error;
  },
};
