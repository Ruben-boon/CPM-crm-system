"use client";
import { createContext, useContext, useState, ReactNode } from "react";
import { ChangeRecord, Item } from "@/types/types";
import {
  createDocument,
  searchDocuments,
  updateDocument,
  deleteDocument,
} from "@/app/actions/crudActions";
import { EntityConfig } from "@/types/entityConfig";

interface RoleFilter {
  bookerChecked: boolean;
  guestChecked: boolean;
}

export interface GenericDataContextType {
  items: Item[];
  selectedItem: Item | null;
  isLoading: boolean;
  error: string | null;
  isEditing: boolean;
  pendingChanges: Record<string, ChangeRecord>;
  roleFilter: RoleFilter;
  entityConfig: EntityConfig;
  searchItems: (searchTerm?: string, searchField?: string) => Promise<void>;
  selectItem: (item: Partial<Item> | null, startEditing?: boolean) => void;
  createItem: (item: Item) => Promise<boolean>;
  updateItem: (item: Item) => Promise<boolean>;
  deleteItem: (id: string) => Promise<boolean>;
  setIsEditing: (isEditing: boolean) => void;
  setPendingChanges: (changes: Record<string, ChangeRecord>) => void;
  setRoleFilter: (filter: Partial<RoleFilter>) => void;
}

const GenericDataContext = createContext<GenericDataContextType | null>(null);

interface GenericDataProviderProps {
  children: ReactNode;
  entityConfig: EntityConfig;
}

export function GenericDataProvider({ children, entityConfig }: GenericDataProviderProps) {
  const [items, setItems] = useState<Item[]>([]);
  const [selectedItem, setSelectedItem] = useState<Item | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [pendingChanges, setPendingChanges] = useState<Record<string, ChangeRecord>>({});
  const [roleFilter, setRoleFilterState] = useState<RoleFilter>({
    bookerChecked: false,
    guestChecked: false,
  });

  const collectionName = entityConfig.name;

  const setRoleFilter = (filter: Partial<RoleFilter>) => {
    setRoleFilterState((prev) => ({
      ...prev,
      ...filter,
    }));
  };

  const searchItems = async (searchTerm?: string, searchField?: string) => {
    console.log(
      `searchItems fired for ${collectionName}, searchTerm:`,
      searchTerm,
      "searchField:",
      searchField
    );
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

  const selectItem = (item: Partial<Item> | null, startEditing = false) => {
    setSelectedItem(item ? ({ _id: "", ...item } as Item) : null);
    setIsEditing(startEditing);
    if (!item) setPendingChanges({});
  };

  const createItem = async (item: Item) => {
    setIsLoading(true);
    try {
      const result = await createDocument(collectionName, item);
      if (result.success) {
        await searchItems();
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
          setPendingChanges({});
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
    <GenericDataContext.Provider
      value={{
        items,
        selectedItem,
        isLoading,
        error,
        isEditing,
        pendingChanges,
        roleFilter,
        entityConfig,
        searchItems,
        selectItem,
        createItem,
        updateItem,
        deleteItem,
        setIsEditing,
        setPendingChanges,
        setRoleFilter,
      }}
    >
      {children}
    </GenericDataContext.Provider>
  );
}

export function useGenericData() {
  const context = useContext(GenericDataContext);
  if (!context) {
    throw new Error("useGenericData must be used within a GenericDataProvider");
  }
  return context;
}