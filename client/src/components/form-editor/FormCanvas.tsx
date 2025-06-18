
import { DndContext, useSensors, DragEndEvent } from "@dnd-kit/core";
import { SortableContext, verticalListSortingStrategy } from "@dnd-kit/sortable";
import { Grip } from "lucide-react";
import { FormPreview } from "./FormPreview";
import { FormEditMode } from "./FormEditMode";
import { organizeFieldsIntoRows } from "@/lib/form-builder";

interface FormCanvasProps {
  formFields: any[];
  setFormFields: (fields: any[] | ((fields: any[]) => any[])) => void;
  selectedFieldId: string | null;
  onFieldSelect: (fieldId: string) => void;
  isPreviewMode: boolean;
  formConfig: any;
  sensors: any;
  onDragEnd: (event: DragEndEvent) => void;
}

export function FormCanvas({
  formFields,
  setFormFields,
  selectedFieldId,
  onFieldSelect,
  isPreviewMode,
  formConfig,
  sensors,
  onDragEnd,
}: FormCanvasProps) {
  const getSpacingValue = () => {
    if (formConfig.spacing === "custom") {
      return `${formConfig.customSpacing}px`;
    }
    return formConfig.spacing;
  };

  return (
    <div className="flex-1 bg-gray-100 dark:bg-gray-900 p-4">
      <div className="w-full">
        <div className="bg-white dark:bg-gray-950 rounded-lg shadow-sm border border-gray-200 dark:border-gray-800 min-h-[500px] p-6">
          {isPreviewMode ? (
            <FormPreview
              formFields={formFields}
              formConfig={formConfig}
              getSpacingValue={getSpacingValue}
            />
          ) : formFields.length === 0 ? (
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
            <DndContext
              sensors={sensors}
              collisionDetection={() => null}
              onDragEnd={onDragEnd}
            >
              <SortableContext
                items={formFields.map((f) => f.id)}
                strategy={verticalListSortingStrategy}
              >
                <FormEditMode
                  formFields={formFields}
                  setFormFields={setFormFields}
                  selectedFieldId={selectedFieldId}
                  onFieldSelect={onFieldSelect}
                  formConfig={formConfig}
                  getSpacingValue={getSpacingValue}
                />
              </SortableContext>
            </DndContext>
          )}
        </div>
      </div>
    </div>
  );
}
