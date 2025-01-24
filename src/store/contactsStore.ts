import { create } from 'zustand';
import { searchData } from '@/app/api/endpoints/contacts';
import { handleApiRequest } from '../utils/errorHandling';
import { Contact } from '@/domain/contacts/contactModel';

interface ContactState {
  contacts: Contact[];
  selectedContact: Contact | null;
  isLoading: boolean;
  searchTerm: string;
  searchField: string;
  createContact?: (contact: any) => Promise<void>;
  updateContact?: (contact: any) => Promise<void>;
  
  // Actions
  setSelectedContact: (contact: Contact | null) => void;
  searchContacts: (field: string, term: string) => Promise<void>;
  clearSearch: () => void;
  
}

export const useContactStore = create<ContactState>((set, get) => ({
  contacts: [],
  selectedContact: null,
  isLoading: false,
  searchTerm: '',
  searchField: '',

  setSelectedContact: (contact) => set({ selectedContact: contact }),

  searchContacts: async (field, term) => {
    set({ searchField: field, searchTerm: term });

    await handleApiRequest(
      'Search contacts',
      () => searchData(field, term),
      {
        onSuccess: (response) => {
          if (response.success && response.data) {
            set({ contacts: response.data });
          }
        },
        onSetLoading: (isLoading) => set({ isLoading })
      }
    );
  },

  clearSearch: () => set({ 
    contacts: [], 
    searchTerm: '', 
    searchField: '' 
  }),
}));