import { NavLink } from 'react-router-dom';
import { useProject } from '@/lib/project-context';
import { useAuth } from '@/lib/AuthContext';
import { useTheme } from 'next-themes';
import { Button } from '@/ui/button';
import {
  LayoutDashboard, KanbanSquare, CalendarDays, ListChecks,
  Settings as SettingsIcon, Plus, Moon, Sun, ChevronsUpDown, LogOut, Check, Download, Users,
} from 'lucide-react';
import NotificationCenter from '@/NotificationCenter';
import { useState, useRef, useEffect } from 'react';
import { cn } from '@/lib/utils';

const NAV = [
  { to: '/', label: 'Painel', icon: LayoutDashboard, end: true },
  { to: '/board', label: 'Quadro', icon: KanbanSquare },
  { to: '/calendar', label: 'Calendário', icon: CalendarDays },
  { to: '/tasks', label: 'Tarefas', icon: ListChecks },
  { to: '/sales', label: 'Vendas & Clientes', icon: Users },
  { to: '/downloads', label: 'Downloads', icon: Download },
];

const PROJECT_ICON_MAP = {
  LayoutDashboard, FolderKanban: LayoutDashboard, Rocket: LayoutDashboard,
  Briefcase: LayoutDashboard, Heart: LayoutDashboard, GraduationCap: LayoutDashboard,
  ShoppingCart: LayoutDashboard, Plane: LayoutDashboard,
};

function getProjectIcon(icon) {
  return PROJECT_ICON_MAP[icon] || LayoutDashboard;
}

export default function Sidebar({ onQuickAdd }) {
  const { projects, currentProject, setCurrentProject, createProject } = useProject();
  const { user, logout } = useAuth();
  const { theme, setTheme } = useTheme();
  const [projectMenu, setProjectMenu] = useState(false);
  const [userMenu, setUserMenu] = useState(false);
  const [newProject, setNewProject] = useState(false);
  const [projectName, setProjectName] = useState('');
  const ref = useRef(null);

  useEffect(() => {
    const handler = (e) => { if (ref.current && !ref.current.contains(e.target)) { setProjectMenu(false); setUserMenu(false); } };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const ProjectIcon = getProjectIcon(currentProject?.icon);

  const handleCreateProject = async () => {
    if (!projectName.trim()) return;
    await createProject({ name: projectName.trim(), color: '#7c3aed', icon: 'LayoutDashboard' });
    setProjectName(''); setNewProject(false); setProjectMenu(false);
  };

  return (
    <aside className="w-64 flex-shrink-0 hidden md:flex flex-col border-r border-border bg-sidebar text-sidebar-foreground">
      <div className="p-4" ref={ref}>
        <button
          onClick={() => setProjectMenu((v) => !v)}
          className="w-full flex items-center gap-2 px-2.5 py-2 rounded-lg hover:bg-sidebar-accent transition-colors"
        >
          <span className="w-7 h-7 rounded-md flex items-center justify-center text-white text-xs font-semibold" style={{ backgroundColor: currentProject?.color || '#7c3aed' }}>
            <ProjectIcon className="w-4 h-4" />
          </span>
          <span className="flex-1 text-left text-sm font-semibold truncate">{currentProject?.name || 'Carregando...'}</span>
          <ChevronsUpDown className="w-4 h-4 text-muted-foreground" />
        </button>

        {projectMenu && (
          <div className="mt-1.5 w-full rounded-xl border border-border bg-popover shadow-lg p-1.5 z-50">
            <div className="max-h-52 overflow-y-auto scrollbar-thin">
              {projects.map((p) => {
                const I = getProjectIcon(p.icon);
                return (
                  <button key={p.id} onClick={() => { setCurrentProject(p); setProjectMenu(false); }} className="w-full flex items-center gap-2 px-2 py-1.5 rounded-md hover:bg-accent text-sm">
                    <span className="w-5 h-5 rounded flex items-center justify-center text-white" style={{ backgroundColor: p.color }}><I className="w-3 h-3" /></span>
                    <span className="flex-1 text-left truncate">{p.name}</span>
                    {currentProject?.id === p.id && <Check className="w-3.5 h-3.5 text-primary" />}
                  </button>
                );
              })}
            </div>
            <div className="h-px bg-border my-1" />
            {newProject ? (
              <div className="p-1.5 space-y-2">
                <input autoFocus value={projectName} onChange={(e) => setProjectName(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && handleCreateProject()} placeholder="Nome do projeto" className="w-full px-2 py-1.5 rounded-md bg-background border border-border text-sm outline-none focus:ring-2 focus:ring-ring" />
                <div className="flex gap-1.5">
                  <Button size="sm" className="h-7 text-xs flex-1" onClick={handleCreateProject}>Criar</Button>
                  <Button size="sm" variant="ghost" className="h-7 text-xs" onClick={() => setNewProject(false)}>Cancelar</Button>
                </div>
              </div>
            ) : (
              <button onClick={() => setNewProject(true)} className="w-full flex items-center gap-2 px-2 py-1.5 rounded-md hover:bg-accent text-sm text-muted-foreground">
                <Plus className="w-4 h-4" /> Novo projeto
              </button>
            )}
          </div>
        )}
      </div>

      <nav className="flex-1 px-3 space-y-0.5">
        {NAV.map((item) => (
          <NavLink key={item.to} to={item.to} end={item.end}
            className={({ isActive }) => cn('flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors',
              isActive ? 'bg-sidebar-accent text-sidebar-accent-foreground' : 'text-muted-foreground hover:text-sidebar-foreground hover:bg-sidebar-accent/60')}>
            <item.icon className="w-4 h-4" />
            {item.label}
          </NavLink>
        ))}
      </nav>

      <div className="p-3 space-y-1.5 border-t border-border">
        <Button onClick={onQuickAdd} className="w-full h-10 rounded-lg shadow-sm">
          <Plus className="w-4 h-4 mr-1.5" /> Adicionar tarefa
        </Button>
        <div className="flex items-center gap-1.5">
          <NotificationCenter className="flex-1 h-9 flex items-center justify-center rounded-lg hover:bg-sidebar-accent" iconSize="w-4 h-4" />
          <Button variant="ghost" size="icon" className="flex-1 h-9" onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}>
            {theme === 'dark' ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
          </Button>
          <NavLink to="/settings" className="flex-1">
            <Button variant="ghost" className="w-full h-9"><SettingsIcon className="w-4 h-4" /></Button>
          </NavLink>
        </div>
        <div className="relative">
          <button onClick={() => setUserMenu((v) => !v)} className="w-full flex items-center gap-2 px-2 py-1.5 rounded-lg hover:bg-sidebar-accent transition-colors">
            <span className="w-7 h-7 rounded-full bg-primary/15 text-primary flex items-center justify-center text-xs font-semibold">
              {(user?.full_name || user?.email || 'U').charAt(0).toUpperCase()}
            </span>
            <span className="flex-1 text-left text-xs truncate">{user?.full_name || user?.email}</span>
          </button>
          {userMenu && (
            <div className="absolute bottom-full left-0 right-0 mb-1 rounded-xl border border-border bg-popover shadow-lg p-1.5">
              <button onClick={() => logout()} className="w-full flex items-center gap-2 px-2 py-1.5 rounded-md hover:bg-accent text-sm text-destructive">
                <LogOut className="w-4 h-4" /> Sair
              </button>
            </div>
          )}
        </div>
      </div>
    </aside>
  );
}