import { NavLink } from 'react-router-dom';
import { useProject } from '@/lib/project-context';
import { useAuth } from '@/lib/AuthContext';
import { useTheme } from 'next-themes';
import { Button } from '@/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/ui/dialog';
import { Input } from '@/ui/input';
import { Label } from '@/ui/label';
import { useToast } from '@/ui/use-toast';
import {
  LayoutDashboard, KanbanSquare, CalendarDays, ListChecks,
  Settings as SettingsIcon, Plus, Moon, Sun, ChevronsUpDown, LogOut, Check, Download, Users, Trash2, Upload,
} from 'lucide-react';
import NotificationCenter from '@/NotificationCenter';
import { useState, useRef, useEffect } from 'react';
import { cn } from '@/lib/utils';
import { supabase } from '@/lib/supabaseClient';
import { projectsApi } from '@/lib/api/projects';

const NAV = [
  { to: '/', label: 'Painel', icon: LayoutDashboard, end: true },
  { to: '/board', label: 'Quadro', icon: KanbanSquare },
  { to: '/calendar', label: 'Calendário', icon: CalendarDays },
  { to: '/tasks', label: 'Tarefas', icon: ListChecks },
  { to: '/sales', label: 'Vendas & Clientes', icon: Users },
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
  const { projects, currentProject, setCurrentProject, createProject, reload } = useProject();
  const { user, logout } = useAuth();
  const { theme, setTheme } = useTheme();
  const { toast } = useToast();
  const [projectMenu, setProjectMenu] = useState(false);
  const [userMenu, setUserMenu] = useState(false);
  const [newProjectOpen, setNewProjectOpen] = useState(false);
  const [deleteProjectOpen, setDeleteProjectOpen] = useState(false);
  const [projectToDelete, setProjectToDelete] = useState(null);
  const [projectName, setProjectName] = useState('');
  const [projectColor, setProjectColor] = useState('#7c3aed');
  const [projectLogo, setProjectLogo] = useState('');
  const [uploadingLogo, setUploadingLogo] = useState(false);
  const [savingProject, setSavingProject] = useState(false);
  const ref = useRef(null);
  const fileRef = useRef(null);

  useEffect(() => {
    const handler = (e) => { if (ref.current && !ref.current.contains(e.target)) { setProjectMenu(false); setUserMenu(false); } };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const ProjectIcon = getProjectIcon(currentProject?.icon);

  const handleLogoUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploadingLogo(true);
    try {
      const fileExt = file.name.split('.').pop();
      const fileName = `project-${Date.now()}.${fileExt}`;
      const { data, error } = await supabase.storage
        .from('project-logos')
        .upload(fileName, file);
      
      if (error) throw error;
      
      const { data: { publicUrl } } = supabase.storage
        .from('project-logos')
        .getPublicUrl(fileName);
      
      setProjectLogo(publicUrl);
    } catch (error) {
      toast({ title: 'Erro ao fazer upload', description: error.message, variant: 'destructive' });
    } finally {
      setUploadingLogo(false);
      if (fileRef.current) fileRef.current.value = '';
    }
  };

  const handleCreateProject = async () => {
    if (!projectName.trim()) return;
    setSavingProject(true);
    try {
      await createProject({ 
        name: projectName.trim(), 
        color: projectColor, 
        icon: 'LayoutDashboard',
        logo: projectLogo
      });
      setProjectName('');
      setProjectColor('#7c3aed');
      setProjectLogo('');
      setNewProjectOpen(false);
      toast({ title: 'Projeto criado com sucesso' });
    } catch (error) {
      toast({ title: 'Erro ao criar projeto', description: error.message, variant: 'destructive' });
    } finally {
      setSavingProject(false);
    }
  };

  const handleDeleteProject = async () => {
    if (!projectToDelete) return;
    setSavingProject(true);
    try {
      await projectsApi.delete(projectToDelete.id);
      await reload();
      if (currentProject?.id === projectToDelete.id) {
        const remaining = projects.filter(p => p.id !== projectToDelete.id);
        if (remaining.length > 0) {
          setCurrentProject(remaining[0]);
        }
      }
      setDeleteProjectOpen(false);
      setProjectToDelete(null);
      toast({ title: 'Projeto excluído com sucesso' });
    } catch (error) {
      toast({ title: 'Erro ao excluir projeto', description: error.message, variant: 'destructive' });
    } finally {
      setSavingProject(false);
    }
  };

  const openDeleteDialog = (project) => {
    setProjectToDelete(project);
    setDeleteProjectOpen(true);
    setProjectMenu(false);
  };

  return (
    <aside className="w-64 flex-shrink-0 hidden md:flex flex-col border-r border-border bg-sidebar text-sidebar-foreground">
      <div className="p-4" ref={ref}>
        <button
          onClick={() => setProjectMenu((v) => !v)}
          className="w-full flex items-center gap-3 px-2.5 py-2 rounded-lg hover:bg-sidebar-accent transition-all duration-200 hover:shadow-sm group"
        >
          {currentProject?.logo ? (
            <img 
              src={currentProject.logo} 
              alt={currentProject.name}
              className="w-10 h-10 rounded-lg object-cover shadow-sm group-hover:shadow-glow-sm transition-shadow"
            />
          ) : (
            <span className="w-10 h-10 rounded-lg flex items-center justify-center text-white text-sm font-semibold shadow-sm group-hover:shadow-glow-sm transition-shadow" style={{ backgroundColor: currentProject?.color || '#7c3aed' }}>
              <ProjectIcon className="w-5 h-5" />
            </span>
          )}
          <span className="flex-1 text-left text-sm font-semibold truncate">{currentProject?.name || 'Carregando...'}</span>
          <ChevronsUpDown className="w-4 h-4 text-muted-foreground group-hover:text-sidebar-foreground transition-colors" />
        </button>

        {projectMenu && (
          <div className="mt-1.5 w-full rounded-xl border border-border bg-popover shadow-lg p-1.5 z-50 animate-scale-in">
            <div className="max-h-52 overflow-y-auto scrollbar-thin">
              {projects.map((p) => {
                const I = getProjectIcon(p.icon);
                return (
                  <div key={p.id} className="flex items-center gap-2">
                    <button onClick={() => { setCurrentProject(p); setProjectMenu(false); }} className="flex-1 flex items-center gap-2 px-2 py-1.5 rounded-md hover:bg-accent text-sm transition-colors">
                      {p.logo ? (
                        <img 
                          src={p.logo} 
                          alt={p.name}
                          className="w-8 h-8 rounded-lg object-cover shadow-sm"
                        />
                      ) : (
                        <span className="w-8 h-8 rounded-lg flex items-center justify-center text-white shadow-sm" style={{ backgroundColor: p.color }}><I className="w-4 h-4" /></span>
                      )}
                      <span className="flex-1 text-left truncate">{p.name}</span>
                      {currentProject?.id === p.id && <Check className="w-3.5 h-3.5 text-primary" />}
                    </button>
                    {projects.length > 1 && (
                      <button onClick={() => openDeleteDialog(p)} className="p-1.5 rounded-md hover:bg-destructive/10 text-destructive transition-colors">
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>
                );
              })}
            </div>
            <div className="h-px bg-border my-1" />
            <button onClick={() => { setNewProjectOpen(true); setProjectMenu(false); }} className="w-full flex items-center gap-2 px-2 py-1.5 rounded-md hover:bg-accent text-sm text-muted-foreground transition-colors">
              <Plus className="w-4 h-4" /> Novo projeto
            </button>
          </div>
        )}
      </div>

      <nav className="flex-1 px-3 space-y-0.5">
        {NAV.map((item) => (
          <NavLink key={item.to} to={item.to} end={item.end}
            className={({ isActive }) => cn('flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-all duration-200',
              isActive 
                ? 'bg-sidebar-accent text-sidebar-accent-foreground shadow-sm' 
                : 'text-muted-foreground hover:text-sidebar-foreground hover:bg-sidebar-accent/60 hover:shadow-sm')}>
            <item.icon className="w-4 h-4" />
            {item.label}
          </NavLink>
        ))}
      </nav>

      <div className="p-3 space-y-1.5 border-t border-border">
        <Button onClick={onQuickAdd} className="w-full h-10 rounded-lg shadow-sm hover:shadow-md transition-shadow">
          <Plus className="w-4 h-4 mr-1.5" /> Adicionar tarefa
        </Button>
        <div className="flex items-center gap-1.5">
          <NotificationCenter className="flex-1 h-9 flex items-center justify-center rounded-lg hover:bg-sidebar-accent transition-colors" iconSize="w-4 h-4" />
          <Button variant="ghost" size="icon" className="flex-1 h-9 hover:bg-sidebar-accent transition-colors" onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}>
            {theme === 'dark' ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
          </Button>
          <NavLink to="/settings" className="flex-1">
            <Button variant="ghost" className="w-full h-9 hover:bg-sidebar-accent transition-colors"><SettingsIcon className="w-4 h-4" /></Button>
          </NavLink>
        </div>
        <div className="relative">
          <button onClick={() => setUserMenu((v) => !v)} className="w-full flex items-center gap-2 px-2 py-1.5 rounded-lg hover:bg-sidebar-accent transition-all duration-200 hover:shadow-sm">
            <span className="w-7 h-7 rounded-full bg-primary/15 text-primary flex items-center justify-center text-xs font-semibold shadow-sm">
              {(user?.full_name || user?.email || 'U').charAt(0).toUpperCase()}
            </span>
            <span className="flex-1 text-left text-xs truncate">{user?.full_name || user?.email}</span>
          </button>
          {userMenu && (
            <div className="absolute bottom-full left-0 right-0 mb-1 rounded-xl border border-border bg-popover shadow-lg p-1.5 animate-scale-in">
              <button onClick={() => logout()} className="w-full flex items-center gap-2 px-2 py-1.5 rounded-md hover:bg-accent text-sm text-destructive transition-colors">
                <LogOut className="w-4 h-4" /> Sair
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Create Project Dialog */}
      <Dialog open={newProjectOpen} onOpenChange={setNewProjectOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Criar novo projeto</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div className="space-y-1.5">
              <Label>Nome do projeto</Label>
              <Input value={projectName} onChange={(e) => setProjectName(e.target.value)} placeholder="Ex: Marketing Q1" />
            </div>
            <div className="space-y-1.5">
              <Label>Cor</Label>
              <div className="flex gap-2">
                {['#7c3aed', '#ef4444', '#f59e0b', '#10b981', '#3b82f6', '#ec4899'].map((color) => (
                  <button
                    key={color}
                    onClick={() => setProjectColor(color)}
                    className={`w-8 h-8 rounded-full border-2 ${projectColor === color ? 'border-foreground' : 'border-transparent'}`}
                    style={{ backgroundColor: color }}
                  />
                ))}
              </div>
            </div>
            <div className="space-y-1.5">
              <Label>Logo (opcional)</Label>
              <div className="flex items-center gap-3">
                {projectLogo ? (
                  <img src={projectLogo} alt="" className="w-12 h-12 rounded-lg object-cover" />
                ) : (
                  <div className="w-12 h-12 rounded-lg bg-muted flex items-center justify-center text-muted-foreground text-xs">
                    Sem logo
                  </div>
                )}
                <div className="flex-1">
                  <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={handleLogoUpload} />
                  <Button size="sm" variant="outline" onClick={() => fileRef.current?.click()} disabled={uploadingLogo}>
                    <Upload className="w-4 h-4 mr-1.5" /> {uploadingLogo ? 'Enviando...' : 'Upload'}
                  </Button>
                </div>
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setNewProjectOpen(false)}>Cancelar</Button>
            <Button onClick={handleCreateProject} disabled={savingProject || !projectName.trim()}>
              {savingProject ? 'Criando...' : 'Criar projeto'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Project Dialog */}
      <Dialog open={deleteProjectOpen} onOpenChange={setDeleteProjectOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Excluir projeto</DialogTitle>
          </DialogHeader>
          <div className="py-4">
            <p className="text-sm text-muted-foreground">
              Tem certeza que deseja excluir o projeto <span className="font-semibold text-foreground">{projectToDelete?.name}</span>?
            </p>
            <p className="text-sm text-destructive mt-2">
              Esta ação não pode ser desfeita. Todas as tarefas, quadros e colunas deste projeto serão excluídos.
            </p>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeleteProjectOpen(false)}>Cancelar</Button>
            <Button variant="destructive" onClick={handleDeleteProject} disabled={savingProject}>
              {savingProject ? 'Excluindo...' : 'Excluir projeto'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </aside>
  );
}