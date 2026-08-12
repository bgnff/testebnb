import { useState } from 'react';
import { tasksApi } from '@/lib/api/tasks';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/ui/dialog';
import { Input } from '@/ui/input';
import { Button } from '@/ui/button';
import { Label } from '@/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/ui/select';
import { useProject } from '@/lib/project-context';
import { ensureBoard, PRIORITIES, todayStr } from '@/lib/kanban-utils';
import { useToast } from '@/ui/use-toast';
import { Loader2 } from 'lucide-react';

export default function QuickAddTask({ open, onClose }) {
  const { currentProject } = useProject();
  const { toast } = useToast();
  const [title, setTitle] = useState('');
  const [priority, setPriority] = useState('medium');
  const [dueDate, setDueDate] = useState('');
  const [saving, setSaving] = useState(false);

  const reset = () => { setTitle(''); setPriority('medium'); setDueDate(''); };

  const handleSubmit = async () => {
    if (!title.trim()) return;
    setSaving(true);
    try {
      const { board, columns } = await ensureBoard(currentProject.id);
      const firstCol = columns[0];
      const colTasks = await tasksApi.list(firstCol.id);
      await tasksApi.create({
        title: title.trim(),
        column_id: firstCol.id,
        board_id: board.id,
        project_id: currentProject.id,
        position: colTasks.length,
        priority,
        due_date: dueDate || undefined,
      });
      toast({ title: 'Tarefa criada' });
      reset();
      onClose();
    } catch (e) {
      toast({ title: 'Não foi possível criar a tarefa', description: e.message, variant: 'destructive' });
    } finally {
      setSaving(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={(o) => { if (!o) { reset(); onClose(); } }}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Adicionar tarefa</DialogTitle>
        </DialogHeader>
        <div className="space-y-4 py-2">
          <div className="space-y-2">
            <Label htmlFor="q-title">Título da tarefa</Label>
            <Input id="q-title" autoFocus value={title} onChange={(e) => setTitle(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && handleSubmit()} placeholder="O que precisa ser feito?" />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-2">
              <Label>Prioridade</Label>
              <Select value={priority} onValueChange={setPriority}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  {Object.entries(PRIORITIES).map(([k, v]) => (
                    <SelectItem key={k} value={k}>
                      <span className="flex items-center gap-2"><span className={`w-2 h-2 rounded-full ${v.dot}`} />{v.label}</span>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="q-due">Data de vencimento</Label>
              <Input id="q-due" type="date" value={dueDate} onChange={(e) => setDueDate(e.target.value)} />
            </div>
          </div>
        </div>
        <DialogFooter>
          <Button variant="ghost" onClick={() => { reset(); onClose(); }}>Cancelar</Button>
          <Button onClick={handleSubmit} disabled={saving || !title.trim()}>
            {saving && <Loader2 className="w-4 h-4 mr-1.5 animate-spin" />} Adicionar tarefa
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}