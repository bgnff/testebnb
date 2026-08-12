import { useState, useEffect, useRef, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { tasksApi } from '@/lib/api/tasks';
import { useProject } from '@/lib/project-context';
import {
  Bell, AlertTriangle, CalendarClock, Clock, ChevronRight,
} from 'lucide-react';
import { cn } from '@/lib/utils';

function dateDiff(dateStr) {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const d = new Date(dateStr + 'T00:00');
  d.setHours(0, 0, 0, 0);
  return Math.round((d - today) / 86400000);
}

function relativeLabel(diff) {
  if (diff < 0) return diff === -1 ? 'Atrasada 1 dia' : `Atrasada ${Math.abs(diff)} dias`;
  if (diff === 0) return 'Vence hoje';
  if (diff === 1) return 'Vence amanhã';
  return `Faltam ${diff} dias`;
}

const SECTIONS = [
  { key: 'overdue', label: 'Atrasadas', icon: AlertTriangle, dot: 'bg-red-500', chip: 'bg-red-100 text-red-700 dark:bg-red-950 dark:text-red-300', accent: 'border-l-red-500' },
  { key: 'today', label: 'Vence hoje', icon: CalendarClock, dot: 'bg-amber-500', chip: 'bg-amber-100 text-amber-700 dark:bg-amber-950 dark:text-amber-300', accent: 'border-l-amber-500' },
  { key: 'tomorrow', label: 'Amanhã', icon: Clock, dot: 'bg-blue-500', chip: 'bg-blue-100 text-blue-700 dark:bg-blue-950 dark:text-blue-300', accent: 'border-l-blue-500' },
  { key: 'soon', label: 'Em breve (3 dias)', icon: Clock, dot: 'bg-primary', chip: 'bg-primary/10 text-primary', accent: 'border-l-primary' },
];

export default function NotificationCenter({ className, iconSize = 'w-4 h-4' }) {
  const { currentProject } = useProject();
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);
  const [tasks, setTasks] = useState([]);
  const ref = useRef(null);

  const loadTasks = useCallback(async () => {
    if (!currentProject) return;
    try {
      const t = await tasksApi.getByProject(currentProject.id);
      setTasks(t);
    } catch { /* ignore */ }
  }, [currentProject]);

  useEffect(() => { loadTasks(); }, [loadTasks]);

  useEffect(() => {
    const interval = setInterval(loadTasks, 60000);
    return () => clearInterval(interval);
  }, [loadTasks]);

  useEffect(() => {
    const handler = (e) => { if (ref.current && !ref.current.contains(e.target)) setOpen(false); };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const pending = tasks.filter((t) => !t.completed && t.due_date);

  const grouped = {
    overdue: pending.filter((t) => dateDiff(t.due_date) < 0)
      .sort((a, b) => a.due_date.localeCompare(b.due_date)),
    today: pending.filter((t) => dateDiff(t.due_date) === 0),
    tomorrow: pending.filter((t) => dateDiff(t.due_date) === 1),
    soon: pending.filter((t) => { const d = dateDiff(t.due_date); return d >= 2 && d <= 3; })
      .sort((a, b) => a.due_date.localeCompare(b.due_date)),
  };

  const totalCount = SECTIONS.reduce((sum, s) => sum + (grouped[s.key]?.length || 0), 0);

  const handleClick = () => {
    setOpen(false);
    navigate('/board');
  };

  return (
    <div className={cn('relative', className)} ref={ref}>
      <button
        onClick={() => { setOpen((v) => !v); if (!open) loadTasks(); }}
        className="relative inline-flex items-center justify-center rounded-lg hover:bg-accent transition-colors"
        aria-label="Notificações"
      >
        <Bell className={iconSize} />
        {totalCount > 0 && (
          <span className={cn(
            'absolute -top-0.5 -right-0.5 min-w-[16px] h-4 px-1 rounded-full text-[9px] font-bold text-white flex items-center justify-center',
            grouped.overdue.length > 0 ? 'bg-red-500 animate-pulse' : 'bg-primary'
          )}>
            {totalCount > 9 ? '9+' : totalCount}
          </span>
        )}
      </button>

      {open && (
        <div className="absolute right-0 bottom-full mb-2 w-80 max-w-[calc(100vw-2rem)] rounded-2xl border border-border bg-popover shadow-xl z-50 overflow-hidden">
          <div className="flex items-center justify-between px-4 py-3 border-b border-border">
            <div className="flex items-center gap-2">
              <Bell className="w-4 h-4 text-primary" />
              <h3 className="text-sm font-semibold">Notificações</h3>
            </div>
            {totalCount > 0 && (
              <span className="text-xs px-2 py-0.5 rounded-full bg-primary/10 text-primary font-medium">{totalCount}</span>
            )}
          </div>

          <div className="max-h-[60vh] overflow-y-auto scrollbar-thin">
            {totalCount === 0 ? (
              <div className="flex flex-col items-center gap-2 py-10 px-4 text-center">
                <div className="w-10 h-10 rounded-full bg-emerald-100 dark:bg-emerald-950 flex items-center justify-center">
                  <Bell className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
                </div>
                <p className="text-sm font-medium">Tudo em dia!</p>
                <p className="text-xs text-muted-foreground">Nenhuma tarefa próxima do vencimento.</p>
              </div>
            ) : (
              SECTIONS.filter((s) => grouped[s.key]?.length > 0).map((section) => (
                <div key={section.key}>
                  <div className="flex items-center gap-1.5 px-4 py-1.5 bg-muted/40">
                    <span className={cn('w-2 h-2 rounded-full', section.dot)} />
                    <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">
                      {section.label}
                    </span>
                    <span className="text-xs text-muted-foreground ml-auto">{grouped[section.key].length}</span>
                  </div>
                  {grouped[section.key].map((task) => {
                    const diff = dateDiff(task.due_date);
                    return (
                      <button
                        key={task.id}
                        onClick={handleClick}
                        className={cn(
                          'w-full flex items-center gap-2.5 px-4 py-2.5 text-left hover:bg-muted/50 transition-colors border-l-4',
                          section.accent
                        )}
                      >
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium truncate">{task.title}</p>
                          <p className="text-xs text-muted-foreground">
                            {relativeLabel(diff)} · {new Date(task.due_date + 'T00:00').toLocaleDateString('pt-BR', { day: '2-digit', month: 'short' })}
                          </p>
                        </div>
                        <span className={cn('text-[10px] font-semibold px-1.5 py-0.5 rounded-full whitespace-nowrap', section.chip)}>
                          {section.label.split(' ')[0]}
                        </span>
                        <ChevronRight className="w-3.5 h-3.5 text-muted-foreground flex-shrink-0" />
                      </button>
                    );
                  })}
                </div>
              ))
            )}
          </div>

          {totalCount > 0 && (
            <button onClick={handleClick} className="w-full px-4 py-2.5 border-t border-border text-xs font-medium text-primary hover:bg-muted/50 transition-colors">
              Ver todas no quadro
            </button>
          )}
        </div>
      )}
    </div>
  );
}