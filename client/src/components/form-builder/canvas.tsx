import { useDroppable } from "@dnd-kit/core";
import {
  SortableContext,
  verticalListSortingStrategy,
  arrayMove,
} from "@dnd-kit/sortable";
import { cn } from "@/lib/utils";
import { MousePointer2 } from "lucide-react";
import { Card, CardHeader, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { FormField } from "./form-field";
import type { FormFieldData } from "@/lib/form-builder";

interface FormCanvasProps {
  fields: FormFieldData[];
  selectedFieldId: string | null;
  onFieldSelect: (fieldId: string | null) => void;
  onFieldsChange: (fields: FormFieldData[]) => void;
  onPreview: () => void;
  onSave: () => void;
}

export function FormCanvas({
  fields,
  selectedFieldId,
  onFieldSelect,
  onFieldsChange,
  onPreview,
  onSave,
}: FormCanvasProps) {
  const { setNodeRef, isOver } = useDroppable({
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

  const handleDragEnd = (event: any) => {
    const { active, over } = event;
    
    if (active.id !== over.id) {
      const oldIndex = fields.findIndex((field) => field.id === active.id);
      const newIndex = fields.findIndex((field) => field.id === over.id);
      
      onFieldsChange(arrayMove(fields, oldIndex, newIndex));
    }
  };

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <div>
          <h3 className="text-lg font-medium">Form Canvas</h3>
          <p className="text-sm text-muted-foreground">
            Drop elements here to build your form
          </p>
        </div>
        <div className="flex space-x-2">
          <Button variant="outline" size="sm" onClick={onPreview}>
            <MousePointer2 className="h-4 w-4 mr-2" />
            Preview
          </Button>
          <Button size="sm" onClick={onSave}>
            Save
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        <div
          ref={setNodeRef}
          className={cn(
            "border-2 border-dashed rounded-lg p-8 min-h-96 transition-colors",
            isOver ? "border-primary bg-primary/5" : "border-muted-foreground/25",
            fields.length === 0 && "flex items-center justify-center"
          )}
        >
          {fields.length === 0 ? (
            <div className="text-center text-muted-foreground">
              <MousePointer2 className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p className="text-lg font-medium mb-2">Start building your form</p>
              <p className="text-sm">
                Drag form elements from the left panel to get started
              </p>
            </div>
          ) : (
            <SortableContext
              items={fields.map((field) => field.id)}
              strategy={verticalListSortingStrategy}
            >
              <div className="space-y-4">
                {fields.map((field) => (
                  <FormField
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
      </CardContent>
    </Card>
  );
}
