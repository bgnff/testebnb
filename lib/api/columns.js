import { supabase } from '@/lib/supabaseClient';

export const columnsApi = {
  async list(boardId) {
    const query = supabase
      .from('columns')
      .select('*');
    
    if (boardId) {
      query.eq('board_id', boardId);
    }
    
    query.order('position', { ascending: true });
    
    const { data, error } = await query;
    
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
    const { data: updated, error } = await supabase
      .from('columns')
      .update({
        name: data.name,
        position: data.position,
        wip_limit: data.wip_limit,
        wip_enabled: data.wip_enabled,
      })
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
