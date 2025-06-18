import { useState } from "react";
import { useDraggable } from "@dnd-kit/core";
import {
  Type,
  Hash,
  CheckSquare,
  Circle,
  ChevronDown,
  Calendar,
  Phone,
  Upload,
  PanelRightOpen,
  AlignLeft,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export type FieldType = "text" | "email" | "number" | "checkbox" | "radio" | "select" | "textarea" | "date" | "tel" | "url" | "file";

interface FieldDefinition {
  type: FieldType;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
}

const fieldTypes: FieldDefinition[] = [
  { type: "text", label: "Text Input", icon: Type },
  { type: "email", label: "Email", icon: Type },
  { type: "number", label: "Number", icon: Hash },
  { type: "textarea", label: "Textarea", icon: AlignLeft },
  { type: "select", label: "Select", icon: ChevronDown },
  { type: "radio", label: "Radio", icon: Circle },
  { type: "checkbox", label: "Checkbox", icon: CheckSquare },
  { type: "date", label: "Date", icon: Calendar },
  { type: "tel", label: "Phone", icon: Phone },
  { type: "url", label: "URL", icon: Type },
  { type: "file", label: "File Upload", icon: Upload },
];

interface DraggableFieldProps {
  field: FieldDefinition;
}

function DraggableField({ field }: DraggableFieldProps) {
  const { attributes, listeners, setNodeRef, transform } = useDraggable({
    id: `field-${field.type}`,
    data: { fieldType: field.type },
  });

  const style = transform
    ? {
        transform: `translate3d(${transform.x}px, ${transform.y}px, 0)`,
      }
    : undefined;

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...listeners}
      {...attributes}
      className="p-3 border border-gray-200 dark:border-gray-700 rounded-lg cursor-grab hover:bg-gray-50 dark:hover:bg-gray-800 flex items-center gap-3 transition-colors"
    >
      <field.icon className="w-4 h-4 text-gray-600 dark:text-gray-400" />
      <span className="text-sm font-medium">{field.label}</span>
    </div>
  );
}

interface FormToolboxProps {
  isExpanded: boolean;
  onToggle: () => void;
}

export function FormToolbox({ isExpanded, onToggle }: FormToolboxProps) {
  return (
    <div className="flex flex-col h-full">
      <div className="p-4 border-b border-gray-200 dark:border-gray-700">
        <div className="flex items-center justify-between">
          {isExpanded && <h3 className="font-semibold">Form Fields</h3>}
          <Button
            variant="ghost"
            size="sm"
            onClick={onToggle}
            className="p-1"
          >
            <PanelRightOpen className={`w-4 h-4 transition-transform ${!isExpanded ? 'rotate-180' : ''}`} />
          </Button>
        </div>
      </div>

      {isExpanded && (
        <div className="flex-1 overflow-y-auto p-4">
          <div className="space-y-2">
            {fieldTypes.map((field) => (
              <DraggableField key={field.type} field={field} />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}