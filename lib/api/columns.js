import { supabase } from '@/lib/supabaseClient';

export const columnsApi = {
  async list() {
    const { data, error } = await supabase
      .from('columns')
      .select('*')
      .order('position', { ascending: true });
    
    if (error) throw error;
    return data;
  },

  async get(id) {
    const { data, error } = await supabase
      .from('columns')
      .select('*')
      .eq('id', id)
      .single();
    
    if (error) throw error;
    return data;
  },

  async create(data) {
    const { data: created, error } = await supabase
      .from('columns')
      .insert({
        name: data.name,
        board_id: data.board_id,
        position: data.position || 0,
        wip_limit: data.wip_limit,
        wip_enabled: data.wip_enabled || false,
      })
      .select()
      .single();
    
    if (error) throw error;
    return created;
  },

  async update(id, data) {
    // Build update object with only provided fields (diff-based update)
    const updateData = {};
    if (data.name !== undefined) updateData.name = data.name;
    if (data.position !== undefined) updateData.position = data.position;
    if (data.wip_limit !== undefined) updateData.wip_limit = data.wip_limit;
    if (data.wip_enabled !== undefined) updateData.wip_enabled = data.wip_enabled;

    const { data: updated, error } = await supabase
      .from('columns')
      .update(updateData)
      .eq('id', id)
      .select()
      .single();
    
    if (error) throw error;
    return updated;
  },

  async delete(id) {
    const { error } = await supabase
      .from('columns')
      .delete()
      .eq('id', id);
    
    if (error) throw error;
  },
};
