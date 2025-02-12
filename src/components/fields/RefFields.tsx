import React, { useState, useEffect, useRef } from "react";
import { Search } from "lucide-react";
import { searchDocuments } from "@/app/actions/crudActions";

interface RefFieldProps {
    label: string;
    value: string;
    onChange: (value: string, displayValue?: string) => void;  // Updated
    required?: boolean;
    disabled?: boolean;
    isEditing?: boolean;
    className?: string;
    collectionName: string;
    displayField?: string;
    selectedLabel?: string;
  }
interface SearchResult {
  _id: string;
  [key: string]: any;
}

export function RefField({
  label,
  value = "",
  onChange,
  required = false,
  disabled,
  isEditing,
  className = "",
  collectionName,
  displayField = "name",
  selectedLabel = "",
}: RefFieldProps) {
  const [searchTerm, setSearchTerm] = useState("");
  const [isSearching, setIsSearching] = useState(false);
  const [results, setResults] = useState<SearchResult[]>([]);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsSearching(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleSearch = async (term: string) => {
    setSearchTerm(term);
    if (term.length > 0) {
      try {
        const searchResults = await searchDocuments<SearchResult>(
          collectionName,
          term,
          displayField
        );
        setResults(searchResults);
        setIsSearching(true);
      } catch (error) {
        console.error("Search failed:", error);
        setResults([]);
      }
    } else {
      setResults([]);
      setIsSearching(false);
    }
  };

  const handleSelect = (result: SearchResult) => {
    onChange(result._id, result[displayField]); // Add the displayValue parameter
    setSearchTerm(result[displayField]);
    setIsSearching(false);
  };

  return (
    <div className="ref-field">
      <label className="field-label">
        {label}
        {isEditing && required && <span className="required-mark">*</span>}
      </label>
      <div className="ref-field-container" ref={dropdownRef}>
        {isEditing ? (
          <div className="search-container">
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => handleSearch(e.target.value)}
              className={`search-input ${className}`}
              placeholder="Search..."
              disabled={disabled}
            />
            <Search className="search-icon" />
            {isSearching && results.length > 0 && (
              <div className="search-results">
                {results.map((result) => (
                  <div
                    key={result._id}
                    className="result-item"
                    onClick={() => handleSelect(result)}
                  >
                    <span className="result-name">{result[displayField]}</span>
                    <span className="result-id">{result._id}</span>
                  </div>
                ))}
              </div>
            )}
          </div>
        ) : (
          <div className={`read-only ${className}`}>
            {selectedLabel || <span className="empty-reference">-</span>}
          </div>
        )}
      </div>
    </div>
  );
}