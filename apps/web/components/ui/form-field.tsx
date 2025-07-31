// apps/web/components/ui/form-field.tsx
// Reusable form field components with consistent styling

import React from 'react'
import { Label } from '@/components/ui/label'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Checkbox } from '@/components/ui/checkbox'
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group'
import { cn } from '@/lib/utils'
import { AlertCircle } from 'lucide-react'

interface BaseFieldProps {
  label: string
  name: string
  required?: boolean
  disabled?: boolean
  error?: string
  description?: string
  className?: string
}

interface TextFieldProps extends BaseFieldProps {
  type?: 'text' | 'email' | 'password' | 'number' | 'tel' | 'url'
  placeholder?: string
  value?: string
  onChange?: (value: string) => void
}

export function TextField({
  label,
  name,
  type = 'text',
  placeholder,
  value,
  onChange,
  required,
  disabled,
  error,
  description,
  className
}: TextFieldProps) {
  return (
    <div className={cn("space-y-2", className)}>
      <Label htmlFor={name} className="text-sm font-medium">
        {label}
        {required && <span className="text-red-500 ml-1">*</span>}
      </Label>
      <Input
        id={name}
        name={name}
        type={type}
        placeholder={placeholder}
        value={value}
        onChange={(e) => onChange?.(e.target.value)}
        disabled={disabled}
        className={cn(error && "border-red-500 focus:border-red-500")}
      />
      {description && (
        <p className="text-xs text-muted-foreground">{description}</p>
      )}
      {error && (
        <div className="flex items-center space-x-1 text-red-600">
          <AlertCircle className="w-3 h-3" />
          <span className="text-xs">{error}</span>
        </div>
      )}
    </div>
  )
}

interface TextAreaFieldProps extends BaseFieldProps {
  placeholder?: string
  value?: string
  onChange?: (value: string) => void
  rows?: number
}

export function TextAreaField({
  label,
  name,
  placeholder,
  value,
  onChange,
  rows = 3,
  required,
  disabled,
  error,
  description,
  className
}: TextAreaFieldProps) {
  return (
    <div className={cn("space-y-2", className)}>
      <Label htmlFor={name} className="text-sm font-medium">
        {label}
        {required && <span className="text-red-500 ml-1">*</span>}
      </Label>
      <Textarea
        id={name}
        name={name}
        placeholder={placeholder}
        value={value}
        onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => onChange?.(e.target.value)}
        rows={rows}
        disabled={disabled}
        className={cn(error && "border-red-500 focus:border-red-500")}
      />
      {description && (
        <p className="text-xs text-muted-foreground">{description}</p>
      )}
      {error && (
        <div className="flex items-center space-x-1 text-red-600">
          <AlertCircle className="w-3 h-3" />
          <span className="text-xs">{error}</span>
        </div>
      )}
    </div>
  )
}

interface SelectFieldProps extends BaseFieldProps {
  placeholder?: string
  value?: string
  onChange?: (value: string) => void
  options: Array<{
    value: string
    label: string
    disabled?: boolean
  }>
}

export function SelectField({
  label,
  name,
  placeholder = "Select an option",
  value,
  onChange,
  options,
  required,
  disabled,
  error,
  description,
  className
}: SelectFieldProps) {
  return (
    <div className={cn("space-y-2", className)}>
      <Label htmlFor={name} className="text-sm font-medium">
        {label}
        {required && <span className="text-red-500 ml-1">*</span>}
      </Label>
      <Select value={value} onValueChange={onChange} disabled={disabled}>
        <SelectTrigger className={cn(error && "border-red-500 focus:border-red-500")}>
          <SelectValue placeholder={placeholder} />
        </SelectTrigger>
        <SelectContent>
          {options.map((option) => (
            <SelectItem 
              key={option.value} 
              value={option.value}
              disabled={option.disabled}
            >
              {option.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
      {description && (
        <p className="text-xs text-muted-foreground">{description}</p>
      )}
      {error && (
        <div className="flex items-center space-x-1 text-red-600">
          <AlertCircle className="w-3 h-3" />
          <span className="text-xs">{error}</span>
        </div>
      )}
    </div>
  )
}

interface CheckboxFieldProps extends BaseFieldProps {
  checked?: boolean
  onChange?: (checked: boolean) => void
}

export function CheckboxField({
  label,
  name,
  checked,
  onChange,
  required,
  disabled,
  error,
  description,
  className
}: CheckboxFieldProps) {
  return (
    <div className={cn("space-y-2", className)}>
      <div className="flex items-center space-x-2">
        <Checkbox
          id={name}
          name={name}
          checked={checked}
          onCheckedChange={onChange}
          disabled={disabled}
        />
        <Label htmlFor={name} className="text-sm font-medium">
          {label}
          {required && <span className="text-red-500 ml-1">*</span>}
        </Label>
      </div>
      {description && (
        <p className="text-xs text-muted-foreground ml-6">{description}</p>
      )}
      {error && (
        <div className="flex items-center space-x-1 text-red-600 ml-6">
          <AlertCircle className="w-3 h-3" />
          <span className="text-xs">{error}</span>
        </div>
      )}
    </div>
  )
}

interface RadioFieldProps extends BaseFieldProps {
  value?: string
  onChange?: (value: string) => void
  options: Array<{
    value: string
    label: string
    description?: string
    disabled?: boolean
  }>
}

export function RadioField({
  label,
  name,
  value,
  onChange,
  options,
  required,
  disabled,
  error,
  description,
  className
}: RadioFieldProps) {
  return (
    <div className={cn("space-y-2", className)}>
      <Label className="text-sm font-medium">
        {label}
        {required && <span className="text-red-500 ml-1">*</span>}
      </Label>
      <RadioGroup value={value} onValueChange={onChange} disabled={disabled}>
        {options.map((option) => (
          <div key={option.value} className="flex items-center space-x-2">
            <RadioGroupItem 
              value={option.value} 
              id={`${name}-${option.value}`}
              disabled={option.disabled}
            />
            <div className="flex-1">
              <Label 
                htmlFor={`${name}-${option.value}`} 
                className="text-sm font-medium"
              >
                {option.label}
              </Label>
              {option.description && (
                <p className="text-xs text-muted-foreground">
                  {option.description}
                </p>
              )}
            </div>
          </div>
        ))}
      </RadioGroup>
      {description && (
        <p className="text-xs text-muted-foreground">{description}</p>
      )}
      {error && (
        <div className="flex items-center space-x-1 text-red-600">
          <AlertCircle className="w-3 h-3" />
          <span className="text-xs">{error}</span>
        </div>
      )}
    </div>
  )
}

// Form section component for grouping fields
interface FormSectionProps {
  title: string
  description?: string
  children: React.ReactNode
  className?: string
}

export function FormSection({ title, description, children, className }: FormSectionProps) {
  return (
    <div className={cn("space-y-4", className)}>
      <div className="border-b pb-2">
        <h3 className="text-lg font-medium">{title}</h3>
        {description && (
          <p className="text-sm text-muted-foreground mt-1">{description}</p>
        )}
      </div>
      <div className="space-y-4">
        {children}
      </div>
    </div>
  )
}