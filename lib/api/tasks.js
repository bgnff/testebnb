import { supabase } from '@/lib/supabaseClient';

export const tasksApi = {
  async list(columnId) {
    const { data, error } = await supabase
      .from('tasks')
      .select('*')
      .eq('column_id', columnId)
      .order('position', { ascending: true });
    
    if (error) throw error;
    return data;
  },

  async getByBoard(boardId) {
    const { data, error } = await supabase
      .from('tasks')
      .select('*')
      .eq('board_id', boardId)
      .order('position', { ascending: true });
    
    if (error) throw error;
    return data;
  },

  async getByProject(projectId) {
    const { data, error } = await supabase
      .from('tasks')
      .select('*')
      .eq('project_id', projectId)
      .order('position', { ascending: true });
    
    if (error) throw error;
    return data;
  },

  async get(id) {
    const { data, error } = await supabase
      .from('tasks')
      .select('*')
      .eq('id', id)
      .single();
    
    if (error) throw error;
    return data;
  },

  async create(data) {
    const { data: created, error } = await supabase
      .from('tasks')
      .insert({
        title: data.title,
        description: data.description,
        column_id: data.column_id,
        board_id: data.board_id,
        project_id: data.project_id,
        due_date: data.due_date,
        priority: data.priority || 'medium',
        labels: data.labels || [],
        assignee: data.assignee,
        subtasks: data.subtasks || [],
        comments: data.comments || [],
        attachments: data.attachments || [],
        position: data.position || 0,
        completed: data.completed || false,
      })
      .select()
      .single();
    
    if (error) throw error;
    return created;
  },

  async update(id, data) {
    const { data: updated, error } = await supabase
      .from('tasks')
      .update({
        title: data.title,
        description: data.description,
        column_id: data.column_id,
        due_date: data.due_date,
        priority: data.priority,
        labels: data.labels,
        assignee: data.assignee,
        subtasks: data.subtasks,
        comments: data.comments,
        attachments: data.attachments,
        position: data.position,
        completed: data.completed,
      })
      .eq('id', id)
      .select()
      .single();
    
    if (error) throw error;
    return updated;
  },

  async delete(id) {
    const { error } = await supabase
      .from('tasks')
      .delete()
      .eq('id', id);
    
    if (error) throw error;
  },
};
