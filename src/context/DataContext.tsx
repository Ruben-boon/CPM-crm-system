"use client";
import { createContext, useContext, useState, ReactNode, useRef, useCallback } from "react";
import { ChangeRecord, Item } from "@/types/types";
import {
  createDocument,
  searchDocuments,
  updateDocument,
  deleteDocument,
} from "@/app/actions/crudActions";

interface RoleFilter {
  bookerChecked: boolean;
  guestChecked: boolean;
}

interface FieldLoadingState {
  [fieldPath: string]: boolean;
}

interface DataContextType {
  items: Item[];
  selectedItem: Item | null;
  originalItem: Item | null; 
  isLoading: boolean;
  error: string | null;
  isEditing: boolean;
  pendingChanges: Record<string, ChangeRecord>;
  roleFilter: RoleFilter;
  fieldLoadingStates: FieldLoadingState;
  searchItems: (searchTerm?: string, searchField?: string) => Promise<void>;
  selectItem: (item: Partial<Item> | null, startEditing?: boolean) => void;
  createItem: (item: Item) => Promise<boolean>;
  updateItem: (item: Item) => Promise<boolean>;
  deleteItem: (id: string) => Promise<boolean>;
  setIsEditing: (isEditing: boolean) => void;
  updateField: (field: string, value: any) => void;
  resetForm: () => void; 
  cancelCopy: () => void; 
  setRoleFilter: (filter: Partial<RoleFilter>) => void;
  setFieldLoading: (fieldPath: string, isLoading: boolean) => void;
  isAnyFieldLoading: () => boolean;
  isDirty: boolean; 
}

const DataContext = createContext<DataContextType | null>(null);

function createDataContext(collectionName: string) {
  function DataProvider({ children }: { children: ReactNode }) {
    const [items, setItems] = useState<Item[]>([]);
    const [selectedItem, setSelectedItem] = useState<Item | null>(null);
    const [originalItem, setOriginalItem] = useState<Item | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [isEditing, setIsEditing] = useState(false);
    const [pendingChanges, setPendingChanges] = useState<
      Record<string, ChangeRecord>
    >({});
    const [roleFilter, setRoleFilterState] = useState<RoleFilter>({
      bookerChecked: false,
      guestChecked: false,
    });
    const [fieldLoadingStates, setFieldLoadingStates] = useState<FieldLoadingState>({});
    
    // Use this ref to track the current loading states without triggering rerenders
    const fieldLoadingStatesRef = useRef<FieldLoadingState>({});

    const isDirty = Object.keys(pendingChanges).length > 0;
    
    const setRoleFilter = (filter: Partial<RoleFilter>) => {
      setRoleFilterState((prev) => ({
        ...prev,
        ...filter,
      }));
    };

    // Memoize this function to prevent it from changing on every render
    const setFieldLoading = useCallback((fieldPath: string, isLoading: boolean) => {
      // First update the ref immediately (doesn't cause rerenders)
      fieldLoadingStatesRef.current = {
        ...fieldLoadingStatesRef.current,
        [fieldPath]: isLoading
      };
      
      // Then update the state with proper equality check
      setFieldLoadingStates(prev => {
        // Skip update if value hasn't changed
        if (prev[fieldPath] === isLoading) {
          return prev;
        }
        
        // Create new state object with updated value
        return {
          ...prev,
          [fieldPath]: isLoading
        };
      });
    }, []);

    // Use the ref for checking loading state to avoid unnecessary rerenders
    const isAnyFieldLoading = useCallback(() => {
      return Object.values(fieldLoadingStatesRef.current).some(isLoading => isLoading);
    }, []);
    
    const cancelCopy = useCallback(() => {
      setSelectedItem(null);
      setOriginalItem(null);
      setPendingChanges({});
      setFieldLoadingStates({});
      fieldLoadingStatesRef.current = {};
      setIsEditing(false);
    }, []);
    
    const searchItems = async (searchTerm?: string, searchField?: string) => {
      setIsLoading(true);
      try {
        const results = await searchDocuments(
          collectionName,
          searchTerm,
          searchField
        );

        // role filtering for contacts
        let filteredResults = [...results];
        if (
          collectionName === "contacts" &&
          (roleFilter.bookerChecked || roleFilter.guestChecked)
        ) {
          filteredResults = results.filter((item) => {
            const role = item.general?.role;
            const includeBooker =
              roleFilter.bookerChecked &&
              (role === "booker" || role === "both");
            const includeGuest =
              roleFilter.guestChecked && (role === "guest" || role === "both");

            return includeBooker || includeGuest;
          });
        }

        setItems(filteredResults);
        setError(null);
      } catch (error) {
        setError(error instanceof Error ? error.message : "Search failed");
      } finally {
        setIsLoading(false);
      }
    };

    const selectItem = useCallback((item: Partial<Item> | null, startEditing = false) => {
      const newItem = item ? ({ _id: "", ...item } as Item) : null;
      setSelectedItem(newItem);
      
      // Store a deep copy of the original item for reset functionality
      setOriginalItem(newItem ? JSON.parse(JSON.stringify(newItem)) : null);
      
      setIsEditing(startEditing);
      setPendingChanges({});
      setFieldLoadingStates({});
      fieldLoadingStatesRef.current = {}; // Reset loading states when selecting a new item
    }, []);

    const updateField = (field: string, value: any) => {
      if (!selectedItem) return;

      // Create a deep copy of the selected item
      const updatedItem = JSON.parse(JSON.stringify(selectedItem));
      
      // Handle nested fields (e.g., "general.firstName")
      const fieldParts = field.split('.');
      
      if (fieldParts.length === 1) {
        // Direct field update
        updatedItem[field] = value;
      } else {
        // Nested field update
        let current = updatedItem;
        for (let i = 0; i < fieldParts.length - 1; i++) {
          const part = fieldParts[i];
          if (!current[part]) current[part] = {};
          current = current[part];
        }
        current[fieldParts[fieldParts.length - 1]] = value;
      }
      
      // Update the selected item
      setSelectedItem(updatedItem);
      
      // Track the change in pendingChanges
      const getOriginalValue = () => {
        if (!originalItem) return undefined;
        
        let current = originalItem;
        for (let i = 0; i < fieldParts.length - 1; i++) {
          if (!current[fieldParts[i]]) return undefined;
          current = current[fieldParts[i]];
        }
        return current[fieldParts[fieldParts.length - 1]];
      };
      
      const originalValue = getOriginalValue();
      
      // Only track as a change if it's different from the original
      if (JSON.stringify(originalValue) !== JSON.stringify(value)) {
        setPendingChanges(prev => ({
          ...prev,
          [field]: {
            oldValue: originalValue,
            newValue: value
          }
        }));
      } else {
        // If value is back to original, remove from pending changes
        const newPendingChanges = { ...pendingChanges };
        delete newPendingChanges[field];
        setPendingChanges(newPendingChanges);
      }

      // If it's a reference field, mark it as loading
      if (field.endsWith('Id')) {
        setFieldLoading(field, true);
      }
    };
    
    const resetForm = useCallback(() => {
      if (originalItem) {
        setSelectedItem(JSON.parse(JSON.stringify(originalItem)));
        setPendingChanges({});
      }
    }, [originalItem]);

    const createItem = async (item: Item) => {
      setIsLoading(true);
      try {
        const result = await createDocument(collectionName, item);
        if (result.success) {
          await searchItems();
          
          // Update both selectedItem and originalItem with the created item
          if (result.data) {
            setSelectedItem(result.data);
            setOriginalItem(JSON.parse(JSON.stringify(result.data)));
            setPendingChanges({});
            setFieldLoadingStates({});
            fieldLoadingStatesRef.current = {};
          }
          
          setError(null);
          return true;
        }
        setError(result.error || "Creation failed");
        return false;
      } finally {
        setIsLoading(false);
      }
    };

    const updateItem = async (item: Item) => {
      if (!item._id) {
        setError("Missing item ID");
        return false;
      }

      setIsLoading(true);
      try {
        const result = await updateDocument(collectionName, item._id, item);
        if (result.success) {
          await searchItems();
          
          // Update both selectedItem and originalItem with the updated item
          if (result.data) {
            setSelectedItem(result.data);
            setOriginalItem(JSON.parse(JSON.stringify(result.data)));
            setPendingChanges({});
            setFieldLoadingStates({});
            fieldLoadingStatesRef.current = {};
          }
          
          setError(null);
          return true;
        }
        setError(result.error || "Update failed");
        return false;
      } finally {
        setIsLoading(false);
      }
    };

    const deleteItem = async (id: string) => {
      if (!id) {
        setError("Missing item ID");
        return false;
      }

      setIsLoading(true);
      try {
        const result = await deleteDocument(collectionName, id);
        if (result.success) {
          // Clear the selected item if it was deleted
          if (selectedItem?._id === id) {
            setSelectedItem(null);
            setOriginalItem(null);
            setPendingChanges({});
            setFieldLoadingStates({});
            fieldLoadingStatesRef.current = {};
          }
          await searchItems();
          setError(null);
          return true;
        }
        setError(result.error || "Deletion failed");
        return false;
      } finally {
        setIsLoading(false);
      }
    };

    return (
      <DataContext.Provider
        value={{
          items,
          selectedItem,
          originalItem,
          isLoading,
          error,
          isEditing,
          pendingChanges,
          roleFilter,
          fieldLoadingStates,
          isDirty,
          searchItems,
          selectItem,
          createItem,
          updateItem,
          deleteItem,
          setIsEditing,
          updateField,
          resetForm,
          cancelCopy, 
          setRoleFilter,
          setFieldLoading,
          isAnyFieldLoading,
        }}
      >
        {children}
      </DataContext.Provider>
    );
  }

  const useData = () => {
    const context = useContext(DataContext);
    if (!context) {
      throw new Error("useData must be used within a DataProvider");
    }
    return context;
  };

  return { DataProvider, useData };
}

export const { DataProvider: ContactsProvider, useData: useContactsData } =
  createDataContext("contacts");

export const { DataProvider: CompaniesProvider, useData: useCompaniesData } =
  createDataContext("companies");

export const { DataProvider: BookingsProvider, useData: useBookingsData } =
  createDataContext("bookings");

export const { DataProvider: HotelsProvider, useData: useHotelsData } =
  createDataContext("hotels");

export const { DataProvider: StaysProvider, useData: useStaysData } =
  createDataContext("stays");