import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useRoute } from "wouter";
import {
  FileText,
  Plus,
  Search,
  MoreHorizontal,
  Edit,
  Trash2,
  Copy,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Card,
  CardContent,
  CardDescription,
  CardTitle,
} from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useProject } from "@/hooks/useProject";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { FormBuilderInterface } from "@/components/form-editor/FormBuilderInterface";
import { createFormField } from "@/lib/form-builder";
import type { Form, Project } from "@shared/schema";

export default function FormEditor() {
  const [, params] = useRoute("/form-editor/:projectId?");
  const projectId = params?.projectId;
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedFormId, setSelectedFormId] = useState<string | null>(null);
  const [isCreatingForm, setIsCreatingForm] = useState(false);

  // Form creation state
  const [formFields, setFormFields] = useState<any[]>([]);
  const [selectedFieldId, setSelectedFieldId] = useState<string | null>(null);
  const [isPreviewMode, setIsPreviewMode] = useState(false);
  const [showSaveDialog, setShowSaveDialog] = useState(false);
  const [formName, setFormName] = useState("");
  const [formDescription, setFormDescription] = useState("");
  const [editingFormId, setEditingFormId] = useState<string | null>(null);

  // UI state
  const [showFormsList, setShowFormsList] = useState(true);
  const [showPropertiesPanel, setShowPropertiesPanel] = useState(false);

  // Form configuration state
  const [formConfig, setFormConfig] = useState({
    layout: "auto",
    gridColumns: 2,
    spacing: "8px",
    customSpacing: 8,
    showLabels: true,
    buttonLayout: "right" as "left" | "center" | "right" | "justify" | "split",
    submitButtonText: "Submit",
    cancelButtonText: "Cancel",
    submitButtonColor: "#3b82f6",
    cancelButtonColor: "#6b7280",
    showCancelButton: false,
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

  // Fetch forms
  const { data: forms = [] } = useQuery<Form[]>({
    queryKey: [`/api/projects/${currentProjectId}/forms`],
    enabled: !!currentProjectId,
  });

  const filteredForms = forms.filter((form) =>
    form.name.toLowerCase().includes(searchTerm.toLowerCase()),
  );

  // Create form mutation
  const createFormMutation = useMutation({
    mutationFn: async (formData: {
      name: string;
      description?: string;
      projectId: string;
    }) => {
      return await apiRequest(
        `/api/projects/${formData.projectId}/forms`,
        "POST",
        {
          ...formData,
          schema: {
            fields: formFields,
            settings: {
              ...formConfig,
              title: formData.name,
              description: formData.description,
            },
          },
        },
      );
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({
        queryKey: [`/api/projects/${currentProjectId}/forms`],
      });
      setIsCreatingForm(false);
      setShowSaveDialog(false);
      setFormName("");
      setFormDescription("");
      setFormFields([]);
      setSelectedFieldId(null);

      const publicUrl = `${window.location.origin}/form/${currentProjectId}/${formName.trim().toLowerCase().replace(/\s+/g, "-")}`;

      toast({
        title: "Form created successfully",
        description: "Click to copy the public form URL",
        action: (
          <button
            onClick={() => {
              navigator.clipboard.writeText(publicUrl);
              toast({
                title: "URL copied",
                description: "Form URL copied to clipboard",
              });
            }}
            className="text-sm underline"
          >
            Copy URL
          </button>
        ),
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

  // Update form mutation
  const updateFormMutation = useMutation({
    mutationFn: async (formData: {
      id: string;
      name: string;
      description?: string;
      projectId: string;
    }) => {
      return await apiRequest(`/api/forms/${formData.id}`, "PUT", {
        name: formData.name,
        description: formData.description,
        schema: {
          fields: formFields,
          settings: {
            ...formConfig,
            title: formData.name,
            description: formData.description,
          },
        },
      });
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({
        queryKey: [`/api/projects/${currentProjectId}/forms`],
      });
      setIsCreatingForm(false);
      setShowSaveDialog(false);
      setFormName("");
      setFormDescription("");
      setFormFields([]);
      setSelectedFieldId(null);
      setEditingFormId(null);

      toast({
        title: "Form updated successfully",
        description: "Your form has been saved",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Error updating form",
        description: error.message || "Failed to update form",
        variant: "destructive",
      });
    },
  });

  const handleCreateForm = () => {
    if (!formName.trim() || !currentProjectId) return;

    if (editingFormId) {
      updateFormMutation.mutate({
        id: editingFormId,
        name: formName.trim(),
        description: formDescription.trim() || undefined,
        projectId: currentProjectId,
      });
    } else {
      createFormMutation.mutate({
        name: formName.trim(),
        description: formDescription.trim() || undefined,
        projectId: currentProjectId,
      });
    }
  };

  const handleNewFormClick = () => {
    setIsCreatingForm(true);
    setSelectedFormId(null);
    setEditingFormId(null);
    setFormFields([]);
    setSelectedFieldId(null);
    setShowPropertiesPanel(false);
    setFormName("");
    setFormDescription("");
    setFormConfig({
      layout: "auto",
      gridColumns: 2,
      spacing: "8px",
      customSpacing: 8,
      showLabels: true,
      buttonLayout: "right",
      submitButtonText: "Submit",
      cancelButtonText: "Cancel",
      submitButtonColor: "#3b82f6",
      cancelButtonColor: "#6b7280",
      showCancelButton: false,
    });
  };

  const handleFormSelect = (formId: string) => {
    setSelectedFormId(formId);
    setIsCreatingForm(false);

    const selectedForm = forms?.find((f) => f.id === formId);
    if (selectedForm) {
      handleEditForm(selectedForm);
    }
  };

  const handleEditForm = (form: any) => {
    setIsCreatingForm(true);
    setEditingFormId(form.id);
    setFormName(form.name);
    setFormDescription(form.description || "");

    if (form.schema) {
      const fields = form.schema.fields || [];
      const settings = form.schema.settings || {};

      setFormFields(fields);
      setFormConfig({
        layout: settings.layout || "auto",
        gridColumns: settings.gridColumns || 2,
        spacing: settings.spacing || "8px",
        customSpacing: settings.customSpacing || 8,
        showLabels: settings.showLabels !== false,
        buttonLayout: settings.buttonLayout || "right",
        submitButtonText: settings.submitButtonText || "Submit",
        cancelButtonText: settings.cancelButtonText || "Cancel",
        submitButtonColor: settings.submitButtonColor || "#3b82f6",
        cancelButtonColor: settings.cancelButtonColor || "#6b7280",
        showCancelButton: settings.showCancelButton || false,
      });
    }

    setSelectedFieldId(null);
    setShowPropertiesPanel(false);
  };

  const handleSaveForm = () => {
    setShowSaveDialog(true);
  };

  const handleAddField = (fieldType: string) => {
    const newField = createFormField(fieldType as any);
    newField.id = Date.now().toString();
    newField.order = formFields.length;

    if (formConfig.layout === "auto") {
      newField.rowId = `row_${Date.now()}`;
      newField.width = 100;
    }

    setFormFields([...formFields, newField]);
    setSelectedFieldId(newField.id);
    setShowPropertiesPanel(true);
  };

  if (!currentProjectId) {
    return (
      <div className="flex h-full">
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <div className="w-16 h-16 mx-auto mb-4 bg-gray-100 dark:bg-gray-800 rounded-full flex items-center justify-center">
              <FileText className="w-8 h-8 text-gray-400 dark:text-gray-500" />
            </div>
            <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-2">
              No project selected
            </h3>
            <p className="text-gray-600 dark:text-gray-400">
              Please select a project from the header to manage forms
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-full">
      {/* Sub-sidebar for forms */}
      {showFormsList && (
        <div className="w-64 border-r border-gray-200 dark:border-gray-800 bg-gray-50 dark:bg-gray-900 flex flex-col">
          {/* Header */}
          <div className="p-4 border-b border-gray-200 dark:border-gray-800">
            <div className="flex items-center justify-between mb-3">
              <h2 className="font-semibold text-gray-900 dark:text-gray-100">
                Forms
              </h2>
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
                className="pl-9 h-8 text-sm bg-white dark:bg-gray-800"
              />
            </div>
          </div>

          {/* Forms List */}
          <div className="flex-1 overflow-y-auto">
            {filteredForms.length === 0 ? (
              <div className="p-4 text-center">
                <Card className="border-dashed">
                  <CardContent className="pt-6">
                    <div className="w-12 h-12 mx-auto mb-4 bg-gray-100 dark:bg-gray-800 rounded-full flex items-center justify-center">
                      <FileText className="w-6 h-6 text-gray-400 dark:text-gray-500" />
                    </div>
                    <CardTitle className="text-sm font-medium text-gray-900 dark:text-gray-100 mb-2">
                      No forms found
                    </CardTitle>
                    <CardDescription className="text-xs text-gray-600 dark:text-gray-400 mb-4">
                      Create your first form to get started with collecting data
                    </CardDescription>
                    <Button
                      size="sm"
                      className="h-8 text-xs"
                      onClick={handleNewFormClick}
                    >
                      <Plus className="w-3 h-3 mr-1" />
                      Create form
                    </Button>
                  </CardContent>
                </Card>
              </div>
            ) : (
              <div className="p-4 space-y-1">
                {filteredForms.map((form) => (
                  <div
                    key={form.id}
                    className={`p-1.5 rounded-lg hover:bg-white dark:hover:bg-gray-800 transition-colors cursor-pointer group border ${
                      selectedFormId === form.id
                        ? "border-green-200 dark:border-green-800 bg-green-50 dark:bg-green-950"
                        : "border-transparent hover:border-gray-200 dark:hover:border-gray-700"
                    }`}
                    onClick={() => handleFormSelect(form.id)}
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <FileText className="w-4 h-4 text-gray-500 dark:text-gray-400 flex-shrink-0" />
                          <h3 className="text-sm font-medium text-gray-900 dark:text-gray-100 truncate">
                            {form.name}
                          </h3>
                        </div>
                      </div>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button
                            variant="ghost"
                            size="sm"
                            className="h-6 w-6 p-0 opacity-0 group-hover:opacity-100 transition-opacity"
                          >
                            <MoreHorizontal className="h-3 w-3" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" className="w-48">
                          <DropdownMenuItem
                            onClick={() => handleEditForm(form)}
                          >
                            <Edit className="mr-2 h-3 w-3" />
                            Edit
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            onClick={() => {
                              const publicUrl = `${window.location.origin}/form/${currentProjectId}/${form.name.toLowerCase().replace(/\s+/g, "-")}`;
                              navigator.clipboard.writeText(publicUrl);
                              toast({
                                title: "URL copied",
                                description: "Form URL copied to clipboard",
                              });
                            }}
                          >
                            <Copy className="mr-2 h-3 w-3" />
                            Copy Public URL
                          </DropdownMenuItem>
                          <DropdownMenuItem>
                            <Copy className="mr-2 h-3 w-3" />
                            Duplicate
                          </DropdownMenuItem>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem className="text-red-600">
                            <Trash2 className="mr-2 h-3 w-3" />
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
      )}

      {/* Main content area */}
      <div className="flex-1 bg-white dark:bg-gray-950">
        {isCreatingForm ? (
          <FormBuilderInterface
            formFields={formFields}
            setFormFields={setFormFields}
            selectedFieldId={selectedFieldId}
            setSelectedFieldId={setSelectedFieldId}
            showPropertiesPanel={showPropertiesPanel}
            setShowPropertiesPanel={setShowPropertiesPanel}
            isPreviewMode={isPreviewMode}
            setIsPreviewMode={setIsPreviewMode}
            formConfig={formConfig}
            setFormConfig={setFormConfig}
            onSave={handleSaveForm}
            onAddField={handleAddField}
          />
        ) : selectedFormId ? (
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
          <div className="flex items-center justify-center h-full">
            <div className="text-center">
              <div className="w-16 h-16 mx-auto mb-4 bg-gray-100 dark:bg-gray-800 rounded-full flex items-center justify-center">
                <FileText className="w-8 h-8 text-gray-400 dark:text-gray-500" />
              </div>
              <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-2">
                Select a form to edit
              </h3>
              <p className="text-gray-600 dark:text-gray-400 mb-6 max-w-md">
                Choose a form from the sidebar to start editing, or create a new
                form to get started
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
              <DialogTitle>
                {editingFormId ? "Update Form" : "Save Form"}
              </DialogTitle>
              <DialogDescription>
                {editingFormId
                  ? "Update your form name and description."
                  : "Give your form a name and description to save it to your project."}
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
                <Label htmlFor="save-form-description">
                  Description (optional)
                </Label>
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
              <Button
                variant="outline"
                onClick={() => setShowSaveDialog(false)}
              >
                Cancel
              </Button>
              <Button
                onClick={handleCreateForm}
                disabled={
                  !formName.trim() ||
                  createFormMutation.isPending ||
                  updateFormMutation.isPending
                }
              >
                {createFormMutation.isPending || updateFormMutation.isPending
                  ? "Saving..."
                  : editingFormId
                    ? "Update Form"
                    : "Save Form"}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
}