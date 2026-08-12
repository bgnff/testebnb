import { supabase } from '@/lib/supabaseClient';

export const messageTemplatesApi = {
  async list() {
    const { data, error } = await supabase
      .from('message_templates')
      .select('*')
      .order('name', { ascending: true });
    
    if (error) throw error;
    return data;
  },

  async get(id) {
    const { data, error } = await supabase
      .from('message_templates')
      .select('*')
      .eq('id', id)
      .single();
    
    if (error) throw error;
    return data;
  },

  async create(data) {
    const { data: created, error } = await supabase
      .from('message_templates')
      .insert({
        name: data.name,
        subject: data.subject,
        body: data.body,
        project_id: data.project_id,
      })
      .select()
      .single();
    
    if (error) throw error;
    return created;
  },

  async update(id, data) {
    const { data: updated, error } = await supabase
      .from('message_templates')
      .update({
        name: data.name,
        subject: data.subject,
        body: data.body,
      })
      .eq('id', id)
      .select()
      .single();
    
    if (error) throw error;
    return updated;
  },

  async delete(id) {
    const { error } = await supabase
      .from('message_templates')
      .delete()
      .eq('id', id);
    
    if (error) throw error;
  },
};
