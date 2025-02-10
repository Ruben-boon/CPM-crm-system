import { BaseEntity, EntityField } from '@/types/entity';

export interface Contact extends BaseEntity {
  general: {
    firstName: string;
    lastName: string;
    email: string;
    phone: string;
  };
  currency: string;
}

export const contactFields: EntityField[] = [
  {
    name: 'general.firstName',
    label: 'First Name',
    type: 'text',
    required: true,
    section: 'general'
  },
  {
    name: 'general.lastName',
    label: 'Last Name',
    type: 'text',
    required: true,
    section: 'general'
  },
  {
    name: 'general.email',
    label: 'Email',
    type: 'email',
    required: true,
    section: 'general'
  },
  {
    name: 'general.phone',
    label: 'Phone',
    type: 'phone',
    section: 'general'
  },
  {
    name: 'currency',
    label: 'Currency',
    type: 'select',
    required: true,
    options: ['EUR', 'USD', 'GBP'],
    section: 'additional'
  }
];

export const searchableFields = [
  { label: 'First Name', value: 'firstName', path: 'general.firstName' },
  { label: 'Last Name', value: 'lastName', path: 'general.lastName' },
  { label: 'Email', value: 'email', path: 'general.email' },
  { label: 'Phone', value: 'phone', path: 'general.phone' },
  { label: 'Currency', value: 'currency' }
];