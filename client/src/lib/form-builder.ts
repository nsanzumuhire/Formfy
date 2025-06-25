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

export interface ConditionalRule {
  field: string;
  operator: 'equals' | 'not_equals' | 'contains' | 'not_contains' | 'greater_than' | 'less_than' | 'is_empty' | 'is_not_empty' | '==' | '!=';
  value: string;
}

export interface ConditionalLogic {
  type: 'visibility' | 'enable' | 'value';
  logic: 'AND' | 'OR';
  rules: ConditionalRule[];
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
  width?: number | string; // Width percentage for auto layout or CSS width value
  layout?: "vertical" | "horizontal" | "inline"; // For radio/checkbox options and field layout
  // Additional form properties
  required?: boolean;
  disabled?: boolean;
  readonly?: boolean;
  // Conditional logic
  condition?: ConditionalLogic;
  // Styling and rendering properties for SDK
  className?: string; // CSS classes for the input field
  style?: Record<string, any>; // Inline styles for the input field
  height?: number | string; // Height for textarea and other fields
  containerClassName?: string; // CSS classes for the field container
  labelClassName?: string; // CSS classes for the label
}

export interface FormSchema {
  fields: FormFieldData[];
  settings: {
    title: string;
    description?: string;
    showLabels?: boolean;
    buttonLayout?: "left" | "center" | "right" | "justify" | "split";
    submitButtonText?: string;
    cancelButtonText?: string;
    submitButtonColor?: string;
    cancelButtonColor?: string;
    showCancelButton?: boolean;
    // Form container styling for SDK
    formClassName?: string; // CSS classes for the form container
    formStyle?: Record<string, any>; // Inline styles for the form container
    layout?: string; // Layout mode (auto, grid, two-column, single-column)
    gridColumns?: number; // Number of columns for grid layout
    spacing?: string; // Spacing between fields
    customSpacing?: number; // Custom spacing value
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

  // Create result array with rows in order (sorted by the minimum order of fields in each row)
  const sortedRows = Object.values(rows).sort((a, b) => {
    const minOrderA = Math.min(...a.map(f => f.order));
    const minOrderB = Math.min(...b.map(f => f.order));
    return minOrderA - minOrderB;
  });
  
  // Add unassigned fields as individual rows, sorted by order
  unassignedFields.sort((a, b) => a.order - b.order);
  unassignedFields.forEach(field => {
    sortedRows.push([field]);
  });

  return sortedRows;
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

export function reorderFieldsInRow(fields: FormFieldData[], rowId: string, draggedFieldId: string, targetFieldId: string): FormFieldData[] {
  const fieldsInRow = fields.filter(f => f.rowId === rowId);
  const otherFields = fields.filter(f => f.rowId !== rowId);
  
  const draggedIndex = fieldsInRow.findIndex(f => f.id === draggedFieldId);
  const targetIndex = fieldsInRow.findIndex(f => f.id === targetFieldId);
  
  if (draggedIndex === -1 || targetIndex === -1) return fields;
  
  // Reorder fields within the row
  const reorderedFields = [...fieldsInRow];
  const [draggedField] = reorderedFields.splice(draggedIndex, 1);
  reorderedFields.splice(targetIndex, 0, draggedField);
  
  // Update order values to maintain position
  reorderedFields.forEach((field, index) => {
    field.order = Math.min(...fieldsInRow.map(f => f.order)) + index;
  });
  
  return [...otherFields, ...reorderedFields];
}

export function moveRowUp(fields: FormFieldData[], rowId: string): FormFieldData[] {
  const rows = organizeFieldsIntoRows(fields);
  const rowIndex = rows.findIndex(row => row[0]?.rowId === rowId);
  
  if (rowIndex <= 0) return fields; // Can't move up if it's already at the top
  
  const targetRowFields = rows[rowIndex - 1];
  const currentRowFields = rows[rowIndex];
  
  // Swap the order values of the two rows
  const targetMinOrder = Math.min(...targetRowFields.map(f => f.order));
  const currentMinOrder = Math.min(...currentRowFields.map(f => f.order));
  
  return fields.map(field => {
    if (targetRowFields.some(f => f.id === field.id)) {
      return { ...field, order: currentMinOrder + (field.order - targetMinOrder) };
    }
    if (currentRowFields.some(f => f.id === field.id)) {
      return { ...field, order: targetMinOrder + (field.order - currentMinOrder) };
    }
    return field;
  });
}

export function moveRowDown(fields: FormFieldData[], rowId: string): FormFieldData[] {
  const rows = organizeFieldsIntoRows(fields);
  const rowIndex = rows.findIndex(row => row[0]?.rowId === rowId);
  
  if (rowIndex === -1 || rowIndex >= rows.length - 1) return fields; // Can't move down if it's already at the bottom
  
  const currentRowFields = rows[rowIndex];
  const targetRowFields = rows[rowIndex + 1];
  
  // Swap the order values of the two rows
  const currentMinOrder = Math.min(...currentRowFields.map(f => f.order));
  const targetMinOrder = Math.min(...targetRowFields.map(f => f.order));
  
  return fields.map(field => {
    if (currentRowFields.some(f => f.id === field.id)) {
      return { ...field, order: targetMinOrder + (field.order - currentMinOrder) };
    }
    if (targetRowFields.some(f => f.id === field.id)) {
      return { ...field, order: currentMinOrder + (field.order - targetMinOrder) };
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
    width: "100%", // Default to full width
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

// Conditional logic evaluation functions
export function evaluateConditionalRule(rule: ConditionalRule, formData: Record<string, any>, fields: FormFieldData[] = []): boolean {
  // Try multiple ways to find the field value
  let fieldValue = formData[rule.field];
  let foundFieldId = rule.field;
  
  // If not found by direct field reference, try other methods
  if (fieldValue === undefined && fields.length > 0) {
    // Try to find by field name property
    const referencedField = fields.find(f => (f as any).name === rule.field);
    if (referencedField) {
      fieldValue = formData[referencedField.id];
      foundFieldId = referencedField.id;
    } else {
      // Try to find by label (case insensitive)
      const fieldByLabel = fields.find(f => f.label.toLowerCase().includes(rule.field.toLowerCase()));
      if (fieldByLabel) {
        fieldValue = formData[fieldByLabel.id];
        foundFieldId = fieldByLabel.id;
      }
    }
  }
  
  const ruleValue = rule.value;
  
  // Debug logging
  console.log('Evaluating conditional rule:', {
    rule,
    fieldValue,
    ruleValue,
    foundFieldId,
    formData,
    fields: fields.map(f => ({ id: f.id, name: (f as any).name, label: f.label }))
  });

  switch (rule.operator) {
    case 'equals':
    case '==':
      return fieldValue === ruleValue;
    case 'not_equals':
    case '!=':
      return fieldValue !== ruleValue;
    case 'contains':
      return typeof fieldValue === 'string' && fieldValue.includes(ruleValue);
    case 'not_contains':
      return typeof fieldValue === 'string' && !fieldValue.includes(ruleValue);
    case 'greater_than':
      return Number(fieldValue) > Number(ruleValue);
    case 'less_than':
      return Number(fieldValue) < Number(ruleValue);
    case 'is_empty':
      return !fieldValue || (typeof fieldValue === 'string' && fieldValue.trim() === '');
    case 'is_not_empty':
      return fieldValue && (typeof fieldValue !== 'string' || fieldValue.trim() !== '');
    default:
      return true;
  }
}

export function evaluateConditionalLogic(condition: ConditionalLogic, formData: Record<string, any>, fields: FormFieldData[] = []): boolean {
  if (!condition.rules || condition.rules.length === 0) {
    return true; // No conditions means always visible/enabled
  }

  const results = condition.rules.map(rule => evaluateConditionalRule(rule, formData, fields));

  if (condition.logic === 'AND') {
    return results.every(result => result);
  } else {
    return results.some(result => result);
  }
}

export function shouldShowField(field: FormFieldData, formData: Record<string, any>, fields: FormFieldData[] = []): boolean {
  console.log('Checking field visibility:', {
    fieldId: field.id,
    fieldLabel: field.label,
    condition: field.condition,
    formData
  });

  if (!field.condition) {
    console.log('No condition found, showing field');
    return true; // Show field if no condition
  }

  // If no type is specified, assume it's a visibility condition
  if (!field.condition.type || field.condition.type === 'visibility') {
    const result = evaluateConditionalLogic(field.condition, formData, fields);
    console.log('Visibility evaluation result:', result);
    return result;
  }

  console.log('Not a visibility condition, showing field');
  return true; // Show field if it's not a visibility condition
}

export function shouldEnableField(field: FormFieldData, formData: Record<string, any>, fields: FormFieldData[] = []): boolean {
  if (!field.condition || field.condition.type !== 'enable') {
    return true; // Enable field if no enable condition
  }

  return evaluateConditionalLogic(field.condition, formData, fields);
}
