import { useState, useEffect, useCallback } from 'react';
import { tasksApi } from '@/lib/api/tasks';
import { columnsApi } from '@/lib/api/columns';
import { useRealtimeTasks } from '@/lib/hooks/useRealtimeTasks';
import { useToast } from '@/ui/use-toast';
import { PRIORITIES, PRIORITY_ORDER, isOverdue } from '@/lib/kanban-utils';
import { Checkbox } from '@/ui/checkbox';
import { Input } from '@/ui/input';
import { Button } from '@/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/ui/select';
import { Loader2, Search, Trash2, CheckCircle2, Flag, Download } from 'lucide-react';
import { exportToCSV } from '@/lib/csv-export';

export default function TaskListView() {
  const { toast } = useToast();
  const { tasks, loading: tasksLoading } = useRealtimeTasks();
  const [columns, setColumns] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState(new Set());
  const [search, setSearch] = useState('');
  const [groupBy, setGroupBy] = useState('priority');

  const loadData = useCallback(async () => {
    setLoading(true);
    try {
      const c = await columnsApi.list();
      const boardIds = [...new Set(tasks.map((x) => x.board_id))];
      setColumns(c.filter((col) => boardIds.includes(col.board_id)));
    } finally {
      setLoading(false);
    }
  }, [tasks]);

  useEffect(() => { loadData(); }, [loadData]);

  const filtered = tasks.filter((t) => {
    if (search) {
      const s = search.toLowerCase();
      if (!t.title.toLowerCase().includes(s) && !(t.description || '').toLowerCase().includes(s)) return false;
    }
    return true;
  });

  const groups = (() => {
    const map = {};
    if (groupBy === 'priority') {
      PRIORITY_ORDER.forEach((p) => { map[p] = []; });
      filtered.forEach((t) => { (map[t.priority] = map[t.priority] || []).push(t); });
    } else if (groupBy === 'status') {
      columns.forEach((c) => { map[c.id] = []; });
      filtered.forEach((t) => { (map[t.column_id] = map[t.column_id] || []).push(t); });
    } else {
      filtered.forEach((t) => { const d = t.due_date || 'Sem data'; (map[d] = map[d] || []).push(t); });
    }
    return map;
  })();

  const toggle = (id) => {
    setSelected((prev) => { const n = new Set(prev); n.has(id) ? n.delete(id) : n.add(id); return n; });
  };

  const allSelected = filtered.length > 0 && filtered.every((t) => selected.has(t.id));
  const toggleAll = () => setSelected(allSelected ? new Set() : new Set(filtered.map((t) => t.id)));

  const bulkComplete = async () => {
    const ids = [...selected];
    try {
      for (const id of ids) {
        await tasksApi.update(id, { completed: true });
      }
      // O hook de realtime vai atualizar automaticamente
      setSelected(new Set());
      toast({ title: `${ids.length} tarefa(s) concluída(s)` });
    } catch (error) {
      toast({ title: 'Erro ao concluir tarefas', description: error.message, variant: 'destructive' });
    }
  };

  const bulkPriority = async (priority) => {
    const ids = [...selected];
    try {
      for (const id of ids) {
        await tasksApi.update(id, { priority });
      }
      // O hook de realtime vai atualizar automaticamente
      setSelected(new Set());
      toast({ title: `Prioridade atualizada para ${ids.length} tarefa(s)` });
    } catch (error) {
      toast({ title: 'Erro ao atualizar prioridade', description: error.message, variant: 'destructive' });
    }
  };

  const bulkDelete = async () => {
    if (!confirm(`Excluir ${selected.size} tarefa(s)?`)) return;
    try {
      for (const id of [...selected]) {
        await tasksApi.delete(id);
      }
      // O hook de realtime vai remover automaticamente
      setSelected(new Set());
      toast({ title: 'Tarefas excluídas' });
    } catch (error) {
      toast({ title: 'Erro ao excluir tarefas', description: error.message, variant: 'destructive' });
    }
  };

  const toggleComplete = async (task) => {
    try {
      await tasksApi.update(task.id, { completed: !task.completed });
      // O hook de realtime vai atualizar automaticamente
    } catch (error) {
      toast({ title: 'Erro ao atualizar tarefa', description: error.message, variant: 'destructive' });
    }
  };

  const groupLabel = (key) => {
    if (groupBy === 'priority') return PRIORITIES[key]?.label || key;
    if (groupBy === 'status') return columns.find((c) => c.id === key)?.name || 'Outro';
    return key === 'Sem data' ? 'Sem data' : new Date(key + 'T00:00').toLocaleDateString('pt-BR', { month: 'long', day: 'numeric', year: 'numeric' });
  };

  if (loading) return <div className="flex-1 flex items-center justify-center"><Loader2 className="w-6 h-6 animate-spin text-muted-foreground" /></div>;

  return (
    <div className="flex-1 overflow-auto scrollbar-thin">
      <div className="px-6 py-6 max-w-5xl mx-auto w-full">
        <div className="flex items-center justify-between mb-5 flex-wrap gap-3">
          <div>
            <h1 className="text-2xl font-semibold">Tarefas</h1>
            <p className="text-sm text-muted-foreground">{tasks.length} tarefas em BnBWeb</p>
          </div>
          <div className="flex items-center gap-2 flex-wrap">
            <div className="relative">
              <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Buscar..." className="pl-8 h-9 w-40 shadow-sm focus:shadow-md transition-shadow" />
            </div>
            <Select value={groupBy} onValueChange={setGroupBy}>
              <SelectTrigger className="h-9 w-36 shadow-sm hover:shadow-md transition-shadow"><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="priority">Agrupar por prioridade</SelectItem>
                <SelectItem value="status">Agrupar por status</SelectItem>
                <SelectItem value="due">Agrupar por vencimento</SelectItem>
              </SelectContent>
            </Select>
            <Button variant="outline" size="sm" className="h-9 shadow-sm hover:shadow-md transition-shadow" onClick={() => exportToCSV('tarefas.csv', ['Título', 'Prioridade', 'Vencimento', 'Concluída', 'Responsável'], tasks.map((t) => [t.title, t.priority, t.due_date || '', t.completed ? 'Sim' : 'Não', t.assignee || '']))}>
              <Download className="w-4 h-4 mr-1.5" /> CSV
            </Button>
          </div>
        </div>

        {selected.size > 0 && (
          <div className="sticky top-0 z-10 mb-4 flex items-center gap-2 bg-primary text-primary-foreground rounded-xl px-4 py-2.5 shadow-lg animate-fade-in">
            <span className="text-sm font-medium">{selected.size} selecionada(s)</span>
            <div className="flex-1" />
            <Button size="sm" variant="secondary" className="h-8 shadow-sm hover:shadow-md transition-shadow" onClick={bulkComplete}><CheckCircle2 className="w-3.5 h-3.5 mr-1" /> Concluir</Button>
            <Select onValueChange={bulkPriority}>
              <SelectTrigger className="h-8 w-36 border-0 bg-secondary shadow-sm hover:shadow-md transition-shadow"><SelectValue placeholder="Definir prioridade" /></SelectTrigger>
              <SelectContent>
                {Object.entries(PRIORITIES).map(([k, v]) => <SelectItem key={k} value={k}>{v.label}</SelectItem>)}
              </SelectContent>
            </Select>
            <Button size="sm" variant="secondary" className="h-8 bg-destructive/90 hover:bg-destructive text-white shadow-sm hover:shadow-md transition-shadow" onClick={bulkDelete}><Trash2 className="w-3.5 h-3.5 mr-1" /> Excluir</Button>
          </div>
        )}

        <div className="bg-card rounded-2xl border border-border overflow-hidden shadow-sm">
          <div className="flex items-center gap-3 px-4 py-2.5 border-b border-border bg-muted/40">
            <Checkbox checked={allSelected} onCheckedChange={toggleAll} />
            <span className="text-xs font-medium text-muted-foreground flex-1">Tarefa</span>
            <span className="text-xs font-medium text-muted-foreground w-24">Vencimento</span>
            <span className="text-xs font-medium text-muted-foreground w-20">Prioridade</span>
          </div>

          {Object.entries(groups).map(([key, items]) => items.length > 0 && (
            <div key={key}>
              <div className="px-4 py-1.5 bg-muted/20 text-xs font-semibold text-muted-foreground uppercase tracking-wide">{groupLabel(key)} · {items.length}</div>
              {items.map((t) => {
                const p = PRIORITIES[t.priority] || PRIORITIES.medium;
                return (
                  <div key={t.id} className={`flex items-center gap-3 px-4 py-2.5 border-b border-border last:border-0 hover:bg-muted/30 transition-all duration-200 hover:shadow-sm ${selected.has(t.id) ? 'bg-primary/5' : ''}`}>
                    <Checkbox checked={selected.has(t.id)} onCheckedChange={() => toggle(t.id)} />
                    <button onClick={() => toggleComplete(t)} className="w-4 h-4 rounded-full border-2 flex items-center justify-center flex-shrink-0 transition-all duration-200 hover:scale-110" style={{ borderColor: t.completed ? '#10b981' : undefined }}>
                      {t.completed && <CheckCircle2 className="w-4 h-4 text-emerald-500" />}
                    </button>
                    <span className={`text-sm flex-1 truncate ${t.completed ? 'line-through text-muted-foreground' : ''}`}>{t.title}</span>
                    {t.due_date && (
                      <span className={`text-xs w-24 ${isOverdue(t.due_date) && !t.completed ? 'text-red-500 font-medium' : 'text-muted-foreground'}`}>
                        {new Date(t.due_date + 'T00:00').toLocaleDateString('pt-BR', { month: 'short', day: 'numeric' })}
                      </span>
                    )}
                    {!t.due_date && <span className="text-xs w-24 text-muted-foreground/50">—</span>}
                    <span className={`text-xs w-20 inline-flex items-center gap-1 ${p.chip} px-2 py-0.5 rounded-full shadow-sm`}>
                      <Flag className="w-2.5 h-2.5" />{p.label}
                    </span>
                  </div>
                );
              })}
            </div>
          ))}
          {filtered.length === 0 && <p className="text-sm text-muted-foreground/60 py-12 text-center">Sem tarefas — crie a primeira.</p>}
        </div>
      </div>
    </div>
  );
}