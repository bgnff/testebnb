import { supabase } from '@/lib/supabaseClient';

export const pipelineCardsApi = {
  async list(projectId) {
    const { data, error } = await supabase
      .from('pipeline_cards')
      .select('*')
      .eq('project_id', projectId)
      .order('position', { ascending: true });
    if (error) throw error;
    return data;
  },

  async get(id) {
    const { data, error } = await supabase
      .from('pipeline_cards')
      .select('*')
      .eq('id', id)
      .single();
    if (error) throw error;
    return data;
  },

  async create(data) {
    const { data: result, error } = await supabase
      .from('pipeline_cards')
      .insert(data)
      .select()
      .single();
    if (error) throw error;
    return result;
  },

  async update(id, data) {
    const { data: result, error } = await supabase
      .from('pipeline_cards')
      .update(data)
      .eq('id', id)
      .select()
      .single();
    if (error) throw error;
    return result;
  },

  async delete(id) {
    const { error } = await supabase
      .from('pipeline_cards')
      .delete()
      .eq('id', id);
    if (error) throw error;
  },
};
