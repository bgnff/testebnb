import { useState, useRef } from 'react';
import { supabase } from '@/lib/supabaseClient';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/ui/dialog';
import { Input } from '@/ui/input';
import { Textarea } from '@/ui/textarea';
import { Button } from '@/ui/button';
import { Label } from '@/ui/label';
import { Checkbox } from '@/ui/checkbox';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/ui/select';
import { useAuth } from '@/lib/AuthContext';
import { PRIORITIES, LABEL_COLORS } from '@/lib/kanban-utils';
import {
  Trash2, Plus, X, Upload, MessageSquare, CheckSquare, Tag, Calendar, Flag, MoveRight,
} from 'lucide-react';

export default function TaskDetailModal({ task, columns, onClose, onUpdate, onDelete }) {
  const { user } = useAuth();
  const [newSubtask, setNewSubtask] = useState('');
  const [newComment, setNewComment] = useState('');
  const [newLabel, setNewLabel] = useState('');
  const [newAttachment, setNewAttachment] = useState('');
  const [uploading, setUploading] = useState(false);
  const fileRef = useRef(null);

  const update = (changes) => onUpdate({ ...task, ...changes });

  const priority = PRIORITIES[task.priority] || PRIORITIES.medium;

  const addSubtask = () => {
    if (!newSubtask.trim()) return;
    update({ subtasks: [...(task.subtasks || []), { title: newSubtask.trim(), completed: false }] });
    setNewSubtask('');
  };
  const toggleSubtask = (i) => {
    const subtasks = [...(task.subtasks || [])];
    subtasks[i] = { ...subtasks[i], completed: !subtasks[i].completed };
    update({ subtasks });
  };
  const removeSubtask = (i) => update({ subtasks: (task.subtasks || []).filter((_, idx) => idx !== i) });

  const addComment = () => {
    if (!newComment.trim()) return;
    update({ comments: [...(task.comments || []), { author: user?.full_name || user?.email || 'Você', text: newComment.trim(), created_date: new Date().toISOString() }] });
    setNewComment('');
  };

  const addLabel = () => {
    if (!newLabel.trim()) return;
    const color = LABEL_COLORS[(task.labels || []).length % LABEL_COLORS.length];
    update({ labels: [...(task.labels || []), { name: newLabel.trim(), color }] });
    setNewLabel('');
  };

  const addAttachment = (url, name) => {
    if (!url.trim()) return;
    update({ attachments: [...(task.attachments || []), { name: name || url, url: url.trim() }] });
    setNewAttachment('');
  };

  const handleUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    try {
      const fileExt = file.name.split('.').pop();
      const fileName = `${task.id}-${Date.now()}.${fileExt}`;
      const { data, error } = await supabase.storage
        .from('task-attachments')
        .upload(fileName, file);
      
      if (error) throw error;
      
      const { data: { publicUrl } } = supabase.storage
        .from('task-attachments')
        .getPublicUrl(fileName);
      
      addAttachment(publicUrl, file.name);
    } catch (error) {
      console.error('Upload error:', error);
    } finally {
      setUploading(false);
      if (fileRef.current) fileRef.current.value = '';
    }
  };

  const currentColumn = columns.find((c) => c.id === task.column_id);

  return (
    <Dialog open={!!task} onOpenChange={(o) => !o && onClose()}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader className="sr-only">
          <DialogTitle>{task.title}</DialogTitle>
        </DialogHeader>

        <input
          defaultValue={task.title}
          onBlur={(e) => { if (e.target.value.trim() && e.target.value !== task.title) update({ title: e.target.value.trim() }); }}
          className="text-xl font-semibold bg-transparent outline-none w-full focus:border-b focus:border-primary"
        />

        <div className="flex flex-wrap items-center gap-2 mt-1 mb-4">
          <span className={`inline-flex items-center gap-1 text-xs px-2 py-1 rounded-full ${priority.chip}`}>
            <Flag className="w-3 h-3" /> {priority.label}
          </span>
          {currentColumn && (
            <span className="inline-flex items-center gap-1 text-xs px-2 py-1 rounded-full bg-muted text-muted-foreground">
              <MoveRight className="w-3 h-3" /> {currentColumn.name}
            </span>
          )}
          <button
            onClick={() => update({ completed: !task.completed })}
            className={`text-xs px-2 py-1 rounded-full cursor-pointer ${task.completed ? 'bg-emerald-100 text-emerald-700' : 'bg-muted text-muted-foreground hover:bg-muted/70'}`}
          >
            {task.completed ? '✓ Concluída' : 'Marcar como concluída'}
          </button>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-1.5">
            <Label className="text-xs flex items-center gap-1.5 text-muted-foreground"><Flag className="w-3.5 h-3.5" /> Prioridade</Label>
            <Select value={task.priority} onValueChange={(v) => update({ priority: v })}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                {Object.entries(PRIORITIES).map(([k, v]) => <SelectItem key={k} value={k}>{v.label}</SelectItem>)}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-1.5">
            <Label className="text-xs flex items-center gap-1.5 text-muted-foreground"><Calendar className="w-3.5 h-3.5" /> Data de vencimento</Label>
            <Input type="date" value={task.due_date || ''} onChange={(e) => update({ due_date: e.target.value })} />
          </div>
          <div className="space-y-1.5 col-span-2">
            <Label className="text-xs text-muted-foreground">Responsável</Label>
            <Input value={task.assignee || ''} onChange={(e) => update({ assignee: e.target.value })} placeholder="Sem responsável" />
          </div>
          <div className="space-y-1.5 col-span-2">
            <Label className="text-xs text-muted-foreground">Mover para coluna</Label>
            <Select value={task.column_id} onValueChange={(v) => update({ column_id: v })}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                {columns.map((c) => <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>)}
              </SelectContent>
            </Select>
          </div>
        </div>

        <div className="space-y-1.5 mt-4">
          <Label className="text-xs flex items-center gap-1.5 text-muted-foreground"><Tag className="w-3.5 h-3.5" /> Rótulos</Label>
          <div className="flex flex-wrap gap-1.5 items-center">
            {(task.labels || []).map((l, i) => (
              <span key={i} className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs" style={{ backgroundColor: l.color + '22', color: l.color }}>
                {l.name}
                <button onClick={() => update({ labels: task.labels.filter((_, idx) => idx !== i) })}><X className="w-3 h-3" /></button>
              </span>
            ))}
            <div className="flex items-center gap-1">
              <input value={newLabel} onChange={(e) => setNewLabel(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && addLabel()} placeholder="+ rótulo" className="text-xs px-2 py-0.5 rounded-full border border-border bg-background outline-none w-24 focus:ring-1 focus:ring-ring" />
            </div>
          </div>
        </div>

        <div className="space-y-1.5 mt-4">
          <Label className="text-xs text-muted-foreground">Descrição</Label>
          <Textarea value={task.description || ''} onChange={(e) => update({ description: e.target.value })} placeholder="Adicione uma descrição..." rows={3} />
        </div>

        <div className="space-y-2 mt-4">
          <Label className="text-xs flex items-center gap-1.5 text-muted-foreground"><CheckSquare className="w-3.5 h-3.5" /> Subtarefas {(task.subtasks || []).length > 0 && `(${(task.subtasks || []).filter((s) => s.completed).length}/${(task.subtasks || []).length})`}</Label>
          {(task.subtasks || []).map((s, i) => (
            <div key={i} className="flex items-center gap-2 group">
              <Checkbox checked={s.completed} onCheckedChange={() => toggleSubtask(i)} />
              <span className={`flex-1 text-sm ${s.completed ? 'line-through text-muted-foreground' : ''}`}>{s.title}</span>
              <button onClick={() => removeSubtask(i)} className="opacity-0 group-hover:opacity-100 text-muted-foreground hover:text-destructive"><X className="w-3.5 h-3.5" /></button>
            </div>
          ))}
          <div className="flex items-center gap-2">
            <Input value={newSubtask} onChange={(e) => setNewSubtask(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && addSubtask()} placeholder="Adicionar subtarefa..." className="h-8 text-sm" />
            <Button size="sm" variant="ghost" onClick={addSubtask}><Plus className="w-4 h-4" /></Button>
          </div>
        </div>

        <div className="space-y-2 mt-4">
          <Label className="text-xs flex items-center gap-1.5 text-muted-foreground"><MessageSquare className="w-3.5 h-3.5" /> Comentários {(task.comments || []).length > 0 && `(${(task.comments || []).length})`}</Label>
          <div className="space-y-3">
            {(task.comments || []).map((c, i) => (
              <div key={i} className="flex gap-2">
                <span className="w-6 h-6 rounded-full bg-primary/15 text-primary flex items-center justify-center text-[10px] font-semibold flex-shrink-0">{(c.author || 'U').charAt(0).toUpperCase()}</span>
                <div className="flex-1 bg-muted/60 rounded-lg p-2">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-medium">{c.author}</span>
                    <span className="text-[10px] text-muted-foreground">{c.created_date ? new Date(c.created_date).toLocaleString('pt-BR', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' }) : ''}</span>
                  </div>
                  <p className="text-sm mt-0.5">{c.text}</p>
                </div>
              </div>
            ))}
          </div>
          <div className="flex items-center gap-2">
            <Input value={newComment} onChange={(e) => setNewComment(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && addComment()} placeholder="Escreva um comentário..." className="h-9 text-sm" />
            <Button size="sm" onClick={addComment}>Enviar</Button>
          </div>
        </div>

        <div className="space-y-2 mt-4">
          <Label className="text-xs text-muted-foreground">Anexos</Label>
          {(task.attachments || []).length > 0 && (
            <div className="space-y-1">
              {(task.attachments || []).map((a, i) => (
                <a key={i} href={a.url} target="_blank" rel="noreferrer" className="flex items-center gap-2 text-sm hover:underline text-primary">
                  <span className="truncate">{a.name}</span>
                </a>
              ))}
            </div>
          )}
          <div className="flex items-center gap-2">
            <Input value={newAttachment} onChange={(e) => setNewAttachment(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && addAttachment(newAttachment)} placeholder="Cole a URL do anexo..." className="h-9 text-sm" />
            <Button size="sm" variant="outline" onClick={() => fileRef.current?.click()} disabled={uploading}>
              <Upload className="w-4 h-4" /> {uploading ? 'Enviando...' : 'Enviar arquivo'}
            </Button>
            <input ref={fileRef} type="file" className="hidden" onChange={handleUpload} />
          </div>
        </div>

        <div className="flex justify-between items-center pt-4 border-t border-border mt-4">
          <Button variant="ghost" className="text-destructive hover:text-destructive" onClick={() => { if (confirm('Excluir esta tarefa?')) onDelete(task.id); }}>
            <Trash2 className="w-4 h-4 mr-1.5" /> Excluir
          </Button>
          <Button onClick={onClose}>Concluído</Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}