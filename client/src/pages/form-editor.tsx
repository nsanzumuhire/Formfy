import { useEffect, useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useRoute, useLocation } from "wouter";
import JSZip from "jszip";
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
  useDroppable,
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
  EyeOff,
  Layout,
  Maximize,
  ArrowLeftRight,
  Calendar,
  Phone,
  Upload,
  Download,
  Lock,
  LayoutPanelTop,
  LayoutGrid,
  Rows3,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Separator } from "@/components/ui/separator";
import { Slider } from "@/components/ui/slider";
import { Checkbox } from "@/components/ui/checkbox";
import { Skeleton } from "@/components/ui/skeleton";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
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
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
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
  validateFormForSave,
  ensureFieldNames,
  generateDefaultFieldName,
} from "@/lib/form-builder";
import { IconSelector } from "@/components/icon-selector";
import * as LucideIcons from "lucide-react";

// Droppable components for drop zones
function RowDropZone({ rowId, onAddField }: { rowId: string; onAddField?: (fieldType: string, targetRowId?: string) => void }) {
  const { setNodeRef } = useDroppable({ id: `row-drop-zone-${rowId}` });
  const [showFieldOptions, setShowFieldOptions] = useState(false);
  
  const fieldTypes = [
    { type: "text", label: "Text Input", icon: Type },
    { type: "email", label: "Email Input", icon: Type },
    { type: "password", label: "Password Input", icon: Lock },
    { type: "number", label: "Number Input", icon: Hash },
    { type: "textarea", label: "Textarea", icon: AlignLeft },
    { type: "select", label: "Select Dropdown", icon: ChevronDown },
    { type: "radio", label: "Radio Group", icon: Circle },
    { type: "checkbox", label: "Checkbox", icon: CheckSquare },
    { type: "date", label: "Date Picker", icon: Calendar },
    { type: "tel", label: "Phone Input", icon: Phone },
    { type: "url", label: "URL Input", icon: Type },
    { type: "file", label: "File Upload", icon: Upload },
  ];

  return (
    <Popover open={showFieldOptions} onOpenChange={setShowFieldOptions}>
      <div ref={setNodeRef} className="relative flex-1 min-w-[100px]">
        <PopoverTrigger asChild>
          <div className="border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg flex items-center justify-center text-gray-400 hover:border-blue-400 hover:text-blue-400 transition-colors cursor-pointer h-12">
            <Plus className="w-4 h-4" />
          </div>
        </PopoverTrigger>
        
        <PopoverContent className="w-80 p-0" align="center">
          <div className="p-4">
            <h4 className="font-medium text-sm mb-3 text-gray-900 dark:text-gray-100">
              Add Form Field
            </h4>
            <div className="grid grid-cols-2 gap-2">
              {fieldTypes.map((fieldType) => {
                const IconComponent = fieldType.icon;
                return (
                  <button
                    key={fieldType.type}
                    className="flex items-center gap-2 p-3 text-left hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg text-sm transition-colors border border-transparent hover:border-gray-200 dark:hover:border-gray-700"
                    onClick={() => {
                      onAddField?.(fieldType.type, rowId);
                      setShowFieldOptions(false);
                    }}
                  >
                    <IconComponent className="w-4 h-4 text-gray-500 dark:text-gray-400" />
                    <span className="text-gray-700 dark:text-gray-300">{fieldType.label}</span>
                  </button>
                );
              })}
            </div>
          </div>
        </PopoverContent>
      </div>
    </Popover>
  );
}

function NewRowDropZone({ onAddField }: { onAddField?: (fieldType: string) => void }) {
  const { setNodeRef } = useDroppable({ id: "new-row-drop-zone" });
  const [showFieldOptions, setShowFieldOptions] = useState(false);
  
  const fieldTypes = [
    { type: "text", label: "Text Input", icon: Type },
    { type: "email", label: "Email Input", icon: Type },
    { type: "password", label: "Password Input", icon: Lock },
    { type: "number", label: "Number Input", icon: Hash },
    { type: "textarea", label: "Textarea", icon: AlignLeft },
    { type: "select", label: "Select Dropdown", icon: ChevronDown },
    { type: "radio", label: "Radio Group", icon: Circle },
    { type: "checkbox", label: "Checkbox", icon: CheckSquare },
    { type: "date", label: "Date Picker", icon: Calendar },
    { type: "tel", label: "Phone Input", icon: Phone },
    { type: "url", label: "URL Input", icon: Type },
    { type: "file", label: "File Upload", icon: Upload },
  ];
  
  return (
    <Popover open={showFieldOptions} onOpenChange={setShowFieldOptions}>
      <div ref={setNodeRef} className="relative">
        <PopoverTrigger asChild>
          <div className="flex items-center justify-center min-h-[80px] border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg text-gray-400 hover:border-blue-400 hover:text-blue-400 transition-colors cursor-pointer">
            <div className="text-center">
              <Plus className="w-6 h-6 mx-auto mb-2" />
              <p className="text-sm">Click to add field or drop fields here</p>
            </div>
          </div>
        </PopoverTrigger>
        
        <PopoverContent className="w-80 p-0" align="center">
          <div className="p-4">
            <h4 className="font-medium text-sm mb-3 text-gray-900 dark:text-gray-100">
              Add Form Field
            </h4>
            <div className="grid grid-cols-2 gap-2">
              {fieldTypes.map((fieldType) => {
                const IconComponent = fieldType.icon;
                return (
                  <button
                    key={fieldType.type}
                    className="flex items-center gap-2 p-3 text-left hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg text-sm transition-colors border border-transparent hover:border-gray-200 dark:hover:border-gray-700"
                    onClick={() => {
                      onAddField?.(fieldType.type);
                      setShowFieldOptions(false);
                    }}
                  >
                    <IconComponent className="w-4 h-4 text-gray-500 dark:text-gray-400" />
                    <span className="text-gray-700 dark:text-gray-300">{fieldType.label}</span>
                  </button>
                );
              })}
            </div>
          </div>
        </PopoverContent>
      </div>
    </Popover>
  );
}

// Sortable Field Component
function SortableField({
  field,
  isSelected,
  onSelect,
  onUpdate,
  onDelete,
  isPreviewMode = false,
}: {
  field: any;
  isSelected: boolean;
  onSelect: () => void;
  onUpdate: (updates: any) => void;
  onDelete?: () => void;
  isPreviewMode?: boolean;
}) {
  const { attributes, listeners, setNodeRef, transform, transition } =
    useSortable({ id: field.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={`p-4 border rounded-lg transition-all ${
        isPreviewMode 
          ? "border-transparent bg-transparent"
          : isSelected
            ? "border-blue-500 bg-blue-50 dark:bg-blue-950"
            : "border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600"
      }`}
      onClick={(e) => {
        if (!isPreviewMode) {
          e.stopPropagation();
          onSelect();
        }
      }}
    >
      <div className={`flex items-center mb-2 ${field.type === "checkbox" && field.showTopLabel === false ? "justify-end" : "justify-between"}`}>
        <label className={`text-sm font-medium text-gray-700 dark:text-gray-300 ${field.type === "checkbox" && field.showTopLabel === false ? "sr-only" : ""}`}>
          {field.label}
          {field.required && <span className="text-red-500 ml-1">*</span>}
        </label>
        {!isPreviewMode && (
          <div className="flex items-center gap-1">
            <button className="p-1 hover:bg-gray-100 dark:hover:bg-gray-800 rounded">
              <Edit className="w-3 h-3 text-gray-400" />
            </button>
            <button
              className="p-1 hover:bg-gray-100 dark:hover:bg-gray-800 rounded hover:text-red-600"
              onClick={(e) => {
                e.stopPropagation();
                if (onDelete) {
                  onDelete();
                }
              }}
            >
              <Trash2 className="w-3 h-3 text-gray-400 hover:text-red-600" />
            </button>
            <button
              className="p-1 hover:bg-gray-100 dark:hover:bg-gray-800 rounded cursor-grab"
              {...attributes}
              {...listeners}
            >
              <Grip className="w-3 h-3 text-gray-400" />
            </button>
          </div>
        )}
      </div>

      {field.type === "text" ||
      field.type === "email" ||
      field.type === "number" ||
      field.type === "tel" ||
      field.type === "url" ? (
        <div className="relative flex items-center">
          {field.icon && field.icon.position === "left" && (
            <div className="absolute left-3 z-10 text-gray-500 dark:text-gray-400">
              {(() => {
                const IconComponent = (LucideIcons as any)[field.icon.name];

                return IconComponent ? (
                  <IconComponent size={field.icon.size} />
                ) : null;
              })()}
            </div>
          )}
          <Input
            type={field.type}
            placeholder={field.placeholder}
            disabled
            className={`bg-gray-50 dark:bg-gray-900 ${field.icon?.position === "left" ? "pl-10" : ""} ${field.icon?.position === "right" ? "pr-10" : ""}`}
            style={{
              paddingLeft:
                field.icon?.position === "left"
                  ? `${30 + (field.icon.size || 16)}px`
                  : undefined,
              paddingRight:
                field.icon?.position === "right"
                  ? `${30 + (field.icon.size || 16)}px`
                  : undefined,
            }}
          />
          {field.icon && field.icon.position === "right" && (
            <div className="absolute right-3 z-10 text-gray-500 dark:text-gray-400">
              {(() => {
                const IconComponent = (LucideIcons as any)[field.icon.name];
                return IconComponent ? (
                  <IconComponent size={field.icon.size} />
                ) : null;
              })()}
            </div>
          )}
        </div>
      ) : field.type === "password" ? (
        <div className="relative flex items-center">
          {field.icon && field.icon.position === "left" && (
            <div className="absolute left-3 z-10 text-gray-500 dark:text-gray-400">
              {(() => {
                const IconComponent = (LucideIcons as any)[field.icon.name];
                return IconComponent ? (
                  <IconComponent size={field.icon.size} />
                ) : null;
              })()}
            </div>
          )}
          <Input
            type="password"
            placeholder={field.placeholder}
            disabled
            className={`bg-gray-50 dark:bg-gray-900 ${field.icon?.position === "left" ? "pl-10" : ""} ${field.showPasswordToggle ? "pr-10" : field.icon?.position === "right" ? "pr-10" : ""}`}
            style={{
              paddingLeft:
                field.icon?.position === "left"
                  ? `${30 + (field.icon.size || 16)}px`
                  : undefined,
              paddingRight:
                field.showPasswordToggle 
                  ? "40px"
                  : field.icon?.position === "right"
                    ? `${30 + (field.icon.size || 16)}px`
                    : undefined,
            }}
          />
          {field.showPasswordToggle && (
            <button
              type="button"
              className="absolute right-3 z-10 text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300"
              disabled
            >
              <EyeOff className="w-4 h-4" />
            </button>
          )}
          {field.icon && field.icon.position === "right" && !field.showPasswordToggle && (
            <div className="absolute right-3 z-10 text-gray-500 dark:text-gray-400">
              {(() => {
                const IconComponent = (LucideIcons as any)[field.icon.name];
                return IconComponent ? (
                  <IconComponent size={field.icon.size} />
                ) : null;
              })()}
            </div>
          )}
        </div>
      ) : field.type === "textarea" ? (
        <Textarea
          placeholder={field.placeholder}
          disabled
          className="bg-gray-50 dark:bg-gray-900 resize-none"
          rows={3}
        />
      ) : field.type === "date" ? (
        <Input type="date" disabled className="bg-gray-50 dark:bg-gray-900" />
      ) : field.type === "file" ? (
        <div className="space-y-1">
          <Input 
            type="file" 
            disabled 
            accept={field.fileTypes?.length 
              ? field.fileTypes.map(type => `.${type.toLowerCase()}`).join(',')
              : undefined}
            className="bg-gray-50 dark:bg-gray-900" 
          />
          {(field.fileTypes?.length || field.maxFileSize || field.minFileSize) && (
            <div className="text-xs text-gray-500 dark:text-gray-400 space-y-1">
              {field.fileTypes?.length && (
                <div>Allowed types: {field.fileTypes.join(', ')}</div>
              )}
              {(field.minFileSize || field.maxFileSize) && (
                <div>
                  Size: {field.minFileSize ? `${field.minFileSize}MB min` : ''}{field.minFileSize && field.maxFileSize ? ', ' : ''}{field.maxFileSize ? `${field.maxFileSize}MB max` : ''}
                </div>
              )}
            </div>
          )}
        </div>
      ) : field.type === "checkbox" ? (
        <div className="flex items-center space-x-2">
          <Checkbox 
            className="pointer-events-none opacity-100"
            checked={false}
          />
          <span className="text-sm text-gray-600 dark:text-gray-400">
            {field.checkboxLabel || "Check this option"}
          </span>
        </div>
      ) : field.type === "radio" ? (
        <RadioGroup
          disabled
          className={
            field.layout === "horizontal" ? "flex flex-wrap gap-4" : "space-y-2"
          }
        >
          {(
            field.options || [
              { label: "Option 1", value: "option1" },
              { label: "Option 2", value: "option2" },
            ]
          ).map((option: any, index: number) => (
            <div key={index} className="flex items-center space-x-2">
              <RadioGroupItem
                value={option.value}
                id={`edit-radio-${field.id}-${index}`}
                disabled
              />
              <Label
                htmlFor={`edit-radio-${field.id}-${index}`}
                className="text-sm text-gray-600 dark:text-gray-400 cursor-pointer"
              >
                {option.label}
              </Label>
            </div>
          ))}
        </RadioGroup>
      ) : field.type === "select" ? (
        <Select disabled>
          <SelectTrigger className="bg-gray-50 dark:bg-gray-900">
            <SelectValue placeholder={field.placeholder} />
          </SelectTrigger>
        </Select>
      ) : null}
    </div>
  );
}

function FormLoadingSkeleton() {
  return (
    <div className="h-full flex">
      {/* Toolbox Skeleton */}
      <div className="w-12 border-r border-gray-200 dark:border-gray-800 bg-gray-50 dark:bg-gray-900 flex flex-col">
        <div className="p-3 border-b border-gray-200 dark:border-gray-800">
          <Skeleton className="w-6 h-6" />
        </div>
        <div className="flex-1 p-1 space-y-1">
          {Array.from({ length: 8 }).map((_, i) => (
            <Skeleton key={i} className="w-10 h-10 rounded" />
          ))}
        </div>
      </div>

      {/* Main Canvas Skeleton */}
      <div className="flex-1 flex flex-col">
        {/* Header Skeleton */}
        <div className="p-6 border-b border-gray-200 dark:border-gray-800">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Skeleton className="w-6 h-6" />
              <Skeleton className="w-48 h-8" />
            </div>
            <div className="flex items-center gap-2">
              <Skeleton className="w-20 h-8" />
              <Skeleton className="w-24 h-8" />
            </div>
          </div>
        </div>

        {/* Content Skeleton */}
        <div className="flex-1 p-6 space-y-4">
          <Skeleton className="w-full h-12" />
          <Skeleton className="w-full h-12" />
          <Skeleton className="w-3/4 h-12" />
          <Skeleton className="w-full h-20" />
          <Skeleton className="w-1/2 h-12" />
        </div>
      </div>

      {/* Properties Panel Skeleton */}
      <div className="w-80 border-l border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-950 p-6 space-y-4">
        <Skeleton className="w-32 h-6" />
        <div className="space-y-3">
          <Skeleton className="w-full h-8" />
          <Skeleton className="w-full h-8" />
          <Skeleton className="w-full h-20" />
          <Skeleton className="w-full h-8" />
        </div>
      </div>
    </div>
  );
}

export default function FormEditor() {
  const [, params] = useRoute("/form-editor/:projectId?/:formId?");
  const [, setLocation] = useLocation();
  const projectId = params?.projectId;
  const formIdFromUrl = params?.formId;
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedFormId, setSelectedFormId] = useState<string | null>(
    formIdFromUrl || null,
  );
  const [isCreatingForm, setIsCreatingForm] = useState(false);
  const [isLoadingFormFromUrl, setIsLoadingFormFromUrl] = useState(false);

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
    fullWidthButtons: false,
  });

  // UI state for comboboxes
  const [layoutOpen, setLayoutOpen] = useState(false);
  const [spacingOpen, setSpacingOpen] = useState(false);

  // Helper functions for styling capture
  const getFieldClassName = (field: any, config: any) => {
    const baseClasses = ["w-full"];

    if (field.type === "textarea") {
      baseClasses.push("resize-none");
    }

    if (config.layout === "auto") {
      baseClasses.push("flex-1");
    }

    return baseClasses.join(" ");
  };

  const getFieldStyle = (field: any, config: any) => {
    const style: Record<string, any> = {};

    if (config.layout === "auto" && field.width) {
      style.width =
        typeof field.width === "number" ? `${field.width}%` : field.width;
    }

    if (field.height && field.type === "textarea") {
      style.height =
        typeof field.height === "number" ? `${field.height}px` : field.height;
    }

    return style;
  };

  const getFieldHeight = (field: any) => {
    if (field.type === "textarea") {
      return field.height || "auto";
    }
    return undefined;
  };

  const getFieldContainerClassName = (field: any, config: any) => {
    const classes = ["space-y-2"];

    if (config.layout === "auto") {
      classes.push("flex-1");
    } else if (config.layout === "grid") {
      classes.push("grid-item");
    }

    return classes.join(" ");
  };

  const getLabelClassName = (config: any) => {
    const classes = [
      "text-sm",
      "font-medium",
      "text-gray-700",
      "dark:text-gray-300",
    ];

    if (!config.showLabels) {
      classes.push("sr-only");
    }

    return classes.join(" ");
  };

  const getFormContainerClassName = (config: any) => {
    const classes = ["space-y-4"];

    switch (config.layout) {
      case "grid":
        classes.push("grid", `grid-cols-${config.gridColumns}`, "gap-4");
        break;

      case "auto":
        classes.push("space-y-4");
        break;
      default:
        classes.push("space-y-4");
    }

    return classes.join(" ");
  };

  const getFormContainerStyle = (config: any) => {
    const style: Record<string, any> = {};

    if (config.spacing === "custom" && config.customSpacing) {
      style.gap = `${config.customSpacing}px`;
    }

    return style;
  };

  const { selectedProject } = useProject();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const currentProjectId = projectId || selectedProject;

  // DnD sensors
  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    }),
  );

  // Fetch project details
  const { data: project } = useQuery<Project>({
    queryKey: [`/api/projects/${currentProjectId}`],
    enabled: !!currentProjectId,
  });

  // Fetch forms
  const {
    data: forms = [],
    refetch: refetchForms,
    isLoading: formsLoading,
  } = useQuery<Form[]>({
    queryKey: [`/api/projects/${currentProjectId}/forms`],
    enabled: !!currentProjectId,
  });

  // Load form for editing
  const loadForm = (form: Form) => {
    setEditingFormId(form.id);
    const schema = form.schema as any;
    if (schema?.fields) {
      setFormFields(schema.fields);
    }
    if (schema?.settings) {
      setFormConfig((prev) => ({ ...prev, ...schema.settings }));
    }
    setIsCreatingForm(true);
    setShowPropertiesPanel(false);
    setSelectedFieldId(null);
  };

  // Function to update URL when form is selected
  const selectFormWithUrl = (formId: string | null) => {
    setSelectedFormId(formId);
    if (formId && currentProjectId) {
      setLocation(`/form-editor/${currentProjectId}/${formId}`);
    } else if (currentProjectId) {
      setLocation(`/form-editor/${currentProjectId}`);
    }
  };

  // Sync URL with selected form
  useEffect(() => {
    if (formIdFromUrl) {
      if (forms.length > 0) {
        const formExists = forms.find((f) => f.id === formIdFromUrl);
        if (formExists) {
          setIsLoadingFormFromUrl(true);
          setSelectedFormId(formIdFromUrl);
          loadForm(formExists);
          // Add a small delay to show loading state
          setTimeout(() => {
            setIsLoadingFormFromUrl(false);
          }, 500);
        } else {
          setIsLoadingFormFromUrl(false);
        }
      } else if (!formsLoading) {
        // If forms are not loading and we have no forms, set loading to false
        setIsLoadingFormFromUrl(false);
      }
    } else {
      setIsLoadingFormFromUrl(false);
    }
  }, [formIdFromUrl, forms, formsLoading]);

  // Listen for project changes to refresh forms
  useEffect(() => {
    const handleProjectChange = (event: CustomEvent) => {
      const { projectId: newProjectId, previousProject } = event.detail || {};
      if (newProjectId !== previousProject) {
        // Reset forms state when project changes
        setSelectedFormId(null);
        setIsCreatingForm(false);
        setEditingFormId(null);
        setFormFields([]);
        setSelectedFieldId(null);
        setShowPropertiesPanel(false);
        setShowFormsList(true); // Show forms list again
        // Update URL to remove form ID
        if (newProjectId) {
          setLocation(`/form-editor/${newProjectId}`);
        }
        // Forms will be automatically refetched due to query key change
      }
    };

    const handleStorageChange = () => {
      // React to localStorage changes from other components
      const storedProject = localStorage.getItem("formfy_selected_project");
      if (storedProject !== currentProjectId) {
        // Reset forms state when project changes
        setSelectedFormId(null);
        setIsCreatingForm(false);
        setEditingFormId(null);
        setFormFields([]);
        setSelectedFieldId(null);
        setShowPropertiesPanel(false);
        setShowFormsList(true);
        // Update URL to remove form ID
        if (storedProject) {
          setLocation(`/form-editor/${storedProject}`);
        }
      }
    };

    window.addEventListener(
      "projectChanged",
      handleProjectChange as EventListener,
    );
    window.addEventListener("localStorageChange", handleStorageChange);

    return () => {
      window.removeEventListener(
        "projectChanged",
        handleProjectChange as EventListener,
      );
      window.removeEventListener("localStorageChange", handleStorageChange);
    };
  }, [currentProjectId]);

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
            fields: ensureFieldNames(formFields).map(
              (field: FormFieldData) => ({
                ...field,
                order: field.order || 0,
                // Add styling information for SDK rendering
                className: getFieldClassName(field, formConfig),
                style: getFieldStyle(field, formConfig),
                height: getFieldHeight(field),
                containerClassName: getFieldContainerClassName(
                  field,
                  formConfig,
                ),
                labelClassName: getLabelClassName(formConfig),
              }),
            ),
            settings: {
              ...formConfig,
              title: formData.name,
              description: formData.description,
              // Add form container styling for SDK
              formClassName: getFormContainerClassName(formConfig),
              formStyle: getFormContainerStyle(formConfig),
              layout: formConfig.layout,
              gridColumns: formConfig.gridColumns,
              spacing: formConfig.spacing,
              customSpacing: formConfig.customSpacing,
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
      setSelectedFormId(null); // Clear selected form to prevent URL routing with form ID
      setShowFormsList(true); // Show forms list sidebar after successful creation

      // Navigate back to form editor with just project ID
      if (currentProjectId) {
        setLocation(`/form-editor/${currentProjectId}`);
      }

      // Generate public form URL with form ID for SDK access
      const publicUrl = `${window.location.origin}/form/${data.id}/testing`;

      toast({
        title: "Form created successfully",
        description: "Click to copy the SDK API URL",
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
          fields: ensureFieldNames(formFields).map((field: FormFieldData) => ({
            ...field,
            order: field.order || 0,
            // Add styling information for SDK rendering
            className: getFieldClassName(field, formConfig),
            style: getFieldStyle(field, formConfig),
            height: getFieldHeight(field),
            containerClassName: getFieldContainerClassName(field, formConfig),
            labelClassName: getLabelClassName(formConfig),
          })),
          settings: {
            ...formConfig,
            title: formData.name,
            description: formData.description,
            // Add form container styling for SDK
            formClassName: getFormContainerClassName(formConfig),
            formStyle: getFormContainerStyle(formConfig),
            layout: formConfig.layout,
            gridColumns: formConfig.gridColumns,
            spacing: formConfig.spacing,
            customSpacing: formConfig.customSpacing,
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
      setSelectedFormId(null); // Clear selected form to prevent URL routing with form ID
      setEditingFormId(null);
      setShowFormsList(true); // Show forms list sidebar after successful update

      // Navigate back to form editor with just project ID
      if (currentProjectId) {
        setLocation(`/form-editor/${currentProjectId}`);
      }

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

  // Duplicate form mutation
  const duplicateFormMutation = useMutation({
    mutationFn: async (formToDuplicate: Form) => {
      const duplicatedName = `${formToDuplicate.name} (Copy)`;
      return await apiRequest(
        `/api/projects/${currentProjectId}/forms`,
        "POST",
        {
          name: duplicatedName,
          description: formToDuplicate.description,
          projectId: currentProjectId,
          schema: formToDuplicate.schema, // Copy the entire schema including fields and settings
        },
      );
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({
        queryKey: [`/api/projects/${currentProjectId}/forms`],
      });

      toast({
        title: "Form duplicated successfully",
        description: `"${data.name}" has been created as a copy`,
      });
    },
    onError: (error: any) => {
      toast({
        title: "Error duplicating form",
        description: error.message || "Failed to duplicate form",
        variant: "destructive",
      });
    },
  });

  const handleDuplicateForm = (form: Form) => {
    duplicateFormMutation.mutate(form);
  };

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

    // Validate form fields before saving
    const validation = validateFormForSave(formFields);
    if (!validation.isValid) {
      toast({
        title: "Form validation failed",
        description: validation.errors.join(", "),
        variant: "destructive",
      });
      return;
    }

    if (editingFormId) {
      // Update existing form
      updateFormMutation.mutate({
        id: editingFormId,
        name: formName.trim(),
        description: formDescription.trim() || undefined,
        projectId: currentProjectId,
      });
    } else {
      // Create new form
      createFormMutation.mutate({
        name: formName.trim(),
        description: formDescription.trim() || undefined,
        projectId: currentProjectId,
      });
    }
  };

  const handleDownloadFormJson = (form: Form) => {
    // Create the JSON data to download
    const formData = {
      id: form.id,
      name: form.name,
      description: form.description,
      schema: form.schema,
      isActive: form.isActive,
      createdAt: form.createdAt,
      updatedAt: form.updatedAt,
    };

    // Convert to JSON string with pretty formatting
    const jsonString = JSON.stringify(formData, null, 2);

    // Create a blob and download link
    const blob = new Blob([jsonString], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    
    // Create a temporary link element and trigger download
    const link = document.createElement('a');
    link.href = url;
    link.download = `${form.name.toLowerCase().replace(/\s+/g, '-')}-form.json`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    
    // Clean up the URL object
    URL.revokeObjectURL(url);

    toast({
      title: "Form downloaded",
      description: `${form.name} has been downloaded as JSON`,
    });
  };

  const handleDownloadAllFormsZip = async () => {
    if (!forms || forms.length === 0) {
      toast({
        title: "No forms to download",
        description: "This project has no forms to export",
        variant: "destructive",
      });
      return;
    }

    try {
      // Create a new JSZip instance
      const zip = new JSZip();
      
      // Add each form as a JSON file to the zip
      forms.forEach((form) => {
        const formData = {
          id: form.id,
          name: form.name,
          description: form.description,
          schema: form.schema,
          isActive: form.isActive,
          createdAt: form.createdAt,
          updatedAt: form.updatedAt,
        };
        
        const jsonString = JSON.stringify(formData, null, 2);
        const filename = `${form.name.toLowerCase().replace(/\s+/g, '-')}-form.json`;
        zip.file(filename, jsonString);
      });

      // Add a project metadata file
      const projectMeta = {
        projectId: currentProjectId,
        projectName: project?.name || "Unknown Project",
        totalForms: forms.length,
        exportDate: new Date().toISOString(),
        exportedBy: "Formfy Form Builder",
      };
      
      zip.file('project-metadata.json', JSON.stringify(projectMeta, null, 2));

      // Generate the zip file
      const content = await zip.generateAsync({ type: "blob" });
      
      // Create download link
      const url = URL.createObjectURL(content);
      const link = document.createElement('a');
      link.href = url;
      
      const projectName = project?.name?.toLowerCase().replace(/\s+/g, '-') || 'project';
      link.download = `${projectName}-forms-export.zip`;
      
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      
      // Clean up
      URL.revokeObjectURL(url);

      toast({
        title: "Forms exported successfully",
        description: `Downloaded ${forms.length} forms as ZIP file`,
      });
    } catch (error) {
      console.error('Error creating ZIP file:', error);
      toast({
        title: "Export failed",
        description: "Failed to create ZIP file. Please try again.",
        variant: "destructive",
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
    setFormName("Untitled Form");
    setFormDescription("");
    setShowFormsList(false); // Collapse forms sidebar when creating
    // Reset form config to defaults
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
    selectFormWithUrl(formId);
    setIsCreatingForm(false);

    // Load and edit the selected form
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
    setShowFormsList(false); // Collapse forms sidebar when editing

    // Load form schema and fields
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
        fullWidthButtons: settings.fullWidthButtons || false,
      });
    }

    setSelectedFieldId(null);
    setShowPropertiesPanel(false);
  };

  const handleFieldSelect = (fieldId: string) => {
    setSelectedFieldId(fieldId);
    setShowPropertiesPanel(true);
  };

  const handleSaveForm = () => {
    setShowSaveDialog(true);
  };

  // Auto layout handlers
  const handleResizeStart = (
    e: React.MouseEvent,
    fieldId: string,
    rowFields: FormFieldData[],
  ) => {
    e.preventDefault();
    const startX = e.clientX;
    const fieldIndex = rowFields.findIndex((f) => f.id === fieldId);
    const currentField = rowFields[fieldIndex];
    const nextField = rowFields[fieldIndex + 1];

    if (!currentField) return;

    // For single fields in a row, just allow visual feedback but maintain 100% width
    if (rowFields.length === 1) {
      const handleMouseMove = (e: MouseEvent) => {
        // Visual feedback only - field stays at 100% width
        const deltaX = e.clientX - startX;
        // Could add visual indicator here if needed
      };

      const handleMouseUp = () => {
        document.removeEventListener("mousemove", handleMouseMove);
        document.removeEventListener("mouseup", handleMouseUp);
      };

      document.addEventListener("mousemove", handleMouseMove);
      document.addEventListener("mouseup", handleMouseUp);
      return;
    }

    // For multiple fields in a row, allow resizing between fields
    if (!nextField) return;

    const startWidthCurrent =
      typeof currentField.width === "number" ? currentField.width : 50;
    const startWidthNext =
      typeof nextField.width === "number" ? nextField.width : 50;

    const handleMouseMove = (e: MouseEvent) => {
      const deltaX = e.clientX - startX;
      const containerWidth = 100; // Percentage based
      const widthChange = (deltaX / window.innerWidth) * containerWidth;

      const newCurrentWidth = Math.max(
        10,
        Math.min(90, startWidthCurrent + widthChange),
      );
      const newNextWidth = Math.max(
        10,
        Math.min(90, startWidthNext - widthChange),
      );

      setFormFields((fields) =>
        fields.map((field) => {
          if (field.id === currentField.id) {
            return { ...field, width: newCurrentWidth };
          }
          if (field.id === nextField.id) {
            return { ...field, width: newNextWidth };
          }
          return field;
        }),
      );
    };

    const handleMouseUp = () => {
      document.removeEventListener("mousemove", handleMouseMove);
      document.removeEventListener("mouseup", handleMouseUp);
    };

    document.addEventListener("mousemove", handleMouseMove);
    document.addEventListener("mouseup", handleMouseUp);
  };

  const handleDropToRow = (e: React.DragEvent, targetRowId?: string) => {
    e.preventDefault();
    const fieldId = e.dataTransfer.getData("text/plain");

    if (!fieldId || !targetRowId) return;

    setFormFields((fields) => {
      // Find the field being dragged
      const draggedField = fields.find((f) => f.id === fieldId);
      if (!draggedField) return fields;

      // Remove field from its current row
      const fieldsWithoutDragged = fields.filter((f) => f.id !== fieldId);

      // Add field to target row
      const updatedField = { ...draggedField, rowId: targetRowId };
      const updatedFields = [...fieldsWithoutDragged, updatedField];

      // Get all fields in the target row and distribute widths evenly
      const fieldsInTargetRow = updatedFields.filter(
        (f) => f.rowId === targetRowId,
      );
      const evenWidth = 100 / fieldsInTargetRow.length;

      return updatedFields.map((field) => {
        if (field.rowId === targetRowId) {
          return { ...field, width: evenWidth };
        }
        return field;
      });
    });
  };

  const handleDropToNewRow = (e: React.DragEvent) => {
    e.preventDefault();
    const fieldId = e.dataTransfer.getData("text/plain");

    if (!fieldId) return;

    setFormFields((fields) => {
      const newRowId = generateRowId();
      return fields.map((field) => {
        if (field.id === fieldId) {
          return { ...field, rowId: newRowId, width: 100 };
        }
        return field;
      });
    });
  };

  const handleAddField = (fieldType: string, targetRowId?: string) => {
    const newField = createFormField(fieldType as any);
    newField.id = Date.now().toString();
    newField.order = formFields.length;

    // For auto layout
    if (formConfig.layout === "auto") {
      if (targetRowId) {
        // Add to specific row
        newField.rowId = targetRowId;
        
        // Update width distribution for all fields in the target row
        setFormFields((currentFields) => {
          const newFields = [...currentFields, newField];
          const fieldsInTargetRow = newFields.filter(f => f.rowId === targetRowId);
          const evenWidth = 100 / fieldsInTargetRow.length;
          
          return newFields.map(field => {
            if (field.rowId === targetRowId) {
              return { ...field, width: evenWidth };
            }
            return field;
          });
        });
      } else {
        // Create a new row for the field
        newField.rowId = generateRowId();
        newField.width = 100; // Numeric percentage for auto layout
        setFormFields([...formFields, newField]);
      }
    } else {
      setFormFields([...formFields, newField]);
    }

    setSelectedFieldId(newField.id);
    setShowPropertiesPanel(true);
  };

  const handleAddFieldOld = (fieldType: string) => {
    const newField = {
      id: Date.now().toString(),
      name: `field_${Date.now()}`,
      label: getFieldLabel(fieldType),
      type: fieldType,
      placeholder: getFieldPlaceholder(fieldType),
      required: false,
      disabled: false,
      readonly: false,
      class: "",
      icon: "",
      prefix: "",
      suffix: "",
      hint: "",
      autofocus: false,
      autocomplete: "",
      debounce: 0,
      width: "100%",
      layout: "vertical",
      multiple: false,
      options:
        fieldType === "radio" || fieldType === "select"
          ? [
              { label: "Option 1", value: "option1" },
              { label: "Option 2", value: "option2" },
            ]
          : [],
      optionSource: "",
      minDate: "",
      maxDate: "",
      dateFormat: "YYYY-MM-DD",
      watch: [],
      calculatedValue: "",
      testId: "",
      validation: {
        minLength: null,
        maxLength: null,
        pattern: "",
        min: null,
        max: null,
        customValidator: "",
        errorMessages: {
          required: "This field is required",
          minLength: "Value is too short",
          maxLength: "Value is too long",
          pattern: "Invalid format",
          min: "Value is too small",
          max: "Value is too large",
        },
      },
      condition: {
        type: "visibility",
        logic: "AND",
        rules: [],
      },
      order: formFields.length,
    };
    setFormFields([...formFields, newField]);
    setSelectedFieldId(newField.id);
    setShowPropertiesPanel(true);
  };

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;

    if (!over) {
      // If dropped outside any droppable area, create a new row for the field
      if (formConfig.layout === "auto") {
        const draggedFieldId = active.id as string;
        setFormFields((fields) => {
          const draggedField = fields.find((f) => f.id === draggedFieldId);
          if (!draggedField) return fields;

          // Create a new standalone row for this field
          const newRowId = generateRowId();
          return fields.map((field) => {
            if (field.id === draggedFieldId) {
              return { ...field, rowId: newRowId, width: 100 };
            }
            return field;
          });
        });
      }
      return;
    }

    if (active.id === over.id) return;

    // For auto layout mode, handle row-based dragging and reordering
    if (formConfig.layout === "auto") {
      const draggedFieldId = active.id as string;
      const overId = over.id as string;

      // Handle special drop zones
      if (overId === "new-row-drop-zone") {
        setFormFields((fields) => {
          const draggedField = fields.find((f) => f.id === draggedFieldId);
          if (!draggedField) return fields;

          // Remove from current row and create new standalone row
          const newRowId = generateRowId();
          const updatedFields = fields.map((field) => {
            if (field.id === draggedFieldId) {
              return {
                ...field,
                rowId: newRowId,
                width: 100,
                order: Math.max(...fields.map((f) => f.order)) + 1,
              };
            }
            return field;
          });

          // Redistribute widths in the original row if it had multiple fields
          if (draggedField.rowId) {
            const remainingFieldsInOriginalRow = updatedFields.filter(
              (f) => f.rowId === draggedField.rowId && f.id !== draggedFieldId,
            );
            if (remainingFieldsInOriginalRow.length > 0) {
              const evenWidth = 100 / remainingFieldsInOriginalRow.length;
              return updatedFields.map((field) => {
                if (
                  field.rowId === draggedField.rowId &&
                  field.id !== draggedFieldId
                ) {
                  return { ...field, width: evenWidth };
                }
                return field;
              });
            }
          }

          return updatedFields;
        });
        return;
      }

      if (overId.startsWith("row-drop-zone-")) {
        const targetRowId = overId.replace("row-drop-zone-", "");
        setFormFields((fields) => {
          const draggedField = fields.find((f) => f.id === draggedFieldId);
          if (!draggedField) return fields;

          const originalRowId = draggedField.rowId;

          // Update the dragged field's row
          let updatedFields = fields.map((field) => {
            if (field.id === draggedFieldId) {
              return { ...field, rowId: targetRowId };
            }
            return field;
          });

          // Redistribute widths in target row
          const fieldsInTargetRow = updatedFields.filter(
            (f) => f.rowId === targetRowId,
          );
          const targetEvenWidth = 100 / fieldsInTargetRow.length;

          updatedFields = updatedFields.map((field) => {
            if (field.rowId === targetRowId) {
              return { ...field, width: targetEvenWidth };
            }
            return field;
          });

          // Redistribute widths in original row if it had multiple fields
          if (originalRowId && originalRowId !== targetRowId) {
            const remainingFieldsInOriginalRow = updatedFields.filter(
              (f) => f.rowId === originalRowId,
            );
            if (remainingFieldsInOriginalRow.length > 0) {
              const originalEvenWidth =
                100 / remainingFieldsInOriginalRow.length;
              updatedFields = updatedFields.map((field) => {
                if (field.rowId === originalRowId) {
                  return { ...field, width: originalEvenWidth };
                }
                return field;
              });
            }
          }

          return updatedFields;
        });
        return;
      }

      // Handle field-to-field drops
      const targetFieldId = overId;
      setFormFields((fields) => {
        const draggedField = fields.find((f) => f.id === draggedFieldId);
        const targetField = fields.find((f) => f.id === targetFieldId);

        if (!draggedField || !targetField) return fields;

        // If both fields are in the same row, reorder within that row
        if (
          draggedField.rowId &&
          targetField.rowId &&
          draggedField.rowId === targetField.rowId
        ) {
          const fieldsInRow = fields.filter(
            (f) => f.rowId === draggedField.rowId,
          );
          const otherFields = fields.filter(
            (f) => f.rowId !== draggedField.rowId,
          );

          const draggedIndex = fieldsInRow.findIndex(
            (f) => f.id === draggedFieldId,
          );
          const targetIndex = fieldsInRow.findIndex(
            (f) => f.id === targetFieldId,
          );

          if (draggedIndex === -1 || targetIndex === -1) return fields;

          // Reorder fields within the row
          const reorderedFields = [...fieldsInRow];
          const [movedField] = reorderedFields.splice(draggedIndex, 1);
          reorderedFields.splice(targetIndex, 0, movedField);

          // Update order values to maintain position
          reorderedFields.forEach((field, index) => {
            field.order = Math.min(...fieldsInRow.map((f) => f.order)) + index;
          });

          return [...otherFields, ...reorderedFields];
        }

        // Moving field from one row to another
        const originalRowId = draggedField.rowId;
        let updatedFields = fields.map((field) => {
          if (field.id === draggedFieldId) {
            return { ...field, rowId: targetField.rowId };
          }
          return field;
        });

        // Redistribute widths in target row
        const fieldsInTargetRow = updatedFields.filter(
          (f) => f.rowId === targetField.rowId,
        );
        const targetEvenWidth = 100 / fieldsInTargetRow.length;

        updatedFields = updatedFields.map((field) => {
          if (field.rowId === targetField.rowId) {
            return { ...field, width: targetEvenWidth };
          }
          return field;
        });

        // Redistribute widths in original row if it had multiple fields
        if (originalRowId && originalRowId !== targetField.rowId) {
          const remainingFieldsInOriginalRow = updatedFields.filter(
            (f) => f.rowId === originalRowId,
          );
          if (remainingFieldsInOriginalRow.length > 0) {
            const originalEvenWidth = 100 / remainingFieldsInOriginalRow.length;
            updatedFields = updatedFields.map((field) => {
              if (field.rowId === originalRowId) {
                return { ...field, width: originalEvenWidth };
              }
              return field;
            });
          }
        }

        return updatedFields;
      });
    } else {
      // Traditional layout mode - clear auto layout properties and do simple reordering
      setFormFields((items) => {
        const clearedItems = items.map((item) => ({
          ...item,
          rowId: undefined,
          width: 100,
        }));

        const oldIndex = clearedItems.findIndex(
          (item) => item.id === active.id,
        );
        const newIndex = clearedItems.findIndex((item) => item.id === over?.id);

        return arrayMove(clearedItems, oldIndex, newIndex);
      });
    }
  };

  const getSpacingValue = () => {
    if (formConfig.spacing === "custom") {
      return `${formConfig.customSpacing}px`;
    }
    return formConfig.spacing;
  };

  const getFieldLabel = (type: string) => {
    const labels: Record<string, string> = {
      text: "Text Input",
      textarea: "Textarea",
      email: "Email",
      number: "Number",
      tel: "Phone Number",
      url: "URL",
      date: "Date",
      file: "File Upload",
      checkbox: "Checkbox",
      radio: "Radio Button",
      select: "Dropdown",
    };
    return labels[type] || "Field";
  };

  const getFieldPlaceholder = (type: string) => {
    const placeholders: Record<string, string> = {
      text: "Enter text...",
      textarea: "Enter your message...",
      email: "Enter email address...",
      number: "Enter number...",
      tel: "Enter phone number...",
      url: "Enter URL...",
      date: "Select date...",
      file: "Choose file...",
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
            <div className="flex items-center gap-2">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <Input
                  type="search"
                  placeholder="Search forms..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-9 h-8 text-sm bg-white dark:bg-gray-800"
                />
              </div>
              {forms && forms.length > 0 && (
                <>
                  <Button 
                    size="sm" 
                    variant="outline" 
                    className="h-8 w-8 p-0" 
                    onClick={handleDownloadAllFormsZip}
                    title="Download all forms as ZIP"
                  >
                    <Download className="w-3 h-3" />
                  </Button>
                  <Button 
                    size="sm" 
                    variant="outline" 
                    className="h-8 w-8 p-0" 
                    onClick={handleNewFormClick}
                    title="Create new form"
                  >
                    <Plus className="w-3 h-3" />
                  </Button>
                </>
              )}
            </div>
          </div>

          {/* Forms List */}
          <div className="flex-1 overflow-y-auto">
            {formsLoading ? (
              <div className="p-4 space-y-2">
                {[...Array(3)].map((_, i) => (
                  <div
                    key={i}
                    className="p-1.5 rounded-lg border border-gray-200 dark:border-gray-700"
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <div className="w-4 h-4 bg-gray-200 dark:bg-gray-700 rounded animate-pulse" />
                          <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded animate-pulse w-24" />
                        </div>
                      </div>
                      <div className="w-6 h-6 bg-gray-200 dark:bg-gray-700 rounded animate-pulse" />
                    </div>
                  </div>
                ))}
              </div>
            ) : filteredForms.length === 0 ? (
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
                            onClick={(e) => {
                              e.stopPropagation();
                              handleDuplicateForm(form);
                            }}
                          >
                            <Copy className="mr-2 h-3 w-3" />
                            Duplicate
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            onClick={() => handleDownloadFormJson(form)}
                          >
                            <Download className="mr-2 h-3 w-3" />
                            Download JSON
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
          /* Form Builder Interface */
          <div className="h-full flex">
            {/* Toolbox Sidebar */}
            <div
              className="w-12 border-r border-gray-200 dark:border-gray-800 bg-gray-50 dark:bg-gray-900 flex flex-col relative z-10"
              onSubmit={(e) => e.preventDefault()}
            >
              {/* Tools Header */}
              <div className="p-3 border-b border-gray-200 dark:border-gray-800">
                <button
                  type="button"
                  onClick={() => setShowFormsList(!showFormsList)}
                  className="w-6 h-6 text-gray-600 dark:text-gray-400 mx-auto hover:text-gray-800 dark:hover:text-gray-200 transition-colors flex items-center justify-center"
                  title="Toggle Forms List"
                >
                  <PanelRightOpen className="w-4 h-4" />
                </button>
              </div>

              {/* Field Tools */}
              <div
                className="flex-1 p-2 space-y-2 relative z-20"
                onSubmit={(e) => e.preventDefault()}
              >
                <button
                  type="button"
                  onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    handleAddField("text");
                  }}
                  className="w-full p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors group relative z-30"
                  title="Text Input"
                >
                  <AlignLeft className="w-4 h-4 text-gray-600 dark:text-gray-400 mx-auto" />
                </button>

                <button
                  type="button"
                  onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    handleAddField("email");
                  }}
                  className="w-full p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors group relative z-30"
                  title="Email Input"
                >
                  <Type className="w-4 h-4 text-gray-600 dark:text-gray-400 mx-auto" />
                </button>

                <button
                  type="button"
                  onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    handleAddField("password");
                  }}
                  className="w-full p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors group relative z-30"
                  title="Password Input"
                >
                  <Lock className="w-4 h-4 text-gray-600 dark:text-gray-400 mx-auto" />
                </button>

                <button
                  type="button"
                  onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    handleAddField("number");
                  }}
                  className="w-full p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors group relative z-30"
                  title="Number Input"
                >
                  <Hash className="w-4 h-4 text-gray-600 dark:text-gray-400 mx-auto" />
                </button>

                <button
                  type="button"
                  onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    handleAddField("checkbox");
                  }}
                  className="w-full p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors group relative z-30"
                  title="Checkbox"
                >
                  <CheckSquare className="w-4 h-4 text-gray-600 dark:text-gray-400 mx-auto" />
                </button>

                <button
                  type="button"
                  onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    handleAddField("radio");
                  }}
                  className="w-full p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors group relative z-30"
                  title="Radio Button"
                >
                  <Circle className="w-4 h-4 text-gray-600 dark:text-gray-400 mx-auto" />
                </button>

                <button
                  type="button"
                  onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    handleAddField("select");
                  }}
                  className="w-full p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors group relative z-30"
                  title="Dropdown"
                >
                  <ChevronDown className="w-4 h-4 text-gray-600 dark:text-gray-400 mx-auto" />
                </button>

                <button
                  type="button"
                  onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    handleAddField("textarea");
                  }}
                  className="w-full p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors group relative z-30"
                  title="Textarea"
                >
                  <AlignLeft className="w-4 h-4 text-gray-600 dark:text-gray-400 mx-auto" />
                </button>

                <button
                  type="button"
                  onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    handleAddField("date");
                  }}
                  className="w-full p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors group relative z-30"
                  title="Date Picker"
                >
                  <Calendar className="w-4 h-4 text-gray-600 dark:text-gray-400 mx-auto" />
                </button>

                <button
                  type="button"
                  onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    handleAddField("file");
                  }}
                  className="w-full p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors group relative z-30"
                  title="File Upload"
                >
                  <Upload className="w-4 h-4 text-gray-600 dark:text-gray-400 mx-auto" />
                </button>

                <button
                  type="button"
                  onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    handleAddField("tel");
                  }}
                  className="w-full p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors group relative z-30"
                  title="Phone Number"
                >
                  <Phone className="w-4 h-4 text-gray-600 dark:text-gray-400 mx-auto" />
                </button>

                <button
                  type="button"
                  onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    handleAddField("url");
                  }}
                  className="w-full p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors group relative z-30"
                  title="URL Input"
                >
                  <LinkIcon className="w-4 h-4 text-gray-600 dark:text-gray-400 mx-auto" />
                </button>
              </div>
            </div>

            {/* Canvas Area */}
            <div className="flex-1 flex flex-col">
              {/* Enhanced Top Toolbar */}
              <div className="h-12 border-b border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-950 flex items-center justify-between px-4">
                <div className="flex items-center gap-4">
                  {/* Layout Type Combobox */}
                  <div className="flex items-center gap-2">
                    <Popover open={layoutOpen} onOpenChange={setLayoutOpen}>
                      <PopoverTrigger asChild>
                        <Button
                          variant="outline"
                          role="combobox"
                          aria-expanded={layoutOpen}
                          className="w-40 h-8 justify-between"
                        >
                          {formConfig.layout === "auto"
                            ? "Auto"
                            : formConfig.layout === "grid"
                              ? "Grid"
                              : formConfig.layout === "single-column"
                                ? "Single"
                                : "Auto"}
                          <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent className="w-40 p-0">
                        <Command>
                          <CommandGroup>
                            <CommandItem
                              value="auto"
                              onSelect={() => {
                                setFormConfig({
                                  ...formConfig,
                                  layout: "auto",
                                });

                                // Convert existing fields to auto layout format
                                setFormFields((fields) =>
                                  fields.map((field) => ({
                                    ...field,
                                    rowId: field.rowId || generateRowId(),
                                    width:
                                      typeof field.width === "string"
                                        ? 100
                                        : field.width || 100,
                                  })),
                                );

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
                              <LayoutPanelTop className="mr-2 h-4 w-4" />
                              Auto
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
                              <LayoutGrid className="mr-2 h-4 w-4" />
                              Grid
                            </CommandItem>
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
                              <Rows3 className="mr-2 h-4 w-4" />
                              Single
                            </CommandItem>
                          </CommandGroup>
                        </Command>
                      </PopoverContent>
                    </Popover>

                    {formConfig.layout === "grid" && (
                      <Input
                        type="number"
                        value={formConfig.gridColumns}
                        onChange={(e) =>
                          setFormConfig({
                            ...formConfig,
                            gridColumns: parseInt(e.target.value) || 2,
                          })
                        }
                        className="w-16 h-8"
                        min="2"
                        max="6"
                      />
                    )}
                  </div>

                  {/* Field Spacing Combobox */}
                  <div className="flex items-center gap-2">
                    <Popover open={spacingOpen} onOpenChange={setSpacingOpen}>
                      <PopoverTrigger asChild>
                        <Button
                          variant="outline"
                          role="combobox"
                          aria-expanded={spacingOpen}
                          className="w-44 h-8 justify-between"
                        >
                          {formConfig.spacing === "2px"
                            ? "2px"
                            : formConfig.spacing === "4px"
                              ? "4px"
                              : formConfig.spacing === "8px"
                                ? "8px"
                                : formConfig.spacing === "custom"
                                  ? "Custom"
                                  : "Field spacing"}
                          <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent className="w-44 p-0">
                        <Command>
                          <CommandGroup>
                            <CommandItem
                              value="2px"
                              onSelect={() => {
                                setFormConfig({
                                  ...formConfig,
                                  spacing: "2px",
                                });
                                setSpacingOpen(false);
                              }}
                            >
                              <Check
                                className={cn(
                                  "mr-2 h-4 w-4",
                                  formConfig.spacing === "2px"
                                    ? "opacity-100"
                                    : "opacity-0",
                                )}
                              />
                              2px
                            </CommandItem>
                            <CommandItem
                              value="4px"
                              onSelect={() => {
                                setFormConfig({
                                  ...formConfig,
                                  spacing: "4px",
                                });
                                setSpacingOpen(false);
                              }}
                            >
                              <Check
                                className={cn(
                                  "mr-2 h-4 w-4",
                                  formConfig.spacing === "4px"
                                    ? "opacity-100"
                                    : "opacity-0",
                                )}
                              />
                              4px
                            </CommandItem>
                            <CommandItem
                              value="8px"
                              onSelect={() => {
                                setFormConfig({
                                  ...formConfig,
                                  spacing: "8px",
                                });
                                setSpacingOpen(false);
                              }}
                            >
                              <Check
                                className={cn(
                                  "mr-2 h-4 w-4",
                                  formConfig.spacing === "8px"
                                    ? "opacity-100"
                                    : "opacity-0",
                                )}
                              />
                              8px
                            </CommandItem>
                            <CommandItem
                              value="8px"
                              onSelect={() => {
                                setFormConfig({
                                  ...formConfig,
                                  spacing: "12px",
                                });
                                setSpacingOpen(false);
                              }}
                            >
                              <Check
                                className={cn(
                                  "mr-2 h-4 w-4",
                                  formConfig.spacing === "12px"
                                    ? "opacity-100"
                                    : "opacity-0",
                                )}
                              />
                              12px
                            </CommandItem>
                            <CommandItem
                              value="custom"
                              onSelect={() => {
                                setFormConfig({
                                  ...formConfig,
                                  spacing: "custom",
                                });
                                setSpacingOpen(false);
                              }}
                            >
                              <Check
                                className={cn(
                                  "mr-2 h-4 w-4",
                                  formConfig.spacing === "custom"
                                    ? "opacity-100"
                                    : "opacity-0",
                                )}
                              />
                              Custom
                            </CommandItem>
                          </CommandGroup>
                        </Command>
                      </PopoverContent>
                    </Popover>

                    {formConfig.spacing === "custom" && (
                      <Input
                        type="number"
                        value={formConfig.customSpacing}
                        onChange={(e) =>
                          setFormConfig({
                            ...formConfig,
                            customSpacing: parseInt(e.target.value) || 8,
                          })
                        }
                        className="w-16 h-8"
                        min="0"
                        max="100"
                      />
                    )}
                  </div>

                  {/* Show Labels Toggle */}
                  <div className="flex items-center gap-2">
                    <Checkbox
                      id="show-labels"
                      checked={formConfig.showLabels}
                      onCheckedChange={(checked) => {
                        setFormConfig({
                          ...formConfig,
                          showLabels: !!checked,
                        });
                      }}
                    />
                    <Label
                      htmlFor="show-labels"
                      className="text-xs cursor-pointer"
                    >
                      Show Labels
                    </Label>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  {/* Button Configuration */}
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button variant="outline" size="sm" className="h-8">
                        <Settings className="w-4 h-4 mr-1" />
                        Buttons
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-80 p-4">
                      <div className="space-y-4">
                        <h4 className="font-medium text-sm">
                          Button Configuration
                        </h4>

                        <div className="space-y-3">
                          <div>
                            <Label className="text-xs">Button Layout</Label>
                            <Select
                              value={formConfig.buttonLayout}
                              onValueChange={(value: any) => {
                                setFormConfig({
                                  ...formConfig,
                                  buttonLayout: value,
                                });
                              }}
                            >
                              <SelectTrigger className="h-8 text-xs">
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="left">Left</SelectItem>
                                <SelectItem value="center">Center</SelectItem>
                                <SelectItem value="right">Right</SelectItem>
                                <SelectItem value="justify">Justify</SelectItem>
                                <SelectItem value="split">Split</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>

                          <div className="flex items-center space-x-2">
                            <Checkbox
                              id="show-cancel"
                              checked={formConfig.showCancelButton}
                              onCheckedChange={(checked) => {
                                setFormConfig({
                                  ...formConfig,
                                  showCancelButton: !!checked,
                                });
                              }}
                            />
                            <Label
                              htmlFor="show-cancel"
                              className="text-xs cursor-pointer"
                            >
                              Show Cancel Button
                            </Label>
                          </div>

                          <div className="flex items-center space-x-2">
                            <Checkbox
                              id="full-width-buttons"
                              checked={formConfig.fullWidthButtons}
                              onCheckedChange={(checked) => {
                                setFormConfig({
                                  ...formConfig,
                                  fullWidthButtons: !!checked,
                                });
                              }}
                            />
                            <Label
                              htmlFor="full-width-buttons"
                              className="text-xs cursor-pointer"
                            >
                              Full Width Buttons
                            </Label>
                          </div>

                          <div className="grid grid-cols-2 gap-2">
                            <div>
                              <Label className="text-xs">Submit Text</Label>
                              <Input
                                value={formConfig.submitButtonText}
                                onChange={(e) => {
                                  setFormConfig({
                                    ...formConfig,
                                    submitButtonText: e.target.value,
                                  });
                                }}
                                className="h-8 text-xs"
                                placeholder="Submit"
                              />
                            </div>
                            <div>
                              <Label className="text-xs">Cancel Text</Label>
                              <Input
                                value={formConfig.cancelButtonText}
                                onChange={(e) => {
                                  setFormConfig({
                                    ...formConfig,
                                    cancelButtonText: e.target.value,
                                  });
                                }}
                                className="h-8 text-xs"
                                placeholder="Cancel"
                              />
                            </div>
                          </div>

                          <div className="grid grid-cols-2 gap-2">
                            <div>
                              <Label className="text-xs">Submit Color</Label>
                              <Input
                                type="color"
                                value={formConfig.submitButtonColor}
                                onChange={(e) => {
                                  setFormConfig({
                                    ...formConfig,
                                    submitButtonColor: e.target.value,
                                  });
                                }}
                                className="h-8 w-full"
                              />
                            </div>
                            <div>
                              <Label className="text-xs">Cancel Color</Label>
                              <Input
                                type="color"
                                value={formConfig.cancelButtonColor}
                                onChange={(e) => {
                                  setFormConfig({
                                    ...formConfig,
                                    cancelButtonColor: e.target.value,
                                  });
                                }}
                                className="h-8 w-full"
                              />
                            </div>
                          </div>
                        </div>
                      </div>
                    </PopoverContent>
                  </Popover>

                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setIsPreviewMode(!isPreviewMode)}
                  >
                    <Eye className="w-4 h-4 mr-1" />
                    {isPreviewMode ? "Edit" : "Preview"}
                  </Button>
                  {isCreatingForm && (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        setIsCreatingForm(false);
                        setEditingFormId(null);
                        setFormFields([]);
                        setSelectedFieldId(null);
                        setShowPropertiesPanel(false);
                        setFormName("");
                        setFormDescription("");
                        setSelectedFormId(null);
                        setShowFormsList(true); // Show forms list again
                      }}
                    >
                      Cancel
                    </Button>
                  )}
                  <Button size="sm" onClick={handleSaveForm}>
                    <Save className="w-4 h-4 mr-1" />
                    Save
                  </Button>
                </div>
              </div>

              {/* Canvas */}
              <div className="flex-1 bg-gray-100 dark:bg-gray-900 p-4">
                <div className="w-full">
                  {/* Form Name Header */}
                  {(formName || editingFormId || isCreatingForm) && (
                    <div className="mb-4 px-1">
                      <div className="flex items-center gap-3">
                        <FileText className="w-5 h-5 text-gray-500 dark:text-gray-400" />
                        <Input
                          value={formName || "Untitled Form"}
                          onChange={(e) => setFormName(e.target.value)}
                          onBlur={(e) => {
                            if (!e.target.value.trim()) {
                              setFormName("Untitled Form");
                            }
                          }}
                          className="text-lg font-medium bg-transparent border-none p-0 h-auto focus:ring-0 focus:border-none text-gray-900 dark:text-gray-100 shadow-none"
                          placeholder="Form name"
                        />
                        {formDescription && (
                          <span className="text-sm text-gray-500 dark:text-gray-400 ml-2">
                            • {formDescription}
                          </span>
                        )}
                      </div>
                    </div>
                  )}

                  <div className="bg-white dark:bg-gray-950 rounded-lg shadow-sm border border-gray-200 dark:border-gray-800 min-h-[500px] p-6">
                    {isPreviewMode ? (
                      /* Preview Mode */
                      <div className="w-full h-full">
                        <div className="space-y-6 h-full">
                          <form className="w-full">
                            {formConfig.layout === "auto" ? (
                              // Auto Layout Preview Mode - Row-based layout
                              <div className="space-y-4">
                                {organizeFieldsIntoRows(formFields).map(
                                  (rowFields, rowIndex) => (
                                    <div
                                      key={
                                        rowFields[0]?.rowId ||
                                        `preview-row-${rowIndex}`
                                      }
                                      className="flex w-full"
                                      style={{ gap: getSpacingValue() }}
                                    >
                                      {rowFields.map((field) => (
                                        <div
                                          key={field.id}
                                          style={{
                                            width: `${typeof field.width === "number" ? field.width : 100 / rowFields.length}%`,
                                          }}
                                          className={`${
                                            field.layout === "horizontal" &&
                                            field.type !== "radio" &&
                                            field.type !== "checkbox"
                                              ? "flex items-center gap-4"
                                              : field.layout === "inline" &&
                                                  field.type !== "radio" &&
                                                  field.type !== "checkbox"
                                                ? "flex items-center gap-2"
                                                : "space-y-2"
                                          }`}
                                        >
                                          {formConfig.showLabels && (
                                            <div
                                              className={`${
                                                field.layout === "horizontal" &&
                                                field.type !== "radio" &&
                                                field.type !== "checkbox"
                                                  ? "min-w-[120px]"
                                                  : ""
                                              }`}
                                            >
                                              <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                                                {field.label}
                                                {field.required && (
                                                  <span className="text-red-500 ml-1">
                                                    *
                                                  </span>
                                                )}
                                              </label>
                                            </div>
                                          )}

                                          <div className="relative w-full">
                                            {/* Render form field based on type */}
                                            {field.type === "text" ||
                                            field.type === "email" ||
                                            field.type === "number" ||
                                            field.type === "tel" ||
                                            field.type === "url" ? (
                                              <div className="relative flex items-center">
                                                {field.icon &&
                                                  field.icon.position ===
                                                    "left" && (
                                                    <div className="absolute left-3 z-10 text-gray-500 dark:text-gray-400">
                                                      {(() => {
                                                        const IconComponent = (
                                                          LucideIcons as any
                                                        )[field.icon.name];

                                                        return IconComponent ? (
                                                          <IconComponent
                                                            size={
                                                              field.icon.size
                                                            }
                                                          />
                                                        ) : null;
                                                      })()}
                                                    </div>
                                                  )}
                                                <Input
                                                  type={field.type}
                                                  placeholder={
                                                    field.placeholder
                                                  }
                                                  disabled={field.disabled}
                                                  readOnly={field.readonly}
                                                  className={`w-full ${field.icon?.position === "left" ? "pl-10" : ""} ${field.icon?.position === "right" ? "pr-10" : ""}`}
                                                  style={{
                                                    width: "100%",
                                                    paddingLeft:
                                                      field.icon?.position ===
                                                      "left"
                                                        ? `${30 + (field.icon.size || 16)}px`
                                                        : undefined,
                                                    paddingRight:
                                                      field.icon?.position ===
                                                      "right"
                                                        ? `${30 + (field.icon.size || 16)}px`
                                                        : undefined,
                                                  }}
                                                />
                                                {field.icon &&
                                                  field.icon.position ===
                                                    "right" && (
                                                    <div className="absolute right-3 z-10 text-gray-500 dark:text-gray-400">
                                                      {(() => {
                                                        const IconComponent = (
                                                          LucideIcons as any
                                                        )[field.icon.name];
                                                        return IconComponent ? (
                                                          <IconComponent
                                                            size={
                                                              field.icon.size
                                                            }
                                                          />
                                                        ) : null;
                                                      })()}
                                                    </div>
                                                  )}
                                              </div>
                                            ) : field.type === "password" ? (
                                              <div className="relative flex items-center">
                                                {field.icon &&
                                                  field.icon.position ===
                                                    "left" && (
                                                    <div className="absolute left-3 z-10 text-gray-500 dark:text-gray-400">
                                                      {(() => {
                                                        const IconComponent = (
                                                          LucideIcons as any
                                                        )[field.icon.name];
                                                        return IconComponent ? (
                                                          <IconComponent
                                                            size={
                                                              field.icon.size
                                                            }
                                                          />
                                                        ) : null;
                                                      })()}
                                                    </div>
                                                  )}
                                                <Input
                                                  type="password"
                                                  placeholder={
                                                    field.placeholder
                                                  }
                                                  disabled={field.disabled}
                                                  readOnly={field.readonly}
                                                  className={`w-full ${field.icon?.position === "left" ? "pl-10" : ""} ${field.showPasswordToggle ? "pr-10" : field.icon?.position === "right" ? "pr-10" : ""}`}
                                                  style={{
                                                    width: "100%",
                                                    paddingLeft:
                                                      field.icon?.position ===
                                                      "left"
                                                        ? `${30 + (field.icon.size || 16)}px`
                                                        : undefined,
                                                    paddingRight:
                                                      field.showPasswordToggle 
                                                        ? "40px"
                                                        : field.icon?.position ===
                                                          "right"
                                                          ? `${30 + (field.icon.size || 16)}px`
                                                          : undefined,
                                                  }}
                                                />
                                                {field.showPasswordToggle && (
                                                  <button
                                                    type="button"
                                                    className="absolute right-3 z-10 text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300"
                                                    onClick={(e) => {
                                                      e.preventDefault();
                                                      // Toggle password visibility (functional in real form)
                                                    }}
                                                  >
                                                    <EyeOff className="w-4 h-4" />
                                                  </button>
                                                )}
                                                {field.icon &&
                                                  field.icon.position ===
                                                    "right" && !field.showPasswordToggle && (
                                                    <div className="absolute right-3 z-10 text-gray-500 dark:text-gray-400">
                                                      {(() => {
                                                        const IconComponent = (
                                                          LucideIcons as any
                                                        )[field.icon.name];
                                                        return IconComponent ? (
                                                          <IconComponent
                                                            size={
                                                              field.icon.size
                                                            }
                                                          />
                                                        ) : null;
                                                      })()}
                                                    </div>
                                                  )}
                                              </div>
                                            ) : field.type === "textarea" ? (
                                              <Textarea
                                                placeholder={field.placeholder}
                                                disabled={field.disabled}
                                                readOnly={field.readonly}
                                                className="w-full resize-none"
                                                style={{ width: "100%" }}
                                                rows={3}
                                              />
                                            ) : field.type === "radio" ? (
                                              <RadioGroup
                                                className={
                                                  field.layout === "horizontal"
                                                    ? "flex flex-wrap gap-4"
                                                    : "space-y-2"
                                                }
                                              >
                                                {(field.options || []).map(
                                                  (
                                                    option: any,
                                                    index: number,
                                                  ) => (
                                                    <div
                                                      key={index}
                                                      className="flex items-center space-x-2"
                                                    >
                                                      <RadioGroupItem
                                                        value={option.value}
                                                        id={`preview-radio-${field.id}-${index}`}
                                                      />
                                                      <Label
                                                        htmlFor={`preview-radio-${field.id}-${index}`}
                                                        className="text-sm cursor-pointer"
                                                      >
                                                        {option.label}
                                                      </Label>
                                                    </div>
                                                  ),
                                                )}
                                              </RadioGroup>
                                            ) : field.type === "checkbox" ? (
                                              <div className="flex items-center space-x-2">
                                                <Checkbox
                                                  id={`preview-checkbox-${field.id}`}
                                                />
                                                <Label
                                                  htmlFor={`preview-checkbox-${field.id}`}
                                                  className="text-sm cursor-pointer"
                                                >
                                                  {field.checkboxLabel || field.placeholder || "Check this option"}
                                                </Label>
                                              </div>
                                            ) : field.type === "select" ? (
                                              <Select>
                                                <SelectTrigger
                                                  className="w-full"
                                                  style={{ width: "100%" }}
                                                >
                                                  <SelectValue
                                                    placeholder={
                                                      field.placeholder
                                                    }
                                                  />
                                                </SelectTrigger>
                                                <SelectContent>
                                                  {(field.options || []).map(
                                                    (
                                                      option: any,
                                                      index: number,
                                                    ) => (
                                                      <SelectItem
                                                        key={index}
                                                        value={option.value}
                                                      >
                                                        {option.label}
                                                      </SelectItem>
                                                    ),
                                                  )}
                                                </SelectContent>
                                              </Select>
                                            ) : field.type === "date" ? (
                                              <Input
                                                type="date"
                                                className="w-full"
                                                style={{ width: "100%" }}
                                              />
                                            ) : field.type === "file" ? (
                                              <div className="space-y-1">
                                                <Input
                                                  type="file"
                                                  accept={field.fileTypes?.length 
                                                    ? field.fileTypes.map(type => `.${type.toLowerCase()}`).join(',')
                                                    : undefined}
                                                  className="w-full"
                                                  style={{ width: "100%" }}
                                                />
                                                {(field.fileTypes?.length || field.maxFileSize || field.minFileSize) && (
                                                  <div className="text-xs text-gray-500 dark:text-gray-400 space-y-1">
                                                    {field.fileTypes?.length && (
                                                      <div>Allowed types: {field.fileTypes.join(', ')}</div>
                                                    )}
                                                    {(field.minFileSize || field.maxFileSize) && (
                                                      <div>
                                                        Size: {field.minFileSize ? `${field.minFileSize}MB min` : ''}{field.minFileSize && field.maxFileSize ? ', ' : ''}{field.maxFileSize ? `${field.maxFileSize}MB max` : ''}
                                                      </div>
                                                    )}
                                                  </div>
                                                )}
                                              </div>
                                            ) : null}
                                          </div>
                                        </div>
                                      ))}
                                    </div>
                                  ),
                                )}
                              </div>
                            ) : (
                              // Traditional Layout Preview Mode
                              <div
                                className={`w-full ${
                                  formConfig.layout === "grid"
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
                                  <div
                                    key={field.id}
                                    className={`${
                                      field.layout === "horizontal" &&
                                      field.type !== "radio" &&
                                      field.type !== "checkbox"
                                        ? "flex items-center gap-4"
                                        : field.layout === "inline" &&
                                            field.type !== "radio" &&
                                            field.type !== "checkbox"
                                          ? "flex items-center gap-2"
                                          : "space-y-2"
                                    }`}
                                  >
                                    {formConfig.showLabels && (
                                      <div
                                        className={`${
                                          field.layout === "horizontal" &&
                                          field.type !== "radio" &&
                                          field.type !== "checkbox"
                                            ? "min-w-[120px]"
                                            : ""
                                        }`}
                                      >
                                        <Label className="text-sm font-medium text-gray-900 dark:text-gray-100">
                                          {field.label}
                                          {field.required && (
                                            <span className="text-red-500">
                                              *
                                            </span>
                                          )}
                                        </Label>
                                      </div>
                                    )}

                                    <div
                                      className={`${
                                        (field.layout === "horizontal" ||
                                          field.layout === "inline") &&
                                        field.type !== "radio" &&
                                        field.type !== "checkbox"
                                          ? "flex-1"
                                          : ""
                                      }`}
                                    >
                                      {field.hint && (
                                        <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">
                                          {field.hint}
                                        </p>
                                      )}

                                      <div className="relative">
                                        {field.prefix && (
                                          <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-sm text-gray-500 z-10">
                                            {field.prefix}
                                          </span>
                                        )}

                                        {field.type === "text" ||
                                        field.type === "email" ||
                                        field.type === "number" ||
                                        field.type === "tel" ||
                                        field.type === "url" ? (
                                          <div className="relative flex items-center">
                                            {field.icon &&
                                              field.icon.position ===
                                                "left" && (
                                                <div className="absolute left-3 z-10 text-gray-500 dark:text-gray-400">
                                                  {(() => {
                                                    const IconComponent = (
                                                      LucideIcons as any
                                                    )[field.icon.name];
                                                    return IconComponent ? (
                                                      <IconComponent
                                                        size={field.icon.size}
                                                      />
                                                    ) : null;
                                                  })()}
                                                </div>
                                              )}
                                            <Input
                                              type={field.type}
                                              placeholder={field.placeholder}
                                              disabled={field.disabled}
                                              readOnly={field.readonly}
                                              autoFocus={field.autofocus}
                                              autoComplete={field.autocomplete}
                                              className={`${field.prefix ? "pl-8" : ""} ${field.suffix ? "pr-8" : ""} ${field.icon?.position === "left" ? "pl-10" : ""} ${field.icon?.position === "right" ? "pr-10" : ""} ${field.class || ""}`}
                                              style={{
                                                width:
                                                  typeof field.width ===
                                                  "number"
                                                    ? `${field.width}%`
                                                    : field.width || "100%",
                                                paddingLeft:
                                                  field.icon?.position ===
                                                  "left"
                                                    ? `${30 + (field.icon.size || 16)}px`
                                                    : undefined,
                                                paddingRight:
                                                  field.icon?.position ===
                                                  "right"
                                                    ? `${30 + (field.icon.size || 16)}px`
                                                    : undefined,
                                                ...(field.layout ===
                                                  "inline" && {
                                                  minWidth: "120px",
                                                }),
                                              }}
                                            />
                                            {field.icon &&
                                              field.icon.position ===
                                                "right" && (
                                                <div className="absolute right-3 z-10 text-gray-500 dark:text-gray-400">
                                                  {(() => {
                                                    const IconComponent = (
                                                      LucideIcons as any
                                                    )[field.icon.name];
                                                    return IconComponent ? (
                                                      <IconComponent
                                                        size={field.icon.size}
                                                      />
                                                    ) : null;
                                                  })()}
                                                </div>
                                              )}
                                          </div>
                                        ) : field.type === "password" ? (
                                          <div className="relative flex items-center">
                                            {field.icon &&
                                              field.icon.position ===
                                                "left" && (
                                                <div className="absolute left-3 z-10 text-gray-500 dark:text-gray-400">
                                                  {(() => {
                                                    const IconComponent = (
                                                      LucideIcons as any
                                                    )[field.icon.name];
                                                    return IconComponent ? (
                                                      <IconComponent
                                                        size={field.icon.size}
                                                      />
                                                    ) : null;
                                                  })()}
                                                </div>
                                              )}
                                            <Input
                                              type="password"
                                              placeholder={field.placeholder}
                                              disabled={field.disabled}
                                              readOnly={field.readonly}
                                              autoFocus={field.autofocus}
                                              autoComplete={field.autocomplete}
                                              className={`${field.prefix ? "pl-8" : ""} ${field.suffix ? "pr-8" : ""} ${field.icon?.position === "left" ? "pl-10" : ""} ${field.showPasswordToggle ? "pr-10" : field.icon?.position === "right" ? "pr-10" : ""} ${field.class || ""}`}
                                              style={{
                                                width:
                                                  typeof field.width ===
                                                  "number"
                                                    ? `${field.width}%`
                                                    : field.width || "100%",
                                                paddingLeft:
                                                  field.icon?.position ===
                                                  "left"
                                                    ? `${30 + (field.icon.size || 16)}px`
                                                    : undefined,
                                                paddingRight:
                                                  field.showPasswordToggle 
                                                    ? "40px"
                                                    : field.icon?.position ===
                                                      "right"
                                                      ? `${30 + (field.icon.size || 16)}px`
                                                      : undefined,
                                                ...(field.layout ===
                                                  "inline" && {
                                                  minWidth: "120px",
                                                }),
                                              }}
                                            />
                                            {field.showPasswordToggle && (
                                              <button
                                                type="button"
                                                className="absolute right-3 z-10 text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300"
                                                onClick={(e) => {
                                                  e.preventDefault();
                                                  // Toggle password visibility (functional in real form)
                                                }}
                                              >
                                                <EyeOff className="w-4 h-4" />
                                              </button>
                                            )}
                                            {field.icon &&
                                              field.icon.position ===
                                                "right" && !field.showPasswordToggle && (
                                                <div className="absolute right-3 z-10 text-gray-500 dark:text-gray-400">
                                                  {(() => {
                                                    const IconComponent = (
                                                      LucideIcons as any
                                                    )[field.icon.name];
                                                    return IconComponent ? (
                                                      <IconComponent
                                                        size={field.icon.size}
                                                      />
                                                    ) : null;
                                                  })()}
                                                </div>
                                              )}
                                          </div>
                                        ) : field.type === "textarea" ? (
                                          <Textarea
                                            placeholder={field.placeholder}
                                            disabled={field.disabled}
                                            readOnly={field.readonly}
                                            className={`${field.class || ""} resize-none`}
                                            style={{
                                              width:
                                                typeof field.width === "number"
                                                  ? `${field.width}%`
                                                  : field.width || "100%",
                                            }}
                                            rows={3}
                                          />
                                        ) : field.type === "date" ? (
                                          <Input
                                            type="date"
                                            disabled={field.disabled}
                                            className={field.class || ""}
                                            style={{
                                              width: field.width || "100%",
                                            }}
                                          />
                                        ) : field.type === "file" ? (
                                          <div className="space-y-1">
                                            <Input
                                              type="file"
                                              accept={field.fileTypes?.length 
                                                ? field.fileTypes.map(type => `.${type.toLowerCase()}`).join(',')
                                                : undefined}
                                              disabled={field.disabled}
                                              className={field.class || ""}
                                              style={{
                                                width: field.width || "100%",
                                              }}
                                            />
                                            {(field.fileTypes?.length || field.maxFileSize || field.minFileSize) && (
                                              <div className="text-xs text-gray-500 dark:text-gray-400 space-y-1">
                                                {field.fileTypes?.length && (
                                                  <div>Allowed types: {field.fileTypes.join(', ')}</div>
                                                )}
                                                {(field.minFileSize || field.maxFileSize) && (
                                                  <div>
                                                    Size: {field.minFileSize ? `${field.minFileSize}MB min` : ''}{field.minFileSize && field.maxFileSize ? ', ' : ''}{field.maxFileSize ? `${field.maxFileSize}MB max` : ''}
                                                  </div>
                                                )}
                                              </div>
                                            )}
                                          </div>
                                        ) : field.type === "checkbox" ? (
                                          <div className="flex items-center space-x-2">
                                            <Checkbox
                                              disabled={field.disabled}
                                              id={`checkbox-${field.id}`}
                                            />
                                            <Label
                                              htmlFor={`checkbox-${field.id}`}
                                              className="text-sm font-normal cursor-pointer"
                                            >
                                              {field.checkboxLabel || field.placeholder ||
                                                "Check this option"}
                                            </Label>
                                          </div>
                                        ) : field.type === "radio" ? (
                                          <RadioGroup
                                            disabled={field.disabled}
                                            className={
                                              field.layout === "horizontal"
                                                ? "flex flex-wrap gap-4"
                                                : "space-y-2"
                                            }
                                          >
                                            {field.options?.map(
                                              (option: any, index: number) => (
                                                <div
                                                  key={index}
                                                  className="flex items-center space-x-2"
                                                >
                                                  <RadioGroupItem
                                                    value={option.value}
                                                    id={`radio-${field.id}-${index}`}
                                                    disabled={field.disabled}
                                                  />
                                                  <Label
                                                    htmlFor={`radio-${field.id}-${index}`}
                                                    className="text-sm font-normal cursor-pointer"
                                                  >
                                                    {option.label}
                                                  </Label>
                                                </div>
                                              ),
                                            ) || (
                                              <div className="flex items-center space-x-2">
                                                <RadioGroupItem
                                                  value="no-options"
                                                  disabled
                                                />
                                                <Label className="text-sm text-gray-400">
                                                  No options configured
                                                </Label>
                                              </div>
                                            )}
                                          </RadioGroup>
                                        ) : field.type === "select" ? (
                                          <Select disabled={field.disabled}>
                                            <SelectTrigger
                                              className={field.class || ""}
                                              style={{
                                                width: field.width || "100%",
                                                ...(field.layout ===
                                                  "inline" && {
                                                  minWidth: "120px",
                                                }),
                                              }}
                                            >
                                              <SelectValue
                                                placeholder={field.placeholder}
                                              />
                                            </SelectTrigger>
                                            <SelectContent>
                                              {field.options?.map(
                                                (
                                                  option: any,
                                                  index: number,
                                                ) => (
                                                  <SelectItem
                                                    key={index}
                                                    value={option.value}
                                                  >
                                                    {option.label}
                                                  </SelectItem>
                                                ),
                                              ) || (
                                                <SelectItem value="no-options">
                                                  No options configured
                                                </SelectItem>
                                              )}
                                            </SelectContent>
                                          </Select>
                                        ) : null}

                                        {field.suffix && (
                                          <span className="absolute right-3 top-1/2 transform -translate-y-1/2 text-sm text-gray-500 z-10">
                                            {field.suffix}
                                          </span>
                                        )}
                                      </div>
                                    </div>
                                  </div>
                                ))}
                              </div>
                            )}

                            {formFields.length === 0 && (
                              <div className="text-center py-8 text-gray-500 dark:text-gray-400">
                                No form fields to preview. Switch to edit mode
                                to add fields.
                              </div>
                            )}

                            {formFields.length > 0 && (
                              <div
                                className={`pt-6 ${
                                  formConfig.fullWidthButtons
                                    ? "flex flex-col space-y-3"
                                    : formConfig.buttonLayout === "left"
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
                                        borderColor:
                                          formConfig.cancelButtonColor,
                                        color: formConfig.cancelButtonColor,
                                      }}
                                      className={`px-6 ${formConfig.fullWidthButtons ? "w-full" : ""}`}
                                    >
                                      {formConfig.cancelButtonText}
                                    </Button>
                                  )}

                                <div
                                  className={`${
                                    formConfig.fullWidthButtons
                                      ? "w-full"
                                      : formConfig.buttonLayout === "split"
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
                                        className={`px-6 ${formConfig.fullWidthButtons ? "w-full" : ""}`}
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
                                    className={`px-6 ${formConfig.fullWidthButtons ? "w-full" : ""}`}
                                  >
                                    {formConfig.submitButtonText}
                                  </Button>
                                </div>
                              </div>
                            )}
                          </form>
                        </div>
                      </div>
                    ) : /* Edit Mode */
                    formFields.length === 0 ? (
                      <div className="flex items-center justify-center h-full text-center py-16">
                        <div>
                          <Grip className="w-12 h-12 text-gray-300 dark:text-gray-600 mx-auto mb-4" />
                          <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-2">
                            Start building your form
                          </h3>
                          <p className="text-gray-500 dark:text-gray-400 text-sm">
                            Click on field icons from the left sidebar to add
                            them to your form
                          </p>
                        </div>
                      </div>
                    ) : (
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
                              {organizeFieldsIntoRows(formFields).map(
                                (rowFields, rowIndex) => {
                                  const rowId = rowFields[0]?.rowId;
                                  const rows =
                                    organizeFieldsIntoRows(formFields);
                                  const canMoveUp = rowIndex > 0;
                                  const canMoveDown =
                                    rowIndex < rows.length - 1;

                                  return (
                                    <div
                                      key={
                                        rowFields[0]?.rowId || `row-${rowIndex}`
                                      }
                                      className="group relative flex gap-2 min-h-[60px] p-2 border border-dashed border-gray-200 dark:border-gray-700 rounded-lg hover:border-blue-300 dark:hover:border-blue-600 transition-colors"
                                      style={{ gap: getSpacingValue() }}
                                    >
                                      {/* Row Controls */}
                                      {rowId && (
                                        <div className="absolute -left-8 top-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col gap-1">
                                          <button
                                            onClick={() => {
                                              if (canMoveUp) {
                                                setFormFields((fields) => {
                                                  const rows =
                                                    organizeFieldsIntoRows(
                                                      fields,
                                                    );
                                                  const currentRowFields =
                                                    rows[rowIndex];
                                                  const targetRowFields =
                                                    rows[rowIndex - 1];

                                                  // Swap the order values of the two rows
                                                  const targetMinOrder =
                                                    Math.min(
                                                      ...targetRowFields.map(
                                                        (f) => f.order,
                                                      ),
                                                    );
                                                  const currentMinOrder =
                                                    Math.min(
                                                      ...currentRowFields.map(
                                                        (f) => f.order,
                                                      ),
                                                    );

                                                  return fields.map((field) => {
                                                    if (
                                                      targetRowFields.some(
                                                        (f) =>
                                                          f.id === field.id,
                                                      )
                                                    ) {
                                                      return {
                                                        ...field,
                                                        order:
                                                          currentMinOrder +
                                                          (field.order -
                                                            targetMinOrder),
                                                      };
                                                    }
                                                    if (
                                                      currentRowFields.some(
                                                        (f) =>
                                                          f.id === field.id,
                                                      )
                                                    ) {
                                                      return {
                                                        ...field,
                                                        order:
                                                          targetMinOrder +
                                                          (field.order -
                                                            currentMinOrder),
                                                      };
                                                    }
                                                    return field;
                                                  });
                                                });
                                              }
                                            }}
                                            disabled={!canMoveUp}
                                            className={`p-1 rounded text-xs ${
                                              canMoveUp
                                                ? "hover:bg-gray-200 dark:hover:bg-gray-700 text-gray-600 dark:text-gray-400"
                                                : "text-gray-300 dark:text-gray-600 cursor-not-allowed"
                                            }`}
                                            title="Move row up"
                                          >
                                            ↑
                                          </button>
                                          <button
                                            onClick={() => {
                                              if (canMoveDown) {
                                                setFormFields((fields) => {
                                                  const rows =
                                                    organizeFieldsIntoRows(
                                                      fields,
                                                    );
                                                  const currentRowFields =
                                                    rows[rowIndex];
                                                  const targetRowFields =
                                                    rows[rowIndex + 1];

                                                  // Swap the order values of the two rows
                                                  const currentMinOrder =
                                                    Math.min(
                                                      ...currentRowFields.map(
                                                        (f) => f.order,
                                                      ),
                                                    );
                                                  const targetMinOrder =
                                                    Math.min(
                                                      ...targetRowFields.map(
                                                        (f) => f.order,
                                                      ),
                                                    );

                                                  return fields.map((field) => {
                                                    if (
                                                      currentRowFields.some(
                                                        (f) =>
                                                          f.id === field.id,
                                                      )
                                                    ) {
                                                      return {
                                                        ...field,
                                                        order:
                                                          targetMinOrder +
                                                          (field.order -
                                                            currentMinOrder),
                                                      };
                                                    }
                                                    if (
                                                      targetRowFields.some(
                                                        (f) =>
                                                          f.id === field.id,
                                                      )
                                                    ) {
                                                      return {
                                                        ...field,
                                                        order:
                                                          currentMinOrder +
                                                          (field.order -
                                                            targetMinOrder),
                                                      };
                                                    }
                                                    return field;
                                                  });
                                                });
                                              }
                                            }}
                                            disabled={!canMoveDown}
                                            className={`p-1 rounded text-xs ${
                                              canMoveDown
                                                ? "hover:bg-gray-200 dark:hover:bg-gray-700 text-gray-600 dark:text-gray-400"
                                                : "text-gray-300 dark:text-gray-600 cursor-not-allowed"
                                            }`}
                                            title="Move row down"
                                          >
                                            ↓
                                          </button>
                                        </div>
                                      )}
                                      {rowFields.map((field) => (
                                        <div
                                          key={field.id}
                                          className="relative group"
                                          style={{
                                            width: `${field.width || 100 / rowFields.length}%`,
                                          }}
                                        >
                                          {/* Resize Handle */}
                                          {(rowFields.length > 1 &&
                                            rowFields.indexOf(field) <
                                              rowFields.length - 1) ||
                                          rowFields.length === 1 ? (
                                            <div
                                              className="absolute right-0 top-0 bottom-0 w-1 bg-transparent hover:bg-blue-400 cursor-col-resize z-10"
                                              onMouseDown={(e) =>
                                                handleResizeStart(
                                                  e,
                                                  field.id,
                                                  rowFields,
                                                )
                                              }
                                            />
                                          ) : null}

                                          <SortableField
                                            field={field}
                                            isSelected={
                                              selectedFieldId === field.id
                                            }
                                            onSelect={() =>
                                              handleFieldSelect(field.id)
                                            }
                                            onUpdate={(updates) => {
                                              setFormFields((fields) =>
                                                fields.map((f) =>
                                                  f.id === field.id
                                                    ? { ...f, ...updates }
                                                    : f,
                                                ),
                                              );
                                            }}
                                            onDelete={() => {
                                              setFormFields((fields) => {
                                                const updatedFields =
                                                  fields.filter(
                                                    (f) => f.id !== field.id,
                                                  );

                                                // If this was the only field in a row, remove the row
                                                const remainingFieldsInRow =
                                                  updatedFields.filter(
                                                    (f) =>
                                                      f.rowId === field.rowId,
                                                  );
                                                if (
                                                  field.rowId &&
                                                  remainingFieldsInRow.length ===
                                                    0
                                                ) {
                                                  // Row is empty, nothing more to do
                                                  return updatedFields;
                                                }

                                                // If there are remaining fields in the row, redistribute widths
                                                if (
                                                  field.rowId &&
                                                  remainingFieldsInRow.length >
                                                    0
                                                ) {
                                                  const evenWidth =
                                                    100 /
                                                    remainingFieldsInRow.length;
                                                  return updatedFields.map(
                                                    (f) => {
                                                      if (
                                                        f.rowId === field.rowId
                                                      ) {
                                                        return {
                                                          ...f,
                                                          width: evenWidth,
                                                        };
                                                      }
                                                      return f;
                                                    },
                                                  );
                                                }

                                                return updatedFields;
                                              });

                                              // Clear selection if deleted field was selected
                                              if (
                                                selectedFieldId === field.id
                                              ) {
                                                setSelectedFieldId(null);
                                                setShowPropertiesPanel(false);
                                              }
                                            }}
                                            isPreviewMode={false}
                                          />
                                        </div>
                                      ))}

                                      {/* Drop Zone for adding fields to this row */}
                                      {rowFields[0]?.rowId && (
                                        <RowDropZone
                                          rowId={rowFields[0].rowId}
                                          onAddField={handleAddField}
                                        />
                                      )}
                                    </div>
                                  );
                                },
                              )}

                              {/* Empty row for new fields */}
                              <NewRowDropZone onAddField={handleAddField} />
                            </div>
                          ) : (
                            // Traditional Layout Modes
                            <div
                              className={`${
                                formConfig.layout === "grid"
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
                                  onDelete={() => {
                                    setFormFields((fields) =>
                                      fields.filter((f) => f.id !== field.id),
                                    );

                                    // Clear selection if deleted field was selected
                                    if (selectedFieldId === field.id) {
                                      setSelectedFieldId(null);
                                      setShowPropertiesPanel(false);
                                    }
                                  }}
                                  isPreviewMode={false}
                                />
                              ))}
                            </div>
                          )}

                          {/* Submit Button Preview in Edit Mode */}
                          {formFields.length > 0 && (
                            <div
                              className={`pt-6 ${
                                formConfig.fullWidthButtons
                                  ? "flex flex-col space-y-3"
                                  : formConfig.buttonLayout === "left"
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
                                    className={`px-6 pointer-events-none ${formConfig.fullWidthButtons ? "w-full" : ""}`}
                                  >
                                    {formConfig.cancelButtonText}
                                  </Button>
                                )}

                              <div
                                className={`${
                                  formConfig.fullWidthButtons
                                    ? "w-full"
                                    : formConfig.buttonLayout === "split"
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
                                      className={`px-6 pointer-events-none ${formConfig.fullWidthButtons ? "w-full" : ""}`}
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
                                  className={`px-6 pointer-events-none ${formConfig.fullWidthButtons ? "w-full" : ""}`}
                                >
                                  {formConfig.submitButtonText}
                                </Button>
                              </div>
                            </div>
                          )}
                        </SortableContext>
                      </DndContext>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* Properties Panel - Collapsed by default, shows when field is selected */}
            {showPropertiesPanel && selectedFieldId && (
              <div className="w-64 border-l border-gray-200 dark:border-gray-800 bg-gray-50 dark:bg-gray-900 p-4">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="font-semibold text-gray-900 dark:text-gray-100">
                    Field Properties
                  </h3>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setShowPropertiesPanel(false)}
                  >
                    ×
                  </Button>
                </div>

                <div className="space-y-6 max-h-[calc(100vh-200px)] overflow-y-auto">
                  {(() => {
                    const selectedField = formFields.find(
                      (f) => f.id === selectedFieldId,
                    );
                    if (!selectedField) return null;

                    const fieldType = selectedField.type;
                    const isTextInput = [
                      "text",
                      "textarea",
                      "email",
                      "number",
                      "tel",
                      "url",
                      "password",
                    ].includes(fieldType);
                    const isSelectInput = ["select", "radio"].includes(
                      fieldType,
                    );
                    const isFileInput = fieldType === "file";
                    const isDateInput = fieldType === "date";
                    const isCheckboxInput = fieldType === "checkbox";

                    return (
                      <>
                        {/* Basic Properties */}
                        <div className="space-y-4">
                          <div>
                            <Label className="text-xs font-medium">
                              Field Name
                            </Label>
                            <Input
                              value={selectedField.name || ""}
                              onChange={(e) => {
                                setFormFields((fields) =>
                                  fields.map((f) =>
                                    f.id === selectedFieldId
                                      ? { ...f, name: e.target.value }
                                      : f,
                                  ),
                                );
                              }}
                              className="mt-1 h-8 text-xs"
                            />
                          </div>

                          <div>
                            <Label className="text-xs font-medium">Label</Label>
                            <Input
                              value={selectedField.label || ""}
                              onChange={(e) => {
                                setFormFields((fields) =>
                                  fields.map((f) =>
                                    f.id === selectedFieldId
                                      ? { ...f, label: e.target.value }
                                      : f,
                                  ),
                                );
                              }}
                              className="mt-1 h-8 text-xs"
                            />
                          </div>

                          {/* Placeholder - Show for most inputs except radio */}
                          {fieldType !== "radio" && (
                            <div>
                              <Label className="text-xs font-medium">
                                {isCheckboxInput
                                  ? "Checkbox Text"
                                  : "Placeholder"}
                              </Label>
                              <Input
                                value={selectedField.placeholder || ""}
                                onChange={(e) => {
                                  setFormFields((fields) =>
                                    fields.map((f) =>
                                      f.id === selectedFieldId
                                        ? { ...f, placeholder: e.target.value }
                                        : f,
                                    ),
                                  );
                                }}
                                className="mt-1 h-8 text-xs"
                                placeholder={
                                  isCheckboxInput
                                    ? "Text next to checkbox"
                                    : "Placeholder text"
                                }
                              />
                            </div>
                          )}

                          <div>
                            <Label className="text-xs font-medium">Hint</Label>
                            <Input
                              value={selectedField.hint || ""}
                              onChange={(e) => {
                                setFormFields((fields) =>
                                  fields.map((f) =>
                                    f.id === selectedFieldId
                                      ? { ...f, hint: e.target.value }
                                      : f,
                                  ),
                                );
                              }}
                              className="mt-1 h-8 text-xs"
                              placeholder="Helper text for this field"
                            />
                          </div>

                          {/* CSS Class */}
                          <div>
                            <Label className="text-xs font-medium">
                              CSS Class
                            </Label>
                            <Input
                              value={selectedField.class || ""}
                              onChange={(e) => {
                                setFormFields((fields) =>
                                  fields.map((f) =>
                                    f.id === selectedFieldId
                                      ? { ...f, class: e.target.value }
                                      : f,
                                  ),
                                );
                              }}
                              className="mt-1 h-8 text-xs"
                              placeholder="Custom CSS classes"
                            />
                          </div>

                          {/* Icon Selector - Full Width */}
                          <IconSelector
                            selectedIcon={selectedField.icon}
                            onIconChange={(icon) => {
                              setFormFields((fields) =>
                                fields.map((f) =>
                                  f.id === selectedFieldId ? { ...f, icon } : f,
                                ),
                              );
                            }}
                          />
                        </div>

                        {/* Field States */}
                        <div className="space-y-3">
                          <h4 className="text-sm font-semibold text-gray-900 dark:text-gray-100 border-b pb-2">
                            Field States
                          </h4>

                          <div className="grid grid-cols-2 gap-2">
                            {/* Required - Show for all except file inputs (typically) */}
                            <div className="flex items-center space-x-2">
                              <Checkbox
                                id="required"
                                checked={selectedField.required || false}
                                onCheckedChange={(checked) => {
                                  setFormFields((fields) =>
                                    fields.map((f) =>
                                      f.id === selectedFieldId
                                        ? { ...f, required: !!checked }
                                        : f,
                                    ),
                                  );
                                }}
                              />
                              <Label
                                htmlFor="required"
                                className="text-xs cursor-pointer"
                              >
                                Required
                              </Label>
                            </div>

                            {/* Disabled - Show for all */}
                            <div className="flex items-center space-x-2">
                              <Checkbox
                                id="disabled"
                                checked={selectedField.disabled || false}
                                onCheckedChange={(checked) => {
                                  setFormFields((fields) =>
                                    fields.map((f) =>
                                      f.id === selectedFieldId
                                        ? { ...f, disabled: !!checked }
                                        : f,
                                    ),
                                  );
                                }}
                              />
                              <Label
                                htmlFor="disabled"
                                className="text-xs cursor-pointer"
                              >
                                Disabled
                              </Label>
                            </div>

                            {/* Read Only - Only for text inputs */}
                            {isTextInput && (
                              <div className="flex items-center space-x-2">
                                <Checkbox
                                  id="readonly"
                                  checked={selectedField.readonly || false}
                                  onCheckedChange={(checked) => {
                                    setFormFields((fields) =>
                                      fields.map((f) =>
                                        f.id === selectedFieldId
                                          ? { ...f, readonly: !!checked }
                                          : f,
                                      ),
                                    );
                                  }}
                                />
                                <Label
                                  htmlFor="readonly"
                                  className="text-xs cursor-pointer"
                                >
                                  Read Only
                                </Label>
                              </div>
                            )}

                            {/* Auto Focus - Show for text inputs and selects */}
                            {(isTextInput || fieldType === "select") && (
                              <div className="flex items-center space-x-2">
                                <Checkbox
                                  id="autofocus"
                                  checked={selectedField.autofocus || false}
                                  onCheckedChange={(checked) => {
                                    setFormFields((fields) =>
                                      fields.map((f) =>
                                        f.id === selectedFieldId
                                          ? { ...f, autofocus: !!checked }
                                          : f,
                                      ),
                                    );
                                  }}
                                />
                                <Label
                                  htmlFor="autofocus"
                                  className="text-xs cursor-pointer"
                                >
                                  Auto Focus
                                </Label>
                              </div>
                            )}

                            {/* Show Password Toggle - Only for password inputs */}
                            {fieldType === "password" && (
                              <div className="flex items-center space-x-2">
                                <Checkbox
                                  id="showPasswordToggle"
                                  checked={selectedField.showPasswordToggle || false}
                                  onCheckedChange={(checked) => {
                                    setFormFields((fields) =>
                                      fields.map((f) =>
                                        f.id === selectedFieldId
                                          ? { ...f, showPasswordToggle: !!checked }
                                          : f,
                                      ),
                                    );
                                  }}
                                />
                                <Label
                                  htmlFor="showPasswordToggle"
                                  className="text-xs cursor-pointer"
                                >
                                  Show/Hide Toggle
                                </Label>
                              </div>
                            )}

                            {/* Multiple - Only for select and file inputs */}
                            {(fieldType === "select" || isFileInput) && (
                              <div className="flex items-center space-x-2">
                                <Checkbox
                                  id="multiple"
                                  checked={selectedField.multiple || false}
                                  onCheckedChange={(checked) => {
                                    setFormFields((fields) =>
                                      fields.map((f) =>
                                        f.id === selectedFieldId
                                          ? { ...f, multiple: !!checked }
                                          : f,
                                      ),
                                    );
                                  }}
                                />
                                <Label
                                  htmlFor="multiple"
                                  className="text-xs cursor-pointer"
                                >
                                  Multiple
                                </Label>
                              </div>
                            )}
                          </div>
                        </div>

                        {/* Validation Rules - Only show relevant validations per field type */}
                        <div className="space-y-3">
                          <h4 className="text-sm font-semibold text-gray-900 dark:text-gray-100 border-b pb-2">
                            Validation
                          </h4>

                          {/* Text length validation - Only for text inputs */}
                          {isTextInput && (
                            <div className="grid grid-cols-2 gap-3">
                              <div>
                                <Label className="text-xs font-medium">
                                  Min Length
                                </Label>
                                <Input
                                  type="number"
                                  value={
                                    selectedField.validation?.minLength || ""
                                  }
                                  onChange={(e) => {
                                    const value = e.target.value
                                      ? parseInt(e.target.value)
                                      : null;
                                    setFormFields((fields) =>
                                      fields.map((f) =>
                                        f.id === selectedFieldId
                                          ? {
                                              ...f,
                                              validation: {
                                                ...f.validation,
                                                minLength: value,
                                              },
                                            }
                                          : f,
                                      ),
                                    );
                                  }}
                                  className="mt-1 h-8 text-xs"
                                />
                              </div>
                              <div>
                                <Label className="text-xs font-medium">
                                  Max Length
                                </Label>
                                <Input
                                  type="number"
                                  value={
                                    selectedField.validation?.maxLength || ""
                                  }
                                  onChange={(e) => {
                                    const value = e.target.value
                                      ? parseInt(e.target.value)
                                      : null;
                                    setFormFields((fields) =>
                                      fields.map((f) =>
                                        f.id === selectedFieldId
                                          ? {
                                              ...f,
                                              validation: {
                                                ...f.validation,
                                                maxLength: value,
                                              },
                                            }
                                          : f,
                                      ),
                                    );
                                  }}
                                  className="mt-1 h-8 text-xs"
                                />
                              </div>
                            </div>
                          )}

                          {/* Numeric validation - Only for number inputs */}
                          {fieldType === "number" && (
                            <div className="grid grid-cols-2 gap-3">
                              <div>
                                <Label className="text-xs font-medium">
                                  Min Value
                                </Label>
                                <Input
                                  type="number"
                                  value={selectedField.validation?.min || ""}
                                  onChange={(e) => {
                                    const value = e.target.value
                                      ? parseFloat(e.target.value)
                                      : null;
                                    setFormFields((fields) =>
                                      fields.map((f) =>
                                        f.id === selectedFieldId
                                          ? {
                                              ...f,
                                              validation: {
                                                ...f.validation,
                                                min: value,
                                              },
                                            }
                                          : f,
                                      ),
                                    );
                                  }}
                                  className="mt-1 h-8 text-xs"
                                />
                              </div>
                              <div>
                                <Label className="text-xs font-medium">
                                  Max Value
                                </Label>
                                <Input
                                  type="number"
                                  value={selectedField.validation?.max || ""}
                                  onChange={(e) => {
                                    const value = e.target.value
                                      ? parseFloat(e.target.value)
                                      : null;
                                    setFormFields((fields) =>
                                      fields.map((f) =>
                                        f.id === selectedFieldId
                                          ? {
                                              ...f,
                                              validation: {
                                                ...f.validation,
                                                max: value,
                                              },
                                            }
                                          : f,
                                      ),
                                    );
                                  }}
                                  className="mt-1 h-8 text-xs"
                                />
                              </div>
                            </div>
                          )}

                          {/* Pattern validation - For text inputs */}
                          {isTextInput && (
                            <div>
                              <Label className="text-xs font-medium">
                                Pattern (Regex)
                              </Label>
                              <Input
                                value={selectedField.validation?.pattern || ""}
                                onChange={(e) => {
                                  setFormFields((fields) =>
                                    fields.map((f) =>
                                      f.id === selectedFieldId
                                        ? {
                                            ...f,
                                            validation: {
                                              ...f.validation,
                                              pattern: e.target.value,
                                            },
                                          }
                                        : f,
                                    ),
                                  );
                                }}
                                className="mt-1 h-8 text-xs"
                                placeholder="^[a-zA-Z]+$"
                              />
                            </div>
                          )}
                        </div>

                        {/* Checkbox Properties */}
                        {selectedField.type === "checkbox" && (
                          <div className="space-y-3">
                            <h4 className="text-sm font-semibold text-gray-900 dark:text-gray-100 border-b pb-2">
                              Checkbox Settings
                            </h4>

                            <div>
                              <Label className="text-xs font-medium">
                                Checkbox Label
                              </Label>
                              <Input
                                value={selectedField.checkboxLabel || ""}
                                onChange={(e) => {
                                  setFormFields((fields) =>
                                    fields.map((f) =>
                                      f.id === selectedFieldId
                                        ? {
                                            ...f,
                                            checkboxLabel: e.target.value,
                                          }
                                        : f,
                                    ),
                                  );
                                }}
                                className="mt-1 h-8 text-xs"
                                placeholder="Check this option"
                              />
                            </div>

                            <div className="flex items-center space-x-2">
                              <Checkbox
                                id="showTopLabel"
                                checked={selectedField.showTopLabel !== false}
                                onCheckedChange={(checked) => {
                                  setFormFields((fields) =>
                                    fields.map((f) =>
                                      f.id === selectedFieldId
                                        ? {
                                            ...f,
                                            showTopLabel: checked,
                                          }
                                        : f,
                                    ),
                                  );
                                }}
                              />
                              <Label
                                htmlFor="showTopLabel"
                                className="text-xs cursor-pointer"
                              >
                                Show top label
                              </Label>
                            </div>
                          </div>
                        )}

                        {/* File Upload Properties */}
                        {selectedField.type === "file" && (
                          <div className="space-y-3">
                            <h4 className="text-sm font-semibold text-gray-900 dark:text-gray-100 border-b pb-2">
                              File Upload Settings
                            </h4>

                            <div>
                              <Label className="text-xs font-medium">
                                Allowed File Types
                              </Label>
                              <div className="mt-1 space-y-2">
                                <Input
                                  value={(selectedField.fileTypes || []).join(', ')}
                                  onChange={(e) => {
                                    const types = e.target.value
                                      .split(',')
                                      .map(type => type.trim())
                                      .filter(type => type.length > 0);
                                    setFormFields((fields) =>
                                      fields.map((f) =>
                                        f.id === selectedFieldId
                                          ? {
                                              ...f,
                                              fileTypes: types.length > 0 ? types : undefined,
                                            }
                                          : f,
                                      ),
                                    );
                                  }}
                                  className="h-8 text-xs"
                                  placeholder="pdf, jpg, png, doc"
                                />
                                <p className="text-xs text-gray-500 dark:text-gray-400">
                                  Separate file extensions with commas (e.g., pdf, jpg, png)
                                </p>
                              </div>
                            </div>

                            <div className="grid grid-cols-2 gap-3">
                              <div>
                                <Label className="text-xs font-medium">
                                  Min Size (MB)
                                </Label>
                                <Input
                                  type="number"
                                  step="0.1"
                                  min="0"
                                  value={selectedField.minFileSize || ""}
                                  onChange={(e) => {
                                    const value = e.target.value
                                      ? parseFloat(e.target.value)
                                      : undefined;
                                    setFormFields((fields) =>
                                      fields.map((f) =>
                                        f.id === selectedFieldId
                                          ? {
                                              ...f,
                                              minFileSize: value,
                                            }
                                          : f,
                                      ),
                                    );
                                  }}
                                  className="mt-1 h-8 text-xs"
                                  placeholder="0.1"
                                />
                              </div>
                              <div>
                                <Label className="text-xs font-medium">
                                  Max Size (MB)
                                </Label>
                                <Input
                                  type="number"
                                  step="0.1"
                                  min="0"
                                  value={selectedField.maxFileSize || ""}
                                  onChange={(e) => {
                                    const value = e.target.value
                                      ? parseFloat(e.target.value)
                                      : undefined;
                                    setFormFields((fields) =>
                                      fields.map((f) =>
                                        f.id === selectedFieldId
                                          ? {
                                              ...f,
                                              maxFileSize: value,
                                            }
                                          : f,
                                      ),
                                    );
                                  }}
                                  className="mt-1 h-8 text-xs"
                                  placeholder="10"
                                />
                              </div>
                            </div>
                          </div>
                        )}

                        {/* Options Management - Only for select and radio */}
                        {isSelectInput && (
                          <div className="space-y-3">
                            <h4 className="text-sm font-semibold text-gray-900 dark:text-gray-100 border-b pb-2">
                              Options
                            </h4>

                            <div className="flex items-center space-x-2">
                              <Checkbox
                                id="useLazyData"
                                checked={!!selectedField.lazySelectData}
                                onCheckedChange={(checked) => {
                                  setFormFields((fields) =>
                                    fields.map((f) =>
                                      f.id === selectedFieldId
                                        ? {
                                            ...f,
                                            lazySelectData:
                                              checked || undefined,
                                            // Clear manual options when enabling lazy data
                                            options: checked
                                              ? []
                                              : f.options || [],
                                          }
                                        : f,
                                    ),
                                  );
                                }}
                              />
                              <Label
                                htmlFor="useLazyData"
                                className="text-xs cursor-pointer"
                              >
                                Load options from API
                              </Label>
                            </div>

                            {!selectedField.lazySelectData && (
                              <div className="space-y-2">
                                <Label className="text-xs font-medium">
                                  Static Options
                                </Label>
                                {(selectedField.options || []).map(
                                  (option: any, index: number) => (
                                    <div key={index} className="flex gap-2">
                                      <Input
                                        value={option.label}
                                        onChange={(e) => {
                                          setFormFields((fields) =>
                                            fields.map((f) =>
                                              f.id === selectedFieldId
                                                ? {
                                                    ...f,
                                                    options:
                                                      f.options?.map(
                                                        (
                                                          opt: any,
                                                          i: number,
                                                        ) =>
                                                          i === index
                                                            ? {
                                                                ...opt,
                                                                label:
                                                                  e.target
                                                                    .value,
                                                              }
                                                            : opt,
                                                      ) || [],
                                                  }
                                                : f,
                                            ),
                                          );
                                        }}
                                        className="h-8 text-xs flex-1"
                                        placeholder="Label"
                                      />
                                      <Input
                                        value={option.value}
                                        onChange={(e) => {
                                          setFormFields((fields) =>
                                            fields.map((f) =>
                                              f.id === selectedFieldId
                                                ? {
                                                    ...f,
                                                    options:
                                                      f.options?.map(
                                                        (
                                                          opt: any,
                                                          i: number,
                                                        ) =>
                                                          i === index
                                                            ? {
                                                                ...opt,
                                                                value:
                                                                  e.target
                                                                    .value,
                                                              }
                                                            : opt,
                                                      ) || [],
                                                  }
                                                : f,
                                            ),
                                          );
                                        }}
                                        className="h-8 text-xs flex-1"
                                        placeholder="Value"
                                      />
                                      <Button
                                        variant="outline"
                                        size="sm"
                                        onClick={() => {
                                          setFormFields((fields) =>
                                            fields.map((f) =>
                                              f.id === selectedFieldId
                                                ? {
                                                    ...f,
                                                    options:
                                                      f.options?.filter(
                                                        (_: any, i: number) =>
                                                          i !== index,
                                                      ) || [],
                                                  }
                                                : f,
                                            ),
                                          );
                                        }}
                                        className="h-8 w-8 p-0"
                                      >
                                        ×
                                      </Button>
                                    </div>
                                  ),
                                )}
                                <Button
                                  variant="outline"
                                  size="sm"
                                  onClick={() => {
                                    setFormFields((fields) =>
                                      fields.map((f) =>
                                        f.id === selectedFieldId
                                          ? {
                                              ...f,
                                              options: [
                                                ...(f.options || []),
                                                { label: "", value: "" },
                                              ],
                                            }
                                          : f,
                                      ),
                                    );
                                  }}
                                  className="h-8 text-xs w-full"
                                >
                                  + Add Option
                                </Button>
                              </div>
                            )}
                          </div>
                        )}
                      </>
                    );
                  })()}

                  {/* Error Messages */}
                  <div className="space-y-3">
                    <h4 className="text-sm font-semibold text-gray-900 dark:text-gray-100 border-b pb-2">
                      Error Messages
                    </h4>

                    <div className="space-y-2">
                      <div>
                        <Label className="text-xs font-medium">
                          Required Message
                        </Label>
                        <Input
                          value={
                            formFields.find((f) => f.id === selectedFieldId)
                              ?.validation?.errorMessages?.required || ""
                          }
                          onChange={(e) => {
                            setFormFields((fields) =>
                              fields.map((f) =>
                                f.id === selectedFieldId
                                  ? {
                                      ...f,
                                      validation: {
                                        ...f.validation,
                                        errorMessages: {
                                          ...f.validation?.errorMessages,
                                          required: e.target.value,
                                        },
                                      },
                                    }
                                  : f,
                              ),
                            );
                          }}
                          className="mt-1 h-8 text-xs"
                          placeholder="This field is required"
                        />
                      </div>

                      <div>
                        <Label className="text-xs font-medium">
                          Pattern Message
                        </Label>
                        <Input
                          value={
                            formFields.find((f) => f.id === selectedFieldId)
                              ?.validation?.errorMessages?.pattern || ""
                          }
                          onChange={(e) => {
                            setFormFields((fields) =>
                              fields.map((f) =>
                                f.id === selectedFieldId
                                  ? {
                                      ...f,
                                      validation: {
                                        ...f.validation,
                                        errorMessages: {
                                          ...f.validation?.errorMessages,
                                          pattern: e.target.value,
                                        },
                                      },
                                    }
                                  : f,
                              ),
                            );
                          }}
                          className="mt-1 h-8 text-xs"
                          placeholder="Invalid format"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Layout & Styling */}
                  <div className="space-y-3">
                    <h4 className="text-sm font-semibold text-gray-900 dark:text-gray-100 border-b pb-2">
                      Layout & Styling
                    </h4>

                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <Label className="text-xs font-medium">Layout</Label>
                        <Select
                          value={
                            formFields.find((f) => f.id === selectedFieldId)
                              ?.layout || "vertical"
                          }
                          onValueChange={(value) => {
                            setFormFields((fields) =>
                              fields.map((f) =>
                                f.id === selectedFieldId
                                  ? { ...f, layout: value }
                                  : f,
                              ),
                            );
                          }}
                        >
                          <SelectTrigger className="mt-1 h-8 text-xs">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="vertical">Vertical</SelectItem>
                            <SelectItem value="horizontal">
                              Horizontal
                            </SelectItem>
                            <SelectItem value="inline">Inline</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>

                      <div>
                        <Label className="text-xs font-medium">Width</Label>
                        <Input
                          value={
                            formFields.find((f) => f.id === selectedFieldId)
                              ?.width || "100%"
                          }
                          onChange={(e) => {
                            setFormFields((fields) =>
                              fields.map((f) =>
                                f.id === selectedFieldId
                                  ? { ...f, width: e.target.value }
                                  : f,
                              ),
                            );
                          }}
                          className="mt-1 h-8 text-xs"
                          placeholder="100%, 50px, auto"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <Label className="text-xs font-medium">
                          Autocomplete
                        </Label>
                        <Input
                          value={
                            formFields.find((f) => f.id === selectedFieldId)
                              ?.autocomplete || ""
                          }
                          onChange={(e) => {
                            setFormFields((fields) =>
                              fields.map((f) =>
                                f.id === selectedFieldId
                                  ? { ...f, autocomplete: e.target.value }
                                  : f,
                              ),
                            );
                          }}
                          className="mt-1 h-8 text-xs"
                          placeholder="email, name, etc."
                        />
                      </div>

                      <div>
                        <Label className="text-xs font-medium">
                          Debounce (ms)
                        </Label>
                        <Input
                          type="number"
                          value={
                            formFields.find((f) => f.id === selectedFieldId)
                              ?.debounce || 0
                          }
                          onChange={(e) => {
                            setFormFields((fields) =>
                              fields.map((f) =>
                                f.id === selectedFieldId
                                  ? {
                                      ...f,
                                      debounce: parseInt(e.target.value) || 0,
                                    }
                                  : f,
                              ),
                            );
                          }}
                          className="mt-1 h-8 text-xs"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Options Management (for select, radio, checkbox) */}
                  {(formFields.find((f) => f.id === selectedFieldId)?.type ===
                    "select" ||
                    formFields.find((f) => f.id === selectedFieldId)?.type ===
                      "radio") && (
                    <div className="space-y-3">
                      <h4 className="text-sm font-semibold text-gray-900 dark:text-gray-100 border-b pb-2">
                        Options
                      </h4>

                      <div>
                        <Label className="text-xs font-medium">
                          Option Source
                        </Label>
                        <Input
                          value={
                            formFields.find((f) => f.id === selectedFieldId)
                              ?.optionSource || ""
                          }
                          onChange={(e) => {
                            setFormFields((fields) =>
                              fields.map((f) =>
                                f.id === selectedFieldId
                                  ? { ...f, optionSource: e.target.value }
                                  : f,
                              ),
                            );
                          }}
                          className="mt-1 h-8 text-xs"
                          placeholder="API endpoint or function name"
                        />
                      </div>

                      <div className="space-y-2">
                        <Label className="text-xs font-medium">
                          Static Options
                        </Label>
                        {(
                          formFields.find((f) => f.id === selectedFieldId)
                            ?.options || []
                        ).map((option: any, index: number) => (
                          <div key={index} className="flex gap-2">
                            <Input
                              value={option.label}
                              onChange={(e) => {
                                setFormFields((fields) =>
                                  fields.map((f) =>
                                    f.id === selectedFieldId
                                      ? {
                                          ...f,
                                          options:
                                            f.options?.map(
                                              (opt: any, i: number) =>
                                                i === index
                                                  ? {
                                                      ...opt,
                                                      label: e.target.value,
                                                    }
                                                  : opt,
                                            ) || [],
                                        }
                                      : f,
                                  ),
                                );
                              }}
                              className="h-8 text-xs flex-1"
                              placeholder="Label"
                            />
                            <Input
                              value={option.value}
                              onChange={(e) => {
                                setFormFields((fields) =>
                                  fields.map((f) =>
                                    f.id === selectedFieldId
                                      ? {
                                          ...f,
                                          options:
                                            f.options?.map(
                                              (opt: any, i: number) =>
                                                i === index
                                                  ? {
                                                      ...opt,
                                                      value: e.target.value,
                                                    }
                                                  : opt,
                                            ) || [],
                                        }
                                      : f,
                                  ),
                                );
                              }}
                              className="h-8 text-xs flex-1"
                              placeholder="Value"
                            />
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => {
                                setFormFields((fields) =>
                                  fields.map((f) =>
                                    f.id === selectedFieldId
                                      ? {
                                          ...f,
                                          options:
                                            f.options?.filter(
                                              (_: any, i: number) =>
                                                i !== index,
                                            ) || [],
                                        }
                                      : f,
                                  ),
                                );
                              }}
                              className="h-8 w-8 p-0"
                            >
                              ×
                            </Button>
                          </div>
                        ))}
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => {
                            setFormFields((fields) =>
                              fields.map((f) =>
                                f.id === selectedFieldId
                                  ? {
                                      ...f,
                                      options: [
                                        ...(f.options || []),
                                        { label: "", value: "" },
                                      ],
                                    }
                                  : f,
                              ),
                            );
                          }}
                          className="h-8 text-xs w-full"
                        >
                          + Add Option
                        </Button>
                      </div>
                    </div>
                  )}

                  {/* Date Configuration */}
                  {formFields.find((f) => f.id === selectedFieldId)?.type ===
                    "date" && (
                    <div className="space-y-3">
                      <h4 className="text-sm font-semibold text-gray-900 dark:text-gray-100 border-b pb-2">
                        Date Settings
                      </h4>

                      <div className="grid grid-cols-2 gap-3">
                        <div>
                          <Label className="text-xs font-medium">
                            Min Date
                          </Label>
                          <Input
                            type="date"
                            value={
                              formFields.find((f) => f.id === selectedFieldId)
                                ?.minDate || ""
                            }
                            onChange={(e) => {
                              setFormFields((fields) =>
                                fields.map((f) =>
                                  f.id === selectedFieldId
                                    ? { ...f, minDate: e.target.value }
                                    : f,
                                ),
                              );
                            }}
                            className="mt-1 h-8 text-xs"
                          />
                        </div>
                        <div>
                          <Label className="text-xs font-medium">
                            Max Date
                          </Label>
                          <Input
                            type="date"
                            value={
                              formFields.find((f) => f.id === selectedFieldId)
                                ?.maxDate || ""
                            }
                            onChange={(e) => {
                              setFormFields((fields) =>
                                fields.map((f) =>
                                  f.id === selectedFieldId
                                    ? { ...f, maxDate: e.target.value }
                                    : f,
                                ),
                              );
                            }}
                            className="mt-1 h-8 text-xs"
                          />
                        </div>
                      </div>

                      <div>
                        <Label className="text-xs font-medium">
                          Date Format
                        </Label>
                        <Select
                          value={
                            formFields.find((f) => f.id === selectedFieldId)
                              ?.dateFormat || "YYYY-MM-DD"
                          }
                          onValueChange={(value) => {
                            setFormFields((fields) =>
                              fields.map((f) =>
                                f.id === selectedFieldId
                                  ? { ...f, dateFormat: value }
                                  : f,
                              ),
                            );
                          }}
                        >
                          <SelectTrigger className="mt-1 h-8 text-xs">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="YYYY-MM-DD">
                              YYYY-MM-DD
                            </SelectItem>
                            <SelectItem value="MM/DD/YYYY">
                              MM/DD/YYYY
                            </SelectItem>
                            <SelectItem value="DD/MM/YYYY">
                              DD/MM/YYYY
                            </SelectItem>
                            <SelectItem value="DD-MM-YYYY">
                              DD-MM-YYYY
                            </SelectItem>
                          </SelectContent>
                        </Select>
                      </div>

                      {/* Date Validation Options */}
                      <div className="grid grid-cols-2 gap-2">
                        <div className="flex items-center space-x-2">
                          <Checkbox
                            id="disablePast"
                            checked={
                              formFields.find((f) => f.id === selectedFieldId)
                                ?.disablePast || false
                            }
                            onCheckedChange={(checked) => {
                              setFormFields((fields) =>
                                fields.map((f) =>
                                  f.id === selectedFieldId
                                    ? { ...f, disablePast: !!checked }
                                    : f,
                                ),
                              );
                            }}
                          />
                          <Label
                            htmlFor="disablePast"
                            className="text-xs cursor-pointer"
                          >
                            Cannot be in past
                          </Label>
                        </div>

                        <div className="flex items-center space-x-2">
                          <Checkbox
                            id="disableFuture"
                            checked={
                              formFields.find((f) => f.id === selectedFieldId)
                                ?.disableFuture || false
                            }
                            onCheckedChange={(checked) => {
                              setFormFields((fields) =>
                                fields.map((f) =>
                                  f.id === selectedFieldId
                                    ? { ...f, disableFuture: !!checked }
                                    : f,
                                ),
                              );
                            }}
                          />
                          <Label
                            htmlFor="disableFuture"
                            className="text-xs cursor-pointer"
                          >
                            Cannot be in future
                          </Label>
                        </div>
                      </div>

                      {/* Date Comparison Validation */}
                      <div className="space-y-2">
                        <Label className="text-xs font-medium">
                          Date Comparison
                        </Label>
                        <div className="grid grid-cols-3 gap-2">
                          <Select
                            value={
                              formFields.find((f) => f.id === selectedFieldId)
                                ?.dateComparison?.type || "none"
                            }
                            onValueChange={(value) => {
                              setFormFields((fields) =>
                                fields.map((f) =>
                                  f.id === selectedFieldId
                                    ? {
                                        ...f,
                                        dateComparison:
                                          value === "none"
                                            ? undefined
                                            : {
                                                ...f.dateComparison,
                                                type: value as
                                                  | "before"
                                                  | "after",
                                              },
                                      }
                                    : f,
                                ),
                              );
                            }}
                          >
                            <SelectTrigger className="h-8 text-xs">
                              <SelectValue placeholder="Select" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="none">None</SelectItem>
                              <SelectItem value="before">
                                Must be before
                              </SelectItem>
                              <SelectItem value="after">
                                Must be after
                              </SelectItem>
                            </SelectContent>
                          </Select>

                          <Select
                            value={
                              formFields.find((f) => f.id === selectedFieldId)
                                ?.dateComparison?.field || ""
                            }
                            onValueChange={(value) => {
                              setFormFields((fields) =>
                                fields.map((f) =>
                                  f.id === selectedFieldId
                                    ? {
                                        ...f,
                                        dateComparison: {
                                          ...f.dateComparison,
                                          field: value,
                                        },
                                      }
                                    : f,
                                ),
                              );
                            }}
                            disabled={
                              !formFields.find((f) => f.id === selectedFieldId)
                                ?.dateComparison?.type ||
                              formFields.find((f) => f.id === selectedFieldId)
                                ?.dateComparison?.type === "none"
                            }
                          >
                            <SelectTrigger className="h-8 text-xs">
                              <SelectValue placeholder="Field" />
                            </SelectTrigger>
                            <SelectContent>
                              {formFields
                                .filter(
                                  (f) =>
                                    f.id !== selectedFieldId &&
                                    f.type === "date",
                                )
                                .map((field) => (
                                  <SelectItem
                                    key={field.id}
                                    value={field.name || field.id}
                                  >
                                    {field.label}
                                  </SelectItem>
                                ))}
                            </SelectContent>
                          </Select>

                          <Input
                            type="number"
                            placeholder="Days"
                            value={
                              formFields.find((f) => f.id === selectedFieldId)
                                ?.dateComparison?.offset || ""
                            }
                            onChange={(e) => {
                              const value = e.target.value
                                ? parseInt(e.target.value)
                                : undefined;
                              setFormFields((fields) =>
                                fields.map((f) =>
                                  f.id === selectedFieldId
                                    ? {
                                        ...f,
                                        dateComparison: {
                                          ...f.dateComparison,
                                          offset: value,
                                        },
                                      }
                                    : f,
                                ),
                              );
                            }}
                            className="h-8 text-xs"
                            disabled={
                              !formFields.find((f) => f.id === selectedFieldId)
                                ?.dateComparison?.type ||
                              formFields.find((f) => f.id === selectedFieldId)
                                ?.dateComparison?.type === "none"
                            }
                          />
                        </div>
                        <p className="text-xs text-gray-500 dark:text-gray-400">
                          Optional: Add days offset (e.g., 30 days before/after
                          another date)
                        </p>
                      </div>
                    </div>
                  )}

                  {/* Conditional Logic */}
                  <div className="space-y-3">
                    <h4 className="text-sm font-semibold text-gray-900 dark:text-gray-100 border-b pb-2">
                      Conditional Logic
                    </h4>

                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <Label className="text-xs font-medium">
                          Condition Type
                        </Label>
                        <Select
                          value={
                            formFields.find((f) => f.id === selectedFieldId)
                              ?.condition?.type || "visibility"
                          }
                          onValueChange={(value) => {
                            setFormFields((fields) =>
                              fields.map((f) =>
                                f.id === selectedFieldId
                                  ? {
                                      ...f,
                                      condition: {
                                        ...f.condition,
                                        type: value as
                                          | "visibility"
                                          | "enable"
                                          | "value",
                                      },
                                    }
                                  : f,
                              ),
                            );
                          }}
                        >
                          <SelectTrigger className="mt-1 h-8 text-xs">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="visibility">
                              Visibility
                            </SelectItem>
                            <SelectItem value="enable">
                              Enable/Disable
                            </SelectItem>
                            <SelectItem value="value">Auto Value</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>

                      <div>
                        <Label className="text-xs font-medium">Logic</Label>
                        <Select
                          value={
                            formFields.find((f) => f.id === selectedFieldId)
                              ?.condition?.logic || "AND"
                          }
                          onValueChange={(value) => {
                            setFormFields((fields) =>
                              fields.map((f) =>
                                f.id === selectedFieldId
                                  ? {
                                      ...f,
                                      condition: {
                                        ...f.condition,
                                        logic: value as "AND" | "OR",
                                      },
                                    }
                                  : f,
                              ),
                            );
                          }}
                        >
                          <SelectTrigger className="mt-1 h-8 text-xs">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="AND">AND</SelectItem>
                            <SelectItem value="OR">OR</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label className="text-xs font-medium">
                        Condition Rules
                      </Label>
                      {(
                        formFields.find((f) => f.id === selectedFieldId)
                          ?.condition?.rules || []
                      ).map((rule: any, index: number) => (
                        <div key={index} className="grid grid-cols-4 gap-2">
                          <Select
                            value={rule.field}
                            onValueChange={(value) => {
                              setFormFields((fields) =>
                                fields.map((f) =>
                                  f.id === selectedFieldId
                                    ? {
                                        ...f,
                                        condition: {
                                          ...f.condition,
                                          rules:
                                            f.condition?.rules?.map(
                                              (r: any, i: number) =>
                                                i === index
                                                  ? { ...r, field: value }
                                                  : r,
                                            ) || [],
                                        },
                                      }
                                    : f,
                                ),
                              );
                            }}
                          >
                            <SelectTrigger className="h-8 text-xs">
                              <SelectValue placeholder="Field" />
                            </SelectTrigger>
                            <SelectContent>
                              {formFields
                                .filter((f) => f.id !== selectedFieldId)
                                .map((field) => (
                                  <SelectItem key={field.id} value={field.name}>
                                    {field.label}
                                  </SelectItem>
                                ))}
                            </SelectContent>
                          </Select>

                          <Select
                            value={rule.operator}
                            onValueChange={(value) => {
                              setFormFields((fields) =>
                                fields.map((f) =>
                                  f.id === selectedFieldId
                                    ? {
                                        ...f,
                                        condition: {
                                          ...f.condition,
                                          rules:
                                            f.condition?.rules?.map(
                                              (r: any, i: number) =>
                                                i === index
                                                  ? {
                                                      ...r,
                                                      operator: value as any,
                                                    }
                                                  : r,
                                            ) || [],
                                        },
                                      }
                                    : f,
                                ),
                              );
                            }}
                          >
                            <SelectTrigger className="h-8 text-xs">
                              <SelectValue placeholder="Op" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="==">=</SelectItem>
                              <SelectItem value="!=">!=</SelectItem>
                              <SelectItem value=">">&gt;</SelectItem>
                              <SelectItem value=">=">&gt;=</SelectItem>
                              <SelectItem value="<">&lt;</SelectItem>
                              <SelectItem value="<=">&lt;=</SelectItem>
                              <SelectItem value="in">in</SelectItem>
                              <SelectItem value="not-in">not in</SelectItem>
                            </SelectContent>
                          </Select>

                          <Input
                            value={rule.value}
                            onChange={(e) => {
                              setFormFields((fields) =>
                                fields.map((f) =>
                                  f.id === selectedFieldId
                                    ? {
                                        ...f,
                                        condition: {
                                          ...f.condition,
                                          rules:
                                            f.condition?.rules?.map(
                                              (r: any, i: number) =>
                                                i === index
                                                  ? {
                                                      ...r,
                                                      value: e.target.value,
                                                    }
                                                  : r,
                                            ) || [],
                                        },
                                      }
                                    : f,
                                ),
                              );
                            }}
                            className="h-8 text-xs"
                            placeholder="Value"
                          />

                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => {
                              setFormFields((fields) =>
                                fields.map((f) =>
                                  f.id === selectedFieldId
                                    ? {
                                        ...f,
                                        condition: {
                                          ...f.condition,
                                          rules:
                                            f.condition?.rules?.filter(
                                              (_: any, i: number) =>
                                                i !== index,
                                            ) || [],
                                        },
                                      }
                                    : f,
                                ),
                              );
                            }}
                            className="h-8 w-8 p-0"
                          >
                            ×
                          </Button>
                        </div>
                      ))}
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => {
                          setFormFields((fields) =>
                            fields.map((f) =>
                              f.id === selectedFieldId
                                ? {
                                    ...f,
                                    condition: {
                                      ...f.condition,
                                      rules: [
                                        ...(f.condition?.rules || []),
                                        {
                                          field: "",
                                          operator: "==" as const,
                                          value: "",
                                        },
                                      ],
                                    },
                                  }
                                : f,
                            ),
                          );
                        }}
                        className="h-8 text-xs w-full"
                      >
                        + Add Rule
                      </Button>
                    </div>

                    <div>
                      <Label className="text-xs font-medium">
                        Watch Fields
                      </Label>
                      <div className="mt-1 space-y-2">
                        {formFields
                          .filter(
                            (f) =>
                              f.type === "number" && f.id !== selectedFieldId,
                          )
                          .map((field) => (
                            <div
                              key={field.id}
                              className="flex items-center space-x-2"
                            >
                              <Checkbox
                                id={`watch-${field.id}`}
                                checked={(
                                  formFields.find(
                                    (f) => f.id === selectedFieldId,
                                  )?.watch || []
                                ).includes(field.name || field.id)}
                                onCheckedChange={(checked) => {
                                  const currentWatch: string[] =
                                    formFields.find(
                                      (f) => f.id === selectedFieldId,
                                    )?.watch || [];
                                  const fieldIdentifier =
                                    field.name || field.id;
                                  let newWatch: string[];

                                  if (checked) {
                                    newWatch = [
                                      ...currentWatch,
                                      fieldIdentifier,
                                    ];
                                  } else {
                                    newWatch = currentWatch.filter(
                                      (w) => w !== fieldIdentifier,
                                    );
                                  }

                                  setFormFields((fields) =>
                                    fields.map((f) =>
                                      f.id === selectedFieldId
                                        ? { ...f, watch: newWatch }
                                        : f,
                                    ),
                                  );
                                }}
                              />
                              <Label
                                htmlFor={`watch-${field.id}`}
                                className="text-xs cursor-pointer flex-1"
                              >
                                {field.label} ({field.name || field.id})
                              </Label>
                            </div>
                          ))}
                        {formFields.filter(
                          (f) =>
                            f.type === "number" && f.id !== selectedFieldId,
                        ).length === 0 && (
                          <p className="text-xs text-gray-500 dark:text-gray-400 py-2">
                            No number fields available to watch
                          </p>
                        )}
                      </div>
                    </div>

                    <div>
                      <Label className="text-xs font-medium">
                        Mathematical Operation
                      </Label>
                      <Select
                        value={
                          formFields.find((f) => f.id === selectedFieldId)
                            ?.mathOperation || "none"
                        }
                        onValueChange={(value) => {
                          setFormFields((fields) =>
                            fields.map((f) =>
                              f.id === selectedFieldId
                                ? {
                                    ...f,
                                    mathOperation:
                                      value === "none" ? undefined : value,
                                  }
                                : f,
                            ),
                          );
                        }}
                      >
                        <SelectTrigger className="mt-1 h-8 text-xs">
                          <SelectValue placeholder="Select operation" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="none">None</SelectItem>
                          <SelectItem value="sum">Sum()</SelectItem>
                          <SelectItem value="subtraction">
                            Subtraction()
                          </SelectItem>
                          <SelectItem value="multiplication">
                            Multiplication()
                          </SelectItem>
                          <SelectItem value="division">Division()</SelectItem>
                          <SelectItem value="average">Average()</SelectItem>
                        </SelectContent>
                      </Select>
                      <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                        Apply mathematical operations to watched fields
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        ) : isLoadingFormFromUrl ? (
          /* Form Loading Skeleton */
          <FormLoadingSkeleton />
        ) : selectedFormId ? (
          /* Form Editor Interface */
          ""
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
