"use client";
import {
  createContext,
  useContext,
  useState,
  ReactNode,
  useRef,
  useCallback,
} from "react";
import { ChangeRecord, Item } from "@/types/types";
import {
  createDocument,
  searchDocuments,
  updateDocument,
  deleteDocument,
} from "@/app/actions/crudActions";
import { useSession } from "next-auth/react";

interface RoleFilter {
  bookerChecked: boolean;
  guestChecked: boolean;
}

interface DataContextType {
  items: Item[];
  selectedItem: Item | null;
  originalItem: Item | null;
  error: string | null;
  isEditing: boolean;
  pendingChanges: Record<string, ChangeRecord>;
  roleFilter: RoleFilter;
  isLoading: boolean;
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
  isDirty: boolean;
  setFieldLoading: (field: string, isLoading: boolean) => void;
}

const DataContext = createContext<DataContextType | null>(null);

function createDataContext(collectionName: string) {
  function DataProvider({ children }: { children: ReactNode }) {
    const { data: session, status } = useSession();
    const userId = session?.user?.id;
    const isAuthenticated = status === "authenticated";

    const [items, setItems] = useState<Item[]>([]);
    const [selectedItem, setSelectedItem] = useState<Item | null>(null);
    const [originalItem, setOriginalItem] = useState<Item | null>(null);
    const [error, setError] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState<boolean>(false);
    const [isEditing, setIsEditing] = useState(false);
    const [pendingChanges, setPendingChanges] = useState<
      Record<string, ChangeRecord>
    >({});
    const [roleFilter, setRoleFilterState] = useState<RoleFilter>({
      bookerChecked: false,
      guestChecked: false,
    });
    const [fieldLoading, setFieldLoadingState] = useState<
      Record<string, boolean>
    >({});

    const isDirty = Object.keys(pendingChanges).length > 0;

    const setRoleFilter = (filter: Partial<RoleFilter>) => {
      setRoleFilterState((prev) => ({
        ...prev,
        ...filter,
      }));
    };

    const setFieldLoading = useCallback((field: string, loading: boolean) => {
      setFieldLoadingState((prev) => ({
        ...prev,
        [field]: loading,
      }));
    }, []);

    const cancelCopy = useCallback(() => {
      setSelectedItem(null);
      setOriginalItem(null);
      setPendingChanges({});
      setIsEditing(false);
    }, []);

    const copyItem = async (id: string) => {
      try {
        setIsLoading(true);

        // Fetch the item to copy
        const result = await searchDocuments(collectionName, id, "_id");

        if (Array.isArray(result) && result.length > 0) {
          // Make a deep clone of the source item
          const sourceItem = JSON.parse(JSON.stringify(result[0]));

          // Remove the _id to create a new item
          delete sourceItem._id;

          // Update name/identifier fields to indicate it's a copy
          if (sourceItem.name) {
            sourceItem.name = `${sourceItem.name} (Copy)`;
          } else if (sourceItem.confirmationNo) {
            sourceItem.confirmationNo = `${sourceItem.confirmationNo} (Copy)`;
          } else if (sourceItem.reference) {
            sourceItem.reference = `${sourceItem.reference} (Copy)`;
          } else if (sourceItem.general?.firstName) {
            sourceItem.general.firstName = `${sourceItem.general.firstName} (Copy)`;
          }

          // Select the item with edit mode enabled
          selectItem(sourceItem, true);
          return true;
        }
        return false;
      } catch (error) {
        console.error(`Error creating ${collectionName} copy:`, error);
        return false;
      } finally {
        setIsLoading(false);
      }
    };

    // In DataContext.tsx, modify the searchItems function

    const searchItems = async (searchTerm?: string, searchField?: string) => {
      try {
        setIsLoading(true);

        // Pass userId as an optional parameter (for auditing or future use)
        // but don't filter by it in the actual query
        const results = await searchDocuments(
          collectionName,
          searchTerm,
          searchField,
          userId // Pass this for potential future use, but don't filter by it
        );

        // Rest of your function remains the same
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
        setItems([]);
      } finally {
        setIsLoading(false);
      }
    };

    const selectItem = useCallback(
      (item: Partial<Item> | null, startEditing = false) => {
        const newItem = item ? ({ _id: "", ...item } as Item) : null;
        setSelectedItem(newItem);

        // Store a deep copy of the original item for reset functionality
        setOriginalItem(newItem ? JSON.parse(JSON.stringify(newItem)) : null);

        setIsEditing(startEditing);
        setPendingChanges({});
      },
      []
    );

    const updateField = (field: string, value: any) => {
      if (!selectedItem) return;

      // Create a deep copy of the selected item
      const updatedItem = JSON.parse(JSON.stringify(selectedItem));

      // Handle nested fields (e.g., "general.firstName")
      const fieldParts = field.split(".");

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
        setPendingChanges((prev) => ({
          ...prev,
          [field]: {
            oldValue: originalValue,
            newValue: value,
          },
        }));
      } else {
        // If value is back to original, remove from pending changes
        const newPendingChanges = { ...pendingChanges };
        delete newPendingChanges[field];
        setPendingChanges(newPendingChanges);
      }
    };

    const resetForm = useCallback(() => {
      if (originalItem) {
        setSelectedItem(JSON.parse(JSON.stringify(originalItem)));
        setPendingChanges({});
      }
    }, [originalItem]);

    const createItem = async (item: Item) => {
      if (!isAuthenticated && userId === undefined) {
        setError("Authentication required");
        return false;
      }

      try {
        setIsLoading(true);

        // Track document version for concurrency control
        const itemWithVersion = { ...item, version: 0 };

        const result = await createDocument(
          collectionName,
          itemWithVersion,
          userId
        );
        if (result.success) {
          await searchItems();

          // Update both selectedItem and originalItem with the created item
          if (result.data) {
            setSelectedItem(result.data);
            setOriginalItem(JSON.parse(JSON.stringify(result.data)));
            setPendingChanges({});
          }

          setError(null);
          return true;
        }
        setError(result.error || "Creation failed");
        return false;
      } catch (error) {
        setError(error instanceof Error ? error.message : "Creation failed");
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

      if (!isAuthenticated && userId === undefined) {
        setError("Authentication required");
        return false;
      }

      try {
        setIsLoading(true);

        // Ensure we're passing the current version
        const currentVersion = selectedItem?.version || 0;
        const itemWithVersion = { ...item, version: currentVersion };

        const result = await updateDocument(
          collectionName,
          item._id,
          itemWithVersion,
          userId
        );
        if (result.success) {
          await searchItems();

          // Update both selectedItem and originalItem with the updated item
          // Include the incremented version
          if (result.data) {
            const updatedItem = {
              ...result.data,
              version: (currentVersion || 0) + 1,
            };
            setSelectedItem(updatedItem);
            setOriginalItem(JSON.parse(JSON.stringify(updatedItem)));
            setPendingChanges({});
          }

          setError(null);
          return true;
        }

        // Special handling for version conflict errors
        if (result.error?.includes("modified by another user")) {
          setError(
            "This record was modified by another user. Please refresh and try again."
          );
          // Could add logic here to show a diff or help resolve the conflict
        } else {
          setError(result.error || "Update failed");
        }

        return false;
      } catch (error) {
        setError(error instanceof Error ? error.message : "Update failed");
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

      if (!isAuthenticated && userId === undefined) {
        setError("Authentication required");
        return false;
      }

      try {
        setIsLoading(true);

        const result = await deleteDocument(collectionName, id, userId);
        if (result.success) {
          // Clear the selected item if it was deleted
          if (selectedItem?._id === id) {
            setSelectedItem(null);
            setOriginalItem(null);
            setPendingChanges({});
          }
          await searchItems();
          setError(null);
          return true;
        }
        setError(result.error || "Deletion failed");
        return false;
      } catch (error) {
        setError(error instanceof Error ? error.message : "Deletion failed");
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
          error,
          isEditing,
          pendingChanges,
          roleFilter,
          isDirty,
          isLoading,
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
