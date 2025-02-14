import React, { useState, useEffect, useRef } from "react";
import { Search } from "lucide-react";
import { searchDocuments } from "@/app/actions/crudActions";

interface RefFieldProps {
  label: string;
  value: string;
  onChange: (value: string, displayValue?: string) => void;
  required?: boolean;
  disabled?: boolean;
  isEditing?: boolean;
  className?: string;
  collectionName: string;
  displayFields?: string[];
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
  displayFields = ["name"],
  selectedLabel = "",
}: RefFieldProps) {
  const [searchTerm, setSearchTerm] = useState("");
  const [isSearching, setIsSearching] = useState(false);
  const [results, setResults] = useState<SearchResult[]>([]);
  const [displayValue, setDisplayValue] = useState(selectedLabel);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const loadReferenceDetails = async () => {
      if (value) {
        try {
          const response = await searchDocuments<SearchResult>(
            collectionName,
            value,
            "_id"
          );
          const results = typeof response === 'string' 
            ? JSON.parse(response) 
            : Array.isArray(response) 
              ? response 
              : [];
          if (results.length > 0) {
            const display = formatDisplayValue(results[0]);
            setDisplayValue(display);
            onChange(value, display);
          }
        } catch (error) {
          console.error(`Failed to load ${collectionName} details:`, error);
        }
      }
    };

    if (value && !selectedLabel) {
      loadReferenceDetails();
    } else {
      setDisplayValue(selectedLabel);
    }
  }, [value, selectedLabel, collectionName]);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsSearching(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const getNestedValue = (obj: any, path: string) => {
    const parts = path.split('.');
    let value = obj;
    for (const part of parts) {
      value = value?.[part];
    }
    return value;
  };

  const formatDisplayValue = (result: SearchResult) => {
    return displayFields
      .map(field => getNestedValue(result, field))
      .filter(Boolean)
      .join(" ");
  };

  const handleSearch = async (term: string) => {
    setSearchTerm(term);
    if (term.length > 0) {
      try {
        const searchPromises = displayFields.map((field) =>
          searchDocuments<SearchResult>(
            collectionName,
            term,
            field
          ).then(response => {
            return typeof response === 'string' 
              ? JSON.parse(response) 
              : Array.isArray(response) 
                ? response 
                : [];
          })
        );
        
        const results = await Promise.all(searchPromises);
        
        const uniqueResults = Array.from(
          new Map(
            results
              .flat()
              .map(item => [item._id, item])
          ).values()
        );
        
        setResults(uniqueResults);
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
    const display = formatDisplayValue(result);
    setDisplayValue(display);
    onChange(result._id, display);
    setSearchTerm("");
    setIsSearching(false);
  };

  return (
    <div className="ref-field">
      <label className="field-label">
        {label}
        {isEditing && required && <span className="required-mark">*</span>}
      </label>
      <div className="ref-field-container" ref={dropdownRef}>
        <div className="ref-field-single">
          <div className={`read-only flex-1 ${className}`}>
            {displayValue || <span className="empty-reference">-</span>}
          </div>
          {isEditing && (
            <div className="search-container flex-1">
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
                      <span className="result-name">{formatDisplayValue(result)}</span>
                      <span className="result-id">{result._id}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}