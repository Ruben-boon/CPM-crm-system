"use client";
import { useState } from "react";
import SearchBar from "./SearchBar";
import { searchData } from "../../../Recyclebin/actions_old/search";

type SearchableField = {
  label: string;
  value: string;
};

interface SearchPanelProps {
  type: string;
  onFilter: any;
  //type specefic fields used for search
  searchableFields: SearchableField[];
  projection: any;
  //this is not used at the moment might fix this later?
  query: any;
}

export default function SearchHandler({
  type,
  onFilter,
  searchableFields,
  projection,
}: SearchPanelProps) {
  const [isLoading, setIsLoading] = useState(false);

  const handleSearch = async (searchField: string, searchTerm: string) => {
    if (searchTerm.trim()) {
      setIsLoading(true);
      try {
        const result = await searchData(type, projection, searchField, searchTerm.trim(),);
        if (result.success && result.results) {
          onFilter(result.results);
          console.log("Searched this in the DB:", result);
        } else {
          console.error("Search failed:", result.error);
        }
      } catch (error) {
        console.error("Error during search:", error);
      } finally {
        setIsLoading(false);
      }
    }
  };

  return (
    <div className="search-panel">
      <SearchBar
        searchableFields={searchableFields}
        onSearch={handleSearch}
        isLoading={isLoading}
      />
    </div>
  );
}
