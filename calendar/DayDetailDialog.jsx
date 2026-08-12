import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/ui/dialog';
import { Button } from '@/ui/button';
import { Textarea } from '@/ui/textarea';
import { Trash2, Plus, StickyNote, CalendarClock, Users } from 'lucide-react';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { PRIORITIES } from '@/lib/kanban-utils';

export default function DayDetailDialog({ date, tasks, notes, meetings = [], onClose, onAddNote, onDeleteNote, onTaskClick, onMeetingClick }) {
  const [content, setContent] = useState('');
  const [color, setColor] = useState('#7c3aed');

  const handleAdd = () => {
    if (!content.trim()) return;
    onAddNote(content.trim(), color);
    setContent('');
  };

  return (
    <Dialog open={!!date} onOpenChange={(o) => !o && onClose()}>
      <DialogContent className="max-w-lg max-h-[85vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="capitalize">{date ? format(new Date(date + 'T00:00'), "EEEE, d 'de' MMMM 'de' yyyy", { locale: ptBR }) : ''}</DialogTitle>
        </DialogHeader>

        <div className="space-y-3">
          {meetings.length > 0 && (
            <div>
              <h4 className="text-xs font-medium text-primary flex items-center gap-1.5 mb-2"><Users className="w-3.5 h-3.5" /> Reuniões de clientes ({meetings.length})</h4>
              <div className="space-y-1.5">
                {meetings.map((m) => (
                  <button key={m.id} onClick={() => { onMeetingClick(m); onClose(); }} className="w-full flex items-center gap-2 text-left px-2.5 py-1.5 rounded-lg bg-primary/5 hover:bg-primary/10 border border-primary/20 transition-colors">
                    <span className="w-1 h-5 rounded-full bg-primary flex-shrink-0" />
                    <span className="text-sm font-medium truncate">{m.name}</span>
                    {m.meeting_time && <span className="text-xs text-muted-foreground">{m.meeting_time}</span>}
                    {m.company && <span className="text-xs text-muted-foreground truncate flex-1">· {m.company}</span>}
                  </button>
                ))}
              </div>
            </div>
          )}

          <div>
            <h4 className="text-xs font-medium text-muted-foreground flex items-center gap-1.5 mb-2"><CalendarClock className="w-3.5 h-3.5" /> Tarefas do dia</h4>
            {tasks.length === 0 ? (
              <p className="text-sm text-muted-foreground/60 py-2">Sem tarefas para este dia.</p>
            ) : (
              <div className="space-y-1.5">
                {tasks.map((t) => {
                  const p = PRIORITIES[t.priority] || PRIORITIES.medium;
                  const lc = t.labels?.[0]?.color || p.color;
                  return (
                    <button key={t.id} onClick={() => { onTaskClick(t); onClose(); }} className="w-full flex items-center gap-2 text-left px-2.5 py-1.5 rounded-lg hover:bg-muted transition-colors">
                      <span className="w-1 h-5 rounded-full" style={{ backgroundColor: lc }} />
                      <span className={`text-sm flex-1 ${t.completed ? 'line-through text-muted-foreground' : ''}`}>{t.title}</span>
                      {t.assignee && <span className="text-xs text-muted-foreground">{t.assignee}</span>}
                    </button>
                  );
                })}
              </div>
            )}
          </div>

          <div>
            <h4 className="text-xs font-medium text-muted-foreground flex items-center gap-1.5 mb-2"><StickyNote className="w-3.5 h-3.5" /> Notas</h4>
            <div className="space-y-2">
              {notes.map((n) => (
                <div key={n.id} className="group flex gap-2 p-2.5 rounded-lg border-l-4 bg-muted/40" style={{ borderColor: n.color }}>
                  <p className="text-sm flex-1 whitespace-pre-wrap">{n.content}</p>
                  <button onClick={() => onDeleteNote(n.id)} className="opacity-0 group-hover:opacity-100 text-muted-foreground hover:text-destructive"><Trash2 className="w-3.5 h-3.5" /></button>
                </div>
              ))}
              {notes.length === 0 && <p className="text-sm text-muted-foreground/60 py-1">Sem notas para este dia.</p>}
            </div>
          </div>

          <div className="space-y-2 pt-2 border-t border-border">
            <Textarea value={content} onChange={(e) => setContent(e.target.value)} placeholder="Adicione uma nota para este dia..." rows={2} />
            <div className="flex items-center gap-2">
              <input type="color" value={color} onChange={(e) => setColor(e.target.value)} className="w-8 h-8 rounded cursor-pointer bg-transparent border border-border" />
              <Button size="sm" onClick={handleAdd} disabled={!content.trim()}><Plus className="w-4 h-4 mr-1" /> Adicionar nota</Button>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}