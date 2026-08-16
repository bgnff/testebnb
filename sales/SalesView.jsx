import { useState, useCallback } from 'react';
import { useToast } from '@/ui/use-toast';
import { Button } from '@/ui/button';
import { Input } from '@/ui/input';
import { Loader2, Plus, Search, Users, MessageSquareText, Pencil, Trash2, Mail, MessageCircle, CalendarClock, Building2 } from 'lucide-react';
import { format, parseISO, isAfter } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { useRealtimeClients } from '@/lib/hooks/useRealtimeClients';
import ClientForm from '@/sales/ClientForm';
import ClientDetail from '@/sales/ClientDetail';
import TemplateManager from '@/sales/TemplateManager';
import SendMessageDialog from '@/sales/SendMessageDialog';

export const STATUS = {
  manutencao_recorrente: { label: 'Manutenção Recorrente', chip: 'bg-blue-100 text-blue-700 dark:bg-blue-500/15 dark:text-blue-400', dot: 'bg-blue-500' },
  cliente_ativo: { label: 'Cliente Ativo', chip: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-500/15 dark:text-emerald-400', dot: 'bg-emerald-500' },
  pendente: { label: 'Pendente', chip: 'bg-amber-100 text-amber-700 dark:bg-amber-500/15 dark:text-amber-400', dot: 'bg-amber-500' },
  inativo: { label: 'Inativo', chip: 'bg-rose-100 text-rose-700 dark:bg-rose-500/15 dark:text-rose-400', dot: 'bg-rose-500' },
};

export const PLAN_LABELS = {
  personalizado: 'Personalizado',
  essencial: 'Essencial',
  growth: 'Growth',
  dominancia: 'Dominância',
};

export default function SalesView() {
  const { clients, loading, setClients } = useRealtimeClients();
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [formOpen, setFormOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [detail, setDetail] = useState(null);
  const [templatesOpen, setTemplatesOpen] = useState(false);
  const [send, setSend] = useState(null);
  const { toast } = useToast();

  const filtered = clients.filter((c) => {
    const q = search.toLowerCase();
    const match = !q || c.name?.toLowerCase().includes(q) || c.company?.toLowerCase().includes(q) || c.email?.toLowerCase().includes(q);
    const s = statusFilter === 'all' || c.status === statusFilter;
    return match && s;
  });

  const handleSave = async (data) => {
    try {
      if (editing) {
        const updated = await clientsApi.update(editing.id, data);
        setClients((p) => p.map((c) => (c.id === updated.id ? updated : c)));
        toast({ title: 'Cliente atualizado' });
      } else {
        const created = await clientsApi.create(data);
        setClients((p) => [created, ...p]);
        toast({ title: 'Cliente criado' });
      }
      setFormOpen(false);
      setEditing(null);
    } catch {
      toast({ title: 'Erro ao salvar cliente', variant: 'destructive' });
    }
  };

  const handleDelete = async (id) => {
    await clientsApi.delete(id);
    setClients((p) => p.filter((c) => c.id !== id));
    setDetail(null);
    toast({ title: 'Cliente removido' });
  };

  const handleUpdate = (updated) => {
    setClients((p) => p.map((c) => (c.id === updated.id ? updated : c)));
    setDetail(updated);
  };

  const openEdit = (client) => { setEditing(client); setFormOpen(true); };

  const counts = {
    all: clients.length,
    manutencao_recorrente: clients.filter((c) => c.status === 'manutencao_recorrente').length,
    cliente_ativo: clients.filter((c) => c.status === 'cliente_ativo').length,
    pendente: clients.filter((c) => c.status === 'pendente').length,
    inativo: clients.filter((c) => c.status === 'inativo').length,
  };

  return (
    <div className="flex-1 flex flex-col overflow-hidden">
      <div className="px-6 py-4 border-b border-border flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-xl font-semibold flex items-center gap-2"><Users className="w-5 h-5 text-primary" /> Vendas & Clientes</h1>
          <p className="text-sm text-muted-foreground">{clients.length} clientes cadastrados</p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={() => setTemplatesOpen(true)} className="shadow-sm hover:shadow-md transition-shadow">
            <MessageSquareText className="w-4 h-4 mr-1.5" /> Modelos de mensagem
          </Button>
          <Button size="sm" onClick={() => { setEditing(null); setFormOpen(true); }} className="shadow-sm hover:shadow-md transition-shadow">
            <Plus className="w-4 h-4 mr-1.5" /> Novo cliente
          </Button>
        </div>
      </div>

      <div className="px-6 py-3 border-b border-border flex items-center gap-2 flex-wrap">
        <div className="relative flex-1 min-w-[200px] max-w-md">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
          <Input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Buscar por nome, empresa ou e-mail..." className="pl-9 shadow-sm focus:shadow-md transition-shadow" />
        </div>
        <div className="flex items-center rounded-lg border border-border p-0.5 shadow-sm">
          {['all', 'manutencao_recorrente', 'cliente_ativo', 'pendente', 'inativo'].map((s) => (
            <button
              key={s}
              onClick={() => setStatusFilter(s)}
              className={`px-3 py-1.5 text-xs font-medium rounded-md transition-all duration-200 ${statusFilter === s ? 'bg-primary text-primary-foreground shadow-sm' : 'text-muted-foreground hover:text-foreground hover:bg-muted/50'}`}
            >
              {s === 'all' ? `Todos (${counts.all})` : `${STATUS[s].label} (${counts[s]})`}
            </button>
          ))}
        </div>
      </div>

      <div className="flex-1 overflow-auto scrollbar-thin p-6">
        {loading ? (
          <div className="flex items-center justify-center py-20"><Loader2 className="w-6 h-6 animate-spin text-muted-foreground" /></div>
        ) : filtered.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 text-center">
            <div className="w-14 h-14 rounded-2xl bg-accent flex items-center justify-center mb-3 shadow-sm">
              <Users className="w-7 h-7 text-primary" />
            </div>
            <p className="text-sm font-medium">Nenhum cliente encontrado</p>
            <p className="text-xs text-muted-foreground mt-1">Cadastre seu primeiro cliente para organizar vendas e reuniões.</p>
            <Button size="sm" className="mt-4 shadow-sm hover:shadow-md transition-shadow" onClick={() => { setEditing(null); setFormOpen(true); }}>
              <Plus className="w-4 h-4 mr-1.5" /> Novo cliente
            </Button>
          </div>
        ) : (
          <div className="max-w-4xl mx-auto space-y-2">
            {filtered.map((c) => {
              const st = STATUS[c.status] || STATUS.lead;
              const hasMeeting = c.meeting_date && c.meeting_status === 'scheduled';
              const upcoming = hasMeeting && isAfter(parseISO(c.meeting_date), new Date(new Date().setHours(0, 0, 0, 0)));
              return (
                <div key={c.id} className="group flex items-center gap-3 bg-card rounded-xl border border-border px-3 py-2.5 shadow-sm hover:shadow-md hover:border-primary/30 transition-all duration-200">
                  <button onClick={() => setDetail(c)} className="flex items-center gap-3 flex-1 min-w-0 text-left">
                    <span className="w-10 h-10 rounded-xl bg-primary/10 text-primary flex items-center justify-center font-semibold flex-shrink-0 shadow-sm">
                      {c.name?.charAt(0).toUpperCase()}
                    </span>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <p className="font-medium truncate">{c.name}</p>
                        <span className={`text-[10px] px-2 py-0.5 rounded-full font-medium flex-shrink-0 ${st.chip} shadow-sm`}>{st.label}</span>
                      </div>
                      <p className="text-xs text-muted-foreground truncate flex items-center gap-1">
                        {c.company ? <><Building2 className="w-3 h-3" /> {c.company}</> : 'Sem empresa'} · {PLAN_LABELS[c.plan] || c.plan}
                      </p>
                      {hasMeeting && (
                        <p className={`text-xs truncate flex items-center gap-1 mt-0.5 ${upcoming ? 'text-primary' : 'text-muted-foreground'}`}>
                          <CalendarClock className="w-3 h-3" />
                          {format(parseISO(c.meeting_date), "dd/MM/yyyy", { locale: ptBR })}{c.meeting_time ? ` • ${c.meeting_time}` : ''}{c.meeting_topic ? ` · ${c.meeting_topic}` : ''}
                        </p>
                      )}
                    </div>
                  </button>

                  {/* Side action buttons */}
                  <div className="flex items-center gap-1 flex-shrink-0">
                    <button
                      title="Enviar e-mail"
                      disabled={!c.email}
                      onClick={() => setSend({ client: c, mode: 'email' })}
                      className="w-9 h-9 rounded-lg flex items-center justify-center border border-border text-muted-foreground hover:bg-primary hover:text-primary-foreground hover:border-primary disabled:opacity-40 disabled:hover:bg-transparent disabled:hover:text-muted-foreground disabled:hover:border-border transition-all duration-200 shadow-sm hover:shadow-md"
                    >
                      <Mail className="w-4 h-4" />
                    </button>
                    <button
                      title="Enviar WhatsApp"
                      disabled={!c.whatsapp}
                      onClick={() => setSend({ client: c, mode: 'whatsapp' })}
                      className="w-9 h-9 rounded-lg flex items-center justify-center border border-border text-muted-foreground hover:bg-[#25D366] hover:text-white hover:border-[#25D366] disabled:opacity-40 disabled:hover:bg-transparent disabled:hover:text-muted-foreground disabled:hover:border-border transition-all duration-200 shadow-sm hover:shadow-md"
                    >
                      <MessageCircle className="w-4 h-4" />
                    </button>
                    <button
                      title={hasMeeting ? `Reunião: ${format(parseISO(c.meeting_date), 'dd/MM/yyyy', { locale: ptBR })}` : 'Sem reunião marcada'}
                      onClick={() => setDetail(c)}
                      className={`w-9 h-9 rounded-lg flex items-center justify-center border transition-all duration-200 shadow-sm hover:shadow-md ${hasMeeting ? 'bg-primary/10 border-primary/30 text-primary hover:bg-primary hover:text-primary-foreground' : 'border-border text-muted-foreground/40 hover:bg-muted hover:text-muted-foreground'}`}
                    >
                      <CalendarClock className="w-4 h-4" />
                    </button>
                    <button
                      title="Editar"
                      onClick={() => openEdit(c)}
                      className="w-9 h-9 rounded-lg flex items-center justify-center text-muted-foreground hover:bg-muted hover:text-foreground transition-all duration-200 shadow-sm hover:shadow-md"
                    >
                      <Pencil className="w-4 h-4" />
                    </button>
                    <button
                      title="Excluir"
                      onClick={() => handleDelete(c.id)}
                      className="w-9 h-9 rounded-lg flex items-center justify-center text-muted-foreground hover:bg-destructive/10 hover:text-destructive transition-all duration-200 shadow-sm hover:shadow-md"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {formOpen && (
        <ClientForm
          open={formOpen}
          client={editing}
          onClose={() => { setFormOpen(false); setEditing(null); }}
          onSave={handleSave}
        />
      )}

      {detail && (
        <ClientDetail
          client={detail}
          onClose={() => setDetail(null)}
          onUpdate={handleUpdate}
          onDelete={handleDelete}
          onEdit={openEdit}
        />
      )}

      {send && (
        <SendMessageDialog
          client={send.client}
          mode={send.mode}
          onClose={() => setSend(null)}
        />
      )}

      {templatesOpen && (
        <TemplateManager open={templatesOpen} onClose={() => setTemplatesOpen(false)} />
      )}
    </div>
  );
}