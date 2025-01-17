import { create } from 'zustand';
import { Contact } from '@/domain/contacts/contactModel';
import { searchData } from '@/api/endpoints/contacts';
import { toast } from 'sonner';

interface ContactState {
  contacts: Contact[];
  selectedContact: Contact | null;
  isLoading: boolean;
  searchTerm: string;
  searchField: string;
  
  // Actions
  setSelectedContact: (contact: Contact | null) => void;
  searchContacts: (field: string, term: string) => Promise<void>;
  clearSearch: () => void;
  createContact: (contact: Contact) => Promise<void>;
  updateContact: (contact: Contact) => Promise<void>;
}

export const useContactStore = create<ContactState>((set, get) => ({
  contacts: [],
  selectedContact: null,
  isLoading: false,
  searchTerm: '',
  searchField: '',

  setSelectedContact: (contact) => {
    set({ selectedContact: contact });
  },

  searchContacts: async (field, term) => {
    set({ isLoading: true, searchField: field, searchTerm: term });
    try {
      const response = await searchData(field, term);
      if (response.success && response.results) {
        set({ contacts: response.results });
      } else {
        toast.error('Search failed', {
          description: response.error || 'Failed to fetch contacts'
        });
      }
    } catch (error) {
      toast.error('Search error', {
        description: error instanceof Error ? error.message : 'An unknown error occurred'
      });
    } finally {
      set({ isLoading: false });
    }
  },

  clearSearch: () => {
    set({ contacts: [], searchTerm: '', searchField: '' });
  },

  createContact: async (contact) => {
    set({ isLoading: true });
    try {
      // API call would go here
      // Update local state on success
      set((state) => ({
        contacts: [...state.contacts, contact],
      }));
      toast.success('Contact created');
    } catch (error) {
      toast.error('Failed to create contact');
      throw error;
    } finally {
      set({ isLoading: false });
    }
  },

  updateContact: async (contact) => {
    set({ isLoading: true });
    try {
      // API call would go here
      // Update local state on success
      set((state) => ({
        contacts: state.contacts.map((c) => 
          c._id === contact._id ? contact : c
        ),
        selectedContact: contact,
      }));
      toast.success('Contact updated');
    } catch (error) {
      toast.error('Failed to update contact');
      throw error;
    } finally {
      set({ isLoading: false });
    }
  },
}));
