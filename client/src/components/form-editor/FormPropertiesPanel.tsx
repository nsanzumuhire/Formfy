
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

interface FormPropertiesPanelProps {
  formFields: any[];
  setFormFields: (fields: any[] | ((fields: any[]) => any[])) => void;
  selectedFieldId: string;
  onClose: () => void;
}

export function FormPropertiesPanel({
  formFields,
  setFormFields,
  selectedFieldId,
  onClose,
}: FormPropertiesPanelProps) {
  const selectedField = formFields.find((f) => f.id === selectedFieldId);
  
  if (!selectedField) return null;

  const updateField = (updates: any) => {
    setFormFields((fields) =>
      fields.map((f) =>
        f.id === selectedFieldId ? { ...f, ...updates } : f
      )
    );
  };

  return (
    <div className="w-64 border-l border-gray-200 dark:border-gray-800 bg-gray-50 dark:bg-gray-900 p-4">
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-semibold text-gray-900 dark:text-gray-100">
          Field Properties
        </h3>
        <Button variant="ghost" size="sm" onClick={onClose}>
          ×
        </Button>
      </div>

      <div className="space-y-6 max-h-[calc(100vh-200px)] overflow-y-auto">
        {/* Basic Properties */}
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <Label className="text-xs font-medium">Field Name</Label>
              <Input
                value={selectedField.name || ""}
                onChange={(e) => updateField({ name: e.target.value })}
                className="mt-1 h-8 text-xs"
              />
            </div>
            <div>
              <Label className="text-xs font-medium">Test ID</Label>
              <Input
                value={selectedField.testId || ""}
                onChange={(e) => updateField({ testId: e.target.value })}
                className="mt-1 h-8 text-xs"
              />
            </div>
          </div>

          <div>
            <Label className="text-xs font-medium">Label</Label>
            <Input
              value={selectedField.label || ""}
              onChange={(e) => updateField({ label: e.target.value })}
              className="mt-1 h-8 text-xs"
            />
          </div>

          <div>
            <Label className="text-xs font-medium">Placeholder</Label>
            <Input
              value={selectedField.placeholder || ""}
              onChange={(e) => updateField({ placeholder: e.target.value })}
              className="mt-1 h-8 text-xs"
            />
          </div>
        </div>

        {/* Field States */}
        <div className="space-y-3">
          <h4 className="text-sm font-semibold text-gray-900 dark:text-gray-100 border-b pb-2">
            Field States
          </h4>

          <div className="grid grid-cols-2 gap-2">
            <div className="flex items-center space-x-2">
              <Checkbox
                id="required"
                checked={selectedField.required || false}
                onCheckedChange={(checked) => updateField({ required: !!checked })}
              />
              <Label htmlFor="required" className="text-xs cursor-pointer">
                Required
              </Label>
            </div>

            <div className="flex items-center space-x-2">
              <Checkbox
                id="disabled"
                checked={selectedField.disabled || false}
                onCheckedChange={(checked) => updateField({ disabled: !!checked })}
              />
              <Label htmlFor="disabled" className="text-xs cursor-pointer">
                Disabled
              </Label>
            </div>
          </div>
        </div>

        {/* Validation Rules */}
        <div className="space-y-3">
          <h4 className="text-sm font-semibold text-gray-900 dark:text-gray-100 border-b pb-2">
            Validation
          </h4>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <Label className="text-xs font-medium">Min Length</Label>
              <Input
                type="number"
                value={selectedField.validation?.minLength || ""}
                onChange={(e) => {
                  const value = e.target.value ? parseInt(e.target.value) : null;
                  updateField({
                    validation: {
                      ...selectedField.validation,
                      minLength: value,
                    },
                  });
                }}
                className="mt-1 h-8 text-xs"
              />
            </div>
            <div>
              <Label className="text-xs font-medium">Max Length</Label>
              <Input
                type="number"
                value={selectedField.validation?.maxLength || ""}
                onChange={(e) => {
                  const value = e.target.value ? parseInt(e.target.value) : null;
                  updateField({
                    validation: {
                      ...selectedField.validation,
                      maxLength: value,
                    },
                  });
                }}
                className="mt-1 h-8 text-xs"
              />
            </div>
          </div>
        </div>

        {/* Options Management for select/radio */}
        {(selectedField.type === "select" || selectedField.type === "radio") && (
          <div className="space-y-3">
            <h4 className="text-sm font-semibold text-gray-900 dark:text-gray-100 border-b pb-2">
              Options
            </h4>

            <div className="space-y-2">
              <Label className="text-xs font-medium">Static Options</Label>
              {(selectedField.options || []).map((option: any, index: number) => (
                <div key={index} className="flex gap-2">
                  <Input
                    value={option.label}
                    onChange={(e) => {
                      const newOptions = selectedField.options?.map((opt: any, i: number) =>
                        i === index ? { ...opt, label: e.target.value } : opt
                      ) || [];
                      updateField({ options: newOptions });
                    }}
                    className="h-8 text-xs flex-1"
                    placeholder="Label"
                  />
                  <Input
                    value={option.value}
                    onChange={(e) => {
                      const newOptions = selectedField.options?.map((opt: any, i: number) =>
                        i === index ? { ...opt, value: e.target.value } : opt
                      ) || [];
                      updateField({ options: newOptions });
                    }}
                    className="h-8 text-xs flex-1"
                    placeholder="Value"
                  />
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      const newOptions = selectedField.options?.filter(
                        (_: any, i: number) => i !== index
                      ) || [];
                      updateField({ options: newOptions });
                    }}
                    className="h-8 w-8 p-0"
                  >
                    ×
                  </Button>
                </div>
              ))}
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  const newOptions = [
                    ...(selectedField.options || []),
                    { label: "", value: "" },
                  ];
                  updateField({ options: newOptions });
                }}
                className="h-8 text-xs w-full"
              >
                + Add Option
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
