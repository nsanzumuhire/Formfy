import { useState, useCallback } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { DragEndEvent } from "@dnd-kit/core";
import { arrayMove } from "@dnd-kit/sortable";
import { FormFieldData, generateFieldId, createFormField } from "@/lib/form-builder";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { Form, Project } from "@shared/schema";

interface UseFormEditorProps {
  projectId: string;
}

export function useFormEditor({ projectId }: UseFormEditorProps) {
  const [formFields, setFormFields] = useState<FormFieldData[]>([]);
  const [selectedFieldId, setSelectedFieldId] = useState<string | null>(null);
  const [isPreviewMode, setIsPreviewMode] = useState(false);
  const [editingFormId, setEditingFormId] = useState<string | null>(null);
  
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

  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Fetch project details
  const { data: project } = useQuery<Project>({
    queryKey: [`/api/projects/${projectId}`],
    enabled: !!projectId,
  });

  // Fetch forms
  const { data: forms = [] } = useQuery<Form[]>({
    queryKey: [`/api/projects/${projectId}/forms`],
    enabled: !!projectId,
  });

  // Handle drag end
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
        queryKey: [`/api/projects/${projectId}/forms`],
      });
      
      // Reset form state
      setFormFields([]);
      setSelectedFieldId(null);
      setEditingFormId(null);

      toast({
        title: "Form created successfully",
        description: "Form has been saved successfully",
      });
    },
    onError: (error) => {
      toast({
        title: "Error creating form",
        description: error.message,
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
    }) => {
      return await apiRequest(
        `/api/forms/${formData.id}`,
        "PATCH",
        {
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
        },
      );
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: [`/api/projects/${projectId}/forms`],
      });
      toast({
        title: "Form updated successfully",
      });
    },
    onError: (error) => {
      toast({
        title: "Error updating form",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  // Load form for editing
  const loadForm = useCallback((form: Form) => {
    setEditingFormId(form.id);
    const schema = form.schema as any;
    if (schema?.fields) {
      setFormFields(schema.fields);
    }
    if (schema?.settings) {
      setFormConfig(prev => ({ ...prev, ...schema.settings }));
    }
  }, []);

  // Reset form state
  const resetForm = useCallback(() => {
    setFormFields([]);
    setSelectedFieldId(null);
    setEditingFormId(null);
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
  }, []);

  return {
    // State
    formFields,
    selectedFieldId,
    isPreviewMode,
    editingFormId,
    formConfig,
    project,
    forms,
    
    // Actions
    setFormFields,
    setSelectedFieldId,
    setIsPreviewMode,
    setFormConfig,
    handleDragEnd,
    loadForm,
    resetForm,
    
    // Mutations
    createFormMutation,
    updateFormMutation,
  };
}