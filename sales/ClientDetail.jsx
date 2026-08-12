import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/ui/dialog';
import { Button } from '@/ui/button';
import { Textarea } from '@/ui/textarea';
import { clientsApi } from '@/lib/api/clients';
import { Mail, MessageCircle, CalendarClock, Building2, Phone, Pencil, Trash2, Save, X } from 'lucide-react';
import { format, parseISO, isAfter } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { STATUS, PLAN_LABELS } from '@/sales/SalesView';
import SendMessageDialog from '@/sales/SendMessageDialog';

function Field({ icon: Icon, label, value }) {
  return (
    <div className="flex items-start gap-2.5 py-1.5">
      <Icon className="w-4 h-4 text-muted-foreground mt-0.5 flex-shrink-0" />
      <div className="flex-1 min-w-0">
        <p className="text-xs text-muted-foreground">{label}</p>
        <p className="text-sm truncate">{value || '—'}</p>
      </div>
    </div>
  );
}

export default function ClientDetail({ client, onClose, onUpdate, onDelete, onEdit }) {
  const [editingMeeting, setEditingMeeting] = useState(false);
  const [meeting, setMeeting] = useState({
    meeting_date: client.meeting_date || '',
    meeting_time: client.meeting_time || '',
    meeting_topic: client.meeting_topic || '',
    meeting_status: client.meeting_status || 'scheduled',
  });
  const [sendOpen, setSendOpen] = useState(null);
  const [saving, setSaving] = useState(false);

  const st = STATUS[client.status] || STATUS.lead;
  const upcoming = client.meeting_date && isAfter(parseISO(client.meeting_date), new Date(new Date().setHours(0, 0, 0, 0)));

  const saveMeeting = async () => {
    setSaving(true);
    try {
      const updated = await clientsApi.update(client.id, meeting);
      onUpdate(updated);
      setEditingMeeting(false);
    } finally {
      setSaving(false);
    }
  };

  return (
    <Dialog open onOpenChange={onClose}>
      <DialogContent className="sm:max-w-lg max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <div className="flex items-start justify-between gap-2">
            <div className="flex items-start gap-3 min-w-0">
              <span className="w-12 h-12 rounded-2xl bg-primary/10 text-primary flex items-center justify-center font-semibold text-lg flex-shrink-0">
                {client.name?.charAt(0).toUpperCase()}
              </span>
              <div className="min-w-0">
                <DialogTitle className="truncate">{client.name}</DialogTitle>
                <div className="flex items-center gap-2 mt-1">
                  <span className={`text-[10px] px-2 py-0.5 rounded-full font-medium ${st.chip}`}>{st.label}</span>
                  <span className="text-xs text-muted-foreground">{PLAN_LABELS[client.plan] || client.plan}</span>
                </div>
              </div>
            </div>
          </div>
        </DialogHeader>

        <div className="space-y-4">
          <div className="bg-muted/40 rounded-xl p-3 divide-y divide-border/60">
            <Field icon={Building2} label="Empresa" value={client.company} />
            <Field icon={Mail} label="E-mail" value={client.email} />
            <Field icon={Phone} label="Telefone" value={client.phone} />
            <Field icon={MessageCircle} label="WhatsApp" value={client.whatsapp} />
          </div>

          {/* Quick actions */}
          <div className="grid grid-cols-2 gap-2">
            <Button variant="outline" size="sm" disabled={!client.email} onClick={() => setSendOpen('email')}>
              <Mail className="w-4 h-4 mr-1.5" /> Enviar e-mail
            </Button>
            <Button size="sm" className="bg-[#25D366] hover:bg-[#1ebe57] text-white" disabled={!client.whatsapp} onClick={() => setSendOpen('whatsapp')}>
              <MessageCircle className="w-4 h-4 mr-1.5" /> WhatsApp
            </Button>
          </div>

          {/* Meeting section */}
          <div className="rounded-xl border border-border p-3">
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-sm font-semibold flex items-center gap-1.5"><CalendarClock className="w-4 h-4 text-primary" /> Reunião</h3>
              <div className="flex items-center gap-1">
                {!editingMeeting ? (
                  <Button variant="ghost" size="sm" onClick={() => setEditingMeeting(true)}><Pencil className="w-3.5 h-3.5 mr-1" /> Editar</Button>
                ) : (
                  <Button variant="ghost" size="sm" onClick={() => setEditingMeeting(false)}><X className="w-3.5 h-3.5" /></Button>
                )}
              </div>
            </div>

            {!editingMeeting ? (
              client.meeting_date ? (
                <div className="space-y-1.5">
                  <div className="flex items-center gap-2">
                    <p className="text-sm font-medium">{format(parseISO(client.meeting_date), "dd 'de' MMMM 'de' yyyy", { locale: ptBR })}</p>
                    {upcoming && client.meeting_status === 'scheduled' && <span className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse" />}
                  </div>
                  {client.meeting_time && <p className="text-sm text-muted-foreground">🕐 {client.meeting_time}</p>}
                  {client.meeting_topic && <p className="text-sm text-muted-foreground">📋 {client.meeting_topic}</p>}
                  <div className="pt-1">
                    <span className={`text-[10px] px-2 py-0.5 rounded-full font-medium ${client.meeting_status === 'done' ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-500/15 dark:text-emerald-400' : client.meeting_status === 'cancelled' ? 'bg-rose-100 text-rose-700 dark:bg-rose-500/15 dark:text-rose-400' : 'bg-primary/10 text-primary'}`}>
                      {client.meeting_status === 'done' ? 'Realizada' : client.meeting_status === 'cancelled' ? 'Cancelada' : 'Agendada'}
                    </span>
                  </div>
                </div>
              ) : (
                <p className="text-sm text-muted-foreground/70 py-1">Nenhuma reunião marcada. Clique em editar para agendar.</p>
              )
            ) : (
              <div className="space-y-2.5">
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="text-xs text-muted-foreground">Data</label>
                    <input type="date" value={meeting.meeting_date} onChange={(e) => setMeeting({ ...meeting, meeting_date: e.target.value })} className="w-full px-2.5 py-1.5 rounded-lg bg-background border border-border text-sm outline-none focus:ring-2 focus:ring-ring" />
                  </div>
                  <div>
                    <label className="text-xs text-muted-foreground">Hora</label>
                    <input type="time" value={meeting.meeting_time} onChange={(e) => setMeeting({ ...meeting, meeting_time: e.target.value })} className="w-full px-2.5 py-1.5 rounded-lg bg-background border border-border text-sm outline-none focus:ring-2 focus:ring-ring" />
                  </div>
                </div>
                <div>
                  <label className="text-xs text-muted-foreground">Pauta</label>
                  <input value={meeting.meeting_topic} onChange={(e) => setMeeting({ ...meeting, meeting_topic: e.target.value })} placeholder="Assunto da reunião" className="w-full px-2.5 py-1.5 rounded-lg bg-background border border-border text-sm outline-none focus:ring-2 focus:ring-ring" />
                </div>
                <div className="flex items-center gap-1.5">
                  {['scheduled', 'done', 'cancelled'].map((s) => (
                    <button key={s} onClick={() => setMeeting({ ...meeting, meeting_status: s })} className={`px-2.5 py-1 rounded-lg text-xs font-medium transition-colors ${meeting.meeting_status === s ? 'bg-primary text-primary-foreground' : 'bg-muted text-muted-foreground hover:bg-muted/70'}`}>
                      {s === 'scheduled' ? 'Agendada' : s === 'done' ? 'Realizada' : 'Cancelada'}
                    </button>
                  ))}
                </div>
                <Button size="sm" className="w-full" onClick={saveMeeting} disabled={saving}>
                  <Save className="w-3.5 h-3.5 mr-1.5" /> Salvar reunião
                </Button>
              </div>
            )}
          </div>

          {client.notes && (
            <div>
              <p className="text-sm font-semibold mb-1.5">Observações</p>
              <Textarea value={client.notes} readOnly rows={3} className="bg-muted/40 resize-none" />
            </div>
          )}

          <div className="flex items-center gap-2 pt-2 border-t border-border">
            {onEdit && <Button variant="outline" size="sm" className="flex-1" onClick={() => onEdit(client)}><Pencil className="w-4 h-4 mr-1.5" /> Editar cliente</Button>}
            <Button variant="outline" size="sm" className={`${onEdit ? '' : 'flex-1'} text-destructive hover:text-destructive`} onClick={() => onDelete(client.id)}><Trash2 className="w-4 h-4 mr-1.5" /> Remover</Button>
          </div>
        </div>
      </DialogContent>

      {sendOpen && (
        <SendMessageDialog
          client={client}
          mode={sendOpen}
          onClose={() => setSendOpen(null)}
        />
      )}
    </Dialog>
  );
}