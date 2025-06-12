import { useState, useCallback } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useRoute } from "wouter";
import { DndContext, DragEndEvent, DragOverEvent } from "@dnd-kit/core";
import { arrayMove } from "@dnd-kit/sortable";
import { FormBuilderToolbox } from "@/components/form-builder/toolbox";
import { FormCanvas } from "@/components/form-builder/canvas";
import { PropertiesPanel } from "@/components/form-builder/properties-panel";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { 
  createFormField,
  type FormFieldData,
  type FormSchema,
} from "@/lib/form-builder";
import type { Form, Project } from "@shared/schema";

export default function FormBuilder() {
  const [, params] = useRoute("/form-builder/:id?");
  const formId = params?.id;
  const isEditing = !!formId;

  const [formName, setFormName] = useState("Untitled Form");
  const [formDescription, setFormDescription] = useState("");
  const [selectedProject, setSelectedProject] = useState<string>("");
  const [fields, setFields] = useState<FormFieldData[]>([]);
  const [selectedFieldId, setSelectedFieldId] = useState<string | null>(null);

  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Fetch projects for project selector
  const { data: projects } = useQuery<Project[]>({
    queryKey: ["/api/projects"],
  });

  // Fetch form data if editing
  const { data: form, isLoading: formLoading } = useQuery<Form>({
    queryKey: [`/api/forms/${formId}`],
    enabled: isEditing,
  });

  // Initialize form data when editing
  useState(() => {
    if (form && !formLoading) {
      setFormName(form.name);
      setFormDescription(form.description || "");
      setSelectedProject(form.projectId);
      
      if (form.schema && typeof form.schema === 'object') {
        const schema = form.schema as FormSchema;
        setFields(schema.fields || []);
      }
    }
  });

  // Auto-select first project if creating new form
  useState(() => {
    if (!isEditing && projects && projects.length > 0 && !selectedProject) {
      setSelectedProject(projects[0].id);
    }
  });

  const saveFormMutation = useMutation({
    mutationFn: async (formData: any) => {
      if (isEditing) {
        return await apiRequest("PUT", `/api/forms/${formId}`, formData);
      } else {
        return await apiRequest("POST", `/api/projects/${selectedProject}/forms`, formData);
      }
    },
    onSuccess: () => {
      toast({
        title: "Form saved",
        description: "Your form has been saved successfully.",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/forms"] });
      queryClient.invalidateQueries({ queryKey: [`/api/projects/${selectedProject}/forms`] });
    },
    onError: (error) => {
      toast({
        title: "Error saving form",
        description: error.message || "Failed to save form. Please try again.",
        variant: "destructive",
      });
    },
  });

  const handleDragEnd = useCallback((event: DragEndEvent) => {
    const { active, over } = event;

    if (!over) return;

    // Handle dropping field from toolbox to canvas
    if (active.data.current?.type === "field" && over.id === "form-canvas") {
      const fieldType = active.data.current.fieldType;
      const newField = createFormField(fieldType);
      newField.order = fields.length;
      setFields((prev) => [...prev, newField]);
    }

    // Handle reordering fields within canvas
    if (active.id !== over.id && over.id !== "form-canvas") {
      const oldIndex = fields.findIndex((field) => field.id === active.id);
      const newIndex = fields.findIndex((field) => field.id === over.id);
      
      if (oldIndex !== -1 && newIndex !== -1) {
        const reorderedFields = arrayMove(fields, oldIndex, newIndex);
        setFields(reorderedFields.map((field, index) => ({ ...field, order: index })));
      }
    }
  }, [fields]);

  const handleDragOver = useCallback((event: DragOverEvent) => {
    // Optional: Add visual feedback for drag over
  }, []);

  const handleFieldUpdate = useCallback((fieldId: string, updates: Partial<FormFieldData>) => {
    setFields((prev) =>
      prev.map((field) =>
        field.id === fieldId ? { ...field, ...updates } : field
      )
    );
  }, []);

  const handleSave = () => {
    if (!formName.trim()) {
      toast({
        title: "Form name required",
        description: "Please enter a name for your form.",
        variant: "destructive",
      });
      return;
    }

    if (!selectedProject) {
      toast({
        title: "Project required",
        description: "Please select a project for your form.",
        variant: "destructive",
      });
      return;
    }

    const schema: FormSchema = {
      fields,
      settings: {
        title: formName,
        description: formDescription,
      },
    };

    saveFormMutation.mutate({
      name: formName,
      description: formDescription,
      schema,
      isActive: true,
    });
  };

  const handlePreview = () => {
    // TODO: Implement form preview
    toast({
      title: "Preview",
      description: "Form preview functionality coming soon!",
    });
  };

  const selectedField = selectedFieldId 
    ? fields.find((field) => field.id === selectedFieldId) || null
    : null;

  if (formLoading) {
    return <div className="p-6">Loading form...</div>;
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="space-y-4">
        <div>
          <h1 className="text-3xl font-bold">
            {isEditing ? "Edit Form" : "Form Builder"}
          </h1>
          <p className="text-muted-foreground">
            {isEditing ? "Modify your existing form" : "Create a new form with drag-and-drop"}
          </p>
        </div>

        {/* Form Settings */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
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
            <Label htmlFor="form-description">Description (Optional)</Label>
            <Input
              id="form-description"
              value={formDescription}
              onChange={(e) => setFormDescription(e.target.value)}
              placeholder="Form description"
            />
          </div>
          {!isEditing && (
            <div>
              <Label htmlFor="project-select">Project</Label>
              <select
                id="project-select"
                className="w-full px-3 py-2 border border-input rounded-md bg-background"
                value={selectedProject}
                onChange={(e) => setSelectedProject(e.target.value)}
              >
                <option value="">Select a project</option>
                {projects?.map((project) => (
                  <option key={project.id} value={project.id}>
                    {project.name}
                  </option>
                ))}
              </select>
            </div>
          )}
        </div>
      </div>

      {/* Form Builder Interface */}
      <DndContext onDragEnd={handleDragEnd} onDragOver={handleDragOver}>
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Toolbox */}
          <div className="lg:col-span-1">
            <FormBuilderToolbox />
          </div>

          {/* Canvas */}
          <div className="lg:col-span-2">
            <FormCanvas
              fields={fields}
              selectedFieldId={selectedFieldId}
              onFieldSelect={setSelectedFieldId}
              onFieldsChange={setFields}
              onPreview={handlePreview}
              onSave={handleSave}
            />
          </div>

          {/* Properties Panel */}
          <div className="lg:col-span-1">
            <PropertiesPanel
              selectedField={selectedField}
              onFieldUpdate={(updates) => {
                if (selectedFieldId) {
                  handleFieldUpdate(selectedFieldId, updates);
                }
              }}
            />
          </div>
        </div>
      </DndContext>

      {/* Save Button */}
      <div className="flex justify-end">
        <Button
          onClick={handleSave}
          disabled={saveFormMutation.isPending}
          className="px-8"
        >
          {saveFormMutation.isPending ? "Saving..." : isEditing ? "Update Form" : "Save Form"}
        </Button>
      </div>
    </div>
  );
}
