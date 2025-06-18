import { useState, useCallback } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useRoute } from "wouter";
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
  useDroppable,
  DragOverEvent,
} from "@dnd-kit/core";
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
  useSortable,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { useDraggable } from "@dnd-kit/core";
import {
  FileText,
  Plus,
  Search,
  MoreHorizontal,
  Edit,
  Trash2,
  Copy,
  Link as LinkIcon,
  Settings,
  Grid3X3,
  Rows,
  Square,
  Palette,
  Type,
  Move,
  PanelRightOpen,
  AlignLeft,
  Hash,
  CheckSquare,
  Circle,
  ChevronDown,
  Grip,
  Save,
  Eye,
  Layout,
  Maximize,
  ArrowLeftRight,
  Calendar,
  Phone,
  Upload,
} from "lucide-react";

// UI Components
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Separator } from "@/components/ui/separator";
import { Slider } from "@/components/ui/slider";
import { Checkbox } from "@/components/ui/checkbox";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem } from "@/components/ui/command";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";

// Hooks and Utils
import { useProject } from "@/hooks/useProject";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { FormFieldData, generateFieldId, createFormField, organizeFieldsIntoRows } from "@/lib/form-builder";
import { Form, Project } from "@shared/schema";

// =============================================================================
// TYPES AND INTERFACES
// =============================================================================

export type FieldType = "text" | "email" | "number" | "checkbox" | "radio" | "select" | "textarea" | "date" | "tel" | "url" | "file";

interface FieldDefinition {
  type: FieldType;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
}

interface FormConfig {
  layout: string;
  gridColumns: number;
  spacing: string;
  customSpacing: number;
  showLabels: boolean;
  buttonLayout: "left" | "center" | "right" | "justify" | "split";
  submitButtonText: string;
  cancelButtonText: string;
  submitButtonColor: string;
  cancelButtonColor: string;
  showCancelButton: boolean;
}

// =============================================================================
// DRAGGABLE FIELD TOOLBOX COMPONENT
// =============================================================================

const fieldTypes: FieldDefinition[] = [
  { type: "text", label: "Text Input", icon: Type },
  { type: "email", label: "Email", icon: Type },
  { type: "number", label: "Number", icon: Hash },
  { type: "textarea", label: "Textarea", icon: AlignLeft },
  { type: "select", label: "Select", icon: ChevronDown },
  { type: "radio", label: "Radio", icon: Circle },
  { type: "checkbox", label: "Checkbox", icon: CheckSquare },
  { type: "date", label: "Date", icon: Calendar },
  { type: "tel", label: "Phone", icon: Phone },
  { type: "url", label: "URL", icon: Type },
  { type: "file", label: "File Upload", icon: Upload },
];

function DraggableField({ field }: { field: FieldDefinition }) {
  const { attributes, listeners, setNodeRef, transform } = useDraggable({
    id: `field-${field.type}`,
    data: { fieldType: field.type },
  });

  const style = transform ? { transform: `translate3d(${transform.x}px, ${transform.y}px, 0)` } : undefined;

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...listeners}
      {...attributes}
      className="p-3 border border-gray-200 dark:border-gray-700 rounded-lg cursor-grab hover:bg-gray-50 dark:hover:bg-gray-800 flex items-center gap-3 transition-colors"
    >
      <field.icon className="w-4 h-4 text-gray-600 dark:text-gray-400" />
      <span className="text-sm font-medium">{field.label}</span>
    </div>
  );
}

// =============================================================================
// SORTABLE FORM FIELD COMPONENT
// =============================================================================

function SortableField({ field, isSelected, onSelect, onUpdate, onDelete }: {
  field: FormFieldData;
  isSelected: boolean;
  onSelect: () => void;
  onUpdate: (updates: Partial<FormFieldData>) => void;
  onDelete: () => void;
}) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id: field.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  const renderFieldInput = () => {
    switch (field.type) {
      case "text":
      case "email":
      case "number":
      case "tel":
      case "url":
        return <Input type={field.type} placeholder={field.placeholder} disabled className="bg-gray-50 dark:bg-gray-900" />;
      case "textarea":
        return <Textarea placeholder={field.placeholder} disabled className="bg-gray-50 dark:bg-gray-900 resize-none" rows={3} />;
      case "date":
        return <Input type="date" disabled className="bg-gray-50 dark:bg-gray-900" />;
      case "file":
        return <Input type="file" disabled className="bg-gray-50 dark:bg-gray-900" />;
      case "checkbox":
        return (
          <div className="flex items-center gap-2">
            <Checkbox disabled />
            <span className="text-sm text-gray-600 dark:text-gray-400">{field.placeholder}</span>
          </div>
        );
      case "radio":
        return (
          <RadioGroup disabled className={field.layout === "horizontal" ? "flex flex-wrap gap-4" : "space-y-2"}>
            {(field.options || [{ label: "Option 1", value: "option1" }, { label: "Option 2", value: "option2" }]).map((option: any, index: number) => (
              <div key={index} className="flex items-center gap-2">
                <RadioGroupItem value={option.value} id={`radio-${field.id}-${index}`} disabled />
                <Label htmlFor={`radio-${field.id}-${index}`} className="text-sm text-gray-600 dark:text-gray-400">{option.label}</Label>
              </div>
            ))}
          </RadioGroup>
        );
      case "select":
        return (
          <Select disabled>
            <SelectTrigger className="bg-gray-50 dark:bg-gray-900">
              <SelectValue placeholder={field.placeholder} />
            </SelectTrigger>
          </Select>
        );
      default:
        return null;
    }
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={`group relative p-4 bg-white dark:bg-gray-800 border-2 rounded-lg transition-all ${
        isSelected ? "border-blue-500 ring-2 ring-blue-500/20" : "border-gray-200 dark:border-gray-700"
      } ${isDragging ? "opacity-50" : ""} hover:border-gray-300 dark:hover:border-gray-600`}
      onClick={onSelect}
    >
      <div className="flex items-center justify-between mb-2">
        <div className="flex-1">
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            {field.label}
            {field.required && <span className="text-red-500 ml-1">*</span>}
          </label>
        </div>
        <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
          <button
            type="button"
            onClick={(e) => { e.stopPropagation(); onDelete(); }}
            className="p-1 hover:bg-gray-100 dark:hover:bg-gray-700 rounded"
          >
            <Trash2 className="w-3 h-3 text-gray-400 hover:text-red-600" />
          </button>
          <button type="button" className="p-1 hover:bg-gray-100 dark:hover:bg-gray-700 rounded cursor-grab" {...attributes} {...listeners}>
            <Grip className="w-3 h-3 text-gray-400" />
          </button>
        </div>
      </div>
      {field.description && <p className="text-xs text-gray-500 dark:text-gray-400 mb-2">{field.description}</p>}
      {renderFieldInput()}
    </div>
  );
}

// =============================================================================
// FORM SETTINGS COMPONENT
// =============================================================================

function FormSettings({ config, onChange }: { config: FormConfig; onChange: (config: FormConfig) => void }) {
  const [isExpanded, setIsExpanded] = useState(false);

  const updateConfig = (updates: Partial<FormConfig>) => {
    onChange({ ...config, ...updates });
  };

  return (
    <Collapsible open={isExpanded} onOpenChange={setIsExpanded}>
      <CollapsibleTrigger asChild>
        <Button variant="outline" size="sm" className="flex items-center gap-2">
          <Settings className="w-4 h-4" />
          Form Settings
        </Button>
      </CollapsibleTrigger>
      <CollapsibleContent className="mt-4">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 p-4 bg-gray-50 dark:bg-gray-900 rounded-lg">
          {/* Layout Settings */}
          <div className="space-y-4">
            <h4 className="font-medium flex items-center gap-2">
              <Grid3X3 className="w-4 h-4" />
              Layout
            </h4>
            <div className="space-y-2">
              <Label>Form Layout</Label>
              <Select value={config.layout} onValueChange={(value) => updateConfig({ layout: value })}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="auto">Auto Layout</SelectItem>
                  <SelectItem value="single">Single Column</SelectItem>
                  <SelectItem value="grid">Grid Layout</SelectItem>
                </SelectContent>
              </Select>
            </div>
            {config.layout === "grid" && (
              <div className="space-y-2">
                <Label>Grid Columns: {config.gridColumns}</Label>
                <Slider
                  value={[config.gridColumns]}
                  onValueChange={(value) => updateConfig({ gridColumns: value[0] })}
                  min={1}
                  max={4}
                  step={1}
                  className="w-full"
                />
              </div>
            )}
          </div>

          {/* Display Settings */}
          <div className="space-y-4">
            <h4 className="font-medium flex items-center gap-2">
              <Rows className="w-4 h-4" />
              Display
            </h4>
            <div className="flex items-center space-x-2">
              <Checkbox
                id="showLabels"
                checked={config.showLabels}
                onCheckedChange={(checked) => updateConfig({ showLabels: checked as boolean })}
              />
              <Label htmlFor="showLabels">Show field labels</Label>
            </div>
          </div>

          {/* Button Settings */}
          <div className="space-y-4">
            <h4 className="font-medium flex items-center gap-2">
              <Palette className="w-4 h-4" />
              Buttons
            </h4>
            <div className="space-y-2">
              <Label>Submit Button Text</Label>
              <Input
                value={config.submitButtonText}
                onChange={(e) => updateConfig({ submitButtonText: e.target.value })}
                placeholder="Submit"
              />
            </div>
          </div>
        </div>
      </CollapsibleContent>
    </Collapsible>
  );
}

// =============================================================================
// MAIN FORM EDITOR COMPONENT
// =============================================================================

export default function FormEditor() {
  const [, params] = useRoute("/form-editor/:projectId?");
  const projectId = params?.projectId;
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedFormId, setSelectedFormId] = useState<string | null>(null);
  const [isCreatingForm, setIsCreatingForm] = useState(false);

  // Form creation state
  const [formFields, setFormFields] = useState<FormFieldData[]>([]);
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
  const [formConfig, setFormConfig] = useState<FormConfig>({
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

  const { selectedProject } = useProject();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const currentProjectId = projectId || selectedProject;

  // DnD sensors
  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates }),
  );

  // Fetch project and forms
  const { data: project } = useQuery<Project>({
    queryKey: [`/api/projects/${currentProjectId}`],
    enabled: !!currentProjectId,
  });

  const { data: forms = [] } = useQuery<Form[]>({
    queryKey: [`/api/projects/${currentProjectId}/forms`],
    enabled: !!currentProjectId,
  });

  const filteredForms = forms.filter((form) =>
    form.name.toLowerCase().includes(searchTerm.toLowerCase()),
  );

  // =============================================================================
  // DRAG AND DROP HANDLERS
  // =============================================================================

  const handleDragEnd = useCallback((event: DragEndEvent) => {
    const { active, over } = event;
    if (!over) return;

    // Handle dropping from toolbox
    if (active.id.toString().startsWith("field-")) {
      const fieldType = active.data.current?.fieldType;
      if (fieldType) {
        const newField = createFormField(fieldType);
        newField.order = formFields.length;
        setFormFields(prev => [...prev, newField]);
        setSelectedFieldId(newField.id);
      }
      return;
    }

    // Handle reordering existing fields
    const activeIndex = formFields.findIndex(field => field.id === active.id);
    const overIndex = formFields.findIndex(field => field.id === over.id);

    if (activeIndex !== overIndex) {
      setFormFields(prev => {
        const reordered = arrayMove(prev, activeIndex, overIndex);
        return reordered.map((field, index) => ({ ...field, order: index }));
      });
    }
  }, [formFields]);

  // =============================================================================
  // FORM MUTATIONS
  // =============================================================================

  const createFormMutation = useMutation({
    mutationFn: async (formData: { name: string; description?: string; projectId: string }) => {
      return await apiRequest(`/api/projects/${formData.projectId}/forms`, "POST", {
        ...formData,
        schema: {
          fields: formFields,
          settings: { ...formConfig, title: formData.name, description: formData.description },
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
      toast({ title: "Form created successfully" });
    },
  });

  const updateFormMutation = useMutation({
    mutationFn: async (formData: { id: string; name: string; description?: string }) => {
      return await apiRequest(`/api/forms/${formData.id}`, "PATCH", {
        name: formData.name,
        description: formData.description,
        schema: {
          fields: formFields,
          settings: { ...formConfig, title: formData.name, description: formData.description },
        },
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [`/api/projects/${currentProjectId}/forms`] });
      toast({ title: "Form updated successfully" });
    },
  });

  // =============================================================================
  // EVENT HANDLERS
  // =============================================================================

  const handleNewFormClick = () => {
    setIsCreatingForm(true);
    setFormFields([]);
    setSelectedFieldId(null);
    setEditingFormId(null);
    setShowFormsList(false);
  };

  const handleEditForm = (form: Form) => {
    setEditingFormId(form.id);
    setIsCreatingForm(true);
    setShowFormsList(false);
    const schema = form.schema as any;
    if (schema?.fields) {
      setFormFields(schema.fields);
    }
    if (schema?.settings) {
      setFormConfig(prev => ({ ...prev, ...schema.settings }));
    }
    setFormName(form.name);
    setFormDescription(form.description || "");
  };

  const handleSaveForm = () => {
    if (formFields.length === 0) {
      toast({ title: "No fields to save", description: "Add some fields to your form before saving.", variant: "destructive" });
      return;
    }
    setShowSaveDialog(true);
  };

  const handleCreateForm = () => {
    if (!formName.trim()) return;

    if (editingFormId) {
      updateFormMutation.mutate({ id: editingFormId, name: formName.trim(), description: formDescription.trim() || undefined });
    } else {
      createFormMutation.mutate({ name: formName.trim(), description: formDescription.trim() || undefined, projectId: currentProjectId });
    }
  };

  const handlePreview = () => {
    if (formFields.length === 0) {
      toast({ title: "No fields to preview", description: "Add some fields to your form before previewing.", variant: "destructive" });
      return;
    }
    setIsPreviewMode(true);
  };

  const getFormStatusBadge = (form: Form) => {
    if (form.isActive) {
      return <Badge variant="default" className="bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-100">Active</Badge>;
    } else {
      return <Badge variant="outline">Inactive</Badge>;
    }
  };

  const { setNodeRef } = useDroppable({ id: "form-canvas" });

  if (!currentProjectId) {
    return (
      <div className="flex items-center justify-center h-screen">
        <p className="text-gray-500">Please select a project to continue.</p>
      </div>
    );
  }

  // =============================================================================
  // RENDER
  // =============================================================================

  return (
    <div className="flex h-screen bg-gray-50 dark:bg-gray-900">
      {/* Forms List Sidebar */}
      {showFormsList && (
        <div className="w-80 border-r border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800">
          <div className="flex flex-col h-full">
            <div className="p-4">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-semibold">Forms</h2>
                <Button size="sm" onClick={handleNewFormClick} className="flex items-center gap-2">
                  <Plus className="w-4 h-4" />
                  New Form
                </Button>
              </div>
              <div className="relative mb-4">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <Input
                  placeholder="Search forms..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>

            <div className="flex-1 overflow-y-auto px-4 pb-4">
              <div className="space-y-3">
                {filteredForms.length === 0 ? (
                  <div className="text-center py-8 text-gray-500 dark:text-gray-400">
                    <p>No forms found</p>
                    <Button variant="outline" size="sm" onClick={handleNewFormClick} className="mt-2">
                      Create your first form
                    </Button>
                  </div>
                ) : (
                  filteredForms.map((form) => (
                    <Card key={form.id} className="cursor-pointer hover:shadow-sm transition-shadow">
                      <CardHeader className="pb-2">
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <CardTitle className="text-sm font-medium line-clamp-1">{form.name}</CardTitle>
                            {form.description && (
                              <p className="text-xs text-gray-500 dark:text-gray-400 mt-1 line-clamp-2">{form.description}</p>
                            )}
                          </div>
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                                <MoreHorizontal className="w-4 h-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuItem onClick={() => handleEditForm(form)}>
                                <Edit className="w-4 h-4 mr-2" />
                                Edit
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </div>
                      </CardHeader>
                      <CardContent className="pt-0">
                        <div className="flex items-center justify-between">
                          {getFormStatusBadge(form)}
                          <span className="text-xs text-gray-400">
                            {form.createdAt ? new Date(form.createdAt).toLocaleDateString() : ""}
                          </span>
                        </div>
                      </CardContent>
                    </Card>
                  ))
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Main Editor Area */}
      <div className="flex-1 flex flex-col">
        {/* Top Toolbar */}
        <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800">
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" onClick={() => setShowFormsList(!showFormsList)} className="flex items-center gap-2">
              <PanelRightOpen className="w-4 h-4" />
              {showFormsList ? "Hide" : "Show"} Forms
            </Button>
          </div>

          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" onClick={handlePreview} className="flex items-center gap-2">
              <Eye className="w-4 h-4" />
              Preview
            </Button>
            <Button size="sm" onClick={handleSaveForm} disabled={formFields.length === 0} className="flex items-center gap-2">
              <Save className="w-4 h-4" />
              Save Form
            </Button>
          </div>
        </div>

        {/* Canvas Area */}
        {isCreatingForm ? (
          <div className="flex-1 flex">
            {/* Toolbox */}
            <div className="w-64 border-r border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800">
              <div className="p-4 border-b border-gray-200 dark:border-gray-700">
                <h3 className="font-semibold">Form Fields</h3>
              </div>
              <div className="flex-1 overflow-y-auto p-4">
                <div className="space-y-2">
                  {fieldTypes.map((field) => (
                    <DraggableField key={field.type} field={field} />
                  ))}
                </div>
              </div>
            </div>

            {/* Canvas */}
            <div className="flex-1 flex flex-col">
              {/* Form Settings */}
              <div className="border-b border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 p-4">
                <FormSettings config={formConfig} onChange={setFormConfig} />
              </div>

              {/* Canvas */}
              <div className="flex-1 overflow-auto p-6 bg-gray-50 dark:bg-gray-900">
                <div className="max-w-4xl mx-auto">
                  <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
                    <div
                      ref={setNodeRef}
                      className="min-h-96 bg-white dark:bg-gray-800 rounded-lg border-2 border-dashed border-gray-300 dark:border-gray-600 p-6"
                    >
                      {formFields.length === 0 ? (
                        <div className="text-center py-12 text-gray-500 dark:text-gray-400">
                          <p className="text-lg mb-2">Start building your form</p>
                          <p className="text-sm">Drag fields from the toolbox to get started</p>
                        </div>
                      ) : (
                        <SortableContext items={formFields.map((field) => field.id)} strategy={verticalListSortingStrategy}>
                          <div className="space-y-4">
                            {formFields
                              .sort((a, b) => a.order - b.order)
                              .map((field) => (
                                <SortableField
                                  key={field.id}
                                  field={field}
                                  isSelected={selectedFieldId === field.id}
                                  onSelect={() => setSelectedFieldId(field.id)}
                                  onUpdate={(updates) => {
                                    const updatedFields = formFields.map((f) =>
                                      f.id === field.id ? { ...f, ...updates } : f
                                    );
                                    setFormFields(updatedFields);
                                  }}
                                  onDelete={() => {
                                    const updatedFields = formFields.filter((f) => f.id !== field.id);
                                    setFormFields(updatedFields);
                                    if (selectedFieldId === field.id) {
                                      setSelectedFieldId(null);
                                    }
                                  }}
                                />
                              ))}
                          </div>
                        </SortableContext>
                      )}
                    </div>
                  </DndContext>
                </div>
              </div>
            </div>
          </div>
        ) : (
          <div className="flex-1 flex items-center justify-center">
            <div className="text-center">
              <div className="mx-auto w-24 h-24 bg-gray-100 dark:bg-gray-800 rounded-full flex items-center justify-center mb-4">
                <FileText className="w-8 h-8 text-gray-400 dark:text-gray-500" />
              </div>
              <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-2">Select a form to edit</h3>
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
              <DialogTitle>{editingFormId ? "Update Form" : "Save Form"}</DialogTitle>
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
                disabled={!formName.trim() || createFormMutation.isPending || updateFormMutation.isPending}
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