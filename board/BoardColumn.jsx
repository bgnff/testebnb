import { useState } from 'react';
import { Droppable, Draggable } from '@hello-pangea/dnd';
import TaskCard from '@/board/TaskCard';
import { Input } from '@/ui/input';
import { Button } from '@/ui/button';
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger, DropdownMenuSeparator,
} from '@/ui/dropdown-menu';
import { MoreHorizontal, Plus, AlertTriangle } from 'lucide-react';

export default function BoardColumn({
  column, tasks, onCardClick, onAddTask, onRename, onDelete, onToggleWip, onSetWipLimit,
}) {
  const [adding, setAdding] = useState(false);
  const [title, setTitle] = useState('');
  const [editingName, setEditingName] = useState(false);
  const [nameValue, setNameValue] = useState(column.name);

  const overLimit = column.wip_enabled && column.wip_limit && tasks.length > column.wip_limit;

  const submit = () => {
    if (title.trim()) onAddTask(column.id, title.trim());
    setTitle(''); setAdding(false);
  };

  const commitName = () => {
    if (nameValue.trim() && nameValue !== column.name) onRename(column.id, nameValue.trim());
    setEditingName(false);
  };

  return (
    <div className="w-72 flex-shrink-0 flex flex-col max-h-full">
      <div className="flex items-center gap-2 px-1 mb-2">
        {editingName ? (
          <input
            autoFocus value={nameValue} onChange={(e) => setNameValue(e.target.value)}
            onBlur={commitName} onKeyDown={(e) => { if (e.key === 'Enter') commitName(); if (e.key === 'Escape') setEditingName(false); }}
            className="flex-1 bg-transparent border-b border-primary outline-none text-sm font-semibold"
          />
        ) : (
          <button onClick={() => setEditingName(true)} className="flex items-center gap-2 flex-1 text-left">
            <span className="w-2 h-2 rounded-full bg-primary/70" />
            <span className="text-sm font-semibold">{column.name}</span>
            <span className={`text-xs px-1.5 py-0.5 rounded-full ${overLimit ? 'bg-red-100 text-red-600' : 'bg-muted text-muted-foreground'}`}>{tasks.length}{column.wip_enabled && column.wip_limit ? `/${column.wip_limit}` : ''}</span>
            {overLimit && <AlertTriangle className="w-3.5 h-3.5 text-red-500" />}
          </button>
        )}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon" className="h-7 w-7"><MoreHorizontal className="w-4 h-4" /></Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem onClick={() => onToggleWip(column.id)}>
              {column.wip_enabled ? 'Desativar limite WIP' : 'Ativar limite WIP'}
            </DropdownMenuItem>
            {column.wip_enabled && (
              <DropdownMenuItem onClick={() => {
                const v = prompt('Limite WIP:', column.wip_limit || 3);
                if (v != null) onSetWipLimit(column.id, parseInt(v) || 0);
              }}>Definir valor do limite WIP</DropdownMenuItem>
            )}
            <DropdownMenuSeparator />
            <DropdownMenuItem className="text-destructive" onClick={() => { if (confirm('Excluir esta coluna e todas as suas tarefas?')) onDelete(column.id); }}>
              Excluir coluna
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      <Droppable droppableId={column.id}>
        {(provided, snapshot) => (
          <div
            ref={provided.innerRef} {...provided.droppableProps}
            className={`flex-1 rounded-xl p-1.5 space-y-2 min-h-[60px] transition-colors ${snapshot.isDraggingOver ? 'bg-primary/5' : ''}`}
          >
            {tasks.map((task, i) => (
              <Draggable key={task.id} draggableId={task.id} index={i}>
                {(p) => (
                  <div ref={p.innerRef} {...p.draggableProps} {...p.dragHandleProps}>
                    <TaskCard task={task} onClick={onCardClick} />
                  </div>
                )}
              </Draggable>
            ))}
            {provided.placeholder}
            {tasks.length === 0 && !adding && (
              <p className="text-xs text-muted-foreground/60 text-center py-6">Sem tarefas</p>
            )}
          </div>
        )}
      </Droppable>

      <div className="px-1 pt-1">
        {adding ? (
          <div className="space-y-1.5">
            <textarea
              autoFocus value={title} onChange={(e) => setTitle(e.target.value)}
              onKeyDown={(e) => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); submit(); } if (e.key === 'Escape') setAdding(false); }}
              placeholder="Título da tarefa..."
              className="w-full text-sm rounded-lg border border-border bg-card p-2 outline-none focus:ring-2 focus:ring-ring resize-none"
              rows={2}
            />
            <div className="flex gap-1.5">
              <Button size="sm" className="h-7 text-xs" onClick={submit}>Adicionar</Button>
              <Button size="sm" variant="ghost" className="h-7 text-xs" onClick={() => setAdding(false)}>Cancelar</Button>
            </div>
          </div>
        ) : (
          <button onClick={() => setAdding(true)} className="flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground px-2 py-1.5 rounded-lg hover:bg-muted/60 transition-colors w-full">
            <Plus className="w-4 h-4" /> Adicionar tarefa
          </button>
        )}
      </div>
    </div>
  );
}