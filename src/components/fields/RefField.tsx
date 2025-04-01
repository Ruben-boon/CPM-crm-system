import React, { useState, useEffect, useRef } from "react";
import { Search, X } from "lucide-react";
import { searchDocuments } from "@/app/actions/crudActions";

interface RefFieldProps {
  label: string;
  fieldPath: string; // Path to the field in the data model
  value: string;
  updateField?: (fieldPath: string, value: any, metadata?: any) => void;
  onChange?: (fieldPath: string, value: any, metadata?: any) => void; // Alternative callback
  required?: boolean;
  disabled?: boolean;
  isEditing?: boolean;
  isChanged?: boolean;
  className?: string;
  collectionName: string;
  displayFields?: string[];
  setFieldLoading?: (fieldPath: string, isLoading: boolean) => void;
  onLoadComplete?: (loaded: boolean, error?: string) => void;
}

export function RefField({
  label,
  fieldPath,
  value = "",
  updateField,
  onChange,
  required = false,
  disabled = false,
  isEditing = false,
  isChanged = false,
  className = "",
  collectionName,
  displayFields = ["name"],
  setFieldLoading,
  onLoadComplete
}: RefFieldProps) {
  const [searchTerm, setSearchTerm] = useState("");
  const [isSearching, setIsSearching] = useState(false);
  const [results, setResults] = useState<any[]>([]);
  const [displayValue, setDisplayValue] = useState("");
  const [isLocalLoading, setIsLocalLoading] = useState(false);
  const [showSearchInput, setShowSearchInput] = useState(!value);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const previousValueRef = useRef<string>("");

  // Use the appropriate update function - handle both callback patterns
  const handleUpdate = (path: string, val: any, metadata?: any) => {
    if (onChange) {
      onChange(path, val, metadata);
    } else if (updateField) {
      updateField(path, val, metadata);
    } else {
      console.error("No update function provided to RefField");
    }
  };

  // Load the display value when the component mounts or value changes
  useEffect(() => {
    // Skip effect if value hasn't changed
    if (previousValueRef.current === value) {
      return;
    }
    
    previousValueRef.current = value;
    
    async function fetchDisplayName() {
      if (!value) {
        setDisplayValue("");
        if (setFieldLoading) {
          setFieldLoading(fieldPath, false);
        }
        if (onLoadComplete) {
          onLoadComplete(true);
        }
        return;
      }

      try {
        setIsLocalLoading(true);
        // Set loading state to true - this is critical!
        if (setFieldLoading) {
          setFieldLoading(fieldPath, true);
        }
        
        const response = await searchDocuments(collectionName, value, "_id");

        if (response && response.length > 0) {
          // Get display string from fields
          const display = displayFields
            .map((field) => {
              const parts = field.split(".");
              let val = response[0];
              for (const part of parts) {
                val = val?.[part];
                if (val === undefined) break;
              }
              return val;
            })
            .filter(Boolean)
            .join(" ");

          setDisplayValue(display);
          
          if (onLoadComplete) {
            onLoadComplete(true);
          }
        } else {
          setDisplayValue("");
          if (onLoadComplete) {
            onLoadComplete(true, "Referenced item not found");
          }
        }

        if (setFieldLoading) {
          setFieldLoading(fieldPath, false);
        }
      } catch (error) {
        console.error(`Failed to load ${collectionName} details:`, error);
        setDisplayValue(`[Unable to load ${collectionName}]`);
        if (setFieldLoading) {
          setFieldLoading(fieldPath, false);
        }
        if (onLoadComplete) {
          onLoadComplete(false, error instanceof Error ? error.message : "Unknown error");
        }
      } finally {
        setIsLocalLoading(false);
      }
    }

    fetchDisplayName();
  }, [value, collectionName, displayFields, fieldPath, setFieldLoading, onLoadComplete]);

  // When value changes, update the showSearchInput state
  useEffect(() => {
    setShowSearchInput(!value);
  }, [value]);

  // Handle click outside to close the dropdown
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setIsSearching(false);
      }
    }

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      // Clear loading state on unmount
      if (setFieldLoading) {
        setFieldLoading(fieldPath, false);
      }
    };
  }, [fieldPath, setFieldLoading]);

  // Handle search input
  const handleSearch = async (term: string) => {
    setSearchTerm(term);

    if (!term.trim()) {
      setResults([]);
      setIsSearching(false);
      return;
    }

    try {
      // Search across all display fields for better results
      const searchPromises = displayFields.map((field) =>
        searchDocuments(collectionName, term, field)
      );

      const resultsArrays = await Promise.all(searchPromises);

      // Combine and deduplicate results
      const combinedResults = Array.from(
        new Map(resultsArrays.flat().map((item) => [item._id, item])).values()
      );

      setResults(combinedResults);
      setIsSearching(combinedResults.length > 0);
    } catch (error) {
      console.error("Search failed:", error);
      setResults([]);
      setIsSearching(false);
    }
  };

  // Handle selecting a search result
  const handleSelect = (result: any) => {
    const display = displayFields
      .map((field) => {
        const parts = field.split(".");
        let val = result;
        for (const part of parts) {
          val = val?.[part];
          if (val === undefined) break;
        }
        return val;
      })
      .filter(Boolean)
      .join(" ");

    setDisplayValue(display);
    handleUpdate(fieldPath, result._id, { displayValue: display });
    setSearchTerm("");
    setIsSearching(false);
    
    // When we select a new value, mark it as loading until the data is fetched
    if (setFieldLoading) {
      setFieldLoading(fieldPath, true);
    }
    
    // Force the UI to show the selected value view
    setShowSearchInput(false);
  };

  // Clear the selection
  const handleClear = () => {
    // Update local states
    setDisplayValue("");
    setSearchTerm("");
    setIsSearching(false);
    
    // Force UI to show search input
    setShowSearchInput(true);
    
    // Update loading state and parent
    if (setFieldLoading) {
      setFieldLoading(fieldPath, false);
    }
    
    // Notify parent
    handleUpdate(fieldPath, "");
    
    // Notify onLoadComplete
    if (onLoadComplete) {
      onLoadComplete(true);
    }
  };

  // Read-only view
  if (!isEditing) {
    return (
      <div className="form-field">
        <label className="field-label">{label}</label>
        <div className={`read-only ${className}`}>
          {value && displayValue ? (
            displayValue
          ) : (
            <span className="empty-reference">-</span>
          )}
        </div>
      </div>
    );
  }

  // Editable view
  return (
    <div className="form-field" ref={dropdownRef}>
      <label className="field-label">
        {label}
        {required && <span className="required-mark">*</span>}
      </label>

      <div className="ref-field-container">
        {!showSearchInput ? (
          <div className="selected-value-container">
            <div
              className={`selected-value ${
                isChanged ? "field-changed" : ""
              } ${className}`}
            >
              {isLocalLoading ? "Loading..." : displayValue || "-"}
            </div>
            <button
              type="button"
              className="clear-button"
              onClick={handleClear}
              disabled={disabled}
            >
              <X size={16} />
            </button>
          </div>
        ) : (
          <div className="search-container">
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => handleSearch(e.target.value)}
              className={`search-input ${
                isChanged ? "field-changed" : ""
              } ${className}`}
              placeholder="Search..."
              disabled={disabled}
            />
            <Search className="search-icon" />

            {isSearching && (
              <div className="search-results">
                {results.map((result) => (
                  <div
                    key={result._id}
                    className="result-item"
                    onClick={() => handleSelect(result)}
                  >
                    {displayFields
                      .map((field) => {
                        const parts = field.split(".");
                        let val = result;
                        for (const part of parts) {
                          val = val?.[part];
                          if (val === undefined) break;
                        }
                        return val;
                      })
                      .filter(Boolean)
                      .join(" ")}
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}