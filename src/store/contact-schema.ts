import { z } from 'zod';

// Basic validation patterns
const phonePattern = /^\+?[1-9]\d{1,14}$/;
const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

// General information schema
const generalSchema = z.object({
  firstName: z.string().min(1, 'First name is required').max(50),
  lastName: z.string().min(1, 'Last name is required').max(50),
  email: z.string().regex(emailPattern, 'Invalid email format'),
  phone: z.string().regex(phonePattern, 'Invalid phone number format').optional(),
});

// Contact schema
export const contactSchema = z.object({
  _id: z.string().optional(), // Optional for new contacts
  general: generalSchema,
  currency: z.enum(['EUR', 'USD', 'GBP']),
  createdAt: z.date().optional(),
  updatedAt: z.date().optional(),
});

// Type inference from schema
export type ContactSchema = z.infer<typeof contactSchema>;

// Form field configuration
export const contactFormFields = {
  'general.firstName': {
    label: 'First Name',
    type: 'text' as const,
    required: true,
  },
  'general.lastName': {
    label: 'Last Name',
    type: 'text' as const,
    required: true,
  },
  'general.email': {
    label: 'Email',
    type: 'email' as const,
    required: true,
  },
  'general.phone': {
    label: 'Phone',
    type: 'tel' as const,
    required: false,
  },
  'currency': {
    label: 'Currency',
    type: 'select' as const,
    required: true,
    options: ['EUR', 'USD', 'GBP'],
  },
};

// Validation helper
export const validateContact = (data: unknown) => {
  return contactSchema.safeParse(data);
};

// Transform form data to Contact model
export const transformFormToContact = (formData: Record<string, any>): ContactSchema => {
  return {
    general: {
      firstName: formData['general.firstName'],
      lastName: formData['general.lastName'],
      email: formData['general.email'],
      phone: formData['general.phone'],
    },
    currency: formData.currency,
  };
};

// Transform Contact model to form data
export const transformContactToForm = (contact: ContactSchema): Record<string, any> => {
  return {
    'general.firstName': contact.general.firstName,
    'general.lastName': contact.general.lastName,
    'general.email': contact.general.email,
    'general.phone': contact.general.phone,
    'currency': contact.currency,
  };
};
