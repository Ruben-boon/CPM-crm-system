// SearchPanel.tsx
"use client";

import { useState, useEffect } from "react";
import SearchBar from "./SearchBar";
import { searchData } from "@/app/actions/search";
import { SerializedContact } from "@/utils/serializers";

interface SearchPanelProps {
  type: string;
  onFilter: (data: SerializedContact[]) => void;
}

export default function SearchHandler({ type, onFilter }: SearchPanelProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [searchableFields, setSearchableFields] = useState<string[]>([]);

  useEffect(() => {
    const initializeFields = async () => {
      try {
        const result = await searchData(type
        );
        if (result.success && result.searchableFields) {
          setSearchableFields(result.searchableFields);
        }
      } catch (error) {
        console.error('Error fetching searchable fields:', error);
      }
    };
    initializeFields();
  }, [type]);

  const handleSearch = async (searchField: string, searchTerm: string) => {
    if (searchTerm.trim()) {
      setIsLoading(true);
      try {
        const result = await searchData('Contacts', searchField, searchTerm.trim());
        if (result.success && result.results) {
          onFilter(result.results);
        } else {
          console.error('Search failed:', result.error);
        }
      } catch (error) {
        console.error('Error during search:', error);
      } finally {
        setIsLoading(false);
      }
    }
  };

  return (
    <div className="search-panel">
      <SearchBar 
        filterList={searchableFields} 
        onSearch={handleSearch}
        isLoading={isLoading}
      />
    </div>
  );
}
