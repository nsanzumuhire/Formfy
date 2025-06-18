import { useState } from "react";
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
} from "@dnd-kit/core";
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
  useSortable,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
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
  ChevronUp,
  ChevronDown as ChevronDownIcon,
  Upload,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
} from "@/components/ui/command";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useProject } from "@/hooks/useProject";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import type { Form, Project } from "@shared/schema";
import { formatDistanceToNow } from "date-fns";
import { Check, ChevronsUpDown } from "lucide-react";
import { cn } from "@/lib/utils";
import {
  FormFieldData,
  createFormField,
  generateFieldId,
  generateRowId,
  organizeFieldsIntoRows,
  distributeWidthsEvenly,
  addFieldToRow,
  createNewRow,
  reorderFieldsInRow,
  moveRowUp,
  moveRowDown,
} from "@/lib/form-builder";

// Sortable Field Component
function SortableField({
  field,
  isSelected,
  onSelect,
  onUpdate,
}: {
  field: FormFieldData;
  isSelected: boolean;
  onSelect: () => void;
  onUpdate: (updates: Partial<FormFieldData>) => void;
}) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: field.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  const getIcon = (type: string) => {
    switch (type) {
      case "text":
        return <Type className="w-4 h-4" />;
      case "email":
        return <AlignLeft className="w-4 h-4" />;
      case "number":
        return <Hash className="w-4 h-4" />;
      case "checkbox":
        return <CheckSquare className="w-4 h-4" />;
      case "radio":
        return <Circle className="w-4 h-4" />;
      case "select":
        return <ChevronDown className="w-4 h-4" />;
      case "textarea":
        return <AlignLeft className="w-4 h-4" />;
      case "date":
        return <Calendar className="w-4 h-4" />;
      case "tel":
        return <Phone className="w-4 h-4" />;
      case "url":
        return <LinkIcon className="w-4 h-4" />;
      case "file":
        return <Upload className="w-4 h-4" />;
      default:
        return <Type className="w-4 h-4" />;
    }
  };

  const renderFormField = () => {
    switch (field.type) {
      case "textarea":
        return (
          <Textarea
            placeholder={field.placeholder}
            className="w-full"
            rows={3}
            disabled
          />
        );
      case "select":
        return (
          <Select disabled>
            <SelectTrigger className="w-full">
              <SelectValue placeholder={field.placeholder} />
            </SelectTrigger>
            <SelectContent>
              {field.options?.map((option, index) => (
                <SelectItem key={index} value={option.value}>
                  {option.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        );
      case "radio":
        return (
          <div className={`space-y-2 ${field.layout === "horizontal" ? "flex flex-wrap gap-4" : ""}`}>
            {field.options?.map((option, index) => (
              <div key={index} className="flex items-center space-x-2">
                <input
                  type="radio"
                  name={field.id}
                  id={`${field.id}-${index}`}
                  value={option.value}
                  disabled
                  className="w-4 h-4"
                />
                <label htmlFor={`${field.id}-${index}`} className="text-sm">
                  {option.label}
                </label>
              </div>
            ))}
          </div>
        );
      case "checkbox":
        return (
          <div className={`space-y-2 ${field.layout === "horizontal" ? "flex flex-wrap gap-4" : ""}`}>
            {field.options?.map((option, index) => (
              <div key={index} className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  id={`${field.id}-${index}`}
                  value={option.value}
                  disabled
                  className="w-4 h-4"
                />
                <label htmlFor={`${field.id}-${index}`} className="text-sm">
                  {option.label}
                </label>
              </div>
            ))}
          </div>
        );
      case "date":
        return (
          <Input
            type="date"
            placeholder={field.placeholder}
            className="w-full"
            disabled
          />
        );
      case "tel":
        return (
          <Input
            type="tel"
            placeholder={field.placeholder}
            className="w-full"
            disabled
          />
        );
      case "url":
        return (
          <Input
            type="url"
            placeholder={field.placeholder}
            className="w-full"
            disabled
          />
        );
      case "file":
        return (
          <div className="border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg p-6 text-center">
            <Upload className="w-8 h-8 mx-auto mb-2 text-gray-400" />
            <p className="text-sm text-gray-500">Click to upload or drag and drop</p>
          </div>
        );
      default:
        return (
          <Input
            type={field.type}
            placeholder={field.placeholder}
            className="w-full"
            disabled
          />
        );
    }
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={`relative group p-4 border rounded-lg transition-all duration-200 ${
        isSelected
          ? "border-blue-500 bg-blue-50 dark:bg-blue-950"
          : "border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600"
      }`}
      onClick={onSelect}
    >
      {/* Drag Handle */}
      <div
        {...attributes}
        {...listeners}
        className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 cursor-grab active:cursor-grabbing p-1 rounded hover:bg-gray-100 dark:hover:bg-gray-800 transition-opacity"
      >
        <Grip className="w-4 h-4 text-gray-400" />
      </div>

      {/* Field Header */}
      <div className="flex items-center gap-2 mb-3">
        {getIcon(field.type)}
        <span className="font-medium text-sm text-gray-700 dark:text-gray-300">
          {field.label}
        </span>
        {field.required && (
          <span className="text-red-500 text-sm">*</span>
        )}
      </div>

      {/* Field Description */}
      {field.description && (
        <p className="text-xs text-gray-500 mb-2">{field.description}</p>
      )}

      {/* Form Field */}
      {renderFormField()}
    </div>
  );
}

export default function FormEditor() {
  const [, params] = useRoute("/forms/:id");
  const selectedFormId = params?.id;

  const { selectedProject } = useProject();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Form builder state
  const [formFields, setFormFields] = useState<FormFieldData[]>([]);
  const [selectedFieldId, setSelectedFieldId] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<"build" | "preview">("build");
  const [showPropertiesPanel, setShowPropertiesPanel] = useState(false);
  const [isResizing, setIsResizing] = useState(false);

  // Form configuration state
  const [formConfig, setFormConfig] = useState({
    layout: "single-column" as "single-column" | "two-column" | "grid" | "auto",
    spacing: "8px",
    gridColumns: 3,
    showLabels: true,
    buttonLayout: "center" as "left" | "center" | "right" | "justify" | "split",
    submitButtonText: "Submit",
    submitButtonColor: "#3b82f6",
    showCancelButton: false,
    cancelButtonText: "Cancel",
    cancelButtonColor: "#6b7280",
  });

  // Dialog state
  const [showSaveDialog, setShowSaveDialog] = useState(false);
  const [formName, setFormName] = useState("");
  const [formDescription, setFormDescription] = useState("");
  const [editingFormId, setEditingFormId] = useState<string | null>(null);
  const [layoutOpen, setLayoutOpen] = useState(false);

  // Drag and drop sensors
  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    }),
  );

  // Fetch forms for the project
  const { data: forms = [], isLoading: formsLoading } = useQuery({
    queryKey: ["/api/projects", selectedProject?.id, "forms"],
    enabled: !!selectedProject?.id,
  });

  // Fetch specific form if editing
  const { data: editingForm } = useQuery({
    queryKey: ["/api/forms", selectedFormId],
    enabled: !!selectedFormId,
  });

  // Create form mutation
  const createFormMutation = useMutation({
    mutationFn: async (data: {
      name: string;
      description?: string;
      schema: any;
    }) => {
      if (!selectedProject?.id) throw new Error("No project selected");
      return apiRequest(`/api/projects/${selectedProject.id}/forms`, {
        method: "POST",
        body: JSON.stringify({
          name: data.name,
          description: data.description,
          schema: data.schema,
          status: "draft",
        }),
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["/api/projects", selectedProject?.id, "forms"],
      });
      setShowSaveDialog(false);
      setFormName("");
      setFormDescription("");
      toast({
        title: "Form created",
        description: "Your form has been saved successfully.",
      });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: "Failed to create form. Please try again.",
        variant: "destructive",
      });
    },
  });

  // Update form mutation
  const updateFormMutation = useMutation({
    mutationFn: async (data: {
      id: string;
      name: string;
      description?: string;
      schema: any;
    }) => {
      return apiRequest(`/api/forms/${data.id}`, {
        method: "PATCH",
        body: JSON.stringify({
          name: data.name,
          description: data.description,
          schema: data.schema,
        }),
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["/api/projects", selectedProject?.id, "forms"],
      });
      queryClient.invalidateQueries({
        queryKey: ["/api/forms", editingFormId],
      });
      setShowSaveDialog(false);
      setFormName("");
      setFormDescription("");
      setEditingFormId(null);
      toast({
        title: "Form updated",
        description: "Your form has been updated successfully.",
      });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: "Failed to update form. Please try again.",
        variant: "destructive",
      });
    },
  });

  // Add field to form
  const addField = (type: string) => {
    const newField = createFormField(type as any);
    setFormFields((prev) => [...prev, newField]);
    setSelectedFieldId(newField.id);
    setShowPropertiesPanel(true);
  };

  // Update field
  const updateField = (fieldId: string, updates: Partial<FormFieldData>) => {
    setFormFields((prev) =>
      prev.map((field) =>
        field.id === fieldId ? { ...field, ...updates } : field,
      ),
    );
  };

  // Delete field
  const deleteField = (fieldId: string) => {
    setFormFields((prev) => prev.filter((field) => field.id !== fieldId));
    if (selectedFieldId === fieldId) {
      setSelectedFieldId(null);
      setShowPropertiesPanel(false);
    }
  };

  // Handle field selection
  const handleFieldSelect = (fieldId: string) => {
    setSelectedFieldId(fieldId);
    setShowPropertiesPanel(true);
  };

  // Handle drag end
  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;

    if (!over || active.id === over.id) return;

    // For auto layout mode, handle row-based dragging and reordering
    if (formConfig.layout === "auto") {
      const draggedFieldId = active.id as string;
      const targetFieldId = over.id as string;
      
      setFormFields((fields) => {
        const draggedField = fields.find(f => f.id === draggedFieldId);
        const targetField = fields.find(f => f.id === targetFieldId);
        
        if (!draggedField || !targetField) return fields;
        
        // If both fields are in the same row, reorder within the row
        if (draggedField.rowId && targetField.rowId && draggedField.rowId === targetField.rowId) {
          return reorderFieldsInRow(fields, draggedField.rowId, draggedFieldId, targetFieldId);
        }
        
        // Clear any existing row assignment from dragged field
        const fieldsWithoutDragged = fields.filter(f => f.id !== draggedFieldId);
        
        // If dropping on a field that has a row, add to that row
        if (targetField.rowId) {
          const updatedField = { ...draggedField, rowId: targetField.rowId };
          const updatedFields = [...fieldsWithoutDragged, updatedField];
          
          // Get all fields in the target row and distribute widths evenly
          const fieldsInTargetRow = updatedFields.filter(f => f.rowId === targetField.rowId);
          const evenWidth = 100 / fieldsInTargetRow.length;
          
          return updatedFields.map(field => {
            if (field.rowId === targetField.rowId) {
              return { ...field, width: evenWidth };
            }
            return field;
          });
        } else {
          // Create a new row with both fields
          const newRowId = generateRowId();
          return fields.map(field => {
            if (field.id === draggedFieldId || field.id === targetFieldId) {
              return { ...field, rowId: newRowId, width: 50 };
            }
            return field;
          });
        }
      });
    } else {
      // Traditional layout mode - clear auto layout properties and do simple reordering
      setFormFields((items) => {
        const clearedItems = items.map(item => ({
          ...item,
          rowId: undefined,
          width: 100
        }));
        
        const oldIndex = clearedItems.findIndex((item) => item.id === active.id);
        const newIndex = clearedItems.findIndex((item) => item.id === over?.id);

        return arrayMove(clearedItems, oldIndex, newIndex);
      });
    }
  };

  const getSpacingValue = () => {
    if (formConfig.spacing === "custom") {
      return "12px";
    }
    return formConfig.spacing;
  };

  // Handle new form creation
  const handleNewFormClick = () => {
    setEditingFormId(null);
    setFormName("");
    setFormDescription("");
    setShowSaveDialog(true);
  };

  // Handle form save
  const handleCreateForm = () => {
    const schema = {
      fields: formFields,
      settings: {
        title: formName,
        description: formDescription,
        ...formConfig,
      },
    };

    if (editingFormId) {
      updateFormMutation.mutate({
        id: editingFormId,
        name: formName,
        description: formDescription,
        schema,
      });
    } else {
      createFormMutation.mutate({
        name: formName,
        description: formDescription,
        schema,
      });
    }
  };

  // Handle resize start
  const handleResizeStart = (
    e: React.MouseEvent,
    fieldId: string,
    rowFields: FormFieldData[]
  ) => {
    e.preventDefault();
    setIsResizing(true);

    const startX = e.clientX;
    const field = rowFields.find((f) => f.id === fieldId);
    const fieldIndex = rowFields.indexOf(field!);
    const nextField = rowFields[fieldIndex + 1];

    if (!field || !nextField) return;

    const startFieldWidth = field.width || 100 / rowFields.length;
    const startNextWidth = nextField.width || 100 / rowFields.length;

    const handleMouseMove = (e: MouseEvent) => {
      const deltaX = e.clientX - startX;
      const containerWidth = 800; // Approximate container width
      const deltaPercentage = (deltaX / containerWidth) * 100;

      const newFieldWidth = Math.max(
        10,
        Math.min(90, startFieldWidth + deltaPercentage)
      );
      const newNextWidth = Math.max(
        10,
        Math.min(90, startNextWidth - deltaPercentage)
      );

      setFormFields((fields) =>
        fields.map((f) => {
          if (f.id === fieldId) {
            return { ...f, width: newFieldWidth };
          }
          if (f.id === nextField.id) {
            return { ...f, width: newNextWidth };
          }
          return f;
        })
      );
    };

    const handleMouseUp = () => {
      setIsResizing(false);
      document.removeEventListener("mousemove", handleMouseMove);
      document.removeEventListener("mouseup", handleMouseUp);
    };

    document.addEventListener("mousemove", handleMouseMove);
    document.addEventListener("mouseup", handleMouseUp);
  };

  if (!selectedProject) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-center">
          <div className="w-16 h-16 mx-auto mb-4 bg-gray-100 dark:bg-gray-800 rounded-full flex items-center justify-center">
            <FileText className="w-8 h-8 text-gray-400 dark:text-gray-500" />
          </div>
          <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-2">
            No project selected
          </h3>
          <p className="text-gray-600 dark:text-gray-400">
            Select a project to start building forms
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-full bg-white dark:bg-gray-950">
      {/* Main Content */}
      <div className="flex-1 flex flex-col">
        {/* Form Builder */}
        <div className="flex-1 flex">
          {/* Form Canvas */}
          <div className={`flex-1 ${showPropertiesPanel ? "mr-0" : ""}`}>
            <div className="h-full flex flex-col">
              {/* Toolbar */}
              <div className="border-b border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-950 p-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className="flex items-center gap-2">
                      <Button
                        variant={activeTab === "build" ? "default" : "ghost"}
                        size="sm"
                        onClick={() => setActiveTab("build")}
                      >
                        <Edit className="w-4 h-4 mr-2" />
                        Build
                      </Button>
                      <Button
                        variant={activeTab === "preview" ? "default" : "ghost"}
                        size="sm"
                        onClick={() => setActiveTab("preview")}
                      >
                        <Eye className="w-4 h-4 mr-2" />
                        Preview
                      </Button>
                    </div>

                    <Separator orientation="vertical" className="h-6" />

                    {/* Layout Controls */}
                    <div className="flex items-center gap-2">
                      <Label className="text-sm font-medium">Layout:</Label>
                      <Popover open={layoutOpen} onOpenChange={setLayoutOpen}>
                        <PopoverTrigger asChild>
                          <Button
                            variant="outline"
                            role="combobox"
                            aria-expanded={layoutOpen}
                            className="w-40 h-8 justify-between"
                          >
                            {formConfig.layout === "single-column"
                              ? "Single"
                              : formConfig.layout === "two-column"
                                ? "Two Col"
                                : formConfig.layout === "grid"
                                  ? "Grid"
                                  : formConfig.layout === "auto"
                                    ? "Auto"
                                    : "Form layout"}
                            <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                          </Button>
                        </PopoverTrigger>
                        <PopoverContent className="w-40 p-0">
                          <Command>
                            <CommandGroup>
                              <CommandItem
                                value="single-column"
                                onSelect={() => {
                                  setFormConfig({
                                    ...formConfig,
                                    layout: "single-column",
                                  });
                                  setLayoutOpen(false);
                                }}
                              >
                                <Check
                                  className={cn(
                                    "mr-2 h-4 w-4",
                                    formConfig.layout === "single-column"
                                      ? "opacity-100"
                                      : "opacity-0",
                                  )}
                                />
                                Single
                              </CommandItem>

                              <CommandItem
                                value="two-column"
                                onSelect={() => {
                                  setFormConfig({
                                    ...formConfig,
                                    layout: "two-column",
                                  });
                                  setLayoutOpen(false);
                                }}
                              >
                                <Check
                                  className={cn(
                                    "mr-2 h-4 w-4",
                                    formConfig.layout === "two-column"
                                      ? "opacity-100"
                                      : "opacity-0",
                                  )}
                                />
                                Two Col
                              </CommandItem>

                              <CommandItem
                                value="grid"
                                onSelect={() => {
                                  setFormConfig({
                                    ...formConfig,
                                    layout: "grid",
                                  });
                                  setLayoutOpen(false);
                                }}
                              >
                                <Check
                                  className={cn(
                                    "mr-2 h-4 w-4",
                                    formConfig.layout === "grid"
                                      ? "opacity-100"
                                      : "opacity-0",
                                  )}
                                />
                                Grid
                              </CommandItem>

                              <CommandItem
                                value="auto"
                                onSelect={() => {
                                  setFormConfig({
                                    ...formConfig,
                                    layout: "auto",
                                  });
                                  setLayoutOpen(false);
                                }}
                              >
                                <Check
                                  className={cn(
                                    "mr-2 h-4 w-4",
                                    formConfig.layout === "auto"
                                      ? "opacity-100"
                                      : "opacity-0",
                                  )}
                                />
                                Auto
                              </CommandItem>
                            </CommandGroup>
                          </Command>
                        </PopoverContent>
                      </Popover>
                    </div>

                    <Separator orientation="vertical" className="h-6" />

                    {/* Spacing Controls */}
                    <div className="flex items-center gap-2">
                      <Label className="text-sm font-medium">Spacing:</Label>
                      <Select
                        value={formConfig.spacing}
                        onValueChange={(value) =>
                          setFormConfig({ ...formConfig, spacing: value })
                        }
                      >
                        <SelectTrigger className="w-20 h-8">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="4px">4px</SelectItem>
                          <SelectItem value="8px">8px</SelectItem>
                          <SelectItem value="12px">12px</SelectItem>
                          <SelectItem value="16px">16px</SelectItem>
                          <SelectItem value="20px">20px</SelectItem>
                          <SelectItem value="24px">24px</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setShowPropertiesPanel(!showPropertiesPanel)}
                    >
                      <Settings className="w-4 h-4 mr-2" />
                      Properties
                    </Button>
                    <Button
                      size="sm"
                      onClick={() => {
                        setEditingFormId(null);
                        setFormName("");
                        setFormDescription("");
                        setShowSaveDialog(true);
                      }}
                      disabled={formFields.length === 0}
                    >
                      <Save className="w-4 h-4 mr-2" />
                      Save Form
                    </Button>
                  </div>
                </div>
              </div>

              {/* Canvas Area */}
              <div className="flex-1 p-6 bg-gray-50 dark:bg-gray-900 overflow-auto">
                <div className="max-w-4xl mx-auto">
                  {activeTab === "build" ? (
                    <DndContext
                      sensors={sensors}
                      collisionDetection={closestCenter}
                      onDragEnd={handleDragEnd}
                    >
                      <SortableContext
                        items={formFields.map((f) => f.id)}
                        strategy={verticalListSortingStrategy}
                      >
                        {formConfig.layout === "auto" ? (
                          // Auto Layout Mode - Row-based layout with drag-and-drop
                          <div className="space-y-4">
                            {organizeFieldsIntoRows(formFields).map((rowFields, rowIndex) => (
                              <div
                                key={rowFields[0]?.rowId || `row-${rowIndex}`}
                                className="relative group"
                              >
                                {/* Row Controls */}
                                {rowFields[0]?.rowId && (
                                  <div className="absolute -left-10 top-1/2 -translate-y-1/2 flex flex-col gap-1 opacity-0 group-hover:opacity-100 transition-opacity z-20">
                                    <Button
                                      size="sm"
                                      variant="outline"
                                      className="h-6 w-6 p-0"
                                      onClick={() => {
                                        setFormFields(fields => moveRowUp(fields, rowFields[0].rowId!));
                                      }}
                                      disabled={rowIndex === 0}
                                    >
                                      <ChevronUp className="h-3 w-3" />
                                    </Button>
                                    <Button
                                      size="sm"
                                      variant="outline"
                                      className="h-6 w-6 p-0"
                                      onClick={() => {
                                        setFormFields(fields => moveRowDown(fields, rowFields[0].rowId!));
                                      }}
                                      disabled={rowIndex === organizeFieldsIntoRows(formFields).length - 1}
                                    >
                                      <ChevronDownIcon className="h-3 w-3" />
                                    </Button>
                                  </div>
                                )}
                                
                                <div
                                  className="flex gap-2 min-h-[60px] p-2 border border-dashed border-gray-200 dark:border-gray-700 rounded-lg hover:border-blue-300 dark:hover:border-blue-600 transition-colors"
                                  style={{ gap: getSpacingValue() }}
                                >
                                  {rowFields.map((field, fieldIndex) => (
                                    <div
                                      key={field.id}
                                      className="relative group/field"
                                      style={{ width: `${field.width || 100 / rowFields.length}%` }}
                                    >
                                      {/* Resize Handle */}
                                      {fieldIndex < rowFields.length - 1 && (
                                        <div
                                          className="absolute right-0 top-0 bottom-0 w-1 bg-transparent hover:bg-blue-400 cursor-col-resize z-10"
                                          onMouseDown={(e) => handleResizeStart(e, field.id, rowFields)}
                                        />
                                      )}
                                      
                                      <SortableField
                                        field={field}
                                        isSelected={selectedFieldId === field.id}
                                        onSelect={() => handleFieldSelect(field.id)}
                                        onUpdate={(updates) => {
                                          setFormFields((fields) =>
                                            fields.map((f) =>
                                              f.id === field.id
                                                ? { ...f, ...updates }
                                                : f,
                                            ),
                                          );
                                        }}
                                      />
                                    </div>
                                  ))}
                                </div>
                              </div>
                            ))}
                            
                            {/* Empty row for new fields */}
                            <div
                              className="flex items-center justify-center min-h-[80px] border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg text-gray-400 hover:border-blue-400 hover:text-blue-400 transition-colors"
                            >
                              <div className="text-center">
                                <Plus className="w-6 h-6 mx-auto mb-2" />
                                <p className="text-sm">Drag fields here to create a new row</p>
                              </div>
                            </div>
                          </div>
                        ) : (
                          // Traditional Layout Modes
                          <div
                            className={`${
                              formConfig.layout === "two-column"
                                ? "grid grid-cols-2"
                                : formConfig.layout === "grid"
                                  ? "grid"
                                  : "flex flex-col"
                            }`}
                            style={{
                              gap: getSpacingValue(),
                              ...(formConfig.layout === "grid" && {
                                gridTemplateColumns: `repeat(${formConfig.gridColumns}, 1fr)`,
                              }),
                            }}
                          >
                            {formFields.map((field) => (
                              <SortableField
                                key={field.id}
                                field={field}
                                isSelected={selectedFieldId === field.id}
                                onSelect={() => handleFieldSelect(field.id)}
                                onUpdate={(updates) => {
                                  setFormFields((fields) =>
                                    fields.map((f) =>
                                      f.id === field.id
                                        ? { ...f, ...updates }
                                        : f,
                                    ),
                                  );
                                }}
                              />
                            ))}
                          </div>
                        )}

                        {/* Submit Button Preview in Edit Mode */}
                        {formFields.length > 0 && (
                          <div
                            className={`pt-6 ${
                              formConfig.buttonLayout === "left"
                                ? "flex justify-start"
                                : formConfig.buttonLayout === "center"
                                  ? "flex justify-center"
                                  : formConfig.buttonLayout === "right"
                                    ? "flex justify-end"
                                    : formConfig.buttonLayout === "justify"
                                      ? "flex justify-between"
                                      : formConfig.buttonLayout === "split"
                                        ? "flex justify-between"
                                        : "flex justify-center"
                            }`}
                          >
                            {formConfig.buttonLayout === "split" &&
                              formConfig.showCancelButton && (
                                <Button
                                  type="button"
                                  variant="outline"
                                  style={{
                                    backgroundColor: "transparent",
                                    borderColor: formConfig.cancelButtonColor,
                                    color: formConfig.cancelButtonColor,
                                  }}
                                  className="px-6 pointer-events-none"
                                >
                                  {formConfig.cancelButtonText}
                                </Button>
                              )}

                            <div
                              className={`${
                                formConfig.buttonLayout === "split"
                                  ? ""
                                  : formConfig.showCancelButton
                                    ? "flex gap-3"
                                    : ""
                              }`}
                            >
                              {formConfig.showCancelButton &&
                                formConfig.buttonLayout !== "split" && (
                                  <Button
                                    type="button"
                                    variant="outline"
                                    style={{
                                      backgroundColor: "transparent",
                                      borderColor:
                                        formConfig.cancelButtonColor,
                                      color: formConfig.cancelButtonColor,
                                    }}
                                    className="px-6 pointer-events-none"
                                  >
                                    {formConfig.cancelButtonText}
                                  </Button>
                                )}

                              <Button
                                type="submit"
                                style={{
                                  backgroundColor:
                                    formConfig.submitButtonColor,
                                  borderColor: formConfig.submitButtonColor,
                                  color: "#ffffff",
                                }}
                                className="px-6 pointer-events-none"
                              >
                                {formConfig.submitButtonText}
                              </Button>
                            </div>
                          </div>
                        )}
                      </SortableContext>
                    </DndContext>
                  ) : (
                    // Preview Mode
                    <div className="bg-white dark:bg-gray-950 rounded-lg shadow-sm border border-gray-200 dark:border-gray-800 p-8">
                      <div className="space-y-6">
                        {formFields.map((field) => (
                          <div key={field.id} className="space-y-2">
                            {formConfig.showLabels && (
                              <Label className="text-sm font-medium">
                                {field.label}
                                {field.required && (
                                  <span className="text-red-500 ml-1">*</span>
                                )}
                              </Label>
                            )}
                            {field.description && (
                              <p className="text-xs text-gray-500">
                                {field.description}
                              </p>
                            )}
                            <div>
                              {/* Render the actual form field based on type */}
                              {field.type === "textarea" ? (
                                <Textarea
                                  placeholder={field.placeholder}
                                  className="w-full"
                                  rows={3}
                                />
                              ) : field.type === "select" ? (
                                <Select>
                                  <SelectTrigger className="w-full">
                                    <SelectValue placeholder={field.placeholder} />
                                  </SelectTrigger>
                                  <SelectContent>
                                    {field.options?.map((option, index) => (
                                      <SelectItem key={index} value={option.value}>
                                        {option.label}
                                      </SelectItem>
                                    ))}
                                  </SelectContent>
                                </Select>
                              ) : field.type === "radio" ? (
                                <div className={`space-y-2 ${field.layout === "horizontal" ? "flex flex-wrap gap-4" : ""}`}>
                                  {field.options?.map((option, index) => (
                                    <div key={index} className="flex items-center space-x-2">
                                      <input
                                        type="radio"
                                        name={field.id}
                                        id={`${field.id}-${index}`}
                                        value={option.value}
                                        className="w-4 h-4"
                                      />
                                      <label htmlFor={`${field.id}-${index}`} className="text-sm">
                                        {option.label}
                                      </label>
                                    </div>
                                  ))}
                                </div>
                              ) : field.type === "checkbox" ? (
                                <div className={`space-y-2 ${field.layout === "horizontal" ? "flex flex-wrap gap-4" : ""}`}>
                                  {field.options?.map((option, index) => (
                                    <div key={index} className="flex items-center space-x-2">
                                      <input
                                        type="checkbox"
                                        id={`${field.id}-${index}`}
                                        value={option.value}
                                        className="w-4 h-4"
                                      />
                                      <label htmlFor={`${field.id}-${index}`} className="text-sm">
                                        {option.label}
                                      </label>
                                    </div>
                                  ))}
                                </div>
                              ) : field.type === "file" ? (
                                <div className="border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg p-6 text-center">
                                  <Upload className="w-8 h-8 mx-auto mb-2 text-gray-400" />
                                  <p className="text-sm text-gray-500">Click to upload or drag and drop</p>
                                </div>
                              ) : (
                                <Input
                                  type={field.type}
                                  placeholder={field.placeholder}
                                  className="w-full"
                                />
                              )}
                            </div>
                          </div>
                        ))}

                        {/* Submit Button in Preview Mode */}
                        {formFields.length > 0 && (
                          <div
                            className={`pt-6 ${
                              formConfig.buttonLayout === "left"
                                ? "flex justify-start"
                                : formConfig.buttonLayout === "center"
                                  ? "flex justify-center"
                                  : formConfig.buttonLayout === "right"
                                    ? "flex justify-end"
                                    : formConfig.buttonLayout === "justify"
                                      ? "flex justify-between"
                                      : formConfig.buttonLayout === "split"
                                        ? "flex justify-between"
                                        : "flex justify-center"
                            }`}
                          >
                            {formConfig.buttonLayout === "split" &&
                              formConfig.showCancelButton && (
                                <Button
                                  type="button"
                                  variant="outline"
                                  style={{
                                    backgroundColor: "transparent",
                                    borderColor: formConfig.cancelButtonColor,
                                    color: formConfig.cancelButtonColor,
                                  }}
                                  className="px-6"
                                >
                                  {formConfig.cancelButtonText}
                                </Button>
                              )}

                            <div
                              className={`${
                                formConfig.buttonLayout === "split"
                                  ? ""
                                  : formConfig.showCancelButton
                                    ? "flex gap-3"
                                    : ""
                              }`}
                            >
                              {formConfig.showCancelButton &&
                                formConfig.buttonLayout !== "split" && (
                                  <Button
                                    type="button"
                                    variant="outline"
                                    style={{
                                      backgroundColor: "transparent",
                                      borderColor: formConfig.cancelButtonColor,
                                      color: formConfig.cancelButtonColor,
                                    }}
                                    className="px-6"
                                  >
                                    {formConfig.cancelButtonText}
                                  </Button>
                                )}

                              <Button
                                type="submit"
                                style={{
                                  backgroundColor: formConfig.submitButtonColor,
                                  borderColor: formConfig.submitButtonColor,
                                  color: "#ffffff",
                                }}
                                className="px-6"
                              >
                                {formConfig.submitButtonText}
                              </Button>
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  )}

                  {/* Empty State */}
                  {formFields.length === 0 && (
                    <div className="flex items-center justify-center min-h-[400px] border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg">
                      <div className="text-center">
                        <div className="w-16 h-16 mx-auto mb-4 bg-gray-100 dark:bg-gray-800 rounded-full flex items-center justify-center">
                          <Plus className="w-8 h-8 text-gray-400 dark:text-gray-500" />
                        </div>
                        <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-2">
                          Start building your form
                        </h3>
                        <p className="text-gray-600 dark:text-gray-400 mb-6 max-w-md">
                          Drag and drop form elements from the toolbox to start
                          creating your form
                        </p>
                        <div className="flex gap-2 justify-center">
                          <Button
                            variant="outline"
                            onClick={() => addField("text")}
                          >
                            Add Text Field
                          </Button>
                          <Button
                            variant="outline"
                            onClick={() => addField("email")}
                          >
                            Add Email Field
                          </Button>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>

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