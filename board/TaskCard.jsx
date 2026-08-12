import { Calendar, MessageSquare, CheckSquare, Paperclip, Flag } from 'lucide-react';
import { PRIORITIES, isOverdue, isToday } from '@/lib/kanban-utils';

export default function TaskCard({ task, onClick }) {
  const priority = PRIORITIES[task.priority] || PRIORITIES.medium;
  const totalSubtasks = (task.subtasks || []).length;
  const completedSubtasks = (task.subtasks || []).filter((s) => s.completed).length;
  const due = task.due_date;
  const overdue = due && isOverdue(due) && !task.completed;
  const today = due && isToday(due);

  return (
    <div
      onClick={() => onClick(task)}
      className="group bg-card rounded-xl border border-border shadow-sm hover:shadow-md hover:border-primary/30 transition-all p-3 cursor-pointer"
    >
      {(task.labels || []).length > 0 && (
        <div className="flex flex-wrap gap-1 mb-2">
          {task.labels.map((l, i) => (
            <span key={i} className="px-1.5 py-0.5 rounded text-[10px] font-medium" style={{ backgroundColor: l.color + '22', color: l.color }}>
              {l.name}
            </span>
          ))}
        </div>
      )}
      <p className={`text-sm font-medium leading-snug ${task.completed ? 'line-through text-muted-foreground' : ''}`}>{task.title}</p>
      {task.description && <p className="text-xs text-muted-foreground mt-1 line-clamp-2">{task.description}</p>}
      <div className="flex items-center gap-2.5 mt-2.5 text-xs text-muted-foreground">
        {due && (
          <span className={`inline-flex items-center gap-1 ${overdue ? 'text-red-500 font-medium' : today ? 'text-amber-500 font-medium' : ''}`}>
            <Calendar className="w-3 h-3" />
            {new Date(due + 'T00:00').toLocaleDateString('pt-BR', { month: 'short', day: 'numeric' })}
          </span>
        )}
        {totalSubtasks > 0 && (
          <span className="inline-flex items-center gap-1">
            <CheckSquare className="w-3 h-3" />{completedSubtasks}/{totalSubtasks}
          </span>
        )}
        {(task.comments || []).length > 0 && (
          <span className="inline-flex items-center gap-1">
            <MessageSquare className="w-3 h-3" />{task.comments.length}
          </span>
        )}
        {(task.attachments || []).length > 0 && <Paperclip className="w-3 h-3" />}
        <span className="ml-auto inline-flex items-center" style={{ color: priority.color }}>
          <Flag className="w-3 h-3" />
        </span>
      </div>
    </div>
  );
}