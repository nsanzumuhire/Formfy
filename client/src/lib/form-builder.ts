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
  // Auto layout properties
  rowId?: string;
  width?: number; // Width percentage for auto layout
  layout?: "vertical" | "horizontal" | "inline"; // For radio/checkbox options and field layout
  // Additional form properties
  required?: boolean;
  disabled?: boolean;
  readonly?: boolean;
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

export function generateRowId(): string {
  return `row_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
}

// Auto layout helper functions
export function organizeFieldsIntoRows(fields: FormFieldData[]): FormFieldData[][] {
  const rows: { [rowId: string]: FormFieldData[] } = {};
  const unassignedFields: FormFieldData[] = [];

  fields.forEach(field => {
    if (field.rowId) {
      if (!rows[field.rowId]) {
        rows[field.rowId] = [];
      }
      rows[field.rowId].push(field);
    } else {
      unassignedFields.push(field);
    }
  });

  // Sort fields within each row by order
  Object.keys(rows).forEach(rowId => {
    rows[rowId].sort((a, b) => a.order - b.order);
  });

  // Create result array with rows in order
  const result: FormFieldData[][] = Object.values(rows);
  
  // Add unassigned fields as individual rows
  unassignedFields.forEach(field => {
    result.push([field]);
  });

  return result;
}

export function distributeWidthsEvenly(fieldsInRow: FormFieldData[]): FormFieldData[] {
  const evenWidth = 100 / fieldsInRow.length;
  return fieldsInRow.map(field => ({
    ...field,
    width: evenWidth
  }));
}

export function addFieldToRow(fields: FormFieldData[], fieldId: string, targetRowId: string): FormFieldData[] {
  return fields.map(field => {
    if (field.id === fieldId) {
      return { ...field, rowId: targetRowId };
    }
    return field;
  });
}

export function createNewRow(fields: FormFieldData[], fieldId: string): FormFieldData[] {
  const newRowId = generateRowId();
  return fields.map(field => {
    if (field.id === fieldId) {
      return { ...field, rowId: newRowId, width: 100 };
    }
    return field;
  });
}

export function createFormField(type: FieldType): FormFieldData {
  const id = generateFieldId();
  
  const baseField: FormFieldData = {
    id,
    type,
    label: getDefaultLabel(type),
    placeholder: getDefaultPlaceholder(type),
    order: 0,
    width: 100, // Default to full width
    layout: 'vertical', // Default layout for radio/checkbox
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
    textarea: 'Textarea',
    email: 'Email Address',
    number: 'Number',
    tel: 'Phone Number',
    url: 'Website URL',
    date: 'Date',
    file: 'File Upload',
    checkbox: 'Checkbox Option',
    radio: 'Radio Options',
    select: 'Select Option',
  };
  
  return labels[type];
}

function getDefaultPlaceholder(type: FieldType): string {
  const placeholders: Record<FieldType, string> = {
    text: 'Enter text here...',
    textarea: 'Enter your message...',
    email: 'Enter your email...',
    number: 'Enter a number...',
    tel: 'Enter phone number...',
    url: 'Enter website URL...',
    date: 'Select date...',
    file: 'Choose file...',
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
