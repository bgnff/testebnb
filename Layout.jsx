import { Outlet } from 'react-router-dom';
import { ProjectProvider } from '@/lib/project-context';
import Sidebar from '@/Sidebar';
import MobileTopBar from '@/MobileTopBar';
import QuickAddTask from '@/QuickAddTask';
import { useState } from 'react';

export default function Layout() {
  const [quickAddOpen, setQuickAddOpen] = useState(false);
  return (
    <ProjectProvider>
      <div className="flex h-screen overflow-hidden bg-background">
        <Sidebar onQuickAdd={() => setQuickAddOpen(true)} />
        <div className="flex-1 overflow-hidden flex flex-col">
          <MobileTopBar onQuickAdd={() => setQuickAddOpen(true)} />
          <main className="flex-1 overflow-hidden flex flex-col">
            <Outlet />
          </main>
        </div>
      </div>
      <QuickAddTask open={quickAddOpen} onClose={() => setQuickAddOpen(false)} />
    </ProjectProvider>
  );
}