import React, { useState, useEffect } from "react";
import { Search } from "lucide-react";
import { SearchableField } from "@/domain/contacts/contactModel";
import { useContactStore } from "@/store/contactsStore";

interface SearchBarProps {
  searchableFields: SearchableField[];
}

export function SearchBar({ searchableFields }: SearchBarProps) {
  const { searchContacts, isLoading } = useContactStore();
  const [searchField, setSearchField] = useState("");
  const [searchTerm, setSearchTerm] = useState("");

  // Initialize with first searchable field
  useEffect(() => {
    if (searchableFields.length > 0) {
      setSearchField(searchableFields[0].value);
    }
  }, [searchableFields]);

  // Initial search on mount
  useEffect(() => {
    if (searchField) {
      searchContacts(searchField, "");
    }
  }, [searchField]); // Dependency on searchField since we need it to be set first

  const handleSearch = () => {
    // Removed the trim check to allow empty searches
    searchContacts(searchField, searchTerm.trim());
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
        onChange={(e) => setSearchField(e.target.value)}
        disabled={isLoading}
      >
        {searchableFields.map((field) => (
          <option key={field.value} value={field.value}>
            {field.label}
          </option>
        ))}
      </select>
    </div>
  );
}
