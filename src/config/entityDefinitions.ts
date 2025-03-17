import { EntityConfigs, FieldOption } from '@/types/entityConfig';

// Define common options
const ROLE_OPTIONS: FieldOption[] = [
  { value: 'booker', label: 'Booker' },
  { value: 'guest', label: 'Guest' },
  { value: 'both', label: 'Booker & Guest' },
];

const TITLE_OPTIONS: FieldOption[] = [
  { value: 'mr', label: 'Mr.' },
  { value: 'ms', label: 'Ms.' },
];

const ROOM_TYPE_OPTIONS: FieldOption[] = [
  { value: 'single', label: 'Single' },
  { value: 'double', label: 'Double' },
  { value: 'suite', label: 'Suite' },
  { value: 'deluxe', label: 'Deluxe' }
];

const STATUS_OPTIONS: FieldOption[] = [
  { value: 'confirmed', label: 'Confirmed' },
  { value: 'checked_in', label: 'Checked In' },
  { value: 'checked_out', label: 'Checked Out' },
  { value: 'cancelled', label: 'Cancelled' },
  { value: 'no_show', label: 'No Show' }
];

// Define entity configurations
const entityConfigs: EntityConfigs = {
  contacts: {
    name: 'contacts',
    displayName: 'Contact',
    pluralName: 'Contacts',
    fields: [
      {
        name: 'title',
        label: 'Title',
        type: 'dropdown',
        options: TITLE_OPTIONS,
        nested: true,
        path: 'general.title'
      },
      {
        name: 'firstName',
        label: 'First Name',
        type: 'text',
        required: true,
        nested: true,
        path: 'general.firstName'
      },
      {
        name: 'lastName',
        label: 'Last Name',
        type: 'text',
        required: true,
        nested: true,
        path: 'general.lastName'
      },
      {
        name: 'email',
        label: 'E-mail',
        type: 'email',
        nested: true,
        path: 'general.email'
      },
      {
        name: 'phone',
        label: 'Phone',
        type: 'tel',
        nested: true,
        path: 'general.phone'
      },
      {
        name: 'role',
        label: 'Role',
        type: 'dropdown',
        options: ROLE_OPTIONS,
        required: true,
        nested: true,
        path: 'general.role'
      },
      {
        name: 'companyId',
        label: 'Company',
        type: 'reference',
        nested: true,
        path: 'general.companyId',
        referenceConfig: {
          collection: 'companies',
          displayFields: ['name']
        }
      }
    ],
    searchFields: ['general.firstName', 'general.lastName', 'general.email', 'general.role'],
    defaultSearchField: 'general.firstName',
    relationFields: {}
  },
  companies: {
    name: 'companies',
    displayName: 'Company',
    pluralName: 'Companies',
    fields: [
      {
        name: 'name',
        label: 'Name',
        type: 'text',
        required: true
      },
      {
        name: 'address',
        label: 'Address',
        type: 'text'
      },
      {
        name: 'postal_code',
        label: 'Postal Code',
        type: 'text'
      },
      {
        name: 'city',
        label: 'City',
        type: 'text'
      },
      {
        name: 'country',
        label: 'Country',
        type: 'text'
      },
      {
        name: 'parentCompanyId',
        label: 'Parent Company',
        type: 'reference',
        referenceConfig: {
          collection: 'companies',
          displayFields: ['name']
        }
      }
    ],
    searchFields: ['name', 'address', 'city', 'country', 'postal_code'],
    defaultSearchField: 'name',
    relationFields: {
      childCompanies: {
        collection: 'companies',
        field: 'parentCompanyId',
        displayFields: [{ path: 'name' }, { path: 'city' }],
        title: 'Child Companies',
        emptyMessage: 'No child companies found'
      },
      contacts: {
        collection: 'contacts',
        field: 'general.companyId',
        displayFields: [
          { path: 'general.title' },
          { path: 'general.firstName' },
          { path: 'general.lastName' }
        ],
        title: 'Contacts',
        emptyMessage: 'No contacts found'
      }
    }
  },
  hotels: {
    name: 'hotels',
    displayName: 'Hotel',
    pluralName: 'Hotels',
    fields: [
      {
        name: 'name',
        label: 'Name',
        type: 'text',
        required: true
      },
      {
        name: 'address',
        label: 'Address',
        type: 'text'
      },
      {
        name: 'postal_code',
        label: 'Postal Code',
        type: 'text'
      },
      {
        name: 'city',
        label: 'City',
        type: 'text'
      },
      {
        name: 'country',
        label: 'Country',
        type: 'text'
      },
      {
        name: 'phone',
        label: 'Phone',
        type: 'tel'
      },
      {
        name: 'email',
        label: 'Email',
        type: 'email'
      },
      {
        name: 'website',
        label: 'Website',
        type: 'text'
      }
    ],
    searchFields: ['name', 'address', 'city', 'country', 'postal_code', 'email', 'phone'],
    defaultSearchField: 'name',
    relationFields: {
      bookings: {
        collection: 'bookings',
        field: 'hotelId',
        displayFields: [
          { path: 'hotelConfirmationNo' },
          { path: 'arrivalDate', label: 'Arrival' }
        ],
        title: 'Bookings',
        emptyMessage: 'No bookings found for this hotel'
      }
    }
  },
  stays: {
    name: 'stays',
    displayName: 'Stay',
    pluralName: 'Stays',
    fields: [
      {
        name: 'reference',
        label: 'Reference',
        type: 'text',
        required: true
      },
      {
        name: 'bookingId',
        label: 'Booking',
        type: 'reference',
        referenceConfig: {
          collection: 'bookings',
          displayFields: ['hotelConfirmationNo', 'arrivalDate']
        }
      },
      {
        name: 'guestId',
        label: 'Guest',
        type: 'reference',
        referenceConfig: {
          collection: 'contacts',
          displayFields: ['general.firstName', 'general.lastName']
        }
      },
      {
        name: 'roomNumber',
        label: 'Room Number',
        type: 'text'
      },
      {
        name: 'roomType',
        label: 'Room Type',
        type: 'dropdown',
        options: ROOM_TYPE_OPTIONS
      },
      {
        name: 'checkInDate',
        label: 'Check-in Date',
        type: 'date',
        required: true
      },
      {
        name: 'checkOutDate',
        label: 'Check-out Date',
        type: 'date',
        required: true
      },
      {
        name: 'status',
        label: 'Status',
        type: 'dropdown',
        options: STATUS_OPTIONS,
        required: true
      },
      {
        name: 'specialRequests',
        label: 'Special Requests',
        type: 'text'
      }
    ],
    searchFields: ['reference', 'roomNumber', 'checkInDate', 'checkOutDate', 'status'],
    defaultSearchField: 'reference',
    relationFields: {}
  }
};

export default entityConfigs;