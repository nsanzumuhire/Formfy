import { useDraggable } from "@dnd-kit/core";
import { CSS } from "@dnd-kit/utilities";
import { cn } from "@/lib/utils";
import {
  Type,
  Mail,
  Hash,
  CheckSquare,
  Circle,
  ChevronDown,
} from "lucide-react";
import { Card, CardHeader, CardContent } from "@/components/ui/card";

export type FieldType = "text" | "email" | "number" | "checkbox" | "radio" | "select";

interface FieldDefinition {
  type: FieldType;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
}

const fieldTypes: FieldDefinition[] = [
  {
    type: "text",
    label: "Text Input",
    icon: Type,
  },
  {
    type: "email",
    label: "Email Input",
    icon: Mail,
  },
  {
    type: "number",
    label: "Number Input",
    icon: Hash,
  },
  {
    type: "checkbox",
    label: "Checkbox",
    icon: CheckSquare,
  },
  {
    type: "radio",
    label: "Radio Button",
    icon: Circle,
  },
  {
    type: "select",
    label: "Select Dropdown",
    icon: ChevronDown,
  },
];

interface DraggableFieldProps {
  field: FieldDefinition;
}

function DraggableField({ field }: DraggableFieldProps) {
  const { attributes, listeners, setNodeRef, transform, isDragging } = useDraggable({
    id: `field-${field.type}`,
    data: {
      type: "field",
      fieldType: field.type,
    },
  });

  const style = {
    transform: CSS.Translate.toString(transform),
  };

  const Icon = field.icon;

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...listeners}
      {...attributes}
      className={cn(
        "p-3 border rounded-md hover:border-primary hover:bg-primary/5 cursor-grab transition-colors",
        isDragging && "opacity-50"
      )}
    >
      <div className="flex items-center">
        <Icon className="h-4 w-4 text-muted-foreground mr-3" />
        <span className="text-sm font-medium">{field.label}</span>
      </div>
    </div>
  );
}

export function FormBuilderToolbox() {
  return (
    <Card>
      <CardHeader>
        <h3 className="text-lg font-medium">Form Elements</h3>
        <p className="text-sm text-muted-foreground">
          Drag elements to build your form
        </p>
      </CardHeader>
      <CardContent className="space-y-3">
        {fieldTypes.map((field) => (
          <DraggableField key={field.type} field={field} />
        ))}
      </CardContent>
    </Card>
  );
}
