import React from 'react';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { SimpleDatePicker } from '@/components/ui/date-picker';
import { cn } from '@/lib/utils';
import * as LucideIcons from 'lucide-react';
import { FormFieldData } from '@/lib/form-builder';

interface FormFieldWithIconProps {
  field: FormFieldData;
  value?: any;
  onChange?: (value: any) => void;
  className?: string;
  disabled?: boolean;
  readonly?: boolean;
  formConfig?: any; // Appearance configuration
}

export function FormFieldWithIcon({ 
  field, 
  value, 
  onChange, 
  className, 
  disabled, 
  readonly,
  formConfig = {}
}: FormFieldWithIconProps) {
  const IconComponent = field.icon ? (LucideIcons as any)[field.icon.name] : null;
  
  // Generate dynamic styles based on form configuration
  const getDynamicStyle = () => {
    if (!formConfig) return {};
    
    return {
      height: `${formConfig.inputHeight || 40}px`,
      borderRadius: `${formConfig.borderRadius || 6}px`,
      borderWidth: `${formConfig.borderStyle?.width || 1}px`,
      borderStyle: formConfig.borderStyle?.style || 'solid',
      borderColor: formConfig.borderStyle?.color || formConfig.theme?.inputBorderColor || '#e2e8f0',
    };
  };

  const getButtonStyle = (type: 'submit' | 'cancel') => {
    if (!formConfig) return {};
    
    if (type === 'submit') {
      return {
        backgroundColor: formConfig.theme?.primaryBackground || formConfig.submitButtonColor || '#3b82f6',
        color: formConfig.theme?.primaryForeground || '#ffffff',
        borderRadius: `${formConfig.borderRadius || 6}px`,
      };
    } else {
      return {
        backgroundColor: formConfig.theme?.secondaryBackground || formConfig.cancelButtonColor || '#f3f4f6',
        color: formConfig.theme?.secondaryForeground || '#374151',
        borderRadius: `${formConfig.borderRadius || 6}px`,
      };
    }
  };
  
  const renderIcon = (position: 'left' | 'right') => {
    if (!field.icon || field.icon.position !== position || !IconComponent) return null;
    
    return (
      <div className={cn(
        "flex items-center px-3",
        field.icon.position === 'left' ? 'border-r' : 'border-l',
        "border-gray-200 dark:border-gray-700 text-gray-500 dark:text-gray-400"
      )}>
        <IconComponent size={field.icon.size} />
      </div>
    );
  };

  const renderInputField = () => {
    const baseInputClass = cn(
      "flex-1",
      field.icon?.position === 'left' && "rounded-l-none border-l-0",
      field.icon?.position === 'right' && "rounded-r-none border-r-0",
      field.className
    );

    switch (field.type) {
      case 'text':
      case 'email':
      case 'password':
      case 'tel':
      case 'url':
      case 'number':
        return (
          <Input
            type={field.type}
            placeholder={field.placeholder}
            value={value || ''}
            onChange={(e) => onChange?.(e.target.value)}
            className={baseInputClass}
            style={getDynamicStyle()}
            disabled={disabled || field.disabled}
            readOnly={readonly || field.readonly}
            required={field.required}
          />
        );
      
      case 'textarea':
        return (
          <Textarea
            placeholder={field.placeholder}
            value={value || ''}
            onChange={(e) => onChange?.(e.target.value)}
            className={baseInputClass}
            disabled={disabled || field.disabled}
            readOnly={readonly || field.readonly}
            required={field.required}
            style={{ 
              height: field.height,
              ...getDynamicStyle()
            }}
          />
        );
      
      case 'select':
        return (
          <Select value={value} onValueChange={onChange} disabled={disabled || field.disabled}>
            <SelectTrigger className={baseInputClass} style={getDynamicStyle()}>
              <SelectValue placeholder={field.placeholder} />
            </SelectTrigger>
            <SelectContent>
              {field.options?.map((option, index) => (
                <SelectItem key={index} value={option.value}>
                  {option.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        );
      
      case 'checkbox':
        return (
          <div className="flex items-center space-x-2">
            <Checkbox
              id={field.id}
              checked={!!value}
              onCheckedChange={onChange}
              disabled={disabled || field.disabled}
            />
            <Label htmlFor={field.id} className="text-sm">
              {field.label}
            </Label>
          </div>
        );
      
      case 'radio':
        return (
          <RadioGroup value={value} onValueChange={onChange} disabled={disabled || field.disabled}>
            {field.options?.map((option, index) => (
              <div key={index} className="flex items-center space-x-2">
                <RadioGroupItem value={option.value} id={`${field.id}-${index}`} />
                <Label htmlFor={`${field.id}-${index}`} className="text-sm">
                  {option.label}
                </Label>
              </div>
            ))}
          </RadioGroup>
        );
      
      case 'file':
        const acceptTypes = field.fileTypes?.length 
          ? field.fileTypes.map(type => `.${type.toLowerCase()}`).join(',')
          : undefined;
          
        return (
          <div className="space-y-1">
            <Input
              type="file"
              accept={acceptTypes}
              onChange={(e) => {
                const file = e.target.files?.[0];
                if (file) {
                  // Validate file size
                  const fileSizeMB = file.size / (1024 * 1024);
                  
                  if (field.maxFileSize && fileSizeMB > field.maxFileSize) {
                    alert(`File size (${fileSizeMB.toFixed(2)}MB) exceeds maximum allowed size of ${field.maxFileSize}MB`);
                    e.target.value = '';
                    return;
                  }
                  
                  if (field.minFileSize && fileSizeMB < field.minFileSize) {
                    alert(`File size (${fileSizeMB.toFixed(2)}MB) is below minimum required size of ${field.minFileSize}MB`);
                    e.target.value = '';
                    return;
                  }
                  
                  // Validate file type
                  if (field.fileTypes?.length) {
                    const fileExtension = file.name.split('.').pop()?.toLowerCase();
                    if (!fileExtension || !field.fileTypes.map(t => t.toLowerCase()).includes(fileExtension)) {
                      alert(`File type "${fileExtension}" is not allowed. Allowed types: ${field.fileTypes.join(', ')}`);
                      e.target.value = '';
                      return;
                    }
                  }
                }
                onChange?.(file);
              }}
              className={baseInputClass}
              style={getDynamicStyle()}
              disabled={disabled || field.disabled}
              required={field.required}
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
      
      case 'date':
        return (
          <SimpleDatePicker
            value={value || ''}
            onChange={onChange}
            placeholder={field.placeholder || "Select date"}
            disabled={disabled || field.disabled}
            className={baseInputClass}
            style={getDynamicStyle()}
            min={field.minDate}
            max={field.maxDate}
          />
        );
      
      default:
        return (
          <Input
            placeholder={field.placeholder}
            value={value || ''}
            onChange={(e) => onChange?.(e.target.value)}
            className={baseInputClass}
            style={getDynamicStyle()}
            disabled={disabled || field.disabled}
            readOnly={readonly || field.readonly}
            required={field.required}
          />
        );
    }
  };

  // For checkbox and radio fields, don't show icons as they have different layouts
  if (field.type === 'checkbox' || field.type === 'radio') {
    return (
      <div className={cn("space-y-2", className)}>
        {renderInputField()}
      </div>
    );
  }

  // For fields that support icons, wrap with icon container
  const hasIcon = field.icon && IconComponent;
  
  if (!hasIcon) {
    return (
      <div className={className}>
        {renderInputField()}
      </div>
    );
  }

  return (
    <div className={cn("relative", className)}>
      <div className="flex items-center border border-gray-200 dark:border-gray-700 rounded-md overflow-hidden bg-white dark:bg-gray-800">
        {renderIcon('left')}
        {renderInputField()}
        {renderIcon('right')}
      </div>
    </div>
  );
}