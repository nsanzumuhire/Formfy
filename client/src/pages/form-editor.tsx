import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useRoute, Link } from "wouter";
import { FileText, Plus, Search, MoreHorizontal, Edit, Trash2, Copy } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useProject } from "@/hooks/useProject";
import type { Form, Project } from "@shared/schema";
import { formatDistanceToNow } from "date-fns";

export default function FormEditor() {
  const [, params] = useRoute("/form-editor/:projectId?");
  const projectId = params?.projectId;
  const [searchTerm, setSearchTerm] = useState("");
  const { selectedProject } = useProject();
  
  const currentProjectId = projectId || selectedProject;

  // Fetch project details
  const { data: project } = useQuery<Project>({
    queryKey: [`/api/projects/${currentProjectId}`],
    enabled: !!currentProjectId,
  });

  // Fetch forms for the selected project
  const { data: forms = [], isLoading } = useQuery<Form[]>({
    queryKey: [`/api/projects/${currentProjectId}/forms`],
    enabled: !!currentProjectId,
  });

  const filteredForms = forms.filter(form =>
    form.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getFormStatusBadge = (form: Form) => {
    const isActive = form.isActive;
    return (
      <Badge variant={isActive ? "default" : "secondary"} className="text-xs">
        {isActive ? "Active" : "Inactive"}
      </Badge>
    );
  };

  if (!currentProjectId) {
    return (
      <div className="flex h-full">
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <FileText className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-2">
              No Project Selected
            </h3>
            <p className="text-gray-600 dark:text-gray-400 mb-6">
              Please select a project to view its forms
            </p>
            <Link href="/projects">
              <Button>Go to Projects</Button>
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-full">
      {/* Sub-sidebar for forms */}
      <div className="w-80 border-r border-gray-200 dark:border-gray-800 bg-gray-50 dark:bg-gray-900 flex flex-col">
        {/* Header */}
        <div className="p-4 border-b border-gray-200 dark:border-gray-800">
          <div className="flex items-center justify-between mb-3">
            <h2 className="font-semibold text-gray-900 dark:text-gray-100">Forms</h2>
            <Link href={`/form-builder?project=${currentProjectId}`}>
              <Button size="sm" className="h-7">
                <Plus className="w-3 h-3 mr-1" />
                New
              </Button>
            </Link>
          </div>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
            <Input
              type="search"
              placeholder="Search forms..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-9 h-8 text-sm bg-white dark:bg-gray-800 border-gray-300 dark:border-gray-700"
            />
          </div>
        </div>

        {/* Project info */}
        {project && (
          <div className="px-4 py-3 border-b border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-800">
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 bg-green-500 rounded-full"></div>
              <span className="text-sm font-medium text-gray-900 dark:text-gray-100 truncate">
                {project.name}
              </span>
            </div>
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
              {forms.length} form{forms.length !== 1 ? 's' : ''}
            </p>
          </div>
        )}

        {/* Forms list */}
        <div className="flex-1 overflow-y-auto">
          {isLoading ? (
            <div className="p-4 space-y-3">
              {Array.from({ length: 3 }).map((_, i) => (
                <div key={i} className="animate-pulse">
                  <div className="h-16 bg-gray-200 dark:bg-gray-700 rounded-lg"></div>
                </div>
              ))}
            </div>
          ) : filteredForms.length === 0 ? (
            <div className="p-4">
              <Card className="border-dashed border-2 border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800">
                <CardContent className="p-6 text-center">
                  <FileText className="w-12 h-12 text-gray-400 mx-auto mb-3" />
                  <CardTitle className="text-sm font-medium text-gray-900 dark:text-gray-100 mb-2">
                    No forms yet
                  </CardTitle>
                  <CardDescription className="text-xs text-gray-600 dark:text-gray-400 mb-4">
                    Create your first form to get started with collecting data
                  </CardDescription>
                  <Link href={`/form-builder?project=${currentProjectId}`}>
                    <Button size="sm" className="h-8 text-xs">
                      <Plus className="w-3 h-3 mr-1" />
                      Create form
                    </Button>
                  </Link>
                </CardContent>
              </Card>
            </div>
          ) : (
            <div className="p-2 space-y-1">
              {filteredForms.map((form) => (
                <div
                  key={form.id}
                  className="p-3 rounded-lg hover:bg-white dark:hover:bg-gray-800 transition-colors cursor-pointer group border border-transparent hover:border-gray-200 dark:hover:border-gray-700"
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <FileText className="w-4 h-4 text-gray-500 dark:text-gray-400 flex-shrink-0" />
                        <span className="text-sm font-medium text-gray-900 dark:text-gray-100 truncate">
                          {form.name}
                        </span>
                      </div>
                      <div className="flex items-center gap-2 mb-2">
                        {getFormStatusBadge(form)}
                        <span className="text-xs text-gray-500 dark:text-gray-400">
                          {formatDistanceToNow(new Date(form.updatedAt || form.createdAt!), { addSuffix: true })}
                        </span>
                      </div>
                      {form.description && (
                        <p className="text-xs text-gray-600 dark:text-gray-400 line-clamp-2">
                          {form.description}
                        </p>
                      )}
                    </div>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-6 w-6 p-0 opacity-0 group-hover:opacity-100 transition-opacity"
                        >
                          <MoreHorizontal className="w-3 h-3" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end" className="w-40">
                        <DropdownMenuItem asChild>
                          <Link href={`/form-builder/${form.id}`} className="flex items-center cursor-pointer">
                            <Edit className="w-3 h-3 mr-2" />
                            Edit form
                          </Link>
                        </DropdownMenuItem>
                        <DropdownMenuItem>
                          <Copy className="w-3 h-3 mr-2" />
                          Duplicate
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem className="text-red-600 dark:text-red-400">
                          <Trash2 className="w-3 h-3 mr-2" />
                          Delete
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Main content area */}
      <div className="flex-1 flex items-center justify-center bg-white dark:bg-gray-950">
        <div className="text-center">
          <div className="w-16 h-16 mx-auto mb-4 bg-gray-100 dark:bg-gray-800 rounded-full flex items-center justify-center">
            <FileText className="w-8 h-8 text-gray-400 dark:text-gray-500" />
          </div>
          <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-2">
            Select a form to edit
          </h3>
          <p className="text-gray-600 dark:text-gray-400 mb-6 max-w-md">
            Choose a form from the sidebar to start editing, or create a new form to get started
          </p>
          <Link href={`/form-builder?project=${currentProjectId}`}>
            <Button>
              <Plus className="w-4 h-4 mr-2" />
              Create new form
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
}