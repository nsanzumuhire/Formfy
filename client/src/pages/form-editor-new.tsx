import { useState } from "react";
import { useRoute } from "wouter";
import { useProject } from "@/hooks/useProject";
import { useToast } from "@/hooks/use-toast";
import { FormsList } from "@/components/form-editor/FormsList";
import { FormCanvas } from "@/components/form-editor/FormCanvas";
import { FormPreview } from "@/components/form-editor/FormPreview";
import { SaveFormDialog } from "@/components/form-editor/SaveFormDialog";
import { useFormEditor } from "@/hooks/useFormEditor";

export default function FormEditor() {
  const [, params] = useRoute("/form-editor/:projectId?");
  const projectId = params?.projectId;
  const { selectedProject } = useProject();
  const { toast } = useToast();

  const currentProjectId = projectId || selectedProject;

  // UI state
  const [searchTerm, setSearchTerm] = useState("");
  const [showFormsList, setShowFormsList] = useState(true);
  const [showPropertiesPanel, setShowPropertiesPanel] = useState(false);
  const [showSaveDialog, setShowSaveDialog] = useState(false);

  // Use the form editor hook for all form logic
  const {
    formFields,
    selectedFieldId,
    isPreviewMode,
    editingFormId,
    formConfig,
    project,
    forms,
    setFormFields,
    setSelectedFieldId,
    setIsPreviewMode,
    setFormConfig,
    handleDragEnd,
    loadForm,
    resetForm,
    createFormMutation,
    updateFormMutation,
  } = useFormEditor({ projectId: currentProjectId });

  // Filter forms based on search
  const filteredForms = forms.filter((form) =>
    form.name.toLowerCase().includes(searchTerm.toLowerCase()),
  );

  // Handle form actions
  const handleCreateForm = () => {
    resetForm();
    setShowFormsList(false);
  };

  const handleEditForm = (form: any) => {
    loadForm(form);
    setShowFormsList(false);
  };

  const handleDeleteForm = (form: any) => {
    // Add delete confirmation logic here
    console.log("Delete form:", form);
  };

  const handleCopyForm = (form: any) => {
    // Add copy form logic here
    console.log("Copy form:", form);
  };

  const handleCopyLink = (form: any) => {
    const publicUrl = `${window.location.origin}/form/${currentProjectId}/${form.name.trim().toLowerCase().replace(/\s+/g, "-")}`;
    navigator.clipboard.writeText(publicUrl);
    toast({ description: "Form URL copied to clipboard!" });
  };

  const handleSave = () => {
    if (formFields.length === 0) {
      toast({
        title: "No fields to save",
        description: "Add some fields to your form before saving.",
        variant: "destructive",
      });
      return;
    }
    setShowSaveDialog(true);
  };

  const handleSaveForm = (data: { name: string; description?: string }) => {
    if (editingFormId) {
      updateFormMutation.mutate({
        id: editingFormId,
        name: data.name,
        description: data.description,
      });
    } else {
      createFormMutation.mutate({
        name: data.name,
        description: data.description,
        projectId: currentProjectId,
      });
    }
    setShowSaveDialog(false);
  };

  const handlePreview = () => {
    if (formFields.length === 0) {
      toast({
        title: "No fields to preview",
        description: "Add some fields to your form before previewing.",
        variant: "destructive",
      });
      return;
    }
    setIsPreviewMode(true);
  };

  if (!currentProjectId) {
    return (
      <div className="flex items-center justify-center h-screen">
        <p className="text-gray-500">Please select a project to continue.</p>
      </div>
    );
  }

  return (
    <div className="flex h-screen bg-gray-50 dark:bg-gray-900">
      {/* Forms List Sidebar */}
      {showFormsList && (
        <div className="w-80 border-r border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800">
          <FormsList
            forms={filteredForms}
            searchTerm={searchTerm}
            onSearchChange={setSearchTerm}
            onCreateForm={handleCreateForm}
            onEditForm={handleEditForm}
            onDeleteForm={handleDeleteForm}
            onCopyForm={handleCopyForm}
            onCopyLink={handleCopyLink}
            projectId={currentProjectId}
          />
        </div>
      )}

      {/* Main Canvas Area */}
      <div className="flex-1 flex flex-col">
        {/* Top Toolbar */}
        <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800">
          <div className="flex items-center gap-2">
            {/* Toggle Forms List Button */}
            <button
              onClick={() => setShowFormsList(!showFormsList)}
              className="px-3 py-1 text-sm border rounded hover:bg-gray-50 dark:hover:bg-gray-700"
            >
              {showFormsList ? "Hide" : "Show"} Forms
            </button>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handlePreview}
              className="px-3 py-1 text-sm border rounded hover:bg-gray-50 dark:hover:bg-gray-700"
            >
              Preview
            </button>
            <button
              onClick={handleSave}
              disabled={formFields.length === 0}
              className="px-3 py-1 text-sm bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50"
            >
              Save Form
            </button>
          </div>
        </div>

        {/* Canvas */}
        <FormCanvas
          fields={formFields}
          selectedFieldId={selectedFieldId}
          formConfig={formConfig}
          onFieldsChange={setFormFields}
          onFieldSelect={setSelectedFieldId}
          onConfigChange={setFormConfig}
          onDragEnd={handleDragEnd}
        />
      </div>

      {/* Preview Modal */}
      <FormPreview
        fields={formFields}
        formConfig={formConfig}
        isOpen={isPreviewMode}
        onClose={() => setIsPreviewMode(false)}
      />

      {/* Save Dialog */}
      <SaveFormDialog
        isOpen={showSaveDialog}
        onClose={() => setShowSaveDialog(false)}
        onSave={handleSaveForm}
        isLoading={createFormMutation.isPending || updateFormMutation.isPending}
      />
    </div>
  );
}