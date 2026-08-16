import { NavLink } from 'react-router-dom';
import { useTheme } from 'next-themes';
import { Button } from '@/ui/button';
import { LayoutDashboard, KanbanSquare, CalendarDays, ListChecks, Plus, Moon, Sun, Users } from 'lucide-react';
import NotificationCenter from '@/NotificationCenter';
import { cn } from '@/lib/utils';

const NAV = [
  { to: '/', label: 'Início', icon: LayoutDashboard, end: true },
  { to: '/board', label: 'Quadro', icon: KanbanSquare },
  { to: '/calendar', label: 'Calendário', icon: CalendarDays },
  { to: '/tasks', label: 'Tarefas', icon: ListChecks },
  { to: '/sales', label: 'Vendas', icon: Users },
];

export default function MobileTopBar({ onQuickAdd }) {
  const { theme, setTheme } = useTheme();
  return (
    <div className="md:hidden border-b border-border bg-background/90 backdrop-blur sticky top-0 z-30">
      <div className="flex items-center gap-2 px-4 py-2.5">
        <span className="w-7 h-7 rounded-lg bg-primary text-primary-foreground flex items-center justify-center font-bold text-sm shadow-sm">B</span>
        <span className="font-semibold text-sm">BnBWeb</span>
        <div className="flex-1" />
        <NotificationCenter className="h-9 w-9 flex items-center justify-center hover:bg-sidebar-accent transition-colors rounded-lg" iconSize="w-4 h-4" />
        <Button variant="ghost" size="icon" className="h-9 w-9 hover:bg-sidebar-accent transition-colors" onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}>
          {theme === 'dark' ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
        </Button>
        <Button size="icon" className="h-9 w-9 shadow-sm hover:shadow-md transition-shadow" onClick={onQuickAdd}><Plus className="w-4 h-4" /></Button>
      </div>
      <nav className="flex items-center gap-1 px-2 pb-2 overflow-x-auto scrollbar-thin">
        {NAV.map((item) => (
          <NavLink key={item.to} to={item.to} end={item.end}
            className={({ isActive }) => cn('flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap transition-all duration-200',
              isActive 
                ? 'bg-primary text-primary-foreground shadow-sm' 
                : 'text-muted-foreground hover:bg-muted hover:shadow-sm')}>
            <item.icon className="w-3.5 h-3.5" />{item.label}
          </NavLink>
        ))}
      </nav>
    </div>
  );
}