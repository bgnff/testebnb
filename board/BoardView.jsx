import { useState, useEffect, useMemo, useCallback } from 'react';
import { DragDropContext } from '@hello-pangea/dnd';
import { useProject } from '@/lib/project-context';
import { ensureBoard, PRIORITIES } from '@/lib/kanban-utils';
import { useToast } from '@/ui/use-toast';
import { tasksApi } from '@/lib/api/tasks';
import { columnsApi } from '@/lib/api/columns';
import BoardColumn from '@/board/BoardColumn';
import TaskDetailModal from '@/board/TaskDetailModal';
import { Input } from '@/ui/input';
import { Button } from '@/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/ui/select';
import { Search, Plus, X, Loader2 } from 'lucide-react';

export default function BoardView() {
  const { currentProject } = useProject();
  const { toast } = useToast();
  const [board, setBoard] = useState(null);
  const [columns, setColumns] = useState([]);
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedTask, setSelectedTask] = useState(null);
  const [search, setSearch] = useState('');
  const [priorityFilter, setPriorityFilter] = useState('all');
  const [labelFilter, setLabelFilter] = useState(null);
  const [addingColumn, setAddingColumn] = useState(false);
  const [newColumnName, setNewColumnName] = useState('');

  const loadData = useCallback(async () => {
    if (!currentProject) return;
    setLoading(true);
    try {
      const { board, columns } = await ensureBoard(currentProject.id);
      setBoard(board);
      setColumns(columns);
      const t = await tasksApi.getByBoard(board.id);
      setTasks(t);
    } finally {
      setLoading(false);
    }
  }, [currentProject]);

  useEffect(() => { loadData(); }, [loadData]);

  const allLabels = useMemo(() => {
    const map = {};
    tasks.forEach((t) => (t.labels || []).forEach((l) => { if (!map[l.name]) map[l.name] = l.color; }));
    return Object.entries(map).map(([name, color]) => ({ name, color }));
  }, [tasks]);

  const filteredTasks = useMemo(() => {
    return tasks.filter((t) => {
      if (search) {
        const s = search.toLowerCase();
        if (!t.title.toLowerCase().includes(s) && !(t.description || '').toLowerCase().includes(s)) return false;
      }
      if (priorityFilter !== 'all' && t.priority !== priorityFilter) return false;
      if (labelFilter && !(t.labels || []).some((l) => l.name === labelFilter)) return false;
      return true;
    });
  }, [tasks, search, priorityFilter, labelFilter]);

  const tasksByColumn = useMemo(() => {
    const map = {};
    columns.forEach((c) => { map[c.id] = []; });
    filteredTasks.forEach((t) => { if (map[t.column_id]) map[t.column_id].push(t); });
    Object.keys(map).forEach((k) => map[k].sort((a, b) => (a.position ?? 0) - (b.position ?? 0)));
    return map;
  }, [filteredTasks, columns]);

  const onDragEnd = async (result) => {
    const { source, destination, draggableId } = result;
    if (!destination) return;
    if (source.droppableId === destination.droppableId && source.index === destination.index) return;

    const destCol = columns.find((c) => c.id === destination.droppableId);
    if (destCol?.wip_enabled && destCol.wip_limit && source.droppableId !== destination.droppableId) {
      const destCount = tasks.filter((t) => t.column_id === destination.droppableId).length;
      if (destCount >= destCol.wip_limit) {
        toast({ title: 'Limite WIP atingido', description: `"${destCol.name}" está no limite (${destCol.wip_limit}).`, variant: 'destructive' });
        return;
      }
    }

    const colTasks = {};
    columns.forEach((c) => { colTasks[c.id] = filteredTasks.filter((t) => t.column_id === c.id).sort((a, b) => (a.position ?? 0) - (b.position ?? 0)); });
    const [moved] = colTasks[source.droppableId].splice(source.index, 1);
    if (!moved) return;
    colTasks[destination.droppableId].splice(destination.index, 0, moved);

    const updates = [];
    Object.keys(colTasks).forEach((colId) => {
      colTasks[colId].forEach((t, i) => {
        if (t.position !== i || t.column_id !== colId) {
          t.position = i; t.column_id = colId;
          updates.push({ id: t.id, position: i, column_id: colId });
        }
      });
    });

    setTasks((prev) => prev.map((t) => {
      const u = updates.find((x) => x.id === t.id);
      return u ? { ...t, position: u.position, column_id: u.column_id } : t;
    }));

    if (updates.length) {
      try {
        for (const u of updates) {
          await tasksApi.update(u.id, { position: u.position, column_id: u.column_id });
        }
      } catch (e) { toast({ title: 'Falha ao salvar ordem', variant: 'destructive' }); loadData(); }
    }
  };

  const addTask = async (columnId, title) => {
    const colTasks = tasks.filter((t) => t.column_id === columnId);
    const created = await tasksApi.create({
      title, column_id: columnId, board_id: board.id, project_id: currentProject.id, position: colTasks.length,
    });
    setTasks((prev) => [...prev, created]);
  };

  const addColumn = async () => {
    if (!newColumnName.trim()) return;
    const created = await columnsApi.create({ name: newColumnName.trim(), board_id: board.id, position: columns.length });
    setColumns((prev) => [...prev, created]);
    setNewColumnName(''); setAddingColumn(false);
  };

  const renameColumn = async (id, name) => {
    await columnsApi.update(id, { name });
    setColumns((prev) => prev.map((c) => (c.id === id ? { ...c, name } : c)));
  };

  const deleteColumn = async (id) => {
    const colTasks = tasks.filter((t) => t.column_id === id);
    for (const t of colTasks) {
      await tasksApi.delete(t.id);
    }
    await columnsApi.delete(id);
    setColumns((prev) => prev.filter((c) => c.id !== id));
    setTasks((prev) => prev.filter((t) => t.column_id !== id));
  };

  const toggleWip = async (id) => {
    const col = columns.find((c) => c.id === id);
    const next = { wip_enabled: !col.wip_enabled, wip_limit: !col.wip_enabled ? (col.wip_limit || 3) : col.wip_limit };
    await columnsApi.update(id, next);
    setColumns((prev) => prev.map((c) => (c.id === id ? { ...c, ...next } : c)));
  };

  const setWipLimit = async (id, value) => {
    await columnsApi.update(id, { wip_limit: value, wip_enabled: true });
    setColumns((prev) => prev.map((c) => (c.id === id ? { ...c, wip_limit: value, wip_enabled: true } : c)));
  };

  const updateTask = (updated) => {
    setTasks((prev) => prev.map((t) => (t.id === updated.id ? updated : t)));
    setSelectedTask(updated);
  };

  const deleteTask = async (id) => {
    await tasksApi.delete(id);
    setTasks((prev) => prev.filter((t) => t.id !== id));
    setSelectedTask(null);
  };

  if (loading) {
    return <div className="flex-1 flex items-center justify-center"><Loader2 className="w-6 h-6 animate-spin text-muted-foreground" /></div>;
  }

  return (
    <div className="flex-1 flex flex-col overflow-hidden">
      <div className="px-6 py-4 border-b border-border bg-background/80 backdrop-blur">
        <div className="flex items-center justify-between gap-4 flex-wrap">
          <div>
            <h1 className="text-xl font-semibold">{board?.name}</h1>
            <p className="text-sm text-muted-foreground">{tasks.length} tarefas · {columns.length} colunas</p>
          </div>
          <div className="flex items-center gap-2 flex-wrap">
            <div className="relative">
              <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Buscar..." className="pl-8 h-9 w-44" />
            </div>
            <Select value={priorityFilter} onValueChange={setPriorityFilter}>
              <SelectTrigger className="h-9 w-36"><SelectValue placeholder="Prioridade" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todas as prioridades</SelectItem>
                {Object.entries(PRIORITIES).map(([k, v]) => <SelectItem key={k} value={k}>{v.label}</SelectItem>)}
              </SelectContent>
            </Select>
            {allLabels.length > 0 && (
              <Select value={labelFilter || 'all'} onValueChange={(v) => setLabelFilter(v === 'all' ? null : v)}>
                <SelectTrigger className="h-9 w-36"><SelectValue placeholder="Rótulo" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos os rótulos</SelectItem>
                  {allLabels.map((l) => <SelectItem key={l.name} value={l.name}>{l.name}</SelectItem>)}
                </SelectContent>
              </Select>
            )}
            {(search || priorityFilter !== 'all' || labelFilter) && (
              <Button variant="ghost" size="sm" onClick={() => { setSearch(''); setPriorityFilter('all'); setLabelFilter(null); }}>
                <X className="w-4 h-4" /> Limpar
              </Button>
            )}
          </div>
        </div>
      </div>

      <div className="flex-1 overflow-x-auto overflow-y-hidden scrollbar-thin">
        <DragDropContext onDragEnd={onDragEnd}>
          <div className="flex gap-3 p-4 h-full items-start">
            {columns.map((col) => (
              <BoardColumn
                key={col.id} column={col} tasks={tasksByColumn[col.id] || []}
                onCardClick={setSelectedTask} onAddTask={addTask}
                onRename={renameColumn} onDelete={deleteColumn}
                onToggleWip={toggleWip} onSetWipLimit={setWipLimit}
              />
            ))}
            <div className="w-72 flex-shrink-0">
              {addingColumn ? (
                <div className="bg-card rounded-xl border border-border p-3 space-y-2">
                  <Input autoFocus value={newColumnName} onChange={(e) => setNewColumnName(e.target.value)}
                    onKeyDown={(e) => { if (e.key === 'Enter') addColumn(); if (e.key === 'Escape') setAddingColumn(false); }}
                    placeholder="Nome da coluna..." />
                  <div className="flex gap-1.5">
                    <Button size="sm" onClick={addColumn}>Adicionar coluna</Button>
                    <Button size="sm" variant="ghost" onClick={() => setAddingColumn(false)}>Cancelar</Button>
                  </div>
                </div>
              ) : (
                <button onClick={() => setAddingColumn(true)} className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground px-3 py-2 w-full rounded-xl border border-dashed border-border hover:bg-muted/40 transition-colors">
                  <Plus className="w-4 h-4" /> Adicionar coluna
                </button>
              )}
            </div>
          </div>
        </DragDropContext>
      </div>

      {selectedTask && (
        <TaskDetailModal
          task={selectedTask} columns={columns}
          onClose={() => setSelectedTask(null)} onUpdate={updateTask} onDelete={deleteTask}
        />
      )}
    </div>
  );
}