import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { Trash2, Grip } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { Select, SelectTrigger, SelectValue } from "@/components/ui/select";
import { FormFieldData } from "@/lib/form-builder";

interface SortableFormFieldProps {
  field: FormFieldData;
  isSelected: boolean;
  onSelect: () => void;
  onUpdate: (updates: Partial<FormFieldData>) => void;
  onDelete: () => void;
}

export function SortableFormField({
  field,
  isSelected,
  onSelect,
  onUpdate,
  onDelete,
}: SortableFormFieldProps) {
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
      case "email":
      case "password":
      case "number":
      case "tel":
      case "url":
        return (
          <Input
            type={field.type}
            placeholder={field.placeholder}
            disabled
            className="bg-gray-50 dark:bg-gray-900"
          />
        );
      case "textarea":
        return (
          <Textarea
            placeholder={field.placeholder}
            disabled
            className="bg-gray-50 dark:bg-gray-900 resize-none"
            rows={3}
          />
        );
      case "date":
        return (
          <Input
            type="date"
            disabled
            className="bg-gray-50 dark:bg-gray-900 [&::-webkit-calendar-picker-indicator]:ml-auto [&::-webkit-calendar-picker-indicator]:cursor-pointer"
          />
        );
      case "file":
        return (
          <div className="space-y-1">
            <Input
              type="file"
              accept={field.fileTypes?.length 
                ? field.fileTypes.map(type => `.${type.toLowerCase()}`).join(',')
                : undefined}
              disabled
              className="bg-gray-50 dark:bg-gray-900"
            />
            {(field.fileTypes?.length || field.maxFileSize || field.minFileSize) && (
              <div className="text-xs text-gray-500 dark:text-gray-400 space-y-1">
                {field.fileTypes?.length && (
                  <div>Allowed types: {field.fileTypes.join(', ')}</div>
                )}
                {(field.minFileSize || field.maxFileSize) && (
                  <div>
                    Size: {field.minFileSize ? `${field.minFileSize}MB min` : ''}{field.minFileSize && field.maxFileSize ? ', ' : ''}{field.maxFileSize ? `${field.maxFileSize}MB max` : ''}
                  </div>
                )}
              </div>
            )}
          </div>
        );
      case "checkbox":
        return (
          <div className="flex items-center space-x-2">
            <Checkbox 
              className="pointer-events-none opacity-100"
              checked={false}
            />
            <span className="text-sm text-gray-600 dark:text-gray-400">
              {field.checkboxLabel || "Check this option"}
            </span>
          </div>
        );
      case "radio":
        return (
          <RadioGroup 
            disabled 
            className={
              field.layout === "horizontal"
                ? "flex flex-wrap gap-4"
                : "space-y-2"
            }
          >
            {(field.options || [
              { label: "Option 1", value: "option1" },
              { label: "Option 2", value: "option2" }
            ]).map((option: any, index: number) => (
              <div key={index} className="flex items-center space-x-2">
                <RadioGroupItem 
                  value={option.value} 
                  id={`radio-${field.id}-${index}`}
                  disabled 
                />
                <Label 
                  htmlFor={`radio-${field.id}-${index}`}
                  className="text-sm text-gray-600 dark:text-gray-400"
                >
                  {option.label}
                </Label>
              </div>
            ))}
          </RadioGroup>
        );
      case "select":
        return (
          <Select disabled>
            <SelectTrigger className="bg-gray-50 dark:bg-gray-900">
              <SelectValue placeholder={field.placeholder} />
            </SelectTrigger>
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
      className={`
        group relative p-4 bg-white dark:bg-gray-800 border-2 rounded-lg transition-all
        ${isSelected ? "border-blue-500 ring-2 ring-blue-500/20" : "border-gray-200 dark:border-gray-700"}
        ${isDragging ? "opacity-50" : ""}
        hover:border-gray-300 dark:hover:border-gray-600
      `}
      onClick={onSelect}
    >
      {/* Field Header */}
      <div className="flex items-center justify-between mb-2">
        <div className="flex-1">
          <label className={`block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1 ${field.type === "checkbox" && field.showTopLabel === false ? "sr-only" : ""}`}>
            {field.label}
            {field.required && <span className="text-red-500 ml-1">*</span>}
          </label>
        </div>
        
        {/* Field Controls */}
        <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              onDelete();
            }}
            className="p-1 hover:bg-gray-100 dark:hover:bg-gray-700 rounded"
          >
            <Trash2 className="w-3 h-3 text-gray-400 hover:text-red-600" />
          </button>
          <button
            type="button"
            className="p-1 hover:bg-gray-100 dark:hover:bg-gray-700 rounded cursor-grab"
            {...attributes}
            {...listeners}
          >
            <Grip className="w-3 h-3 text-gray-400" />
          </button>
        </div>
      </div>

      {/* Field Description */}
      {field.description && (
        <p className="text-xs text-gray-500 dark:text-gray-400 mb-2">
          {field.description}
        </p>
      )}

      {/* Field Input */}
      {renderFieldInput()}
    </div>
  );
}