import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { queryClient } from "@/lib/queryClient";
import type { Project } from "@shared/schema";

const PROJECT_STORAGE_KEY = "formfy_selected_project";

export function useProject() {
  const [selectedProject, setSelectedProject] = useState<string | null>(() => {
    // Initialize from localStorage
    if (typeof window !== "undefined") {
      return localStorage.getItem(PROJECT_STORAGE_KEY);
    }
    return null;
  });

  const { data: projects, isLoading: projectsLoading } = useQuery<Project[]>({
    queryKey: ["/api/projects"],
  });

  // Persist project selection to localStorage and invalidate related caches
  const selectProject = (projectId: string | null) => {
    const previousProject = selectedProject;
    setSelectedProject(projectId);
    
    if (typeof window !== "undefined") {
      if (projectId) {
        localStorage.setItem(PROJECT_STORAGE_KEY, projectId);
      } else {
        localStorage.removeItem(PROJECT_STORAGE_KEY);
      }
    }

    // Invalidate project-specific caches when project changes
    if (previousProject !== projectId) {
      // Invalidate forms cache for both old and new projects
      if (previousProject) {
        queryClient.invalidateQueries({ 
          queryKey: [`/api/projects/${previousProject}/forms`] 
        });
        queryClient.invalidateQueries({ 
          queryKey: [`/api/projects/${previousProject}/api-keys`] 
        });
      }
      if (projectId) {
        queryClient.invalidateQueries({ 
          queryKey: [`/api/projects/${projectId}/forms`] 
        });
        queryClient.invalidateQueries({ 
          queryKey: [`/api/projects/${projectId}/api-keys`] 
        });
        queryClient.invalidateQueries({ 
          queryKey: [`/api/projects/${projectId}`] 
        });
      }
      
      // Also invalidate dashboard stats to reflect the new project
      queryClient.invalidateQueries({ 
        queryKey: ["/api/dashboard/stats"] 
      });
    }
  };

  // Validate and handle project selection
  useEffect(() => {
    if (!projectsLoading && projects) {
      if (projects.length === 0) {
        // No projects available, clear selection
        if (selectedProject) {
          selectProject(null);
        }
      } else if (selectedProject) {
        // Check if selected project still exists
        const projectExists = projects.some(p => p.id === selectedProject);
        if (!projectExists) {
          // Selected project no longer exists, auto-select first available
          selectProject(projects[0].id);
        }
      } else {
        // No project selected but projects available, auto-select first
        selectProject(projects[0].id);
      }
    }
  }, [projects, projectsLoading, selectedProject]);

  const currentProject = projects?.find(p => p.id === selectedProject);

  // Project state helpers
  const hasProjects = projects && projects.length > 0;
  const hasSelectedProject = selectedProject && currentProject;
  const needsProjectSelection = hasProjects && !hasSelectedProject;

  return {
    selectedProject,
    setSelectedProject: selectProject,
    projects: projects || [],
    currentProject,
    projectsLoading,
    hasProjects,
    hasSelectedProject,
    needsProjectSelection,
  };
}