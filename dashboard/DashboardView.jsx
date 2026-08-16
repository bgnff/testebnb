import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { tasksApi } from '@/lib/api/tasks';
import { columnsApi } from '@/lib/api/columns';
import { useProject } from '@/lib/project-context';
import { PRIORITIES, todayStr, isOverdue } from '@/lib/kanban-utils';
import { Loader2, CalendarClock, AlertTriangle, CheckCircle2, ListTodo, ArrowRight } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, CartesianGrid } from 'recharts';

export default function DashboardView() {
  const { currentProject } = useProject();
  const navigate = useNavigate();
  const [tasks, setTasks] = useState([]);
  const [columns, setColumns] = useState([]);
  const [loading, setLoading] = useState(true);

  const loadData = useCallback(async () => {
    if (!currentProject) return;
    setLoading(true);
    try {
      const t = await tasksApi.getByProject(currentProject.id);
      setTasks(t);
      const cols = await columnsApi.list();
      const boardIds = [...new Set(t.map((x) => x.board_id))];
      setColumns(cols.filter((c) => boardIds.includes(c.board_id)));
    } finally {
      setLoading(false);
    }
  }, [currentProject]);

  useEffect(() => { loadData(); }, [loadData]);

  if (loading) return <div className="flex-1 flex items-center justify-center"><Loader2 className="w-6 h-6 animate-spin text-muted-foreground" /></div>;

  const today = todayStr();
  const dueToday = tasks.filter((t) => t.due_date === today && !t.completed);
  const overdue = tasks.filter((t) => isOverdue(t.due_date) && !t.completed);
  const completed = tasks.filter((t) => t.completed);

  const colData = columns.map((c) => ({ name: c.name, count: tasks.filter((t) => t.column_id === c.id).length }));

  const priorityData = Object.entries(PRIORITIES).map(([k, v]) => ({
    name: v.label, value: tasks.filter((t) => t.priority === k).length, color: v.color,
  })).filter((d) => d.value > 0);

  const upcoming = tasks
    .filter((t) => t.due_date && !t.completed)
    .sort((a, b) => (a.due_date || '').localeCompare(b.due_date || ''))
    .slice(0, 6);

  const stats = [
    { label: 'Vence hoje', value: dueToday.length, icon: CalendarClock, color: 'text-amber-500', bg: 'bg-amber-50 dark:bg-amber-950/40', border: 'border-amber-200 dark:border-amber-900' },
    { label: 'Atrasadas', value: overdue.length, icon: AlertTriangle, color: 'text-red-500', bg: 'bg-red-50 dark:bg-red-950/40', border: 'border-red-200 dark:border-red-900' },
    { label: 'Concluídas', value: completed.length, icon: CheckCircle2, color: 'text-emerald-500', bg: 'bg-emerald-50 dark:bg-emerald-950/40', border: 'border-emerald-200 dark:border-emerald-900' },
    { label: 'Total de tarefas', value: tasks.length, icon: ListTodo, color: 'text-primary', bg: 'bg-primary/10', border: 'border-primary/20' },
  ];

  return (
    <div className="flex-1 overflow-auto scrollbar-thin">
      <div className="px-6 py-6 max-w-6xl mx-auto w-full">
        <div className="mb-6">
          <h1 className="text-2xl font-semibold">Painel</h1>
          <p className="text-sm text-muted-foreground">{currentProject?.name} · visão geral do seu trabalho</p>
        </div>

        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-6">
          {stats.map((s) => (
            <div key={s.label} className={`bg-card rounded-2xl border ${s.border} p-4 shadow-sm hover:shadow-md transition-all duration-200`}>
              <div className={`w-9 h-9 rounded-xl ${s.bg} flex items-center justify-center mb-3 shadow-sm`}>
                <s.icon className={`w-4 h-4 ${s.color}`} />
              </div>
              <p className="text-2xl font-semibold">{s.value}</p>
              <p className="text-xs text-muted-foreground">{s.label}</p>
            </div>
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mb-6">
          <div className="bg-card rounded-2xl border border-border p-5 shadow-sm hover:shadow-md transition-all duration-200">
            <h3 className="text-sm font-semibold mb-4">Tarefas por coluna</h3>
            {colData.length === 0 ? (
              <p className="text-sm text-muted-foreground/60 py-8 text-center">Sem dados</p>
            ) : (
              <ResponsiveContainer width="100%" height={220}>
                <BarChart data={colData}>
                  <CartesianGrid strokeDasharray="3 3" className="stroke-border" vertical={false} />
                  <XAxis dataKey="name" tick={{ fontSize: 11 }} className="text-muted-foreground" />
                  <YAxis allowDecimals={false} tick={{ fontSize: 11 }} />
                  <Tooltip contentStyle={{ borderRadius: 12, border: '1px solid hsl(var(--border))', fontSize: 12 }} />
                  <Bar dataKey="count" fill="hsl(var(--primary))" radius={[6, 6, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            )}
          </div>

          <div className="bg-card rounded-2xl border border-border p-5 shadow-sm hover:shadow-md transition-all duration-200">
            <h3 className="text-sm font-semibold mb-4">Tarefas por prioridade</h3>
            {priorityData.length === 0 ? (
              <p className="text-sm text-muted-foreground/60 py-8 text-center">Sem dados</p>
            ) : (
              <ResponsiveContainer width="100%" height={220}>
                <PieChart>
                  <Pie data={priorityData} dataKey="value" nameKey="name" cx="50%" cy="50%" innerRadius={50} outerRadius={85} paddingAngle={3}>
                    {priorityData.map((d) => <Cell key={d.name} fill={d.color} />)}
                  </Pie>
                  <Tooltip contentStyle={{ borderRadius: 12, border: '1px solid hsl(var(--border))', fontSize: 12 }} />
                </PieChart>
              </ResponsiveContainer>
            )}
            <div className="flex flex-wrap justify-center gap-3 mt-1">
              {priorityData.map((d) => (
                <span key={d.name} className="flex items-center gap-1.5 text-xs text-muted-foreground">
                  <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: d.color }} />{d.name} ({d.value})
                </span>
              ))}
            </div>
          </div>
        </div>

        <div className="bg-card rounded-2xl border border-border p-5 shadow-sm hover:shadow-md transition-all duration-200">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-semibold">Próximas tarefas</h3>
            <button onClick={() => navigate('/board')} className="text-xs text-primary flex items-center gap-1 hover:underline transition-colors">Ver quadro <ArrowRight className="w-3 h-3" /></button>
          </div>
          {upcoming.length === 0 ? (
            <p className="text-sm text-muted-foreground/60 py-8 text-center">Nada agendado. Tudo em dia! 🎉</p>
          ) : (
            <div className="space-y-1">
              {upcoming.map((t) => {
                const p = PRIORITIES[t.priority] || PRIORITIES.medium;
                return (
                  <div key={t.id} className="flex items-center gap-3 px-2 py-2 rounded-lg hover:bg-muted/50 transition-all duration-200 hover:shadow-sm">
                    <span className="w-2 h-2 rounded-full shadow-sm" style={{ backgroundColor: p.color }} />
                    <span className="text-sm flex-1 truncate">{t.title}</span>
                    <span className={`text-xs ${isOverdue(t.due_date) ? 'text-red-500 font-medium' : 'text-muted-foreground'}`}>
                      {new Date(t.due_date + 'T00:00').toLocaleDateString('pt-BR', { month: 'short', day: 'numeric' })}
                    </span>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}