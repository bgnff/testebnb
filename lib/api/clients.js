import { supabase } from '@/lib/supabaseClient';

export const clientsApi = {
  async list() {
    const { data, error } = await supabase
      .from('clients')
      .select('*')
      .order('created_at', { ascending: false });
    
    if (error) throw error;
    return data;
  },

  async get(id) {
    const { data, error } = await supabase
      .from('clients')
      .select('*')
      .eq('id', id)
      .single();
    
    if (error) throw error;
    return data;
  },

  async create(data) {
    const { data: created, error } = await supabase
      .from('clients')
      .insert({
        name: data.name,
        email: data.email,
        phone: data.phone,
        company: data.company,
        whatsapp: data.whatsapp,
        status: data.status || 'pendente',
        plan: data.plan || 'personalizado',
        notes: data.notes,
        project_id: data.project_id,
        monthly_value: data.monthly_value,
        next_payment_date: data.next_payment_date,
      })
      .select()
      .single();
    
    if (error) throw error;
    return created;
  },

  async update(id, data) {
    const { data: updated, error } = await supabase
      .from('clients')
      .update({
        name: data.name,
        email: data.email,
        phone: data.phone,
        company: data.company,
        whatsapp: data.whatsapp,
        status: data.status,
        plan: data.plan,
        notes: data.notes,
        monthly_value: data.monthly_value,
        next_payment_date: data.next_payment_date,
      })
      .eq('id', id)
      .select()
      .single();
    
    if (error) throw error;
    return updated;
  },

  async delete(id) {
    const { error } = await supabase
      .from('clients')
      .delete()
      .eq('id', id);
    
    if (error) throw error;
  },
};
