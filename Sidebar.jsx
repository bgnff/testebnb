import { NavLink } from 'react-router-dom';
import { useAuth } from '@/lib/AuthContext';
import { useTheme } from 'next-themes';
import { Button } from '@/ui/button';
import { useToast } from '@/ui/use-toast';
import {
  LayoutDashboard, KanbanSquare, CalendarDays, ListChecks,
  Settings as SettingsIcon, Moon, Sun, LogOut, Users, Plus,
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
];

export default function Sidebar({ onQuickAdd }) {
  const { user, logout } = useAuth();
  const { theme, setTheme } = useTheme();
  const { toast } = useToast();
  const [userMenu, setUserMenu] = useState(false);
  const ref = useRef(null);

  useEffect(() => {
    const handler = (e) => { if (ref.current && !ref.current.contains(e.target)) { setUserMenu(false); } };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  return (
    <aside className="w-64 flex-shrink-0 hidden md:flex flex-col border-r border-border bg-sidebar text-sidebar-foreground">
      <div className="p-4">
        <div className="w-full flex items-center gap-3 px-2.5 py-2 rounded-lg bg-sidebar-accent shadow-sm">
          <span className="w-10 h-10 rounded-lg flex items-center justify-center text-white text-sm font-semibold shadow-sm" style={{ backgroundColor: '#7c3aed' }}>
            <LayoutDashboard className="w-5 h-5" />
          </span>
          <span className="flex-1 text-left text-sm font-semibold truncate">BnBWeb</span>
        </div>
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
    </aside>
  );
}