import { supabase } from '@/lib/supabaseClient';

export const projectsApi = {
  async list() {
    const { data, error } = await supabase
      .from('projects')
      .select('*')
      .order('created_at', { ascending: false });
    
    if (error) throw error;
    return data;
  },

  async get(id) {
    const { data, error } = await supabase
      .from('projects')
      .select('*')
      .eq('id', id)
      .single();
    
    if (error) throw error;
    return data;
  },

  async create(data) {
    const { data: created, error } = await supabase
      .from('projects')
      .insert({
        name: data.name,
        description: data.description,
        color: data.color || '#7c3aed',
        icon: data.icon || 'LayoutDashboard',
        logo: data.logo,
      })
      .select()
      .single();
    
    if (error) throw error;
    return created;
  },

  async update(id, data) {
    const { data: updated, error } = await supabase
      .from('projects')
      .update({
        name: data.name,
        description: data.description,
        color: data.color,
        icon: data.icon,
        logo: data.logo,
      })
      .eq('id', id)
      .select()
      .single();
    
    if (error) throw error;
    return updated;
  },

  async delete(id) {
    const { error } = await supabase
      .from('projects')
      .delete()
      .eq('id', id);
    
    if (error) throw error;
  },
};
