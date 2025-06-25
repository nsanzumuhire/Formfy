import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { useProject } from "@/hooks/useProject";
import { NoProjectsState, ProjectSelector, ProjectLoadingState } from "@/components/project-state";
import { apiRequest } from "@/lib/queryClient";
import {
  Key,
  Plus,
  Copy,
  Trash2,
  Eye,
  EyeOff,
} from "lucide-react";
import type { ApiKey } from "@shared/schema";

export default function ApiKeys() {
  const { 
    projects, 
    currentProject, 
    projectsLoading, 
    hasProjects, 
    needsProjectSelection,
    setSelectedProject 
  } = useProject();
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [newKeyName, setNewKeyName] = useState("");
  const [newKeyEnvironment, setNewKeyEnvironment] = useState<"testing" | "production">("testing");
  const [visibleKeys, setVisibleKeys] = useState<Set<string>>(new Set());

  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: apiKeys, isLoading } = useQuery<ApiKey[]>({
    queryKey: currentProject ? [`/api/projects/${currentProject.id}/api-keys`] : [],
    enabled: !!currentProject,
  });

  const createApiKeyMutation = useMutation({
    mutationFn: async (data: { name: string; environment: string }) => {
      return await apiRequest(`/api/projects/${currentProject?.id}/api-keys`, "POST", data);
    },
    onSuccess: () => {
      toast({
        title: "API Key created",
        description: "Your new API key has been generated successfully.",
      });
      queryClient.invalidateQueries({ queryKey: [`/api/projects/${currentProject?.id}/api-keys`] });
      setShowCreateDialog(false);
      setNewKeyName("");
      setNewKeyEnvironment("testing");
    },
    onError: (error) => {
      toast({
        title: "Error creating API key",
        description: error.message || "Failed to create API key.",
        variant: "destructive",
      });
    },
  });

  const deleteApiKeyMutation = useMutation({
    mutationFn: async (keyId: string) => {
      return await apiRequest(`/api/api-keys/${keyId}`, "DELETE");
    },
    onSuccess: () => {
      toast({
        title: "API Key deleted",
        description: "The API key has been deleted successfully.",
      });
      queryClient.invalidateQueries({ queryKey: [`/api/projects/${currentProject?.id}/api-keys`] });
    },
    onError: (error) => {
      toast({
        title: "Error deleting API key",
        description: error.message || "Failed to delete API key.",
        variant: "destructive",
      });
    },
  });

  const handleCreateApiKey = () => {
    if (!newKeyName.trim()) {
      toast({
        title: "Name required",
        description: "Please enter a name for your API key.",
        variant: "destructive",
      });
      return;
    }

    createApiKeyMutation.mutate({
      name: newKeyName,
      environment: newKeyEnvironment,
    });
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast({
      title: "Copied to clipboard",
      description: "API key has been copied to your clipboard.",
    });
  };

  const toggleKeyVisibility = (keyId: string) => {
    const newVisibleKeys = new Set(visibleKeys);
    if (newVisibleKeys.has(keyId)) {
      newVisibleKeys.delete(keyId);
    } else {
      newVisibleKeys.add(keyId);
    }
    setVisibleKeys(newVisibleKeys);
  };

  const maskApiKey = (key: string) => {
    return `${key.substring(0, 8)}...${key.substring(key.length - 8)}`;
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
          <h1 className="text-3xl font-bold">API Keys</h1>
          <p className="text-muted-foreground mt-1">
            {currentProject?.name} • Project ID: <span className="font-mono text-xs">{currentProject?.id}</span>
          </p>
          <p className="text-muted-foreground text-sm">
            Manage API keys for secure integrations
          </p>
        </div>
        <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
          <DialogTrigger asChild>
            <Button disabled={!currentProject}>
              <Plus className="h-4 w-4 mr-2" />
              Create API Key
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Create New API Key</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <Label htmlFor="key-name">Name</Label>
                <Input
                  id="key-name"
                  value={newKeyName}
                  onChange={(e) => setNewKeyName(e.target.value)}
                  placeholder="e.g., Production Key"
                />
              </div>
              <div>
                <Label htmlFor="key-environment">Environment</Label>
                <Select value={newKeyEnvironment} onValueChange={(value: "testing" | "production") => setNewKeyEnvironment(value)}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="testing">Testing</SelectItem>
                    <SelectItem value="production">Production</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="flex justify-end space-x-2">
                <Button
                  variant="outline"
                  onClick={() => setShowCreateDialog(false)}
                >
                  Cancel
                </Button>
                <Button
                  onClick={handleCreateApiKey}
                  disabled={createApiKeyMutation.isPending}
                >
                  {createApiKeyMutation.isPending ? "Creating..." : "Create"}
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Project Selector */}
      {projects && projects.length > 0 && (
        <div className="flex flex-wrap gap-2">
          {projects.map((project) => (
            <Button
              key={project.id}
              variant={currentProject?.id === project.id ? "default" : "outline"}
              size="sm"
              onClick={() => setSelectedProject(project.id)}
            >
              {project.name}
            </Button>
          ))}
        </div>
      )}

      {/* API Keys List */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <span>Project API Keys</span>
            {currentProject && (
              <Badge variant="outline">
                {currentProject.name}
              </Badge>
            )}
          </CardTitle>
        </CardHeader>
        <CardContent>
          {!currentProject ? (
            <div className="text-center py-8">
              <Key className="h-12 w-12 mx-auto text-muted-foreground/50 mb-4" />
              <h3 className="text-lg font-medium mb-2">Select a project</h3>
              <p className="text-muted-foreground">
                Choose a project to view its API keys
              </p>
            </div>
          ) : isLoading ? (
            <div className="space-y-4">
              {[1, 2].map((i) => (
                <div key={i} className="animate-pulse">
                  <div className="h-20 bg-muted rounded-lg"></div>
                </div>
              ))}
            </div>
          ) : apiKeys && apiKeys.length > 0 ? (
            <div className="space-y-4">
              {apiKeys.map((apiKey) => (
                <div
                  key={apiKey.id}
                  className="p-4 border rounded-lg space-y-3"
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="font-medium">{apiKey.name}</h3>
                      <div className="flex items-center space-x-2 text-sm text-muted-foreground">
                        <Badge 
                          variant={apiKey.environment === "production" ? "default" : "secondary"}
                        >
                          {apiKey.environment}
                        </Badge>
                        <Badge variant={apiKey.isActive ? "default" : "secondary"}>
                          {apiKey.isActive ? "Active" : "Inactive"}
                        </Badge>
                      </div>
                    </div>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => deleteApiKeyMutation.mutate(apiKey.id)}
                      disabled={deleteApiKeyMutation.isPending}
                      className="hover:bg-destructive/10 hover:text-destructive"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                  
                  <div className="flex items-center space-x-2">
                    <code className="flex-1 px-3 py-2 bg-muted rounded text-sm font-mono">
                      {visibleKeys.has(apiKey.id) ? apiKey.key : maskApiKey(apiKey.key)}
                    </code>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => toggleKeyVisibility(apiKey.id)}
                    >
                      {visibleKeys.has(apiKey.id) ? (
                        <EyeOff className="h-4 w-4" />
                      ) : (
                        <Eye className="h-4 w-4" />
                      )}
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => copyToClipboard(apiKey.key)}
                    >
                      <Copy className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8">
              <Key className="h-12 w-12 mx-auto text-muted-foreground/50 mb-4" />
              <h3 className="text-lg font-medium mb-2">No API keys</h3>
              <p className="text-muted-foreground mb-4">
                Create your first API key to start integrating
              </p>
              <Button onClick={() => setShowCreateDialog(true)}>
                <Plus className="h-4 w-4 mr-2" />
                Create API Key
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Integration Instructions */}
      {apiKeys && apiKeys.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Integration Guide</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <h4 className="font-medium mb-2">React SDK</h4>
              <code className="block p-3 bg-muted rounded text-sm">
                {`<FormBuilder 
  formName="your-form-name" 
  projectId="${currentProject?.id}" 
  apiKey="your-api-key" 
/>`}
              </code>
            </div>
            <div>
              <h4 className="font-medium mb-2">Angular SDK</h4>
              <code className="block p-3 bg-muted rounded text-sm">
                {`<form-builder 
  [formName]="'your-form-name'" 
  [projectId]="'${currentProject?.id}'" 
  [apiKey]="'your-api-key'">
</form-builder>`}
              </code>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
