import { boardsApi } from '@/lib/api/boards';
import { columnsApi } from '@/lib/api/columns';
import { tasksApi } from '@/lib/api/tasks';

export const PRIORITIES = {
  low: { label: 'Baixa', color: '#64748b', dot: 'bg-slate-400', chip: 'bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-300' },
  medium: { label: 'Média', color: '#3b82f6', dot: 'bg-blue-500', chip: 'bg-blue-100 text-blue-600 dark:bg-blue-950 dark:text-blue-300' },
  high: { label: 'Alta', color: '#f59e0b', dot: 'bg-amber-500', chip: 'bg-amber-100 text-amber-600 dark:bg-amber-950 dark:text-amber-300' },
  urgent: { label: 'Urgente', color: '#ef4444', dot: 'bg-red-500', chip: 'bg-red-100 text-red-600 dark:bg-red-950 dark:text-red-300' },
};

export const PRIORITY_ORDER = ['urgent', 'high', 'medium', 'low'];

export const LABEL_COLORS = ['#7c3aed', '#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#ec4899', '#8b5cf6', '#14b8a6'];

export const PROJECT_ICONS = ['LayoutDashboard', 'FolderKanban', 'Rocket', 'Briefcase', 'Heart', 'GraduationCap', 'ShoppingCart', 'Plane'];

export function todayStr() {
  return new Date().toISOString().slice(0, 10);
}

export function isOverdue(dateStr) {
  if (!dateStr) return false;
  return dateStr < todayStr();
}

export function isToday(dateStr) {
  return dateStr === todayStr();
}

export async function ensureBoard(projectId) {
  let boards = await boardsApi.list(projectId);
  let board = boards[0];
  if (!board) {
    board = await boardsApi.create({ name: 'Quadro Principal', project_id: projectId });
  }
  let columns = await columnsApi.list(board.id);
  if (columns.length === 0) {
    const defaults = ['A Fazer', 'Em Andamento', 'Revisão', 'Concluído'];
    for (let i = 0; i < defaults.length; i++) {
      await columnsApi.create({ name: defaults[i], board_id: board.id, position: i });
    }
    columns = await columnsApi.list(board.id);
    // cria algumas tarefas de exemplo na primeira inicialização
    await tasksApi.create({ title: 'Bem-vindo ao seu quadro 👋', description: 'Clique neste cartão para ver detalhes, adicionar subtarefas, comentários e mais.', column_id: columns[0].id, board_id: board.id, project_id: projectId, position: 0, priority: 'medium', labels: [{ name: 'Primeiros passos', color: '#7c3aed' }] });
    await tasksApi.create({ title: 'Criar landing page', column_id: columns[1].id, board_id: board.id, project_id: projectId, position: 0, priority: 'high', due_date: todayStr() });
    await tasksApi.create({ title: 'Definir metas do projeto', column_id: columns[0].id, board_id: board.id, project_id: projectId, position: 1, priority: 'low' });
  }
  columns.sort((a, b) => (a.position ?? 0) - (b.position ?? 0));
  return { board, columns };
}