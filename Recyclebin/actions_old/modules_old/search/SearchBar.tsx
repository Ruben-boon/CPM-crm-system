"use client";
import { Search } from "lucide-react";
import { useEffect } from "react";
import { useState } from "react";

type SearchableField = {
  label: string;
  value: string;
};

interface SearchBarProps {
  searchableFields: SearchableField[];
  onSearch: (searchField: string, searchTerm: string) => void;
  isLoading?: boolean;
}

export default function SearchBar({
  searchableFields,
  onSearch,
  isLoading = false,
}: SearchBarProps) {
  const [searchField, setSearchField] = useState("");
  const [searchTerm, setSearchTerm] = useState("");

  //set the first field on initilise
  useEffect(() => {
    if (searchableFields.length > 0) {
      setSearchField(searchableFields[0].value); 
    }
  }, [searchableFields]);


  const handleSearch = () => {
    onSearch(searchField, searchTerm.trim());
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      handleSearch();
    }
};

  return (
    <div className="search-container">
      <div className="search-bar">
        <Search className="search-bar__icon" size={20} strokeWidth={1.5} />
        <input
          type="text"
          className="search-bar__input"
          placeholder={`Search by ${searchField}`}
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          onKeyDown={handleKeyDown}
          disabled={isLoading}
        />
      </div>

      <select
        className="search-filter"
        value={searchField}
        onChange={(e) => {
          setSearchField(e.target.value);
        }}
        disabled={isLoading}
      >
        {searchableFields.map((field) => {
          return (
            <option key={field.value} value={field.value}>
              {field.label}
            </option>
          );
        })}
      </select>
    </div>
  );
}
