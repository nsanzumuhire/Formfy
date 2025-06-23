import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Link } from "wouter";
import { useProject } from "@/hooks/useProject";
import { NoProjectsState, ProjectSelector, ProjectLoadingState } from "@/components/project-state";
import {
  FileText,
  Plus,
  Edit,
  Trash2,
  Eye,
  Calendar,
} from "lucide-react";
import type { Form } from "@shared/schema";

export default function Forms() {
  const { 
    projects, 
    currentProject, 
    projectsLoading, 
    hasProjects, 
    needsProjectSelection,
    setSelectedProject 
  } = useProject();

  const { data: forms, isLoading } = useQuery<Form[]>({
    queryKey: currentProject ? [`/api/projects/${currentProject.id}/forms`] : [],
    enabled: !!currentProject,
  });

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  // Loading state
  if (projectsLoading) {
    return (
      <div className="p-6">
        <ProjectLoadingState />
      </div>
    );
  }

  // No projects state
  if (!hasProjects) {
    return (
      <div className="p-6 max-w-2xl mx-auto mt-16">
        <NoProjectsState />
      </div>
    );
  }

  // Project selection needed
  if (needsProjectSelection) {
    return (
      <div className="p-6 max-w-2xl mx-auto mt-16">
        <ProjectSelector 
          projects={projects}
          selectedProject={currentProject?.id || null}
          onProjectChange={setSelectedProject}
        />
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Forms</h1>
          <p className="text-muted-foreground mt-1">
            {currentProject?.name} • Manage and organize your form collection
          </p>
        </div>
        <Link href="/form-editor">
          <Button>
            <Plus className="h-4 w-4 mr-2" />
            Create Form
          </Button>
        </Link>
      </div>

      {/* Forms List */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <span>Forms</span>
            <Badge variant="outline">
              {currentProject?.name}
            </Badge>
          </CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="space-y-4">
              {[1, 2, 3].map((i) => (
                <div key={i} className="flex items-center justify-between p-4 border rounded-lg">
                  <div className="flex items-center space-x-3">
                    <Skeleton className="h-10 w-10 rounded-lg" />
                    <div>
                      <Skeleton className="h-4 w-32" />
                      <Skeleton className="h-3 w-24 mt-1" />
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Skeleton className="h-6 w-16" />
                    <Skeleton className="h-8 w-8" />
                    <Skeleton className="h-8 w-8" />
                  </div>
                </div>
              ))}
            </div>
          ) : forms && forms.length > 0 ? (
            <div className="space-y-4">
              {forms.map((form) => (
                <div
                  key={form.id}
                  className="flex items-center justify-between p-4 border rounded-lg hover:border-primary/50 transition-colors"
                >
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 bg-blue-100 dark:bg-blue-900/20 rounded-lg flex items-center justify-center">
                      <FileText className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                    </div>
                    <div>
                      <h3 className="font-medium">{form.name}</h3>
                      <div className="flex items-center space-x-2 text-sm text-muted-foreground">
                        <Calendar className="h-3 w-3" />
                        <span>
                          Modified {form.updatedAt ? formatDate(form.updatedAt.toString()) : "Unknown"}
                        </span>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Badge variant={form.isActive ? "default" : "secondary"}>
                      {form.isActive ? "Active" : "Inactive"}
                    </Badge>
                    <Button variant="ghost" size="sm" title="Preview">
                      <Eye className="h-4 w-4" />
                    </Button>
                    <Link href={`/form-builder/${form.id}`}>
                      <Button variant="ghost" size="sm" title="Edit">
                        <Edit className="h-4 w-4" />
                      </Button>
                    </Link>
                    <Button 
                      variant="ghost" 
                      size="sm" 
                      title="Delete"
                      className="hover:bg-destructive/10 hover:text-destructive"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8">
              <FileText className="h-12 w-12 mx-auto text-muted-foreground/50 mb-4" />
              <h3 className="text-lg font-medium mb-2">No forms yet</h3>
              <p className="text-muted-foreground mb-4">
                Create your first form to get started
              </p>
              <Link href="/form-builder">
                <Button>
                  <Plus className="h-4 w-4 mr-2" />
                  Create Form
                </Button>
              </Link>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
