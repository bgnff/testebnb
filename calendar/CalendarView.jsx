import { useState, useEffect, useMemo, useCallback } from 'react';
import { DragDropContext } from '@hello-pangea/dnd';
import { useProject } from '@/lib/project-context';
import { useToast } from '@/ui/use-toast';
import { tasksApi } from '@/lib/api/tasks';
import { calendarNotesApi } from '@/lib/api/calendar-notes';
import { clientsApi } from '@/lib/api/clients';
import DayDetailDialog from '@/calendar/DayDetailDialog';
import CalendarDayCell from '@/calendar/CalendarDayCell';
import TaskDetailModal from '@/board/TaskDetailModal';
import ClientDetail from '@/sales/ClientDetail';
import { Button } from '@/ui/button';
import { Textarea } from '@/ui/textarea';
import { Loader2, ChevronLeft, ChevronRight, Plus, CalendarClock, StickyNote, Trash2, Users } from 'lucide-react';
import {
  startOfMonth, endOfMonth, startOfWeek, endOfWeek, eachDayOfInterval,
  format, isSameMonth, isToday, addMonths, subMonths, addWeeks, subWeeks, addDays, subDays,
} from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { PRIORITIES } from '@/lib/kanban-utils';

const WEEKDAYS = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'];

const VIEWS = [
  { key: 'month', label: 'Mês' },
  { key: 'week', label: 'Semana' },
  { key: 'day', label: 'Dia' },
];

export default function CalendarView() {
  const { currentProject } = useProject();
  const { toast } = useToast();
  const [view, setView] = useState('month');
  const [cursor, setCursor] = useState(new Date());
  const [tasks, setTasks] = useState([]);
  const [notes, setNotes] = useState([]);
  const [meetings, setMeetings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedDay, setSelectedDay] = useState(null);
  const [selectedTask, setSelectedTask] = useState(null);
  const [selectedClient, setSelectedClient] = useState(null);
  const [dayNoteContent, setDayNoteContent] = useState('');
  const [dayNoteColor, setDayNoteColor] = useState('#7c3aed');

  const loadData = useCallback(async () => {
    if (!currentProject) return;
    setLoading(true);
    try {
      const [t, n, clients] = await Promise.all([
        tasksApi.getByProject(currentProject.id),
        calendarNotesApi.list(currentProject.id),
        clientsApi.list(),
      ]);
      setTasks(t.filter((x) => x.due_date));
      setNotes(n);
      setMeetings(clients.filter((c) => c.meeting_date && c.meeting_status === 'scheduled'));
    } finally {
      setLoading(false);
    }
  }, [currentProject]);

  useEffect(() => { loadData(); }, [loadData]);

  const visibleDays = useMemo(() => {
    if (view === 'month') {
      const start = startOfWeek(startOfMonth(cursor), { weekStartsOn: 0 });
      const end = endOfWeek(endOfMonth(cursor), { weekStartsOn: 0 });
      return eachDayOfInterval({ start, end });
    }
    if (view === 'week') {
      const start = startOfWeek(cursor, { weekStartsOn: 0 });
      const end = endOfWeek(cursor, { weekStartsOn: 0 });
      return eachDayOfInterval({ start, end });
    }
    return [cursor];
  }, [cursor, view]);

  const tasksByDate = useMemo(() => {
    const map = {};
    tasks.forEach((t) => { if (t.due_date) { (map[t.due_date] = map[t.due_date] || []).push(t); } });
    return map;
  }, [tasks]);

  const notesByDate = useMemo(() => {
    const map = {};
    notes.forEach((n) => { (map[n.date] = map[n.date] || []).push(n); });
    return map;
  }, [notes]);

  const meetingsByDate = useMemo(() => {
    const map = {};
    meetings.forEach((m) => { (map[m.meeting_date] = map[m.meeting_date] || []).push(m); });
    return map;
  }, [meetings]);

  const headerTitle = useMemo(() => {
    if (view === 'month') return format(cursor, 'MMMM yyyy', { locale: ptBR });
    if (view === 'week') {
      const start = startOfWeek(cursor, { weekStartsOn: 0 });
      const end = endOfWeek(cursor, { weekStartsOn: 0 });
      return `${format(start, "d 'de' MMMM", { locale: ptBR })} – ${format(end, "d 'de' MMMM 'de' yyyy", { locale: ptBR })}`;
    }
    return format(cursor, "EEEE, d 'de' MMMM 'de' yyyy", { locale: ptBR });
  }, [cursor, view]);

  const navigate = (dir) => {
    if (view === 'month') setCursor(dir > 0 ? addMonths(cursor, 1) : subMonths(cursor, 1));
    else if (view === 'week') setCursor(dir > 0 ? addWeeks(cursor, 1) : subWeeks(cursor, 1));
    else setCursor(dir > 0 ? addDays(cursor, 1) : subDays(cursor, 1));
  };

  const onDragEnd = async (result) => {
    const { destination, draggableId } = result;
    if (!destination) return;
    const newDate = destination.droppableId;
    const task = tasks.find((t) => t.id === draggableId);
    if (!task || task.due_date === newDate) return;
    setTasks((prev) => prev.map((t) => (t.id === task.id ? { ...t, due_date: newDate } : t)));
    try {
      await tasksApi.update(task.id, { due_date: newDate });
    } catch (e) {
      toast({ title: 'Falha ao reagendar', variant: 'destructive' });
      loadData();
    }
  };

  const addNote = async (date, content, color) => {
    const created = await calendarNotesApi.create({ date, content, color, project_id: currentProject.id });
    setNotes((prev) => [...prev, created]);
  };

  const deleteNote = async (id) => {
    await calendarNotesApi.delete(id);
    setNotes((prev) => prev.filter((n) => n.id !== id));
  };

  const handleDayNoteAdd = () => {
    if (!dayNoteContent.trim()) return;
    addNote(format(cursor, 'yyyy-MM-dd'), dayNoteContent.trim(), dayNoteColor);
    setDayNoteContent('');
  };

  if (loading) return <div className="flex-1 flex items-center justify-center"><Loader2 className="w-6 h-6 animate-spin text-muted-foreground" /></div>;

  const dayDateStr = format(cursor, 'yyyy-MM-dd');
  const dayTasks = tasksByDate[dayDateStr] || [];
  const dayNotes = notesByDate[dayDateStr] || [];
  const dayMeetings = meetingsByDate[dayDateStr] || [];
  const selectedDayTasks = selectedDay ? (tasksByDate[selectedDay] || []) : [];
  const selectedDayNotes = selectedDay ? (notesByDate[selectedDay] || []) : [];
  const selectedDayMeetings = selectedDay ? (meetingsByDate[selectedDay] || []) : [];

  return (
    <div className="flex-1 flex flex-col overflow-hidden">
      <div className="px-6 py-4 border-b border-border flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-xl font-semibold capitalize">{headerTitle}</h1>
          <p className="text-sm text-muted-foreground">{tasks.length} tarefas · {notes.length} notas · {meetings.length} reuniões</p>
        </div>
        <div className="flex items-center gap-2">
          <div className="flex items-center rounded-lg border border-border p-0.5 shadow-sm">
            {VIEWS.map((v) => (
              <button
                key={v.key}
                onClick={() => { setView(v.key); setSelectedDay(null); }}
                className={`px-3 py-1.5 text-xs font-medium rounded-md transition-all duration-200 ${view === v.key ? 'bg-primary text-primary-foreground shadow-sm' : 'text-muted-foreground hover:text-foreground hover:bg-muted/50'}`}
              >
                {v.label}
              </button>
            ))}
          </div>
          <Button variant="outline" size="sm" onClick={() => { setCursor(new Date()); setSelectedDay(null); }} className="shadow-sm hover:shadow-md transition-shadow">Hoje</Button>
          <Button variant="ghost" size="icon" onClick={() => navigate(-1)} className="hover:bg-muted transition-colors"><ChevronLeft className="w-4 h-4" /></Button>
          <Button variant="ghost" size="icon" onClick={() => navigate(1)} className="hover:bg-muted transition-colors"><ChevronRight className="w-4 h-4" /></Button>
        </div>
      </div>

      {view === 'day' ? (
        <div className="flex-1 overflow-auto scrollbar-thin p-4">
          <div className="max-w-3xl mx-auto">
            {dayMeetings.length > 0 && (
              <div className="bg-primary/5 rounded-2xl border border-primary/20 p-4 mb-4 shadow-sm hover:shadow-md transition-shadow">
                <h3 className="text-sm font-semibold mb-3 flex items-center gap-1.5 text-primary"><Users className="w-4 h-4" /> Reuniões de clientes ({dayMeetings.length})</h3>
                <div className="space-y-1.5">
                  {dayMeetings.map((m) => (
                    <button key={m.id} onClick={() => setSelectedClient(m)} className="w-full flex items-center gap-2 text-left px-3 py-2 rounded-lg bg-card hover:bg-primary/10 transition-all duration-200 hover:shadow-sm border border-primary/20">
                      <span className="w-1 h-5 rounded-full bg-primary flex-shrink-0 shadow-sm" />
                      <span className="text-sm font-medium truncate">{m.name}</span>
                      {m.meeting_time && <span className="text-xs text-muted-foreground">{m.meeting_time}</span>}
                      {m.company && <span className="text-xs text-muted-foreground truncate flex-1">· {m.company}</span>}
                    </button>
                  ))}
                </div>
              </div>
            )}

            <div className="bg-card rounded-2xl border border-border p-4 mb-4 shadow-sm hover:shadow-md transition-shadow">
              <h3 className="text-sm font-semibold mb-3 flex items-center gap-1.5"><CalendarClock className="w-4 h-4" /> Tarefas do dia</h3>
              {dayTasks.length === 0 ? (
                <p className="text-sm text-muted-foreground/60 py-4 text-center">Sem tarefas para este dia.</p>
              ) : (
                <div className="space-y-1.5">
                  {dayTasks.map((t) => {
                    const p = PRIORITIES[t.priority] || PRIORITIES.medium;
                    const lc = t.labels?.[0]?.color || p.color;
                    return (
                      <button key={t.id} onClick={() => setSelectedTask(t)} className="w-full flex items-center gap-2 text-left px-3 py-2 rounded-lg hover:bg-muted transition-all duration-200 hover:shadow-sm">
                        <span className="w-1 h-5 rounded-full flex-shrink-0 shadow-sm" style={{ backgroundColor: lc }} />
                        <span className={`text-sm flex-1 ${t.completed ? 'line-through text-muted-foreground' : ''}`}>{t.title}</span>
                        {t.assignee && <span className="text-xs text-muted-foreground">{t.assignee}</span>}
                        <span className={`text-xs px-2 py-0.5 rounded-full ${p.chip} shadow-sm`}>{p.label}</span>
                      </button>
                    );
                  })}
                </div>
              )}
            </div>

            <div className="bg-card rounded-2xl border border-border p-4 shadow-sm hover:shadow-md transition-shadow">
              <h3 className="text-sm font-semibold mb-3 flex items-center gap-1.5"><StickyNote className="w-4 h-4" /> Notas</h3>
              <div className="space-y-2 mb-3">
                {dayNotes.map((n) => (
                  <div key={n.id} className="group flex gap-2 p-2.5 rounded-lg border-l-4 bg-muted/40 shadow-sm hover:shadow-md transition-shadow" style={{ borderColor: n.color }}>
                    <p className="text-sm flex-1 whitespace-pre-wrap">{n.content}</p>
                    <button onClick={() => deleteNote(n.id)} className="opacity-0 group-hover:opacity-100 text-muted-foreground hover:text-destructive transition-opacity"><Trash2 className="w-3.5 h-3.5" /></button>
                  </div>
                ))}
                {dayNotes.length === 0 && <p className="text-sm text-muted-foreground/60 py-1">Sem notas para este dia.</p>}
              </div>
              <div className="flex items-center gap-2 pt-2 border-t border-border">
                <Textarea value={dayNoteContent} onChange={(e) => setDayNoteContent(e.target.value)} placeholder="Adicione uma nota para este dia..." rows={2} className="flex-1 shadow-sm focus:shadow-md transition-shadow" />
                <div className="flex flex-col items-center gap-1.5">
                  <input type="color" value={dayNoteColor} onChange={(e) => setDayNoteColor(e.target.value)} className="w-8 h-8 rounded cursor-pointer bg-transparent border border-border shadow-sm hover:shadow-md transition-shadow" />
                  <Button size="sm" onClick={handleDayNoteAdd} disabled={!dayNoteContent.trim()} className="shadow-sm hover:shadow-md transition-shadow"><Plus className="w-4 h-4" /></Button>
                </div>
              </div>
            </div>
          </div>
        </div>
      ) : (
        <div className="flex-1 overflow-auto scrollbar-thin p-4">
          <DragDropContext onDragEnd={onDragEnd}>
            <div className="grid grid-cols-7 gap-1.5">
              {WEEKDAYS.map((d) => (
                <div key={d} className="text-center text-xs font-medium text-muted-foreground py-1">{d}</div>
              ))}
              {visibleDays.map((day) => {
                const dateStr = format(day, 'yyyy-MM-dd');
                const dTasks = tasksByDate[dateStr] || [];
                const dNotes = notesByDate[dateStr] || [];
                const dMeetings = meetingsByDate[dateStr] || [];
                const dimmed = view === 'month' && !isSameMonth(day, cursor);
                const maxTasks = view === 'week' ? 6 : 3;
                const minHeight = view === 'week' ? 220 : 104;
                return (
                  <CalendarDayCell
                    key={dateStr} day={day} tasks={dTasks} notes={dNotes} meetings={dMeetings}
                    maxTasks={maxTasks} minHeight={minHeight} dimmed={dimmed}
                    onClick={setSelectedDay} onTaskClick={setSelectedTask} onMeetingClick={setSelectedClient}
                  />
                );
              })}
            </div>
          </DragDropContext>
          <p className="text-xs text-muted-foreground/70 mt-4 text-center">Dica: arraste uma tarefa para outro dia para reagendá-la.</p>
        </div>
      )}

      {selectedDay && view !== 'day' && (
        <DayDetailDialog
          date={selectedDay} tasks={selectedDayTasks} notes={selectedDayNotes} meetings={selectedDayMeetings}
          onClose={() => setSelectedDay(null)}
          onAddNote={(content, color) => addNote(selectedDay, content, color)} onDeleteNote={deleteNote}
          onTaskClick={setSelectedTask} onMeetingClick={setSelectedClient}
        />
      )}

      {selectedTask && (
        <TaskDetailModal
          task={selectedTask}
          columns={[]}
          onClose={() => setSelectedTask(null)}
          onUpdate={(u) => { setTasks((prev) => prev.map((t) => (t.id === u.id ? u : t))); setSelectedTask(u); }}
          onDelete={async (id) => { await tasksApi.delete(id); setTasks((prev) => prev.filter((t) => t.id !== id)); setSelectedTask(null); }}
        />
      )}

      {selectedClient && (
        <ClientDetail
          client={selectedClient}
          onClose={() => setSelectedClient(null)}
          onUpdate={(u) => { setMeetings((prev) => prev.map((m) => (m.id === u.id ? u : m))); setSelectedClient(u); }}
          onDelete={async (id) => { setMeetings((prev) => prev.filter((m) => m.id !== id)); setSelectedClient(null); }}
          onEdit={null}
        />
      )}
    </div>
  );
}