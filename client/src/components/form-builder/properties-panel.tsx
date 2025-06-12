import { Card, CardHeader, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { MousePointer2, Plus, Trash2 } from "lucide-react";
import type { FormFieldData, ValidationRule } from "@/lib/form-builder";

interface PropertiesPanelProps {
  selectedField: FormFieldData | null;
  onFieldUpdate: (updates: Partial<FormFieldData>) => void;
}

export function PropertiesPanel({ selectedField, onFieldUpdate }: PropertiesPanelProps) {
  if (!selectedField) {
    return (
      <Card>
        <CardHeader>
          <h3 className="text-lg font-medium">Properties</h3>
          <p className="text-sm text-muted-foreground">
            Configure selected element
          </p>
        </CardHeader>
        <CardContent>
          <div className="text-center text-muted-foreground py-8">
            <MousePointer2 className="h-8 w-8 mx-auto mb-2" />
            <p className="text-sm">
              Select a form element to configure its properties
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }

  const updateValidation = (rule: ValidationRule) => {
    const existingRules = selectedField.validation || [];
    const ruleIndex = existingRules.findIndex((r) => r.type === rule.type);
    
    let newRules;
    if (ruleIndex >= 0) {
      newRules = [...existingRules];
      newRules[ruleIndex] = rule;
    } else {
      newRules = [...existingRules, rule];
    }
    
    onFieldUpdate({ validation: newRules });
  };

  const removeValidation = (type: string) => {
    const newRules = (selectedField.validation || []).filter((r) => r.type !== type);
    onFieldUpdate({ validation: newRules });
  };

  const addOption = () => {
    const options = selectedField.options || [];
    const newOption = {
      label: `Option ${options.length + 1}`,
      value: `option-${options.length + 1}`,
    };
    onFieldUpdate({ options: [...options, newOption] });
  };

  const updateOption = (index: number, field: 'label' | 'value', value: string) => {
    const options = [...(selectedField.options || [])];
    options[index] = { ...options[index], [field]: value };
    onFieldUpdate({ options });
  };

  const removeOption = (index: number) => {
    const options = (selectedField.options || []).filter((_, i) => i !== index);
    onFieldUpdate({ options });
  };

  const hasValidationRule = (type: string) => {
    return (selectedField.validation || []).some((rule) => rule.type === type);
  };

  return (
    <Card>
      <CardHeader>
        <h3 className="text-lg font-medium">Properties</h3>
        <p className="text-sm text-muted-foreground">
          Configure selected element
        </p>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Basic Properties */}
        <div>
          <Label htmlFor="field-label">Label</Label>
          <Input
            id="field-label"
            value={selectedField.label}
            onChange={(e) => onFieldUpdate({ label: e.target.value })}
            placeholder="Field label"
          />
        </div>

        <div>
          <Label htmlFor="field-placeholder">Placeholder</Label>
          <Input
            id="field-placeholder"
            value={selectedField.placeholder || ""}
            onChange={(e) => onFieldUpdate({ placeholder: e.target.value })}
            placeholder="Field placeholder"
          />
        </div>

        <div>
          <Label htmlFor="field-description">Description</Label>
          <Textarea
            id="field-description"
            value={selectedField.description || ""}
            onChange={(e) => onFieldUpdate({ description: e.target.value })}
            placeholder="Field description (optional)"
            rows={2}
          />
        </div>

        {/* Required Field */}
        <div className="flex items-center space-x-2">
          <Checkbox
            id="required"
            checked={hasValidationRule('required')}
            onCheckedChange={(checked) => {
              if (checked) {
                updateValidation({ type: 'required', message: 'This field is required' });
              } else {
                removeValidation('required');
              }
            }}
          />
          <Label htmlFor="required">Required field</Label>
        </div>

        {/* Options for select/radio fields */}
        {(selectedField.type === 'select' || selectedField.type === 'radio') && (
          <div>
            <div className="flex items-center justify-between mb-2">
              <Label>Options</Label>
              <Button variant="outline" size="sm" onClick={addOption}>
                <Plus className="h-4 w-4 mr-1" />
                Add Option
              </Button>
            </div>
            <div className="space-y-2">
              {(selectedField.options || []).map((option, index) => (
                <div key={index} className="flex items-center space-x-2">
                  <Input
                    value={option.label}
                    onChange={(e) => updateOption(index, 'label', e.target.value)}
                    placeholder="Option label"
                    className="flex-1"
                  />
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => removeOption(index)}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Validation Rules */}
        <div>
          <Label>Validation</Label>
          <div className="space-y-2 mt-2">
            {selectedField.type === 'text' && (
              <>
                <div className="flex items-center space-x-2">
                  <Checkbox
                    checked={hasValidationRule('minLength')}
                    onCheckedChange={(checked) => {
                      if (checked) {
                        updateValidation({ type: 'minLength', value: 1, message: 'Too short' });
                      } else {
                        removeValidation('minLength');
                      }
                    }}
                  />
                  <Label className="text-sm">Minimum length</Label>
                  {hasValidationRule('minLength') && (
                    <Input
                      type="number"
                      className="w-20"
                      value={(selectedField.validation?.find(r => r.type === 'minLength')?.value as number) || 1}
                      onChange={(e) => updateValidation({
                        type: 'minLength',
                        value: parseInt(e.target.value),
                        message: 'Too short'
                      })}
                    />
                  )}
                </div>
                <div className="flex items-center space-x-2">
                  <Checkbox
                    checked={hasValidationRule('maxLength')}
                    onCheckedChange={(checked) => {
                      if (checked) {
                        updateValidation({ type: 'maxLength', value: 100, message: 'Too long' });
                      } else {
                        removeValidation('maxLength');
                      }
                    }}
                  />
                  <Label className="text-sm">Maximum length</Label>
                  {hasValidationRule('maxLength') && (
                    <Input
                      type="number"
                      className="w-20"
                      value={(selectedField.validation?.find(r => r.type === 'maxLength')?.value as number) || 100}
                      onChange={(e) => updateValidation({
                        type: 'maxLength',
                        value: parseInt(e.target.value),
                        message: 'Too long'
                      })}
                    />
                  )}
                </div>
              </>
            )}

            {selectedField.type === 'number' && (
              <>
                <div className="flex items-center space-x-2">
                  <Checkbox
                    checked={hasValidationRule('min')}
                    onCheckedChange={(checked) => {
                      if (checked) {
                        updateValidation({ type: 'min', value: 0, message: 'Too small' });
                      } else {
                        removeValidation('min');
                      }
                    }}
                  />
                  <Label className="text-sm">Minimum value</Label>
                  {hasValidationRule('min') && (
                    <Input
                      type="number"
                      className="w-20"
                      value={(selectedField.validation?.find(r => r.type === 'min')?.value as number) || 0}
                      onChange={(e) => updateValidation({
                        type: 'min',
                        value: parseInt(e.target.value),
                        message: 'Too small'
                      })}
                    />
                  )}
                </div>
                <div className="flex items-center space-x-2">
                  <Checkbox
                    checked={hasValidationRule('max')}
                    onCheckedChange={(checked) => {
                      if (checked) {
                        updateValidation({ type: 'max', value: 100, message: 'Too large' });
                      } else {
                        removeValidation('max');
                      }
                    }}
                  />
                  <Label className="text-sm">Maximum value</Label>
                  {hasValidationRule('max') && (
                    <Input
                      type="number"
                      className="w-20"
                      value={(selectedField.validation?.find(r => r.type === 'max')?.value as number) || 100}
                      onChange={(e) => updateValidation({
                        type: 'max',
                        value: parseInt(e.target.value),
                        message: 'Too large'
                      })}
                    />
                  )}
                </div>
              </>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
