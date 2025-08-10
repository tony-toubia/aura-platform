// apps/web/lib/utils/validation.ts
// Common validation utilities and schemas

import { z } from 'zod'

// ============================================================================
// COMMON VALIDATION SCHEMAS
// ============================================================================

export const emailSchema = z.string().email('Please enter a valid email address')

export const passwordSchema = z
  .string()
  .min(8, 'Password must be at least 8 characters')
  .regex(/[A-Z]/, 'Password must contain at least one uppercase letter')
  .regex(/[a-z]/, 'Password must contain at least one lowercase letter')
  .regex(/[0-9]/, 'Password must contain at least one number')

export const nameSchema = z
  .string()
  .min(1, 'Name is required')
  .max(100, 'Name must be less than 100 characters')
  .regex(/^[a-zA-Z\s'-]+$/, 'Name can only contain letters, spaces, hyphens, and apostrophes')

export const urlSchema = z.string().url('Please enter a valid URL')

export const phoneSchema = z
  .string()
  .regex(/^\+?[\d\s\-\(\)]+$/, 'Please enter a valid phone number')
  .min(10, 'Phone number must be at least 10 digits')

// ============================================================================
// AURA-SPECIFIC VALIDATION SCHEMAS
// ============================================================================

export const auraNameSchema = z
  .string()
  .min(1, 'Aura name is required')
  .max(50, 'Aura name must be less than 50 characters')
  .regex(/^[a-zA-Z0-9\s\-_]+$/, 'Aura name can only contain letters, numbers, spaces, hyphens, and underscores')

export const vesselCodeSchema = z
  .string()
  .min(1, 'Vessel code is required')
  .max(100, 'Vessel code must be less than 100 characters')

export const personalityTraitSchema = z
  .number()
  .min(0, 'Trait value must be between 0 and 100')
  .max(100, 'Trait value must be between 0 and 100')

export const ruleNameSchema = z
  .string()
  .min(1, 'Rule name is required')
  .max(100, 'Rule name must be less than 100 characters')

// ============================================================================
// VALIDATION UTILITIES
// ============================================================================

export interface ValidationResult<T = unknown> {
  success: boolean
  data?: T
  errors?: Array<{
    field: string
    message: string
  }>
}

export function validateField<T>(
  schema: z.ZodSchema<T>,
  value: unknown,
  fieldName: string
): ValidationResult<T> {
  const result = schema.safeParse(value)
  
  if (result.success) {
    return {
      success: true,
      data: result.data,
    }
  }
  
  return {
    success: false,
    errors: result.error.issues.map((err) => ({
      field: fieldName,
      message: err.message,
    })),
  }
}

export function validateObject<T>(
  schema: z.ZodSchema<T>,
  data: unknown
): ValidationResult<T> {
  const result = schema.safeParse(data)
  
  if (result.success) {
    return {
      success: true,
      data: result.data,
    }
  }
  
  return {
    success: false,
    errors: result.error.issues.map((err) => ({
      field: err.path.join('.'),
      message: err.message,
    })),
  }
}

// ============================================================================
// FORM VALIDATION HELPERS
// ============================================================================

export function createFormValidator<T>(schema: z.ZodSchema<T>) {
  return {
    validate: (data: unknown) => validateObject(schema, data),
    validateField: (fieldName: keyof T, value: unknown) => {
      // Extract the schema for the specific field
      const shape = (schema as unknown as { shape?: Record<string, z.ZodTypeAny> }).shape
      const fieldSchema = shape?.[fieldName as string]
      if (fieldSchema) {
        return validateField(fieldSchema, value, String(fieldName))
      }
      return { success: true }
    },
  }
}

// ============================================================================
// SANITIZATION UTILITIES
// ============================================================================

export function sanitizeString(input: string): string {
  return input.trim().replace(/\s+/g, ' ')
}

export function sanitizeEmail(email: string): string {
  return email.toLowerCase().trim()
}

export function sanitizeName(name: string): string {
  return name
    .trim()
    .replace(/\s+/g, ' ')
    .replace(/[^a-zA-Z\s'-]/g, '')
}

export function sanitizeAuraName(name: string): string {
  return name
    .trim()
    .replace(/\s+/g, ' ')
    .replace(/[^a-zA-Z0-9\s\-_]/g, '')
}

// ============================================================================
// VALIDATION RULES
// ============================================================================

export const validationRules = {
  required: (message = 'This field is required') => 
    z.string().min(1, message),
  
  minLength: (min: number, message?: string) =>
    z.string().min(min, message || `Must be at least ${min} characters`),
  
  maxLength: (max: number, message?: string) =>
    z.string().max(max, message || `Must be less than ${max} characters`),
  
  range: (min: number, max: number, message?: string) =>
    z.number().min(min).max(max, message || `Must be between ${min} and ${max}`),
  
  oneOf: <T extends string>(values: [T, ...T[]], message?: string) =>
    z.enum(values, message || `Must be one of: ${values.join(', ')}`),
  
  pattern: (regex: RegExp, message: string) =>
    z.string().regex(regex, message),
  
  custom: <T>(validator: (value: unknown) => value is T, message: string) =>
    z.custom<T>(validator, { message }),
}

// ============================================================================
// COMMON VALIDATION PATTERNS
// ============================================================================

export const commonPatterns = {
  alphanumeric: /^[a-zA-Z0-9]+$/,
  alphanumericWithSpaces: /^[a-zA-Z0-9\s]+$/,
  slug: /^[a-z0-9-]+$/,
  hexColor: /^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/,
  uuid: /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i,
}