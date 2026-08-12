import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/ui/dialog';
import { Input } from '@/ui/input';
import { Textarea } from '@/ui/textarea';
import { Button } from '@/ui/button';
import { Label } from '@/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/ui/select';
import { Loader2 } from 'lucide-react';

const EMPTY = {
  name: '', company: '', email: '', phone: '', whatsapp: '',
  plan: 'free', status: 'lead', notes: '',
  meeting_date: '', meeting_time: '', meeting_topic: '', meeting_status: 'scheduled',
};

export default function ClientForm({ open, client, onClose, onSave }) {
  const [form, setForm] = useState(EMPTY);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    setForm(client ? { ...EMPTY, ...client } : EMPTY);
  }, [client, open]);

  const set = (k, v) => setForm((p) => ({ ...p, [k]: v }));

  const submit = async () => {
    if (!form.name.trim()) return;
    setSaving(true);
    try {
      const payload = { ...form, name: form.name.trim() };
      await onSave(payload);
    } finally {
      setSaving(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-lg max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{client ? 'Editar cliente' : 'Novo cliente'}</DialogTitle>
        </DialogHeader>
        <div className="space-y-4 py-2">
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5 col-span-2 sm:col-span-1">
              <Label>Nome *</Label>
              <Input value={form.name} onChange={(e) => set('name', e.target.value)} placeholder="Nome do cliente" autoFocus />
            </div>
            <div className="space-y-1.5 col-span-2 sm:col-span-1">
              <Label>Empresa</Label>
              <Input value={form.company} onChange={(e) => set('company', e.target.value)} placeholder="Empresa" />
            </div>
            <div className="space-y-1.5">
              <Label>E-mail</Label>
              <Input type="email" value={form.email} onChange={(e) => set('email', e.target.value)} placeholder="cliente@email.com" />
            </div>
            <div className="space-y-1.5">
              <Label>Telefone</Label>
              <Input value={form.phone} onChange={(e) => set('phone', e.target.value)} placeholder="(11) 99999-9999" />
            </div>
            <div className="space-y-1.5">
              <Label>WhatsApp</Label>
              <Input value={form.whatsapp} onChange={(e) => set('whatsapp', e.target.value)} placeholder="5511999999999" />
            </div>
            <div className="space-y-1.5">
              <Label>Plano</Label>
              <Select value={form.plan} onValueChange={(v) => set('plan', v)}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="free">Free</SelectItem>
                  <SelectItem value="starter">Starter</SelectItem>
                  <SelectItem value="pro">Pro</SelectItem>
                  <SelectItem value="enterprise">Enterprise</SelectItem>
                  <SelectItem value="outro">Outro</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5">
              <Label>Status</Label>
              <Select value={form.status} onValueChange={(v) => set('status', v)}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="lead">Lead</SelectItem>
                  <SelectItem value="active">Ativo</SelectItem>
                  <SelectItem value="churned">Churn</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="pt-2 border-t border-border">
            <p className="text-sm font-semibold mb-3 flex items-center gap-1.5">📅 Reunião</p>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label>Data</Label>
                <Input type="date" value={form.meeting_date || ''} onChange={(e) => set('meeting_date', e.target.value)} />
              </div>
              <div className="space-y-1.5">
                <Label>Hora</Label>
                <Input type="time" value={form.meeting_time || ''} onChange={(e) => set('meeting_time', e.target.value)} />
              </div>
              <div className="space-y-1.5 col-span-2">
                <Label>Pauta da reunião</Label>
                <Input value={form.meeting_topic || ''} onChange={(e) => set('meeting_topic', e.target.value)} placeholder="Assunto da reunião" />
              </div>
              <div className="space-y-1.5 col-span-2">
                <Label>Status da reunião</Label>
                <Select value={form.meeting_status} onValueChange={(v) => set('meeting_status', v)}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="scheduled">Agendada</SelectItem>
                    <SelectItem value="done">Realizada</SelectItem>
                    <SelectItem value="cancelled">Cancelada</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>

          <div className="space-y-1.5">
            <Label>Observações</Label>
            <Textarea value={form.notes || ''} onChange={(e) => set('notes', e.target.value)} rows={3} placeholder="Notas sobre o cliente, histórico, contexto..." />
          </div>
        </div>
        <DialogFooter>
          <Button variant="ghost" onClick={onClose}>Cancelar</Button>
          <Button onClick={submit} disabled={!form.name.trim() || saving}>
            {saving ? <Loader2 className="w-4 h-4 mr-1.5 animate-spin" /> : null}
            {client ? 'Salvar alterações' : 'Criar cliente'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}