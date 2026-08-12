import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { projectsApi } from '@/lib/api/projects';

const ProjectContext = createContext(null);

export function ProjectProvider({ children }) {
  const [projects, setProjects] = useState([]);
  const [currentProject, setCurrentProjectState] = useState(null);
  const [loading, setLoading] = useState(true);

  const loadProjects = useCallback(async () => {
    setLoading(true);
    try {
      let list = await projectsApi.list();
      if (list.length === 0) {
        const created = await projectsApi.create({
          name: 'Oficinas Introdutórias',
          description: 'Espaço inicial disponível para todos os usuários',
          color: '#7c3aed',
          icon: 'LayoutDashboard',
        });
        list = [created];
      }
      setProjects(list);
      const savedId = localStorage.getItem('current_project_id');
      const found = list.find((p) => p.id === savedId) || list[0];
      setCurrentProjectState(found);
      localStorage.setItem('current_project_id', found.id);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadProjects();
  }, [loadProjects]);

  const setCurrentProject = (project) => {
    setCurrentProjectState(project);
    localStorage.setItem('current_project_id', project.id);
  };

  const createProject = async (data) => {
    const created = await projectsApi.create(data);
    setProjects((prev) => [created, ...prev]);
    setCurrentProject(created);
    return created;
  };

  const value = { projects, currentProject, setCurrentProject, createProject, loading, reload: loadProjects };
  return <ProjectContext.Provider value={value}>{children}</ProjectContext.Provider>;
}

export function useProject() {
  const ctx = useContext(ProjectContext);
  if (!ctx) throw new Error('useProject must be used within ProjectProvider');
  return ctx;
}