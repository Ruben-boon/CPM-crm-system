"use client";
import { createContext, useContext, useState, ReactNode } from "react";
import { ChangeRecord, Item } from "@/types/types";
import {
  createDocument,
  searchDocuments,
  updateDocument,
} from "@/app/actions/crudActions";

interface DataContextType {
  items: Item[];
  selectedItem: Item | null;
  isLoading: boolean;
  error: string | null;
  isEditing: boolean;
  pendingChanges: Record<string, ChangeRecord>;
  searchItems: (searchTerm?: string) => Promise<void>;
  selectItem: (item: Partial<Item> | null, startEditing?: boolean) => void;
  createItem: (item: Item) => Promise<boolean>;
  updateItem: (item: Item) => Promise<boolean>;
  setIsEditing: (isEditing: boolean) => void;
  setPendingChanges: (changes: Record<string, ChangeRecord>) => void;
}

const DataContext = createContext<DataContextType | null>(null);

function createDataContext(collectionName: string) {
  function DataProvider({ children }: { children: ReactNode }) {
    const [items, setItems] = useState<Item[]>([]);
    const [selectedItem, setSelectedItem] = useState<Item | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [isEditing, setIsEditing] = useState(false);
    const [pendingChanges, setPendingChanges] = useState<
      Record<string, ChangeRecord>
    >({});

    const searchItems = async (searchTerm?: string, searchField?: string) => {
      console.log("searchItems fired searchTerm:",searchTerm,"searchField:", searchField);
      setIsLoading(true);
      try {
        const results = await searchDocuments(collectionName, searchTerm ,searchField);
        setItems(results);
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

    return (
      <DataContext.Provider
        value={{
          items,
          selectedItem,
          isLoading,
          error,
          isEditing,
          pendingChanges,
          searchItems,
          selectItem,
          createItem,
          updateItem,
          setIsEditing,
          setPendingChanges,
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

//create context based on DB type
export const { DataProvider: ContactsProvider, useData: useContactsData } =
  createDataContext("contacts");

  export const { DataProvider: CompaniesProvider, useData: useCopaniesData } =
  createDataContext("companies");

// export const { DataProvider: VariableProvider, useData: useVariableData } =
//   createDataContext("variables");

// export const { DataProvider: WoningenProvider, useData: useWoningenData } =
//   createDataContext("woningen");

// export const { DataProvider: TypesProvider, useData: useTypesData } =
//   createDataContext("types");
