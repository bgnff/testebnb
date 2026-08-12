import { Droppable, Draggable } from '@hello-pangea/dnd';
import { format, isToday } from 'date-fns';
import { Users } from 'lucide-react';
import { PRIORITIES } from '@/lib/kanban-utils';

export default function CalendarDayCell({ day, tasks, notes, meetings = [], maxTasks, maxNotes = 2, minHeight, dimmed, onClick, onTaskClick, onMeetingClick }) {
  const dateStr = format(day, 'yyyy-MM-dd');
  const today = isToday(day);

  return (
    <Droppable droppableId={dateStr}>
      {(provided, snapshot) => (
        <div
          ref={provided.innerRef} {...provided.droppableProps}
          onClick={() => onClick(dateStr)}
          className={`rounded-lg border p-1.5 cursor-pointer transition-colors ${dimmed ? 'bg-muted/30 border-transparent' : 'bg-card border-border'} ${snapshot.isDraggingOver ? 'border-primary border-2' : ''} ${today ? 'ring-1 ring-primary' : ''}`}
          style={{ minHeight }}
        >
          <div className="flex items-center justify-between mb-1">
            <span className={`text-xs font-medium ${today ? 'bg-primary text-primary-foreground w-5 h-5 rounded-full flex items-center justify-center' : dimmed ? 'text-muted-foreground/50' : 'text-foreground'}`}>
              {format(day, 'd')}
            </span>
          </div>
          <div className="space-y-0.5">
            {meetings.slice(0, 2).map((m) => (
              <div
                key={m.id}
                onClick={(e) => { e.stopPropagation(); onMeetingClick(m); }}
                className="text-[10px] leading-tight px-1.5 py-0.5 rounded truncate bg-primary/10 text-primary border border-primary/20 hover:bg-primary hover:text-primary-foreground transition-colors flex items-center gap-1"
                title={`Reunião: ${m.name}${m.meeting_time ? ` ${m.meeting_time}` : ''}`}
              >
                <Users className="w-2.5 h-2.5 flex-shrink-0" />
                <span className="truncate">{m.name}</span>
              </div>
            ))}
            {tasks.slice(0, maxTasks).map((t, i) => {
              const p = PRIORITIES[t.priority] || PRIORITIES.medium;
              const lc = t.labels?.[0]?.color || p.color;
              return (
                <Draggable key={t.id} draggableId={t.id} index={i}>
                  {(p2) => (
                    <div
                      ref={p2.innerRef} {...p2.draggableProps} {...p2.dragHandleProps}
                      onClick={(e) => { e.stopPropagation(); onTaskClick(t); }}
                      className={`text-[10px] leading-tight px-1.5 py-0.5 rounded truncate text-white ${t.completed ? 'opacity-50 line-through' : ''}`}
                      style={{ backgroundColor: lc }}
                      title={t.title}
                    >
                      {t.title}
                    </div>
                  )}
                </Draggable>
              );
            })}
            {tasks.length > maxTasks && <div className="text-[10px] text-muted-foreground px-1">+{tasks.length - maxTasks} tarefas</div>}
            {notes.slice(0, maxNotes).map((n) => (
              <div
                key={n.id}
                className="text-[10px] leading-tight px-1.5 py-0.5 rounded truncate border-l-2 bg-muted/40"
                style={{ borderColor: n.color }}
                title={n.content}
              >
                <span className="text-muted-foreground">{n.content}</span>
              </div>
            ))}
            {notes.length > maxNotes && <div className="text-[10px] text-muted-foreground px-1">+{notes.length - maxNotes} notas</div>}
          </div>
          {provided.placeholder}
        </div>
      )}
    </Droppable>
  );
}