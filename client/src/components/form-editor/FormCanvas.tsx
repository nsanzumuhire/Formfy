import { useState } from "react";
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
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { FormFieldData } from "@/lib/form-builder";
import { FormToolbox } from "./FormToolbox";
import { SortableFormField } from "./SortableFormField";
import { FormSettings } from "./FormSettings";

interface FormCanvasProps {
  fields: FormFieldData[];
  selectedFieldId: string | null;
  formConfig: any;
  onFieldsChange: (fields: FormFieldData[]) => void;
  onFieldSelect: (fieldId: string | null) => void;
  onConfigChange: (config: any) => void;
  onDragEnd: (event: DragEndEvent) => void;
}

export function FormCanvas({
  fields,
  selectedFieldId,
  formConfig,
  onFieldsChange,
  onFieldSelect,
  onConfigChange,
  onDragEnd,
}: FormCanvasProps) {
  const [isToolboxExpanded, setIsToolboxExpanded] = useState(true);

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    }),
  );

  const { setNodeRef } = useDroppable({
    id: "form-canvas",
  });

  const handleFieldUpdate = (fieldId: string, updates: Partial<FormFieldData>) => {
    const updatedFields = fields.map((field) =>
      field.id === fieldId ? { ...field, ...updates } : field
    );
    onFieldsChange(updatedFields);
  };

  const handleFieldDelete = (fieldId: string) => {
    const updatedFields = fields.filter((field) => field.id !== fieldId);
    onFieldsChange(updatedFields);
    if (selectedFieldId === fieldId) {
      onFieldSelect(null);
    }
  };

  return (
    <div className="flex h-full">
      {/* Toolbox */}
      <div
        className={`${
          isToolboxExpanded ? "w-64" : "w-12"
        } transition-all duration-200 border-r border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800`}
      >
        <FormToolbox
          isExpanded={isToolboxExpanded}
          onToggle={() => setIsToolboxExpanded(!isToolboxExpanded)}
        />
      </div>

      {/* Canvas */}
      <div className="flex-1 flex flex-col">
        {/* Form Settings */}
        <div className="border-b border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 p-4">
          <FormSettings
            config={formConfig}
            onChange={onConfigChange}
          />
        </div>

        {/* Canvas Area */}
        <div className="flex-1 overflow-auto p-6 bg-gray-50 dark:bg-gray-900">
          <div className="max-w-4xl mx-auto">
            <DndContext
              sensors={sensors}
              collisionDetection={closestCenter}
              onDragEnd={onDragEnd}
            >
              <div
                ref={setNodeRef}
                className="min-h-96 bg-white dark:bg-gray-800 rounded-lg border-2 border-dashed border-gray-300 dark:border-gray-600 p-6"
              >
                {fields.length === 0 ? (
                  <div className="text-center py-12 text-gray-500 dark:text-gray-400">
                    <p className="text-lg mb-2">Start building your form</p>
                    <p className="text-sm">Drag fields from the toolbox to get started</p>
                  </div>
                ) : (
                  <SortableContext
                    items={fields.map((field) => field.id)}
                    strategy={verticalListSortingStrategy}
                  >
                    <div className="space-y-4">
                      {fields
                        .sort((a, b) => a.order - b.order)
                        .map((field) => (
                          <SortableFormField
                            key={field.id}
                            field={field}
                            isSelected={selectedFieldId === field.id}
                            onSelect={() => onFieldSelect(field.id)}
                            onUpdate={(updates) => handleFieldUpdate(field.id, updates)}
                            onDelete={() => handleFieldDelete(field.id)}
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
  );
}