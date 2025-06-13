import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useRoute, Link } from "wouter";
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

// Sortable Field Component
function SortableField({
  field,
  isSelected,
  onSelect,
  onUpdate,
}: {
  field: any;
  isSelected: boolean;
  onSelect: () => void;
  onUpdate: (updates: any) => void;
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
      className={`p-4 border rounded-lg cursor-pointer transition-all ${
        isSelected
          ? "border-blue-500 bg-blue-50 dark:bg-blue-950"
          : "border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600"
      }`}
      onClick={onSelect}
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
          <button
            className="p-1 hover:bg-gray-100 dark:hover:bg-gray-800 rounded cursor-grab"
            {...attributes}
            {...listeners}
          >
            <Grip className="w-3 h-3 text-gray-400" />
          </button>
        </div>
      </div>

      {field.type === "text" ||
      field.type === "email" ||
      field.type === "number" ? (
        <Input
          placeholder={field.placeholder}
          disabled
          className="bg-gray-50 dark:bg-gray-900"
        />
      ) : field.type === "checkbox" ? (
        <div className="flex items-center gap-2">
          <input type="checkbox" disabled className="rounded" />
          <span className="text-sm text-gray-600 dark:text-gray-400">
            {field.placeholder}
          </span>
        </div>
      ) : field.type === "radio" ? (
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <Circle className="w-4 h-4 text-gray-400" />
            <span className="text-sm text-gray-600 dark:text-gray-400">
              Option 1
            </span>
          </div>
          <div className="flex items-center gap-2">
            <Circle className="w-4 h-4 text-gray-400" />
            <span className="text-sm text-gray-600 dark:text-gray-400">
              Option 2
            </span>
          </div>
        </div>
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
    layout: "",
    gridColumns: 2,
    spacing: "",
    customSpacing: 8,
  });

  // UI state for comboboxes
  const [layoutOpen, setLayoutOpen] = useState(false);
  const [spacingOpen, setSpacingOpen] = useState(false);

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
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: [`/api/projects/${currentProjectId}/forms`],
      });
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
    setShowPropertiesPanel(true);
  };

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;

    if (active.id !== over?.id) {
      setFormFields((items) => {
        const oldIndex = items.findIndex((item) => item.id === active.id);
        const newIndex = items.findIndex((item) => item.id === over?.id);

        return arrayMove(items, oldIndex, newIndex);
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
                          <h3 className="text-sm font-medium text-gray-900 dark:text-gray-100 truncate">
                            {form.name}
                          </h3>
                        </div>
                        <div className="flex items-center gap-2 mb-2">
                          {getFormStatusBadge(form)}
                          <span className="text-xs text-gray-500 dark:text-gray-400">
                            {formatDistanceToNow(new Date(form.createdAt!), {
                              addSuffix: true,
                            })}
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
                            <MoreHorizontal className="h-3 w-3" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" className="w-40">
                          <DropdownMenuItem>
                            <Edit className="mr-2 h-3 w-3" />
                            Edit
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
          /* Form Builder Interface */
          <div className="h-full flex">
            {/* Toolbox Sidebar */}
            <div className="w-12 border-r border-gray-200 dark:border-gray-800 bg-gray-50 dark:bg-gray-900 flex flex-col">
              {/* Tools Header */}
              <div className="p-3 border-b border-gray-200 dark:border-gray-800">
                <button
                  onClick={() => setShowFormsList(!showFormsList)}
                  className="w-6 h-6 text-gray-600 dark:text-gray-400 mx-auto hover:text-gray-800 dark:hover:text-gray-200 transition-colors flex items-center justify-center"
                  title="Toggle Forms List"
                >
                  <PanelRightOpen className="w-5 h-5" />
                </button>
              </div>

              {/* Field Tools */}
              <div className="flex-1 p-2 space-y-2">
                <button
                  onClick={() => handleAddField("text")}
                  className="w-full p-2 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-800 transition-colors group"
                  title="Text Input"
                >
                  <AlignLeft className="w-5 h-5 text-gray-600 dark:text-gray-400 mx-auto" />
                </button>

                <button
                  onClick={() => handleAddField("email")}
                  className="w-full p-2 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-800 transition-colors group"
                  title="Email Input"
                >
                  <Type className="w-5 h-5 text-gray-600 dark:text-gray-400 mx-auto" />
                </button>

                <button
                  onClick={() => handleAddField("number")}
                  className="w-full p-2 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-800 transition-colors group"
                  title="Number Input"
                >
                  <Hash className="w-5 h-5 text-gray-600 dark:text-gray-400 mx-auto" />
                </button>

                <button
                  onClick={() => handleAddField("checkbox")}
                  className="w-full p-2 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-800 transition-colors group"
                  title="Checkbox"
                >
                  <CheckSquare className="w-5 h-5 text-gray-600 dark:text-gray-400 mx-auto" />
                </button>

                <button
                  onClick={() => handleAddField("radio")}
                  className="w-full p-2 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-800 transition-colors group"
                  title="Radio Button"
                >
                  <Circle className="w-5 h-5 text-gray-600 dark:text-gray-400 mx-auto" />
                </button>

                <button
                  onClick={() => handleAddField("select")}
                  className="w-full p-2 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-800 transition-colors group"
                  title="Dropdown"
                >
                  <ChevronDown className="w-5 h-5 text-gray-600 dark:text-gray-400 mx-auto" />
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
                          {formConfig.layout === "single-column"
                            ? "Single"
                            : formConfig.layout === "two-column"
                              ? "Two Col"
                              : formConfig.layout === "grid"
                                ? "Grid"
                                : formConfig.layout === "mixed"
                                  ? "Mixed"
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
                              value="mixed"
                              onSelect={() => {
                                setFormConfig({
                                  ...formConfig,
                                  layout: "mixed",
                                });
                                setLayoutOpen(false);
                              }}
                            >
                              <Check
                                className={cn(
                                  "mr-2 h-4 w-4",
                                  formConfig.layout === "mixed"
                                    ? "opacity-100"
                                    : "opacity-0",
                                )}
                              />
                              Mixed
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
              <div className="flex-1 bg-gray-100 dark:bg-gray-900 p-4">
                <div className="w-full">
                  <div className="bg-white dark:bg-gray-950 rounded-lg shadow-sm border border-gray-200 dark:border-gray-800 min-h-[500px] p-6">
                    {formFields.length === 0 ? (
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
                          <div
                            className={`${
                              formConfig.layout === "two-column"
                                ? "grid grid-cols-2"
                                : formConfig.layout === "grid"
                                  ? "grid"
                                  : formConfig.layout === "mixed"
                                    ? "space-y-4"
                                    : "flex flex-col"
                            }`}
                            style={{
                              gap:
                                formConfig.layout !== "mixed"
                                  ? getSpacingValue()
                                  : undefined,
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

                <div className="space-y-4">
                  <div>
                    <Label className="text-sm font-medium">Label</Label>
                    <Input
                      value={
                        formFields.find((f) => f.id === selectedFieldId)
                          ?.label || ""
                      }
                      onChange={(e) => {
                        setFormFields((fields) =>
                          fields.map((f) =>
                            f.id === selectedFieldId
                              ? { ...f, label: e.target.value }
                              : f,
                          ),
                        );
                      }}
                      className="mt-1"
                    />
                  </div>

                  <div>
                    <Label className="text-sm font-medium">Placeholder</Label>
                    <Input
                      value={
                        formFields.find((f) => f.id === selectedFieldId)
                          ?.placeholder || ""
                      }
                      onChange={(e) => {
                        setFormFields((fields) =>
                          fields.map((f) =>
                            f.id === selectedFieldId
                              ? { ...f, placeholder: e.target.value }
                              : f,
                          ),
                        );
                      }}
                      className="mt-1"
                    />
                  </div>

                  <div className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      id="required"
                      checked={
                        formFields.find((f) => f.id === selectedFieldId)
                          ?.required || false
                      }
                      onChange={(e) => {
                        setFormFields((fields) =>
                          fields.map((f) =>
                            f.id === selectedFieldId
                              ? { ...f, required: e.target.checked }
                              : f,
                          ),
                        );
                      }}
                    />
                    <Label htmlFor="required" className="text-sm font-medium">
                      Required field
                    </Label>
                  </div>
                </div>
              </div>
            )}
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
              <DialogTitle>Save Form</DialogTitle>
              <DialogDescription>
                Give your form a name and description to save it to your
                project.
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
