import React from 'react';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
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
}

export function FormFieldWithIcon({ 
  field, 
  value, 
  onChange, 
  className, 
  disabled, 
  readonly 
}: FormFieldWithIconProps) {
  const IconComponent = field.icon ? (LucideIcons as any)[field.icon.name] : null;
  
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
            style={{ height: field.height }}
          />
        );
      
      case 'select':
        return (
          <Select value={value} onValueChange={onChange} disabled={disabled || field.disabled}>
            <SelectTrigger className={baseInputClass}>
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
        return (
          <Input
            type="file"
            onChange={(e) => onChange?.(e.target.files?.[0])}
            className={baseInputClass}
            disabled={disabled || field.disabled}
            required={field.required}
          />
        );
      
      case 'date':
        return (
          <Input
            type="date"
            value={value || ''}
            onChange={(e) => onChange?.(e.target.value)}
            className={baseInputClass}
            disabled={disabled || field.disabled}
            readOnly={readonly || field.readonly}
            required={field.required}
          />
        );
      
      default:
        return (
          <Input
            placeholder={field.placeholder}
            value={value || ''}
            onChange={(e) => onChange?.(e.target.value)}
            className={baseInputClass}
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