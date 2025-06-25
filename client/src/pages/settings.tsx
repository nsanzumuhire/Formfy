import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useToast } from "@/hooks/use-toast";
import { useTheme } from "@/components/ui/theme-provider";
import { apiRequest } from "@/lib/queryClient";
import { useAuth } from "@/hooks/useAuth";
import {
  User,
  Settings as SettingsIcon,
  Moon,
  Sun,
  Monitor,
  Plus,
  Trash2,
} from "lucide-react";
import type { Project } from "@shared/schema";

export default function Settings() {
  const [showCreateProject, setShowCreateProject] = useState(false);
  const [newProjectName, setNewProjectName] = useState("");
  const [newProjectDescription, setNewProjectDescription] = useState("");

  const { user } = useAuth();
  const { theme, setTheme } = useTheme();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: projects, isLoading } = useQuery<Project[]>({
    queryKey: ["/api/projects"],
  });

  const createProjectMutation = useMutation({
    mutationFn: async (data: { name: string; description?: string }) => {
      return await apiRequest("/api/projects", "POST", data);
    },
    onSuccess: () => {
      toast({
        title: "Project created",
        description: "Your new project has been created successfully.",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/projects"] });
      setShowCreateProject(false);
      setNewProjectName("");
      setNewProjectDescription("");
    },
    onError: (error) => {
      toast({
        title: "Error creating project",
        description: error.message || "Failed to create project.",
        variant: "destructive",
      });
    },
  });

  const deleteProjectMutation = useMutation({
    mutationFn: async (projectId: string) => {
      return await apiRequest(`/api/projects/${projectId}`, "DELETE");
    },
    onSuccess: () => {
      toast({
        title: "Project deleted",
        description: "The project has been deleted successfully.",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/projects"] });
    },
    onError: (error) => {
      toast({
        title: "Error deleting project",
        description: error.message || "Failed to delete project.",
        variant: "destructive",
      });
    },
  });

  const handleCreateProject = () => {
    if (!newProjectName.trim()) {
      toast({
        title: "Project name required",
        description: "Please enter a name for your project.",
        variant: "destructive",
      });
      return;
    }

    createProjectMutation.mutate({
      name: newProjectName,
      description: newProjectDescription || undefined,
    });
  };

  const handleDeleteProject = (projectId: string, projectName: string) => {
    if (window.confirm(`Are you sure you want to delete "${projectName}"? This action cannot be undone.`)) {
      deleteProjectMutation.mutate(projectId);
    }
  };

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold">Settings</h1>
        <p className="text-muted-foreground mt-1">
          Manage your account and project settings
        </p>
      </div>

      {/* Profile Section */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <User className="h-5 w-5 mr-2" />
            Profile
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="flex items-center space-x-4">
            <Avatar className="h-16 w-16">
              <AvatarImage src={user?.profileImageUrl || ""} alt={user?.firstName || ""} />
              <AvatarFallback className="text-lg">
                {user?.firstName?.[0]}{user?.lastName?.[0]}
              </AvatarFallback>
            </Avatar>
            <div>
              <h3 className="text-lg font-medium">
                {user?.firstName} {user?.lastName}
              </h3>
              <p className="text-muted-foreground">{user?.email}</p>
            </div>
          </div>
          
          <div className="pt-4 border-t">
            <p className="text-sm text-muted-foreground">
              Profile information is managed through your OAuth provider.
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Appearance Section */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <SettingsIcon className="h-5 w-5 mr-2" />
            Appearance
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div>
            <Label className="text-base">Theme</Label>
            <p className="text-sm text-muted-foreground mb-3">
              Choose your preferred theme
            </p>
            <div className="flex space-x-2">
              <Button
                variant={theme === "light" ? "default" : "outline"}
                size="sm"
                onClick={() => setTheme("light")}
              >
                <Sun className="h-4 w-4 mr-2" />
                Light
              </Button>
              <Button
                variant={theme === "dark" ? "default" : "outline"}
                size="sm"
                onClick={() => setTheme("dark")}
              >
                <Moon className="h-4 w-4 mr-2" />
                Dark
              </Button>
              <Button
                variant={theme === "system" ? "default" : "outline"}
                size="sm"
                onClick={() => setTheme("system")}
              >
                <Monitor className="h-4 w-4 mr-2" />
                System
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Projects Section */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Projects</CardTitle>
            <Dialog open={showCreateProject} onOpenChange={setShowCreateProject}>
              <DialogTrigger asChild>
                <Button size="sm">
                  <Plus className="h-4 w-4 mr-2" />
                  New Project
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Create New Project</DialogTitle>
                </DialogHeader>
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="project-name">Project Name</Label>
                    <Input
                      id="project-name"
                      value={newProjectName}
                      onChange={(e) => setNewProjectName(e.target.value)}
                      placeholder="e.g., My Website Forms"
                    />
                  </div>
                  <div>
                    <Label htmlFor="project-description">Description (Optional)</Label>
                    <Textarea
                      id="project-description"
                      value={newProjectDescription}
                      onChange={(e) => setNewProjectDescription(e.target.value)}
                      placeholder="Describe your project..."
                      rows={3}
                    />
                  </div>
                  <div className="flex justify-end space-x-2">
                    <Button
                      variant="outline"
                      onClick={() => setShowCreateProject(false)}
                    >
                      Cancel
                    </Button>
                    <Button
                      onClick={handleCreateProject}
                      disabled={createProjectMutation.isPending}
                    >
                      {createProjectMutation.isPending ? "Creating..." : "Create"}
                    </Button>
                  </div>
                </div>
              </DialogContent>
            </Dialog>
          </div>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="space-y-3">
              {[1, 2, 3].map((i) => (
                <div key={i} className="animate-pulse">
                  <div className="h-16 bg-muted rounded-lg"></div>
                </div>
              ))}
            </div>
          ) : projects && projects.length > 0 ? (
            <div className="space-y-3">
              {projects.map((project) => (
                <div
                  key={project.id}
                  className="flex items-center justify-between p-4 border rounded-lg"
                >
                  <div>
                    <h3 className="font-medium">{project.name}</h3>
                    <p className="text-sm text-muted-foreground">
                      {project.description || "No description"}
                    </p>
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleDeleteProject(project.id, project.name)}
                    disabled={deleteProjectMutation.isPending}
                    className="hover:bg-destructive/10 hover:text-destructive"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8">
              <h3 className="text-lg font-medium mb-2">No projects yet</h3>
              <p className="text-muted-foreground mb-4">
                Create your first project to get started
              </p>
              <Button onClick={() => setShowCreateProject(true)}>
                <Plus className="h-4 w-4 mr-2" />
                Create Project
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
