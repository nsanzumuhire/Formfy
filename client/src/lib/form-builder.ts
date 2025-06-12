import type { FieldType } from "@/components/form-builder/toolbox";

export interface ValidationRule {
  type: 'required' | 'minLength' | 'maxLength' | 'min' | 'max' | 'pattern';
  value?: string | number;
  message: string;
}

export interface FormFieldOption {
  label: string;
  value: string;
}

export interface FormFieldData {
  id: string;
  type: FieldType;
  label: string;
  placeholder?: string;
  description?: string;
  validation?: ValidationRule[];
  options?: FormFieldOption[];
  order: number;
}

export interface FormSchema {
  fields: FormFieldData[];
  settings: {
    title: string;
    description?: string;
  };
}

export function generateFieldId(): string {
  return `field_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
}

export function createFormField(type: FieldType): FormFieldData {
  const id = generateFieldId();
  
  const baseField: FormFieldData = {
    id,
    type,
    label: getDefaultLabel(type),
    placeholder: getDefaultPlaceholder(type),
    order: 0,
  };

  // Add default options for select and radio fields
  if (type === 'select' || type === 'radio') {
    baseField.options = [
      { label: 'Option 1', value: 'option-1' },
      { label: 'Option 2', value: 'option-2' },
    ];
  }

  return baseField;
}

function getDefaultLabel(type: FieldType): string {
  const labels: Record<FieldType, string> = {
    text: 'Text Field',
    email: 'Email Address',
    number: 'Number',
    checkbox: 'Checkbox Option',
    radio: 'Radio Options',
    select: 'Select Option',
  };
  
  return labels[type];
}

function getDefaultPlaceholder(type: FieldType): string {
  const placeholders: Record<FieldType, string> = {
    text: 'Enter text here...',
    email: 'Enter your email...',
    number: 'Enter a number...',
    checkbox: '',
    radio: '',
    select: 'Choose an option...',
  };
  
  return placeholders[type];
}

export function validateFormField(field: FormFieldData, value: any): string[] {
  const errors: string[] = [];
  
  if (!field.validation) return errors;
  
  for (const rule of field.validation) {
    switch (rule.type) {
      case 'required':
        if (!value || (typeof value === 'string' && value.trim() === '')) {
          errors.push(rule.message);
        }
        break;
      
      case 'minLength':
        if (typeof value === 'string' && value.length < (rule.value as number)) {
          errors.push(rule.message);
        }
        break;
      
      case 'maxLength':
        if (typeof value === 'string' && value.length > (rule.value as number)) {
          errors.push(rule.message);
        }
        break;
      
      case 'min':
        if (typeof value === 'number' && value < (rule.value as number)) {
          errors.push(rule.message);
        }
        break;
      
      case 'max':
        if (typeof value === 'number' && value > (rule.value as number)) {
          errors.push(rule.message);
        }
        break;
      
      case 'pattern':
        if (typeof value === 'string' && rule.value) {
          const regex = new RegExp(rule.value as string);
          if (!regex.test(value)) {
            errors.push(rule.message);
          }
        }
        break;
    }
  }
  
  return errors;
}
