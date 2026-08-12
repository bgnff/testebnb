import { NavLink } from 'react-router-dom';
import { useTheme } from 'next-themes';
import { Button } from '@/ui/button';
import { LayoutDashboard, KanbanSquare, CalendarDays, ListChecks, Plus, Moon, Sun, Download, Users } from 'lucide-react';
import NotificationCenter from '@/NotificationCenter';
import { cn } from '@/lib/utils';

const NAV = [
  { to: '/', label: 'Início', icon: LayoutDashboard, end: true },
  { to: '/board', label: 'Quadro', icon: KanbanSquare },
  { to: '/calendar', label: 'Calendário', icon: CalendarDays },
  { to: '/tasks', label: 'Tarefas', icon: ListChecks },
  { to: '/sales', label: 'Vendas', icon: Users },
  { to: '/downloads', label: 'Downloads', icon: Download },
];

export default function MobileTopBar({ onQuickAdd }) {
  const { theme, setTheme } = useTheme();
  return (
    <div className="md:hidden border-b border-border bg-background/90 backdrop-blur sticky top-0 z-30">
      <div className="flex items-center gap-2 px-4 py-2.5">
        <span className="w-7 h-7 rounded-lg bg-primary text-primary-foreground flex items-center justify-center font-bold text-sm">F</span>
        <span className="font-semibold text-sm">FlowState</span>
        <div className="flex-1" />
        <NotificationCenter className="h-9 w-9 flex items-center justify-center" iconSize="w-4 h-4" />
        <Button variant="ghost" size="icon" className="h-9 w-9" onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}>
          {theme === 'dark' ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
        </Button>
        <Button size="icon" className="h-9 w-9" onClick={onQuickAdd}><Plus className="w-4 h-4" /></Button>
      </div>
      <nav className="flex items-center gap-1 px-2 pb-2 overflow-x-auto scrollbar-thin">
        {NAV.map((item) => (
          <NavLink key={item.to} to={item.to} end={item.end}
            className={({ isActive }) => cn('flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap transition-colors',
              isActive ? 'bg-primary text-primary-foreground' : 'text-muted-foreground hover:bg-muted')}>
            <item.icon className="w-3.5 h-3.5" />{item.label}
          </NavLink>
        ))}
      </nav>
    </div>
  );
}