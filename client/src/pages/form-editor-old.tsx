import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useRoute, Link } from "wouter";
import { 
  FileText, Plus, Search, MoreHorizontal, Edit, Trash2, Copy, 
  Settings, Grid3X3, Rows, Square, Palette, Type, Move, 
  PanelRightOpen, AlignLeft, Hash, CheckSquare, Circle, ChevronDown,
  Grip, Save, Eye, Layout, Maximize, ArrowLeftRight
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Separator } from "@/components/ui/separator";
import { Slider } from "@/components/ui/slider";
import { Checkbox } from "@/components/ui/checkbox";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
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
  const [formFields, setFormFields] = useState<any[]>([]);
  const [selectedFieldId, setSelectedFieldId] = useState<string | null>(null);
  const [showSaveDialog, setShowSaveDialog] = useState(false);
  const [formName, setFormName] = useState("");
  const [formDescription, setFormDescription] = useState("");
  
  // UI state
  const [showFormsList, setShowFormsList] = useState(true);
  const [showPropertiesPanel, setShowPropertiesPanel] = useState(false);
  
  // Form configuration state
  const [formConfig, setFormConfig] = useState({
    layout: "single-column",
    gridColumns: 2,
    spacing: "normal",
    width: "auto", // "auto" or "full"
    maxWidth: 600,
    borderRadius: 8,
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
        schema: { 
          fields: formFields,
          settings: {
            ...formConfig,
            title: formData.name,
            description: formData.description
          }
        },
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [`/api/projects/${currentProjectId}/forms`] });
      setIsCreatingForm(false);
      setShowSaveDialog(false);
      setFormName("");
      setFormDescription("");
      setFormFields([]);
      setSelectedFieldId(null);
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
    setFormFields([]);
    setSelectedFieldId(null);
    setShowPropertiesPanel(false);
  };

  const handleFormSelect = (formId: string) => {
    setSelectedFormId(formId);
    setIsCreatingForm(false);
  };

  const handleFieldSelect = (fieldId: string) => {
    setSelectedFieldId(fieldId);
    setShowPropertiesPanel(true);
  };

  const handleSaveForm = () => {
    setShowSaveDialog(true);
  };

  const handleAddField = (fieldType: string) => {
    const newField = {
      id: Date.now().toString(),
      type: fieldType,
      label: getFieldLabel(fieldType),
      placeholder: getFieldPlaceholder(fieldType),
      required: false,
      order: formFields.length,
    };
    setFormFields([...formFields, newField]);
    setSelectedFieldId(newField.id);
  };

  const getFieldLabel = (type: string) => {
    const labels: Record<string, string> = {
      text: "Text Input",
      email: "Email",
      number: "Number",
      checkbox: "Checkbox",
      radio: "Radio Button",
      select: "Dropdown",
    };
    return labels[type] || "Field";
  };

  const getFieldPlaceholder = (type: string) => {
    const placeholders: Record<string, string> = {
      text: "Enter text...",
      email: "Enter email address...",
      number: "Enter number...",
      checkbox: "Check this option",
      radio: "Select option",
      select: "Choose an option",
    };
    return placeholders[type] || "Enter value...";
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
      {showFormsList && (
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
      )}

      {/* Main content area */}
      <div className="flex-1 bg-white dark:bg-gray-950">
        {isCreatingForm ? (
          /* Form Builder Interface */
          <div className="h-full flex">
            {/* Toolbox Sidebar */}
            <div className="w-16 border-r border-gray-200 dark:border-gray-800 bg-gray-50 dark:bg-gray-900 flex flex-col">
              {/* Tools Header */}
              <div className="p-3 border-b border-gray-200 dark:border-gray-800">
                <button
                  onClick={() => setShowFormsList(!showFormsList)}
                  className="w-6 h-6 text-gray-600 dark:text-gray-400 mx-auto hover:text-gray-800 dark:hover:text-gray-200 transition-colors"
                  title="Toggle Forms List"
                >
                  <PanelRightOpen className="w-6 h-6" />
                </button>
              </div>
              
              {/* Field Tools */}
              <div className="flex-1 p-2 space-y-2">
                <button
                  onClick={() => handleAddField('text')}
                  className="w-full p-2 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-800 transition-colors group"
                  title="Text Input"
                >
                  <AlignLeft className="w-5 h-5 text-gray-600 dark:text-gray-400 mx-auto" />
                </button>
                
                <button
                  onClick={() => handleAddField('email')}
                  className="w-full p-2 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-800 transition-colors group"
                  title="Email Input"
                >
                  <Type className="w-5 h-5 text-gray-600 dark:text-gray-400 mx-auto" />
                </button>
                
                <button
                  onClick={() => handleAddField('number')}
                  className="w-full p-2 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-800 transition-colors group"
                  title="Number Input"
                >
                  <Hash className="w-5 h-5 text-gray-600 dark:text-gray-400 mx-auto" />
                </button>
                
                <button
                  onClick={() => handleAddField('checkbox')}
                  className="w-full p-2 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-800 transition-colors group"
                  title="Checkbox"
                >
                  <CheckSquare className="w-5 h-5 text-gray-600 dark:text-gray-400 mx-auto" />
                </button>
                
                <button
                  onClick={() => handleAddField('radio')}
                  className="w-full p-2 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-800 transition-colors group"
                  title="Radio Button"
                >
                  <Circle className="w-5 h-5 text-gray-600 dark:text-gray-400 mx-auto" />
                </button>
                
                <button
                  onClick={() => handleAddField('select')}
                  className="w-full p-2 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-800 transition-colors group"
                  title="Dropdown"
                >
                  <ChevronDown className="w-5 h-5 text-gray-600 dark:text-gray-400 mx-auto" />
                </button>
              </div>
            </div>

            {/* Canvas Area */}
            <div className="flex-1 flex flex-col">
              {/* Top Toolbar */}
              <div className="h-12 border-b border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-950 flex items-center justify-between px-4">
                <div className="flex items-center gap-2">
                  <Layout className="w-4 h-4 text-gray-500" />
                  <span className="text-sm text-gray-600 dark:text-gray-400">Form Builder</span>
                </div>
                <div className="flex items-center gap-2">
                  <Button variant="outline" size="sm">
                    <Eye className="w-4 h-4 mr-1" />
                    Preview
                  </Button>
                  <Button size="sm" onClick={handleSaveForm}>
                    <Save className="w-4 h-4 mr-1" />
                    Save
                  </Button>
                </div>
              </div>

              {/* Canvas */}
              <div className="flex-1 bg-gray-100 dark:bg-gray-900 p-6">
                <div className="max-w-2xl mx-auto">
                  <div 
                    className="bg-white dark:bg-gray-950 rounded-lg shadow-sm border border-gray-200 dark:border-gray-800 min-h-[500px] p-6"
                    style={{ maxWidth: `${formConfig.maxWidth}px` }}
                  >
                    {formFields.length === 0 ? (
                      <div className="flex items-center justify-center h-full text-center py-16">
                        <div>
                          <Grip className="w-12 h-12 text-gray-300 dark:text-gray-600 mx-auto mb-4" />
                          <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-2">
                            Start building your form
                          </h3>
                          <p className="text-gray-500 dark:text-gray-400 text-sm">
                            Click on field icons from the left sidebar to add them to your form
                          </p>
                        </div>
                      </div>
                    ) : (
                      <div className="space-y-4">
                        {formFields.map((field) => (
                          <div
                            key={field.id}
                            className={`p-4 border rounded-lg cursor-pointer transition-all ${
                              selectedFieldId === field.id 
                                ? "border-blue-500 bg-blue-50 dark:bg-blue-950" 
                                : "border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600"
                            }`}
                            onClick={() => setSelectedFieldId(field.id)}
                          >
                            <div className="flex items-center justify-between mb-2">
                              <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                                {field.label}
                                {field.required && <span className="text-red-500 ml-1">*</span>}
                              </label>
                              <div className="flex items-center gap-1">
                                <button className="p-1 hover:bg-gray-100 dark:hover:bg-gray-800 rounded">
                                  <Edit className="w-3 h-3 text-gray-400" />
                                </button>
                                <button className="p-1 hover:bg-gray-100 dark:hover:bg-gray-800 rounded">
                                  <Trash2 className="w-3 h-3 text-gray-400" />
                                </button>
                                <button className="p-1 hover:bg-gray-100 dark:hover:bg-gray-800 rounded cursor-grab">
                                  <Grip className="w-3 h-3 text-gray-400" />
                                </button>
                              </div>
                            </div>
                            
                            {field.type === 'text' || field.type === 'email' || field.type === 'number' ? (
                              <Input placeholder={field.placeholder} disabled className="bg-gray-50 dark:bg-gray-900" />
                            ) : field.type === 'checkbox' ? (
                              <div className="flex items-center gap-2">
                                <input type="checkbox" disabled className="rounded" />
                                <span className="text-sm text-gray-600 dark:text-gray-400">{field.placeholder}</span>
                              </div>
                            ) : field.type === 'radio' ? (
                              <div className="space-y-2">
                                <div className="flex items-center gap-2">
                                  <Circle className="w-4 h-4 text-gray-400" />
                                  <span className="text-sm text-gray-600 dark:text-gray-400">Option 1</span>
                                </div>
                                <div className="flex items-center gap-2">
                                  <Circle className="w-4 h-4 text-gray-400" />
                                  <span className="text-sm text-gray-600 dark:text-gray-400">Option 2</span>
                                </div>
                              </div>
                            ) : field.type === 'select' ? (
                              <Select disabled>
                                <SelectTrigger className="bg-gray-50 dark:bg-gray-900">
                                  <SelectValue placeholder={field.placeholder} />
                                </SelectTrigger>
                              </Select>
                            ) : null}
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
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

        {/* Save Form Dialog */}
        <Dialog open={showSaveDialog} onOpenChange={setShowSaveDialog}>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle>Save Form</DialogTitle>
              <DialogDescription>
                Give your form a name and description to save it to your project.
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <Label htmlFor="save-form-name">Form Name</Label>
                <Input
                  id="save-form-name"
                  placeholder="Enter form name..."
                  value={formName}
                  onChange={(e) => setFormName(e.target.value)}
                  className="mt-1"
                />
              </div>
              <div>
                <Label htmlFor="save-form-description">Description (optional)</Label>
                <Textarea
                  id="save-form-description"
                  placeholder="Brief description of your form..."
                  value={formDescription}
                  onChange={(e) => setFormDescription(e.target.value)}
                  className="mt-1 resize-none"
                  rows={3}
                />
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setShowSaveDialog(false)}>
                Cancel
              </Button>
              <Button 
                onClick={handleCreateForm}
                disabled={!formName.trim() || createFormMutation.isPending}
              >
                {createFormMutation.isPending ? "Saving..." : "Save Form"}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
}