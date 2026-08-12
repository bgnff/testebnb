import { useState, useEffect, useCallback } from 'react';
import { messageTemplatesApi } from '@/lib/api/message-templates';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/ui/dialog';
import { Button } from '@/ui/button';
import { Input } from '@/ui/input';
import { Textarea } from '@/ui/textarea';
import { Label } from '@/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/ui/select';
import { Loader2, Plus, Pencil, Trash2, MessageSquareText, Check } from 'lucide-react';
import { useToast } from '@/ui/use-toast';

const TYPE_LABELS = {
  cobranca: 'Cobrança',
  upgrade: 'Upgrade de plano',
  reuniao: 'Reunião',
  outro: 'Outro',
};

const TYPE_CHIP = {
  cobranca: 'bg-rose-100 text-rose-700 dark:bg-rose-500/15 dark:text-rose-400',
  upgrade: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-500/15 dark:text-emerald-400',
  reuniao: 'bg-primary/10 text-primary',
  outro: 'bg-muted text-muted-foreground',
};

const EMPTY = { title: '', type: 'cobranca', subject: '', body: '' };

export default function TemplateManager({ open, onClose }) {
  const { toast } = useToast();
  const [templates, setTemplates] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState(EMPTY);
  const [saving, setSaving] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const list = await messageTemplatesApi.list();
      setTemplates(list);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { load(); }, [load]);

  const startNew = () => { setForm(EMPTY); setEditing('new'); };
  const startEdit = (t) => { setForm({ title: t.title, type: t.type, subject: t.subject || '', body: t.body }); setEditing(t.id); };

  const save = async () => {
    if (!form.title.trim() || !form.body.trim()) return;
    setSaving(true);
    try {
      if (editing === 'new') {
        const created = await base44.entities.MessageTemplate.create(form);
        setTemplates((p) => [created, ...p]);
      } else {
        const updated = await base44.entities.MessageTemplate.update(editing, form);
        setTemplates((p) => p.map((t) => (t.id === updated.id ? updated : t)));
      }
      setEditing(null);
      toast({ title: 'Modelo salvo' });
    } finally {
      setSaving(false);
    }
  };

  const remove = async (id) => {
    await messageTemplatesApi.delete(id);
    setTemplates((p) => p.filter((t) => t.id !== id));
    toast({ title: 'Modelo removido' });
  };

  const set = (k, v) => setForm((p) => ({ ...p, [k]: v }));

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-2xl max-h-[90vh] overflow-hidden flex flex-col">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2"><MessageSquareText className="w-4 h-4 text-primary" /> Modelos de mensagem</DialogTitle>
        </DialogHeader>

        {editing ? (
          <div className="flex-1 overflow-y-auto p-1 space-y-4">
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label>Título *</Label>
                <Input value={form.title} onChange={(e) => set('title', e.target.value)} placeholder="Ex.: Cobrança mensal" />
              </div>
              <div className="space-y-1.5">
                <Label>Tipo *</Label>
                <Select value={form.type} onValueChange={(v) => set('type', v)}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {Object.entries(TYPE_LABELS).map(([k, v]) => (
                      <SelectItem key={k} value={k}>{v}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="space-y-1.5">
              <Label>Assunto (e-mail)</Label>
              <Input value={form.subject} onChange={(e) => set('subject', e.target.value)} placeholder="Assunto do e-mail" />
            </div>
            <div className="space-y-1.5">
              <Label>Corpo da mensagem *</Label>
              <Textarea value={form.body} onChange={(e) => set('body', e.target.value)} rows={8} placeholder="Olá {nome}, ..." />
              <p className="text-xs text-muted-foreground/70">Variáveis disponíveis: {`{nome}`}, {`{empresa}`}, {`{plano}`}, {`{email}`}, {`{telefone}`}</p>
            </div>
          </div>
        ) : loading ? (
          <div className="flex items-center justify-center py-10"><Loader2 className="w-5 h-5 animate-spin text-muted-foreground" /></div>
        ) : (
          <div className="flex-1 overflow-y-auto p-1 space-y-2">
            {templates.length === 0 ? (
              <div className="text-center py-10">
                <p className="text-sm text-muted-foreground">Nenhum modelo criado.</p>
                <Button size="sm" className="mt-3" onClick={startNew}><Plus className="w-4 h-4 mr-1.5" /> Novo modelo</Button>
              </div>
            ) : (
              templates.map((t) => (
                <div key={t.id} className="group rounded-xl border border-border p-3 hover:shadow-sm transition-shadow">
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <p className="font-medium text-sm truncate">{t.title}</p>
                        <span className={`text-[10px] px-2 py-0.5 rounded-full font-medium ${TYPE_CHIP[t.type]}`}>{TYPE_LABELS[t.type]}</span>
                      </div>
                      {t.subject && <p className="text-xs text-muted-foreground mt-0.5 truncate">📋 {t.subject}</p>}
                      <p className="text-xs text-muted-foreground/80 mt-1 line-clamp-2 whitespace-pre-wrap">{t.body}</p>
                    </div>
                    <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                      <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => startEdit(t)}><Pencil className="w-3.5 h-3.5" /></Button>
                      <Button variant="ghost" size="icon" className="h-7 w-7 text-destructive" onClick={() => remove(t.id)}><Trash2 className="w-3.5 h-3.5" /></Button>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        )}

        <DialogFooter>
          {editing ? (
            <>
              <Button variant="ghost" onClick={() => setEditing(null)}>Cancelar</Button>
              <Button onClick={save} disabled={!form.title.trim() || !form.body.trim() || saving}>
                {saving ? <Loader2 className="w-4 h-4 mr-1.5 animate-spin" /> : <Check className="w-4 h-4 mr-1.5" />}
                Salvar modelo
              </Button>
            </>
          ) : (
            <>
              <Button variant="ghost" onClick={onClose}>Fechar</Button>
              <Button onClick={startNew}><Plus className="w-4 h-4 mr-1.5" /> Novo modelo</Button>
            </>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}