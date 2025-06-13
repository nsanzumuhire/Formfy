import { useState, useCallback } from "react";
import { useLocation, useRoute } from "wouter";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
  DragOverEvent,
} from "@dnd-kit/core";
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Command, CommandGroup, CommandItem } from "@/components/ui/command";
import { useToast } from "@/hooks/use-toast";
import { 
  Plus, 
  Settings, 
  Eye, 
  Save, 
  Trash2, 
  GripVertical,
  Type,
  Mail,
  Hash,
  CheckSquare,
  Circle,
  List,
  Check,
  ChevronsUpDown
} from "lucide-react";
import { cn } from "@/lib/utils";
import { apiRequest } from "@/lib/queryClient";
import { useProject } from "@/hooks/useProject";

// Types
interface FormField {
  id: string;
  type: 'text' | 'email' | 'number' | 'checkbox' | 'radio' | 'select';
  label: string;
  placeholder?: string;
  description?: string;
  required?: boolean;
  options?: { label: string; value: string }[];
  order: number;
}

interface FormConfig {
  layout: 'single-column' | 'two-column' | 'grid' | 'mixed';
  spacing: 'compact' | 'normal' | 'relaxed';
  gridColumns?: number;
}

interface Form {
  id: string;
  name: string;
  description?: string;
  schema: {
    fields: FormField[];
    settings: {
      title: string;
      description?: string;
    };
  };
  status: 'draft' | 'published' | 'archived';
}

// Helper functions
const generateFieldId = () => `field_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

const createFormField = (type: FormField['type']): FormField => ({
  id: generateFieldId(),
  type,
  label: getDefaultLabel(type),
  placeholder: getDefaultPlaceholder(type),
  required: false,
  order: 0,
  ...(type === 'radio' || type === 'select' ? { options: [{ label: 'Option 1', value: 'option1' }] } : {})
});

const getDefaultLabel = (type: FormField['type']): string => {
  const labels = {
    text: 'Text Field',
    email: 'Email Address', 
    number: 'Number',
    checkbox: 'Checkbox',
    radio: 'Radio Group',
    select: 'Select Dropdown'
  };
  return labels[type];
};

const getDefaultPlaceholder = (type: FormField['type']): string => {
  const placeholders = {
    text: 'Enter text...',
    email: 'Enter email address...',
    number: 'Enter number...',
    checkbox: '',
    radio: '',
    select: ''
  };
  return placeholders[type];
};

// Draggable Field Component
function DraggableField({ type, label, icon: Icon }: { type: FormField['type']; label: string; icon: any }) {
  return (
    <div
      className="flex items-center gap-2 p-3 border border-gray-200 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 cursor-grab hover:shadow-md transition-shadow"
      draggable
      onDragStart={(e) => {
        e.dataTransfer.setData('application/json', JSON.stringify({ type }));
      }}
    >
      <Icon className="h-4 w-4 text-gray-500" />
      <span className="text-sm font-medium">{label}</span>
    </div>
  );
}

// Sortable Field Component
function SortableField({ field, isSelected, onSelect, onUpdate, onDelete }: {
  field: FormField;
  isSelected: boolean;
  onSelect: () => void;
  onUpdate: (updates: Partial<FormField>) => void;
  onDelete: () => void;
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

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={cn(
        "p-4 border rounded-lg bg-white dark:bg-gray-800 cursor-pointer transition-colors",
        isSelected ? "border-blue-500 bg-blue-50 dark:bg-blue-950" : "border-gray-200 dark:border-gray-700 hover:border-gray-300"
      )}
      onClick={onSelect}
    >
      <div className="flex items-center gap-2 mb-2">
        <div {...attributes} {...listeners} className="cursor-grab">
          <GripVertical className="h-4 w-4 text-gray-400" />
        </div>
        <Label className="font-medium">{field.label}</Label>
        {field.required && <Badge variant="secondary" className="text-xs">Required</Badge>}
        <Button
          variant="ghost"
          size="sm"
          onClick={(e) => {
            e.stopPropagation();
            onDelete();
          }}
          className="ml-auto p-1 h-auto"
        >
          <Trash2 className="h-3 w-3" />
        </Button>
      </div>
      
      <div className="ml-6">
        {field.type === 'text' || field.type === 'email' || field.type === 'number' ? (
          <Input placeholder={field.placeholder} disabled className="text-sm" />
        ) : field.type === 'checkbox' ? (
          <div className="flex items-center space-x-2">
            <Checkbox disabled />
            <Label className="text-sm">{field.label}</Label>
          </div>
        ) : field.type === 'radio' ? (
          <RadioGroup disabled>
            {field.options?.map((option, index) => (
              <div key={index} className="flex items-center space-x-2">
                <RadioGroupItem value={option.value} disabled />
                <Label className="text-sm">{option.label}</Label>
              </div>
            ))}
          </RadioGroup>
        ) : field.type === 'select' ? (
          <Select disabled>
            <SelectTrigger className="text-sm">
              <SelectValue placeholder="Select an option" />
            </SelectTrigger>
          </Select>
        ) : null}
      </div>
    </div>
  );
}

// Field Properties Panel
function FieldPropertiesPanel({ field, onUpdate }: {
  field: FormField;
  onUpdate: (updates: Partial<FormField>) => void;
}) {
  return (
    <div className="space-y-4">
      <div>
        <Label htmlFor="field-label">Label</Label>
        <Input
          id="field-label"
          value={field.label}
          onChange={(e) => onUpdate({ label: e.target.value })}
        />
      </div>

      {(field.type === 'text' || field.type === 'email' || field.type === 'number') && (
        <div>
          <Label htmlFor="field-placeholder">Placeholder</Label>
          <Input
            id="field-placeholder"
            value={field.placeholder || ''}
            onChange={(e) => onUpdate({ placeholder: e.target.value })}
          />
        </div>
      )}

      <div>
        <Label htmlFor="field-description">Description</Label>
        <Textarea
          id="field-description"
          value={field.description || ''}
          onChange={(e) => onUpdate({ description: e.target.value })}
          rows={2}
        />
      </div>

      <div className="flex items-center space-x-2">
        <Checkbox
          id="field-required"
          checked={field.required}
          onCheckedChange={(checked) => onUpdate({ required: checked as boolean })}
        />
        <Label htmlFor="field-required">Required field</Label>
      </div>

      {(field.type === 'radio' || field.type === 'select') && (
        <div>
          <Label>Options</Label>
          <div className="space-y-2 mt-2">
            {field.options?.map((option, index) => (
              <div key={index} className="flex gap-2">
                <Input
                  value={option.label}
                  onChange={(e) => {
                    const newOptions = [...(field.options || [])];
                    newOptions[index] = { ...option, label: e.target.value, value: e.target.value.toLowerCase().replace(/\s+/g, '_') };
                    onUpdate({ options: newOptions });
                  }}
                  placeholder="Option label"
                />
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    const newOptions = field.options?.filter((_, i) => i !== index);
                    onUpdate({ options: newOptions });
                  }}
                >
                  <Trash2 className="h-3 w-3" />
                </Button>
              </div>
            ))}
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                const newOptions = [...(field.options || []), { label: `Option ${(field.options?.length || 0) + 1}`, value: `option${(field.options?.length || 0) + 1}` }];
                onUpdate({ options: newOptions });
              }}
              className="w-full"
            >
              <Plus className="h-3 w-3 mr-1" />
              Add Option
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}

// Form Preview Component
function FormPreview({ fields, config }: { fields: FormField[]; config: FormConfig }) {
  const getSpacingClass = (spacing: string) => {
    switch (spacing) {
      case 'compact': return 'space-y-2';
      case 'relaxed': return 'space-y-6';
      default: return 'space-y-4';
    }
  };

  const getLayoutClass = (layout: string) => {
    switch (layout) {
      case 'two-column': return 'grid grid-cols-2 gap-4';
      case 'grid': return `grid grid-cols-${config.gridColumns || 2} gap-4`;
      default: return 'space-y-4';
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-6 bg-white dark:bg-gray-900 rounded-lg border">
      <div className={cn(getLayoutClass(config.layout), getSpacingClass(config.spacing))}>
        {fields.map((field) => (
          <div key={field.id} className="space-y-2">
            <Label className="text-sm font-medium">
              {field.label}
              {field.required && <span className="text-red-500 ml-1">*</span>}
            </Label>
            {field.description && (
              <p className="text-xs text-gray-500">{field.description}</p>
            )}
            
            {field.type === 'text' || field.type === 'email' || field.type === 'number' ? (
              <Input type={field.type} placeholder={field.placeholder} />
            ) : field.type === 'checkbox' ? (
              <div className="flex items-center space-x-2">
                <Checkbox />
                <Label className="text-sm">{field.label}</Label>
              </div>
            ) : field.type === 'radio' ? (
              <RadioGroup>
                {field.options?.map((option) => (
                  <div key={option.value} className="flex items-center space-x-2">
                    <RadioGroupItem value={option.value} />
                    <Label className="text-sm">{option.label}</Label>
                  </div>
                ))}
              </RadioGroup>
            ) : field.type === 'select' ? (
              <Select>
                <SelectTrigger>
                  <SelectValue placeholder="Select an option" />
                </SelectTrigger>
                <SelectContent>
                  {field.options?.map((option) => (
                    <SelectItem key={option.value} value={option.value}>
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            ) : null}
          </div>
        ))}
      </div>
    </div>
  );
}

// Main Form Editor Component
export default function FormEditor() {
  const [, navigate] = useLocation();
  const [match, params] = useRoute("/form-editor/:id?");
  const { selectedProject } = useProject();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // State
  const [fields, setFields] = useState<FormField[]>([]);
  const [selectedFieldId, setSelectedFieldId] = useState<string | null>(null);
  const [showPreview, setShowPreview] = useState(false);
  const [showSaveDialog, setShowSaveDialog] = useState(false);
  const [formName, setFormName] = useState("");
  const [formDescription, setFormDescription] = useState("");
  const [formConfig, setFormConfig] = useState<FormConfig>({
    layout: 'single-column',
    spacing: 'normal',
    gridColumns: 2
  });
  const [layoutOpen, setLayoutOpen] = useState(false);
  const [spacingOpen, setSpacingOpen] = useState(false);

  // DnD Sensors
  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  // Mutations
  const createFormMutation = useMutation({
    mutationFn: async (formData: { name: string; description?: string; schema: any }) => {
      return await apiRequest(`/api/projects/${selectedProject}/forms`, {
        method: 'POST',
        body: JSON.stringify(formData),
      });
    },
    onSuccess: () => {
      toast({
        title: "Success",
        description: "Form created successfully!",
      });
      queryClient.invalidateQueries({ queryKey: [`/api/projects/${selectedProject}/forms`] });
      navigate("/forms");
    },
    onError: (error: Error) => {
      toast({
        title: "Error", 
        description: error.message,
        variant: "destructive",
      });
    },
  });

  // Event Handlers
  const handleDragEnd = useCallback((event: DragEndEvent) => {
    const { active, over } = event;
    
    if (!over) return;

    if (active.id !== over.id) {
      setFields((items) => {
        const oldIndex = items.findIndex(item => item.id === active.id);
        const newIndex = items.findIndex(item => item.id === over.id);
        return arrayMove(items, oldIndex, newIndex);
      });
    }
  }, []);

  const handleDragOver = useCallback((event: DragOverEvent) => {
    // Handle drag over canvas
  }, []);

  const handleCanvasDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    try {
      const data = JSON.parse(e.dataTransfer.getData('application/json'));
      if (data.type) {
        const newField = createFormField(data.type);
        newField.order = fields.length;
        setFields(prev => [...prev, newField]);
        setSelectedFieldId(newField.id);
      }
    } catch (error) {
      console.error('Failed to parse drag data:', error);
    }
  }, [fields.length]);

  const handleFieldUpdate = useCallback((fieldId: string, updates: Partial<FormField>) => {
    setFields(prev => prev.map(field => 
      field.id === fieldId ? { ...field, ...updates } : field
    ));
  }, []);

  const handleFieldDelete = useCallback((fieldId: string) => {
    setFields(prev => prev.filter(field => field.id !== fieldId));
    if (selectedFieldId === fieldId) {
      setSelectedFieldId(null);
    }
  }, [selectedFieldId]);

  const handleSave = useCallback(() => {
    setShowSaveDialog(true);
  }, []);

  const handleCreateForm = useCallback((name: string, description?: string) => {
    const schema = {
      fields: fields,
      settings: {
        title: name,
        description: description,
      },
    };

    createFormMutation.mutate({
      name,
      description,
      schema,
    });

    setShowSaveDialog(false);
  }, [fields, createFormMutation]);

  // Field types for toolbox
  const fieldTypes = [
    { type: 'text' as const, label: 'Text', icon: Type },
    { type: 'email' as const, label: 'Email', icon: Mail },
    { type: 'number' as const, label: 'Number', icon: Hash },
    { type: 'checkbox' as const, label: 'Checkbox', icon: CheckSquare },
    { type: 'radio' as const, label: 'Radio', icon: Circle },
    { type: 'select' as const, label: 'Select', icon: List },
  ];

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="flex h-screen">
        {/* Toolbox */}
        <div className="w-64 bg-white dark:bg-gray-900 border-r border-gray-200 dark:border-gray-700 overflow-y-auto">
          <div className="p-4">
            <h2 className="text-lg font-semibold mb-4">Form Elements</h2>
            <div className="space-y-2">
              {fieldTypes.map((fieldType) => (
                <DraggableField
                  key={fieldType.type}
                  type={fieldType.type}
                  label={fieldType.label}
                  icon={fieldType.icon}
                />
              ))}
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="flex-1 flex flex-col">
          {/* Header */}
          <div className="bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-700">
            <div className="px-6 py-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <h1 className="text-xl font-semibold">Form Builder</h1>
                  
                  {/* Layout Configuration */}
                  <div className="flex items-center gap-2">
                    <div className="relative">
                      <Popover open={layoutOpen} onOpenChange={setLayoutOpen}>
                        <PopoverTrigger asChild>
                          <Button
                            variant="outline"
                            role="combobox"
                            aria-expanded={layoutOpen}
                            className="w-40 h-12 justify-between pt-6 pb-2"
                          >
                            {formConfig.layout === "single-column"
                              ? "Single"
                              : formConfig.layout === "two-column"
                                ? "Two Col"
                                : formConfig.layout === "grid"
                                  ? "Grid"
                                  : formConfig.layout === "mixed"
                                    ? "Mixed"
                                    : ""}
                            <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                          </Button>
                        </PopoverTrigger>
                        <Label 
                          className={`absolute left-3 transition-all duration-200 pointer-events-none text-xs ${
                            formConfig.layout && formConfig.layout !== "" 
                              ? "top-1 text-gray-500 dark:text-gray-400" 
                              : "top-1/2 -translate-y-1/2 text-gray-400 dark:text-gray-500"
                          }`}
                        >
                          Form Layout
                        </Label>
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
                                Single Column
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
                                Two Column
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
                    </div>

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

                  {/* Field Spacing Configuration */}
                  <div className="flex items-center gap-2">
                    <div className="relative">
                      <Popover open={spacingOpen} onOpenChange={setSpacingOpen}>
                        <PopoverTrigger asChild>
                          <Button
                            variant="outline"
                            role="combobox"
                            aria-expanded={spacingOpen}
                            className="w-32 h-12 justify-between pt-6 pb-2"
                          >
                            {formConfig.spacing === "compact"
                              ? "Compact"
                              : formConfig.spacing === "normal"
                                ? "Normal"
                                : formConfig.spacing === "relaxed"
                                  ? "Relaxed"
                                  : ""}
                            <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                          </Button>
                        </PopoverTrigger>
                        <Label 
                          className={`absolute left-3 transition-all duration-200 pointer-events-none text-xs ${
                            formConfig.spacing && formConfig.spacing !== "" 
                              ? "top-1 text-gray-500 dark:text-gray-400" 
                              : "top-1/2 -translate-y-1/2 text-gray-400 dark:text-gray-500"
                          }`}
                        >
                          Field Spacing
                        </Label>
                        <PopoverContent className="w-32 p-0">
                          <Command>
                            <CommandGroup>
                              <CommandItem
                                value="compact"
                                onSelect={() => {
                                  setFormConfig({
                                    ...formConfig,
                                    spacing: "compact",
                                  });
                                  setSpacingOpen(false);
                                }}
                              >
                                <Check
                                  className={cn(
                                    "mr-2 h-4 w-4",
                                    formConfig.spacing === "compact"
                                      ? "opacity-100"
                                      : "opacity-0",
                                  )}
                                />
                                Compact
                              </CommandItem>
                              <CommandItem
                                value="normal"
                                onSelect={() => {
                                  setFormConfig({
                                    ...formConfig,
                                    spacing: "normal",
                                  });
                                  setSpacingOpen(false);
                                }}
                              >
                                <Check
                                  className={cn(
                                    "mr-2 h-4 w-4",
                                    formConfig.spacing === "normal"
                                      ? "opacity-100"
                                      : "opacity-0",
                                  )}
                                />
                                Normal
                              </CommandItem>
                              <CommandItem
                                value="relaxed"
                                onSelect={() => {
                                  setFormConfig({
                                    ...formConfig,
                                    spacing: "relaxed",
                                  });
                                  setSpacingOpen(false);
                                }}
                              >
                                <Check
                                  className={cn(
                                    "mr-2 h-4 w-4",
                                    formConfig.spacing === "relaxed"
                                      ? "opacity-100"
                                      : "opacity-0",
                                  )}
                                />
                                Relaxed
                              </CommandItem>
                            </CommandGroup>
                          </Command>
                        </PopoverContent>
                      </Popover>
                    </div>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex items-center gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setShowPreview(!showPreview)}
                    className="flex items-center gap-1"
                  >
                    <Eye className="h-4 w-4" />
                    {showPreview ? "Edit" : "Preview"}
                  </Button>
                  <Button
                    size="sm"
                    onClick={handleSave}
                    className="flex items-center gap-1"
                  >
                    <Save className="h-4 w-4" />
                    Save Form
                  </Button>
                </div>
              </div>
            </div>
          </div>

          {/* Canvas */}
          <div className="flex-1 bg-white dark:bg-gray-900">
            {showPreview ? (
              <div className="p-6">
                <FormPreview fields={fields} config={formConfig} />
              </div>
            ) : (
              <DndContext
                sensors={sensors}
                collisionDetection={closestCenter}
                onDragEnd={handleDragEnd}
                onDragOver={handleDragOver}
              >
                <div className="h-full p-6">
                  <SortableContext items={fields.map(f => f.id)} strategy={verticalListSortingStrategy}>
                    <div 
                      className="min-h-[400px] border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg p-4 bg-gray-50 dark:bg-gray-800/50"
                      onDrop={handleCanvasDrop}
                      onDragOver={(e) => e.preventDefault()}
                    >
                      {fields.length === 0 ? (
                        <div className="flex items-center justify-center h-64 text-gray-500 dark:text-gray-400">
                          <div className="text-center">
                            <Plus className="h-12 w-12 mx-auto mb-2 opacity-50" />
                            <p>Drag fields from the toolbox to start building your form</p>
                          </div>
                        </div>
                      ) : (
                        <div className="space-y-4">
                          {fields.map((field) => (
                            <SortableField
                              key={field.id}
                              field={field}
                              isSelected={selectedFieldId === field.id}
                              onSelect={() => setSelectedFieldId(field.id)}
                              onUpdate={(updates) => handleFieldUpdate(field.id, updates)}
                              onDelete={() => handleFieldDelete(field.id)}
                            />
                          ))}
                        </div>
                      )}
                    </div>
                  </SortableContext>
                </div>
              </DndContext>
            )}
          </div>
        </div>

        {/* Properties Panel */}
        <div className="w-80 bg-white dark:bg-gray-900 border-l border-gray-200 dark:border-gray-700 overflow-y-auto">
          <div className="p-6">
            <h3 className="text-lg font-semibold mb-4">Field Properties</h3>
            {selectedFieldId && (
              <FieldPropertiesPanel
                field={fields.find(f => f.id === selectedFieldId)!}
                onUpdate={(updates) => handleFieldUpdate(selectedFieldId, updates)}
              />
            )}
            {!selectedFieldId && (
              <div className="text-center text-gray-500 dark:text-gray-400 py-8">
                <Settings className="h-12 w-12 mx-auto mb-2 opacity-50" />
                <p>Select a field to edit its properties</p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Save Form Dialog */}
      <Dialog open={showSaveDialog} onOpenChange={setShowSaveDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Save Form</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="form-name">Form Name</Label>
              <Input
                id="form-name"
                value={formName}
                onChange={(e) => setFormName(e.target.value)}
                placeholder="Enter form name"
              />
            </div>
            <div>
              <Label htmlFor="form-description">Description (optional)</Label>
              <Input
                id="form-description"
                value={formDescription}
                onChange={(e) => setFormDescription(e.target.value)}
                placeholder="Enter form description"
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowSaveDialog(false)}>
              Cancel
            </Button>
            <Button
              onClick={() => handleCreateForm(formName, formDescription)}
              disabled={!formName.trim() || createFormMutation.isPending}
            >
              {createFormMutation.isPending ? "Saving..." : "Save Form"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}