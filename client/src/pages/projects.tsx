import { useState } from "react";
import { useMutation, useQuery } from "@tanstack/react-query";
import { Plus, ExternalLink, MoreVertical, Pause, Play, Archive, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { ProjectCreateDialog } from "@/components/project-create-dialog";
import { type Project } from "@shared/schema";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { formatDistanceToNow } from "date-fns";
import { useLocation } from "wouter";

export default function Projects() {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const { toast } = useToast();
  const [, setLocation] = useLocation();

  const { data: projects = [], isLoading } = useQuery<Project[]>({
    queryKey: ["/api/projects"],
  });

  const updateProjectMutation = useMutation({
    mutationFn: async ({ id, status }: { id: string; status: string }) => {
      return await apiRequest(`/api/projects/${id}`,"PATCH",  { status });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/projects"] });
      toast({
        title: "Project updated",
        description: "Project status has been updated.",
      });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const deleteProjectMutation = useMutation({
    mutationFn: async (id: string) => {
      return await apiRequest(`/api/projects/${id}`, "DELETE");
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/projects"] });
      toast({
        title: "Project deleted",
        description: "Project has been deleted successfully.",
      });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const handleStatusChange = (project: Project, newStatus: string) => {
    updateProjectMutation.mutate({ id: project.id, status: newStatus });
  };

  const handleDeleteProject = (project: Project) => {
    if (window.confirm(`Are you sure you want to delete "${project.name}"? This action cannot be undone.`)) {
      deleteProjectMutation.mutate(project.id);
    }
  };

  const handleProjectClick = (project: Project) => {
    // Store the selected project in localStorage for persistence
    localStorage.setItem('formfy_selected_project', project.id);
    
    // Trigger custom storage change event for same-tab synchronization
    window.dispatchEvent(new CustomEvent('localStorageChange'));
    
    // Force cache invalidation for the new project
    queryClient.invalidateQueries({ 
      queryKey: [`/api/projects/${project.id}/forms`] 
    });
    queryClient.invalidateQueries({ 
      queryKey: [`/api/projects/${project.id}/api-keys`] 
    });
    queryClient.invalidateQueries({ 
      queryKey: [`/api/projects/${project.id}`] 
    });
    
    // Navigate to form-editor page
    setLocation('/form-editor');
  };

  const getStatusIndicator = (status: string) => {
    switch (status) {
      case "active":
        return (
          <div className="flex items-center">
            <div className="w-2 h-2 bg-green-500 rounded-full mr-2"></div>
            <Badge variant="secondary" className="text-xs bg-green-50 text-green-700 dark:bg-green-900/20 dark:text-green-300">
              Active
            </Badge>
          </div>
        );
      case "paused":
        return (
          <div className="flex items-center">
            <div className="w-2 h-2 bg-yellow-500 rounded-full mr-2"></div>
            <Badge variant="secondary" className="text-xs bg-yellow-50 text-yellow-700 dark:bg-yellow-900/20 dark:text-yellow-300">
              Paused
            </Badge>
          </div>
        );
      case "archived":
        return (
          <div className="flex items-center">
            <div className="w-2 h-2 bg-gray-500 rounded-full mr-2"></div>
            <Badge variant="secondary" className="text-xs bg-gray-50 text-gray-700 dark:bg-gray-900/20 dark:text-gray-300">
              Archived
            </Badge>
          </div>
        );
      default:
        return (
          <div className="flex items-center">
            <div className="w-2 h-2 bg-green-500 rounded-full mr-2"></div>
            <Badge variant="secondary" className="text-xs bg-green-50 text-green-700 dark:bg-green-900/20 dark:text-green-300">
              Active
            </Badge>
          </div>
        );
    }
  };

  if (isLoading) {
    return (
      <div className="p-8">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-2xl font-semibold text-gray-900">Projects</h1>
            <p className="text-gray-600 mt-1">Manage your form builder projects</p>
          </div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {Array.from({ length: 6 }).map((_, i) => (
            <Card key={i} className="animate-pulse border-0 shadow-sm bg-white dark:bg-gray-900">
              <CardHeader className="pb-4">
                <div className="h-5 bg-gray-200 dark:bg-gray-700 rounded w-3/4"></div>
                <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-1/2 mt-3"></div>
              </CardHeader>
              <CardContent className="pt-0">
                <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-full mb-3"></div>
                <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-2/3"></div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="p-8">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-semibold text-gray-900 dark:text-gray-100">Projects</h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">Manage your form builder projects</p>
        </div>
        
        <Button 
          onClick={() => setIsDialogOpen(true)}
          className="bg-green-600 hover:bg-green-700 text-white"
        >
          <Plus className="w-4 h-4 mr-2" />
          New project
        </Button>
      </div>

      {projects.length === 0 ? (
        <div className="text-center py-12">
          <div className="w-16 h-16 mx-auto mb-4 bg-gray-100 dark:bg-gray-800 rounded-full flex items-center justify-center">
            <Plus className="w-8 h-8 text-gray-400 dark:text-gray-500" />
          </div>
          <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-2">No projects yet</h3>
          <p className="text-gray-600 dark:text-gray-400 mb-6">Get started by creating your first project</p>
          <Button 
            onClick={() => setIsDialogOpen(true)}
            className="bg-green-600 hover:bg-green-700 text-white"
          >
            <Plus className="w-4 h-4 mr-2" />
            New project
          </Button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {projects.map((project) => (
            <Card 
              key={project.id} 
              className="hover:shadow-lg transition-all duration-200 border-0 shadow-sm bg-white dark:bg-gray-900 cursor-pointer"
              onClick={() => handleProjectClick(project)}
            >
              <CardHeader className="pb-4">
                <div className="flex items-start justify-between">
                  <div className="flex-1 min-w-0">
                    <h3 className="font-semibold text-gray-900 dark:text-gray-100 truncate text-lg">{project.name}</h3>
                    <div className="mt-2">
                      {getStatusIndicator(project.status || "active")}
                    </div>
                  </div>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button 
                        variant="ghost" 
                        size="sm" 
                        className="h-8 w-8 p-0 hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-500 dark:text-gray-400"
                        onClick={(e) => e.stopPropagation()}
                      >
                        <MoreVertical className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" onClick={(e) => e.stopPropagation()}>
                      <DropdownMenuItem asChild>
                        <a href={`/forms?project=${project.id}`} className="flex items-center cursor-pointer">
                          <ExternalLink className="w-4 h-4 mr-2" />
                          View forms
                        </a>
                      </DropdownMenuItem>
                      <DropdownMenuSeparator />
                      {project.status === "active" ? (
                        <DropdownMenuItem 
                          onClick={() => handleStatusChange(project, "paused")}
                          className="flex items-center cursor-pointer"
                        >
                          <Pause className="w-4 h-4 mr-2" />
                          Pause project
                        </DropdownMenuItem>
                      ) : (
                        <DropdownMenuItem 
                          onClick={() => handleStatusChange(project, "active")}
                          className="flex items-center cursor-pointer"
                        >
                          <Play className="w-4 h-4 mr-2" />
                          Resume project
                        </DropdownMenuItem>
                      )}
                      <DropdownMenuItem 
                        onClick={() => handleStatusChange(project, "archived")}
                        className="flex items-center cursor-pointer"
                      >
                        <Archive className="w-4 h-4 mr-2" />
                        Archive
                      </DropdownMenuItem>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem 
                        onClick={() => handleDeleteProject(project)}
                        className="flex items-center cursor-pointer text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20"
                      >
                        <Trash2 className="w-4 h-4 mr-2" />
                        Delete
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              </CardHeader>
              <CardContent className="pt-0">
                <div className="space-y-4">
                  {project.description && (
                    <p className="text-sm text-gray-600 dark:text-gray-400 line-clamp-2 leading-relaxed">{project.description}</p>
                  )}
                  
                  <div className="text-xs text-gray-500 dark:text-gray-500 pt-2 border-t border-gray-100 dark:border-gray-800">
                    Created {formatDistanceToNow(new Date(project.createdAt || Date.now()))} ago
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
      
      {/* Project Creation Dialog */}
      <ProjectCreateDialog 
        open={isDialogOpen}
        onOpenChange={setIsDialogOpen}
      />
    </div>
  );
}