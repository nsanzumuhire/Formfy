import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import type { Project } from "@shared/schema";

export function useProject() {
  const [selectedProject, setSelectedProject] = useState<string | null>(null);

  const { data: projects } = useQuery<Project[]>({
    queryKey: ["/api/projects"],
  });

  // Auto-select first project if available and none selected
  useEffect(() => {
    if (projects && projects.length > 0 && !selectedProject) {
      setSelectedProject(projects[0].id);
    }
  }, [projects, selectedProject]);

  const currentProject = projects?.find(p => p.id === selectedProject);

  return {
    selectedProject,
    setSelectedProject,
    projects,
    currentProject,
  };
}