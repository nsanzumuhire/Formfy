import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { cn } from "@/lib/utils";
import { GripVertical, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import type { FormFieldData } from "@/lib/form-builder";

interface FormFieldProps {
  field: FormFieldData;
  isSelected: boolean;
  onSelect: () => void;
  onUpdate: (updates: Partial<FormFieldData>) => void;
  onDelete: () => void;
}

export function FormField({ field, isSelected, onSelect, onUpdate, onDelete }: FormFieldProps) {
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
  };

  const renderFieldInput = () => {
    switch (field.type) {
      case "text":
        return (
          <Input
            type="text"
            placeholder={field.placeholder}
            disabled
          />
        );
      case "email":
        return (
          <Input
            type="email"
            placeholder={field.placeholder}
            disabled
          />
        );
      case "password":
        return (
          <Input
            type="password"
            placeholder={field.placeholder}
            disabled
          />
        );
      case "number":
        return (
          <Input
            type="number"
            placeholder={field.placeholder}
            disabled
          />
        );
      case "checkbox":
        return (
          <div className="flex items-center space-x-2">
            <Checkbox disabled />
            <Label className="text-sm">{field.label}</Label>
          </div>
        );
      case "radio":
        return (
          <RadioGroup disabled>
            {(field.options || []).map((option) => (
              <div key={option.value} className="flex items-center space-x-2">
                <RadioGroupItem value={option.value} />
                <Label className="text-sm">{option.label}</Label>
              </div>
            ))}
          </RadioGroup>
        );
      case "select":
        return (
          <Select disabled>
            <SelectTrigger>
              <SelectValue placeholder={field.placeholder} />
            </SelectTrigger>
            <SelectContent>
              {(field.options || []).map((option) => (
                <SelectItem key={option.value} value={option.value}>
                  {option.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        );
      default:
        return null;
    }
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={cn(
        "bg-card border rounded-md p-4 relative group transition-colors",
        isSelected && "border-primary bg-primary/5",
        isDragging && "opacity-50"
      )}
      onClick={onSelect}
    >
      {/* Drag Handle */}
      <div
        {...attributes}
        {...listeners}
        className="absolute -left-3 top-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 transition-opacity cursor-grab"
      >
        <div className="bg-background border rounded p-1">
          <GripVertical className="h-4 w-4" />
        </div>
      </div>

      {/* Delete Button */}
      <Button
        variant="outline"
        size="sm"
        className="absolute -right-3 -top-3 opacity-0 group-hover:opacity-100 transition-opacity hover:bg-destructive hover:text-destructive-foreground"
        onClick={(e) => {
          e.stopPropagation();
          onDelete();
        }}
      >
        <Trash2 className="h-4 w-4" />
      </Button>

      <div className="space-y-2">
        {field.type !== "checkbox" && (
          <Label className="text-sm font-medium">
            {field.label}
            {field.validation?.some(rule => rule.type === 'required') && (
              <span className="text-destructive ml-1">*</span>
            )}
          </Label>
        )}
        
        {field.description && (
          <p className="text-xs text-muted-foreground">{field.description}</p>
        )}
        
        {renderFieldInput()}
      </div>
    </div>
  );
}
