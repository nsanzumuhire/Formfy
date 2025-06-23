import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { FolderOpen, Plus, AlertCircle } from "lucide-react";
import { Link } from "wouter";
import type { Project } from "@shared/schema";

interface NoProjectsStateProps {
  className?: string;
}

export function NoProjectsState({ className }: NoProjectsStateProps) {
  return (
    <div className={className}>
      <Card className="border-dashed">
        <CardHeader className="text-center">
          <div className="mx-auto w-12 h-12 bg-muted rounded-lg flex items-center justify-center mb-4">
            <FolderOpen className="h-6 w-6 text-muted-foreground" />
          </div>
          <CardTitle>No Projects Found</CardTitle>
          <CardDescription>
            You don't have any projects yet. Create your first project to get started with building forms.
          </CardDescription>
        </CardHeader>
        <CardContent className="text-center">
          <Link href="/projects">
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              Create Your First Project
            </Button>
          </Link>
        </CardContent>
      </Card>
    </div>
  );
}

interface ProjectSelectorProps {
  projects: Project[];
  selectedProject: string | null;
  onProjectChange: (projectId: string) => void;
  className?: string;
}

export function ProjectSelector({ projects, selectedProject, onProjectChange, className }: ProjectSelectorProps) {
  return (
    <div className={className}>
      <Card className="border-dashed">
        <CardHeader className="text-center">
          <div className="mx-auto w-12 h-12 bg-muted rounded-lg flex items-center justify-center mb-4">
            <AlertCircle className="h-6 w-6 text-muted-foreground" />
          </div>
          <CardTitle>Select a Project</CardTitle>
          <CardDescription>
            Choose a project to continue working with your forms and data.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div>
              <label className="text-sm font-medium mb-2 block">Available Projects</label>
              <Select value={selectedProject || ""} onValueChange={onProjectChange}>
                <SelectTrigger>
                  <SelectValue placeholder="Select a project..." />
                </SelectTrigger>
                <SelectContent>
                  {projects.map((project) => (
                    <SelectItem key={project.id} value={project.id}>
                      <div className="flex flex-col">
                        <span className="font-medium">{project.name}</span>
                        {project.description && (
                          <span className="text-xs text-muted-foreground">{project.description}</span>
                        )}
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="text-center">
              <Link href="/projects">
                <Button variant="outline" size="sm">
                  <Plus className="h-4 w-4 mr-2" />
                  Create New Project
                </Button>
              </Link>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

interface ProjectLoadingStateProps {
  className?: string;
}

export function ProjectLoadingState({ className }: ProjectLoadingStateProps) {
  return (
    <div className={className}>
      <Card>
        <CardHeader>
          <div className="flex items-center space-x-4">
            <Skeleton className="h-12 w-12 rounded-lg" />
            <div className="space-y-2">
              <Skeleton className="h-4 w-[200px]" />
              <Skeleton className="h-3 w-[150px]" />
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-3/4" />
            <Skeleton className="h-4 w-1/2" />
          </div>
        </CardContent>
      </Card>
    </div>
  );
}