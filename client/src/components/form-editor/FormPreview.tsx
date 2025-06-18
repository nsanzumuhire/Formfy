import { useState } from "react";
import { X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { FormFieldData, shouldShowField, shouldEnableField } from "@/lib/form-builder";

interface FormPreviewProps {
  fields: FormFieldData[];
  formConfig: any;
  isOpen: boolean;
  onClose: () => void;
}

export function FormPreview({ fields, formConfig, isOpen, onClose }: FormPreviewProps) {
  const [formData, setFormData] = useState<Record<string, any>>({});

  if (!isOpen) return null;

  const handleFieldChange = (fieldId: string, value: any) => {
    setFormData(prev => ({ ...prev, [fieldId]: value }));
  };

  const getButtonLayoutClass = () => {
    switch (formConfig.buttonLayout) {
      case "left": return "justify-start";
      case "center": return "justify-center";
      case "right": return "justify-end";
      case "justify": return "justify-between";
      case "split": return "justify-between";
      default: return "justify-end";
    }
  };

  const renderField = (field: FormFieldData) => {
    const isVisible = shouldShowField(field, formData, fields);
    const isEnabled = shouldEnableField(field, formData, fields);

    if (!isVisible) return null;

    const fieldProps = {
      disabled: !isEnabled,
      required: field.required,
    };

    return (
      <div key={field.id} className="space-y-2">
        {formConfig.showLabels && (
          <Label htmlFor={field.id} className="text-sm font-medium">
            {field.label}
            {field.required && <span className="text-red-500 ml-1">*</span>}
          </Label>
        )}
        
        {field.description && (
          <p className="text-xs text-gray-600 dark:text-gray-400">
            {field.description}
          </p>
        )}

        {field.type === "text" || field.type === "email" || field.type === "number" || field.type === "tel" || field.type === "url" ? (
          <Input
            id={field.id}
            type={field.type}
            placeholder={field.placeholder}
            value={formData[field.id] || ""}
            onChange={(e) => handleFieldChange(field.id, e.target.value)}
            {...fieldProps}
          />
        ) : field.type === "textarea" ? (
          <Textarea
            id={field.id}
            placeholder={field.placeholder}
            value={formData[field.id] || ""}
            onChange={(e) => handleFieldChange(field.id, e.target.value)}
            rows={3}
            {...fieldProps}
          />
        ) : field.type === "date" ? (
          <Input
            id={field.id}
            type="date"
            value={formData[field.id] || ""}
            onChange={(e) => handleFieldChange(field.id, e.target.value)}
            {...fieldProps}
          />
        ) : field.type === "file" ? (
          <Input
            id={field.id}
            type="file"
            onChange={(e) => handleFieldChange(field.id, e.target.files?.[0])}
            {...fieldProps}
          />
        ) : field.type === "checkbox" ? (
          <div className="flex items-center space-x-2">
            <Checkbox
              id={field.id}
              checked={formData[field.id] || false}
              onCheckedChange={(checked) => handleFieldChange(field.id, checked)}
              {...fieldProps}
            />
            <Label htmlFor={field.id} className="text-sm">
              {field.placeholder}
            </Label>
          </div>
        ) : field.type === "radio" ? (
          <RadioGroup
            value={formData[field.id] || ""}
            onValueChange={(value) => handleFieldChange(field.id, value)}
            className={field.layout === "horizontal" ? "flex flex-wrap gap-4" : "space-y-2"}
            {...fieldProps}
          >
            {(field.options || []).map((option: any, index: number) => (
              <div key={index} className="flex items-center space-x-2">
                <RadioGroupItem value={option.value} id={`${field.id}-${index}`} />
                <Label htmlFor={`${field.id}-${index}`} className="text-sm">
                  {option.label}
                </Label>
              </div>
            ))}
          </RadioGroup>
        ) : field.type === "select" ? (
          <Select
            value={formData[field.id] || ""}
            onValueChange={(value) => handleFieldChange(field.id, value)}
            {...fieldProps}
          >
            <SelectTrigger>
              <SelectValue placeholder={field.placeholder} />
            </SelectTrigger>
            <SelectContent>
              {(field.options || []).map((option: any, index: number) => (
                <SelectItem key={index} value={option.value}>
                  {option.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        ) : null}
      </div>
    );
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4">
      <div className="bg-white dark:bg-gray-800 rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-4 border-b">
          <h2 className="text-lg font-semibold">Form Preview</h2>
          <Button variant="ghost" size="sm" onClick={onClose}>
            <X className="w-4 h-4" />
          </Button>
        </div>
        
        <div className="p-6">
          <Card>
            <CardHeader>
              <CardTitle>Preview Form</CardTitle>
            </CardHeader>
            <CardContent>
              <form className="space-y-6">
                {fields
                  .sort((a, b) => a.order - b.order)
                  .map(renderField)}

                <div className={`flex gap-4 ${getButtonLayoutClass()}`}>
                  {formConfig.showCancelButton && formConfig.buttonLayout === "split" && (
                    <Button type="button" variant="outline">
                      {formConfig.cancelButtonText}
                    </Button>
                  )}
                  
                  <Button type="submit" style={{ backgroundColor: formConfig.submitButtonColor }}>
                    {formConfig.submitButtonText}
                  </Button>
                  
                  {formConfig.showCancelButton && formConfig.buttonLayout !== "split" && (
                    <Button type="button" variant="outline" style={{ borderColor: formConfig.cancelButtonColor }}>
                      {formConfig.cancelButtonText}
                    </Button>
                  )}
                </div>
              </form>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}