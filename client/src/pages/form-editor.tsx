import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useRoute, Link } from "wouter";
import { 
  FileText, Plus, Search, MoreHorizontal, Edit, Trash2, Copy, 
  Settings, Grid3X3, Rows, Square, Palette, Type, Move 
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Separator } from "@/components/ui/separator";
import { Slider } from "@/components/ui/slider";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";
import { useProject } from "@/hooks/useProject";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import type { Form, Project } from "@shared/schema";
import { formatDistanceToNow } from "date-fns";

export default function FormEditor() {
  const [, params] = useRoute("/form-editor/:projectId?");
  const projectId = params?.projectId;
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedFormId, setSelectedFormId] = useState<string | null>(null);
  const [isCreatingForm, setIsCreatingForm] = useState(false);
  
  // Form creation state
  const [formName, setFormName] = useState("");
  const [formDescription, setFormDescription] = useState("");
  
  // Form configuration state
  const [formConfig, setFormConfig] = useState({
    layout: "single-column",
    maxWidth: 600,
    borderRadius: 8,
    spacing: "normal",
    theme: "light",
    backgroundColor: "#ffffff",
    textColor: "#000000",
  });

  const { selectedProject } = useProject();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  
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

  // Create form mutation
  const createFormMutation = useMutation({
    mutationFn: async (formData: { name: string; description?: string; projectId: string }) => {
      return await apiRequest(`/api/projects/${formData.projectId}/forms`, "POST", {
        ...formData,
        schema: { fields: [], settings: formConfig },
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [`/api/projects/${currentProjectId}/forms`] });
      setIsCreatingForm(false);
      setFormName("");
      setFormDescription("");
      toast({
        title: "Form created",
        description: "Your new form has been created successfully.",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Error creating form",
        description: error.message || "Failed to create form",
        variant: "destructive",
      });
    },
  });

  const getFormStatusBadge = (form: Form) => {
    const isActive = form.isActive;
    return (
      <Badge variant={isActive ? "default" : "secondary"} className="text-xs">
        {isActive ? "Active" : "Inactive"}
      </Badge>
    );
  };

  const handleCreateForm = () => {
    if (!formName.trim() || !currentProjectId) return;
    
    createFormMutation.mutate({
      name: formName.trim(),
      description: formDescription.trim() || undefined,
      projectId: currentProjectId,
    });
  };

  const handleNewFormClick = () => {
    setIsCreatingForm(true);
    setSelectedFormId(null);
  };

  const handleFormSelect = (formId: string) => {
    setSelectedFormId(formId);
    setIsCreatingForm(false);
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
            <Button size="sm" className="h-7" onClick={handleNewFormClick}>
              <Plus className="w-3 h-3 mr-1" />
              New
            </Button>
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
                  <Button size="sm" className="h-8 text-xs" onClick={handleNewFormClick}>
                    <Plus className="w-3 h-3 mr-1" />
                    Create form
                  </Button>
                </CardContent>
              </Card>
            </div>
          ) : (
            <div className="p-2 space-y-1">
              {filteredForms.map((form) => (
                <div
                  key={form.id}
                  className={`p-3 rounded-lg hover:bg-white dark:hover:bg-gray-800 transition-colors cursor-pointer group border ${
                    selectedFormId === form.id 
                      ? "border-blue-200 dark:border-blue-800 bg-blue-50 dark:bg-blue-950" 
                      : "border-transparent hover:border-gray-200 dark:hover:border-gray-700"
                  }`}
                  onClick={() => handleFormSelect(form.id)}
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
      <div className="flex-1 bg-white dark:bg-gray-950">
        {isCreatingForm ? (
          /* Form Creation Interface */
          <div className="h-full flex">
            {/* Form Builder Canvas */}
            <div className="flex-1 p-6">
              <div className="max-w-4xl mx-auto">
                <div className="mb-6">
                  <h1 className="text-2xl font-semibold text-gray-900 dark:text-gray-100 mb-2">
                    Create New Form
                  </h1>
                  <p className="text-gray-600 dark:text-gray-400">
                    Build your form with drag-and-drop fields and customize its appearance
                  </p>
                </div>

                {/* Form Basic Info */}
                <Card className="mb-6">
                  <CardHeader>
                    <CardTitle className="text-lg">Form Details</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div>
                      <Label htmlFor="form-name">Form Name</Label>
                      <Input
                        id="form-name"
                        placeholder="Enter form name..."
                        value={formName}
                        onChange={(e) => setFormName(e.target.value)}
                        className="mt-1"
                      />
                    </div>
                    <div>
                      <Label htmlFor="form-description">Description (optional)</Label>
                      <Textarea
                        id="form-description"
                        placeholder="Brief description of your form..."
                        value={formDescription}
                        onChange={(e) => setFormDescription(e.target.value)}
                        className="mt-1 resize-none"
                        rows={3}
                      />
                    </div>
                  </CardContent>
                </Card>

                {/* Form Preview */}
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Form Preview</CardTitle>
                    <CardDescription>
                      This is how your form will appear to users
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div 
                      className="p-8 border-2 border-dashed border-gray-300 dark:border-gray-700 rounded-lg text-center min-h-[300px] flex items-center justify-center"
                      style={{
                        maxWidth: `${formConfig.maxWidth}px`,
                        backgroundColor: formConfig.backgroundColor,
                        borderRadius: `${formConfig.borderRadius}px`,
                        color: formConfig.textColor,
                      }}
                    >
                      <div>
                        <FileText className="w-16 h-16 mx-auto mb-4 text-gray-400" />
                        <h3 className="text-lg font-medium mb-2">
                          {formName || "Untitled Form"}
                        </h3>
                        <p className="text-sm text-gray-500 mb-4">
                          {formDescription || "Add fields to start building your form"}
                        </p>
                        <p className="text-xs text-gray-400">
                          Drag fields from the toolbox to start building
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Action Buttons */}
                <div className="flex justify-end gap-3 mt-6">
                  <Button 
                    variant="outline" 
                    onClick={() => setIsCreatingForm(false)}
                  >
                    Cancel
                  </Button>
                  <Button 
                    onClick={handleCreateForm}
                    disabled={!formName.trim() || createFormMutation.isPending}
                  >
                    {createFormMutation.isPending ? "Creating..." : "Create Form"}
                  </Button>
                </div>
              </div>
            </div>

            {/* Configuration Panel */}
            <div className="w-80 border-l border-gray-200 dark:border-gray-800 bg-gray-50 dark:bg-gray-900 p-4">
              <h3 className="font-semibold text-gray-900 dark:text-gray-100 mb-4">
                Form Configuration
              </h3>
              
              <Tabs defaultValue="layout" className="w-full">
                <TabsList className="grid w-full grid-cols-2">
                  <TabsTrigger value="layout">Layout</TabsTrigger>
                  <TabsTrigger value="style">Style</TabsTrigger>
                </TabsList>
                
                <TabsContent value="layout" className="space-y-4 mt-4">
                  <div>
                    <Label className="text-sm font-medium flex items-center gap-2 mb-3">
                      <Grid3X3 className="w-4 h-4" />
                      Layout Type
                    </Label>
                    <Select 
                      value={formConfig.layout} 
                      onValueChange={(value) => setFormConfig({...formConfig, layout: value})}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="single-column">Single Column</SelectItem>
                        <SelectItem value="two-column">Two Columns</SelectItem>
                        <SelectItem value="grid">Grid Layout</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <Label className="text-sm font-medium flex items-center gap-2 mb-3">
                      <Square className="w-4 h-4" />
                      Max Width ({formConfig.maxWidth}px)
                    </Label>
                    <Slider
                      value={[formConfig.maxWidth]}
                      onValueChange={([value]) => setFormConfig({...formConfig, maxWidth: value})}
                      min={400}
                      max={1200}
                      step={50}
                      className="w-full"
                    />
                  </div>

                  <div>
                    <Label className="text-sm font-medium flex items-center gap-2 mb-3">
                      <Move className="w-4 h-4" />
                      Field Spacing
                    </Label>
                    <Select 
                      value={formConfig.spacing} 
                      onValueChange={(value) => setFormConfig({...formConfig, spacing: value})}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="compact">Compact</SelectItem>
                        <SelectItem value="normal">Normal</SelectItem>
                        <SelectItem value="relaxed">Relaxed</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </TabsContent>

                <TabsContent value="style" className="space-y-4 mt-4">
                  <div>
                    <Label className="text-sm font-medium flex items-center gap-2 mb-3">
                      <Square className="w-4 h-4" />
                      Border Radius ({formConfig.borderRadius}px)
                    </Label>
                    <Slider
                      value={[formConfig.borderRadius]}
                      onValueChange={([value]) => setFormConfig({...formConfig, borderRadius: value})}
                      min={0}
                      max={24}
                      step={2}
                      className="w-full"
                    />
                  </div>

                  <div>
                    <Label className="text-sm font-medium flex items-center gap-2 mb-3">
                      <Palette className="w-4 h-4" />
                      Theme
                    </Label>
                    <Select 
                      value={formConfig.theme} 
                      onValueChange={(value) => setFormConfig({...formConfig, theme: value})}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="light">Light</SelectItem>
                        <SelectItem value="dark">Dark</SelectItem>
                        <SelectItem value="minimal">Minimal</SelectItem>
                        <SelectItem value="modern">Modern</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <Label className="text-sm font-medium mb-3 block">Background Color</Label>
                    <Input
                      type="color"
                      value={formConfig.backgroundColor}
                      onChange={(e) => setFormConfig({...formConfig, backgroundColor: e.target.value})}
                      className="w-full h-10"
                    />
                  </div>

                  <div>
                    <Label className="text-sm font-medium mb-3 block">Text Color</Label>
                    <Input
                      type="color"
                      value={formConfig.textColor}
                      onChange={(e) => setFormConfig({...formConfig, textColor: e.target.value})}
                      className="w-full h-10"
                    />
                  </div>
                </TabsContent>
              </Tabs>
            </div>
          </div>
        ) : selectedFormId ? (
          /* Form Editor Interface */
          <div className="p-6">
            <div className="text-center py-12">
              <div className="w-16 h-16 mx-auto mb-4 bg-gray-100 dark:bg-gray-800 rounded-full flex items-center justify-center">
                <Edit className="w-8 h-8 text-gray-400 dark:text-gray-500" />
              </div>
              <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-2">
                Form Editor Coming Soon
              </h3>
              <p className="text-gray-600 dark:text-gray-400 mb-6 max-w-md">
                Form editing interface will be available in the next update
              </p>
            </div>
          </div>
        ) : (
          /* Default State */
          <div className="flex items-center justify-center h-full">
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
              <Button onClick={handleNewFormClick}>
                <Plus className="w-4 h-4 mr-2" />
                Create new form
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}