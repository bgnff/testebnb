import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { projectsApi } from '@/lib/api/projects';
import { useRealtimeProjects } from '@/lib/hooks/useRealtimeProjects';

const ProjectContext = createContext(null);

export function ProjectProvider({ children }) {
  const { projects, loading, setProjects } = useRealtimeProjects();
  const [currentProject, setCurrentProjectState] = useState(null);

  useEffect(() => {
    if (projects.length === 0) return;
    const savedId = localStorage.getItem('current_project_id');
    const found = projects.find((p) => p.id === savedId) || projects[0];
    setCurrentProjectState(found);
    if (found) localStorage.setItem('current_project_id', found.id);
  }, [projects]);

  const setCurrentProject = (project) => {
    setCurrentProjectState(project);
    localStorage.setItem('current_project_id', project.id);
  };

  const createProject = async (data) => {
    const created = await projectsApi.create(data);
    // O hook de realtime vai adicionar automaticamente
    setCurrentProject(created);
    return created;
  };

  const reload = async () => {
    // O hook de realtime já está sincronizando, mas podemos forçar reload se necessário
    const list = await projectsApi.list();
    setProjects(list);
  };

  const value = { projects, currentProject, setCurrentProject, createProject, loading, reload };
  return <ProjectContext.Provider value={value}>{children}</ProjectContext.Provider>;
}

export function useProject() {
  const ctx = useContext(ProjectContext);
  if (!ctx) throw new Error('useProject must be used within ProjectProvider');
  return ctx;
}