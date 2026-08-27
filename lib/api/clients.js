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
        monthly_value: data.monthly_value,
        next_payment_date: data.next_payment_date,
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
    if (data.email !== undefined) updateData.email = data.email;
    if (data.phone !== undefined) updateData.phone = data.phone;
    if (data.company !== undefined) updateData.company = data.company;
    if (data.whatsapp !== undefined) updateData.whatsapp = data.whatsapp;
    if (data.status !== undefined) updateData.status = data.status;
    if (data.plan !== undefined) updateData.plan = data.plan;
    if (data.notes !== undefined) updateData.notes = data.notes;
    if (data.monthly_value !== undefined) updateData.monthly_value = data.monthly_value;
    if (data.next_payment_date !== undefined) updateData.next_payment_date = data.next_payment_date;

    const { data: updated, error } = await supabase
      .from('clients')
      .update(updateData)
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
