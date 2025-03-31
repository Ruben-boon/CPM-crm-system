import React, { useState, useEffect, useRef } from "react";
import { Search, X, Plus } from "lucide-react";
import { searchDocuments } from "@/app/actions/crudActions";
import Button from "@/components/common/Button";
import { useModal } from "@/context/ModalContext";

interface MultiRefFieldProps {
  label: string;
  value: string[];
  onChange: (value: string[]) => void;
  required?: boolean;
  disabled?: boolean;
  isEditing?: boolean;
  className?: string;
  collectionName: string;
  displayFields?: string[];
  showQuickAdd?: boolean;
  onLoadComplete?: (loaded: boolean, error?: string) => void;
}

interface SearchResult {
  _id: string;
  [key: string]: any;
}

export function MultiRefField({
  label,
  value = [],
  onChange,
  required = false,
  disabled,
  isEditing,
  className = "",
  collectionName,
  displayFields = ["name"],
  showQuickAdd = false,
  onLoadComplete
}: MultiRefFieldProps) {
  const [searchTerm, setSearchTerm] = useState("");
  const [isSearching, setIsSearching] = useState(false);
  const [results, setResults] = useState<SearchResult[]>([]);
  const [displayNames, setDisplayNames] = useState<string[]>([]);
  const dropdownRef = useRef<HTMLDivElement>(null);
  
  const { openModal } = useModal();
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

  // Fetch display names when references change
  useEffect(() => {
    const fetchDisplayNames = async () => {
      if (value.length > 0) {
        try {
          const namePromises = value.map(id => 
            searchDocuments<SearchResult>(collectionName, id, "_id")
          );
          const results = await Promise.all(namePromises);
          const names = results
            .map(result => result[0] ? formatDisplayValue(result[0]) : id)
            .filter(Boolean);

          setDisplayNames(names);
          onLoadComplete?.(true);
        } catch (error) {
          console.error(`Failed to load ${collectionName} display names:`, error);
          // Fallback to IDs if fetching fails
          setDisplayNames(value);
        }
      } else {
        setDisplayNames([]);
      }
    };

    fetchDisplayNames();
  }, [value, collectionName]);

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
        const searchPromises = displayFields.map((field) =>
          searchDocuments<SearchResult>(
            collectionName,
            term,
            field
          )
        );
        
        const results = await Promise.all(searchPromises);
        
        const filteredResults = Array.from(
          new Map(
            results
              .flat()
              .filter(item => !value.includes(item._id))
              .map(item => [item._id, item])
          ).values()
        );
        
        setResults(filteredResults);
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
    const newValue = [...value, result._id];
    onChange(newValue);
    setSearchTerm("");
    setIsSearching(false);
  };

  const handleRemove = (index: number) => {
    const newValue = value.filter((_, i) => i !== index);
    onChange(newValue);
  };

  const handleQuickAdd = () => {
    if (collectionName === "contacts") {
      openModal("contact", {
        initialData: {
          general: { role: "guest" }
        },
        callback: (contactId: string) => {
          const newValue = [...value, contactId];
          onChange(newValue);
        }
      });
    }
  };
  const shouldShowQuickAdd = showQuickAdd && collectionName === "contacts" && isEditing;

  return (
    <div className="ref-field multi-ref-field">
      <label className="field-label">
        {label}
        {isEditing && required && <span className="required-mark">*</span>}
      </label>
      <div className="ref-field-container" ref={dropdownRef}>
        {isEditing ? (
          <>
            <div className="selected-items">
              {value.map((id, index) => (
                <div key={`${id}-${index}`} className="selected-item">
                  <span>{displayNames[index] || id}</span>
                  <button
                    type="button"
                    onClick={() => handleRemove(index)}
                    className="remove-button"
                  >
                    <X className="h-4 w-4" />
                  </button>
                </div>
              ))}
            </div>
            <div className="search-container">
              <div className="search-input-container">
                <input
                  type="text"
                  value={searchTerm}
                  onChange={(e) => handleSearch(e.target.value)}
                  className={`search-input ${className}`}
                  placeholder="Search..."
                  disabled={disabled}
                />
                <Search className="search-icon" />
                
                {shouldShowQuickAdd && (
                  <Button 
                    type="button"
                    size="sm"
                    intent="secondary"
                    icon={Plus} 
                    onClick={handleQuickAdd}
                    className="quick-add-button"
                  >
                    Add New
                  </Button>
                )}
              </div>
              
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
          </>
        ) : (
          <div className={`read-only ${className}`}>
            {displayNames.length > 0 ? (
              <div className="selected-items-readonly selected-items">
                {displayNames.map((name, index) => (
                  <div key={`${value[index]}-${index}`} className="selected-item-readonly">
                    {name}
                  </div>
                ))}
              </div>
            ) : (
              <span className="empty-reference">-</span>
            )}
          </div>
        )}
      </div>

      <style jsx>{`
        .search-input-container {
          display: flex;
          gap: 8px;
          width: 100%;
        }

        .search-input {
          flex: 1;
        }

        .quick-add-button {
          white-space: nowrap;
        }
      `}</style>
    </div>
  );
}