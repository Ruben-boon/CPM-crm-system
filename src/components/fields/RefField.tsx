import React, { useState, useEffect, useRef } from "react";
import { Search, X } from "lucide-react";
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
  onLoadComplete?: (loaded: boolean, error?: string) => void;
  allowClear?: boolean; // New prop to control whether clearing is allowed
  selectedLabel?: string; // Optional prop for pre-filled display value
}

export function RefField({
  label,
  value = "",
  onChange,
  required = false,
  disabled = false,
  isEditing = false,
  className = "",
  collectionName,
  displayFields = ["name"],
  onLoadComplete,
  allowClear = false, // Default to false for backward compatibility
  selectedLabel,
}: RefFieldProps) {
  const [searchTerm, setSearchTerm] = useState("");
  const [isSearching, setIsSearching] = useState(false);
  const [results, setResults] = useState<any[]>([]);
  const [displayValue, setDisplayValue] = useState(selectedLabel || "");
  const [isLoading, setIsLoading] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const prevValueRef = useRef<string>(value);
  const loadCompleteCalledRef = useRef<boolean>(false);
  const [retryCount, setRetryCount] = useState(0);
  const MAX_RETRIES = 3;
  const retryDelay = process.env.NODE_ENV === 'production' ? 1000 : 0;

  // Reset the load complete flag when value changes
  useEffect(() => {
    // Value has changed, we're starting a new load cycle
    if (value !== prevValueRef.current) {
      loadCompleteCalledRef.current = false;
      setDisplayValue(selectedLabel || "");
      setRetryCount(0);
      prevValueRef.current = value;
    }
  }, [value, selectedLabel]);

  // Define fetchDisplayName at the component level so it's accessible everywhere
  async function fetchDisplayName() {
    // Skip if we already have a display value for this ID
    if (value && displayValue && value === prevValueRef.current) {
      if (!loadCompleteCalledRef.current) {
        loadCompleteCalledRef.current = true;
        onLoadComplete?.(true);
      }
      setIsLoading(false);
      return;
    }
    
    // Reset display value if no ID
    if (!value) {
      setIsLoading(false);
      
      // Only signal complete if we haven't already for this value
      if (!loadCompleteCalledRef.current) {
        loadCompleteCalledRef.current = true;
        onLoadComplete?.(true);
      }
      return;
    }

    try {
      setIsLoading(true);
      const response = await searchDocuments(collectionName, value, "_id");
      const parsedResults = typeof response === "string" ? JSON.parse(response) : response;
      const resultArray = Array.isArray(parsedResults) ? parsedResults : [];
      
      // Only proceed if this is still the current value
      if (value !== prevValueRef.current) return;
      
      if (resultArray.length > 0) {
        // Get display string from fields
        const display = displayFields
          .map(field => {
            const parts = field.split(".");
            let val = resultArray[0];
            for (const part of parts) {
              val = val?.[part];
              if (val === undefined) break;
            }
            return val;
          })
          .filter(Boolean)
          .join(" ");
          
        setDisplayValue(display);
      } else {
        setDisplayValue("");
      }
      
      // Signal load complete only once per value
      if (!loadCompleteCalledRef.current) {
        loadCompleteCalledRef.current = true;
        onLoadComplete?.(true);
      }
    } catch (error) {
      console.error(`Failed to load ${collectionName} details:`, error);
      
      // Only handle error for current value
      if (value === prevValueRef.current) {
        // Increase retry count but don't set displayValue yet to allow retries
        setRetryCount(prev => prev + 1);
        
        // Only on final retry, set a display value
        if (retryCount >= MAX_RETRIES - 1) {
          setDisplayValue(`[Unable to load ${collectionName}]`);
          
          // Signal load error only once per value
          if (!loadCompleteCalledRef.current) {
            loadCompleteCalledRef.current = true;
            onLoadComplete?.(false, `Failed to load ${collectionName} details`);
          }
        }
      }
    } finally {
      // Only update loading state if this is for the current value
      if (value === prevValueRef.current) {
        setIsLoading(false);
      }
    }
  }

  // Single effect for loading with retry logic
  useEffect(() => {
    if (value && !loadCompleteCalledRef.current) {
      const timeoutId = setTimeout(() => {
        fetchDisplayName().catch((error) => {
          console.error("Error in fetchDisplayName:", error);
          // Retry logic is handled inside fetchDisplayName
        });
      }, retryCount * retryDelay);
      
      return () => clearTimeout(timeoutId);
    } else if (!value && !loadCompleteCalledRef.current) {
      // For empty values, signal complete immediately
      loadCompleteCalledRef.current = true;
      onLoadComplete?.(true);
    }
  }, [value, retryCount, collectionName, displayFields, onLoadComplete]);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsSearching(false);
      }
    }
    
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Handle search input
  async function handleSearch(term: string) {
    setSearchTerm(term);
    
    if (!term.trim()) {
      setResults([]);
      setIsSearching(false);
      return;
    }

    try {
      const response = await searchDocuments(collectionName, term, displayFields[0]);
      const parsedResults = typeof response === "string" ? JSON.parse(response) : response;
      const resultArray = Array.isArray(parsedResults) ? parsedResults : [];
      
      setResults(resultArray);
      setIsSearching(resultArray.length > 0);
    } catch (error) {
      console.error("Search failed:", error);
      setResults([]);
    }
  }

  // Handle selecting a search result
  function handleSelect(result: any) {
    const display = displayFields
      .map(field => {
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
    
    // When manually selecting, we're already "loaded"
    loadCompleteCalledRef.current = true;
    prevValueRef.current = result._id;  
    setDisplayValue(display);
    setIsLoading(false); // Explicitly clear loading state
    onChange(result._id, display);
    setSearchTerm("");
    setIsSearching(false);
    
    // Signal complete for manual selection
    onLoadComplete?.(true);
  }

  // Clear the selection
  function handleClear() {
    loadCompleteCalledRef.current = true;
    prevValueRef.current = "";
    setDisplayValue("");
    setSearchTerm("");
    setIsLoading(false); // Explicitly clear loading state
    onChange("", "");
    setIsSearching(false);
    
    // Signal complete for clearing
    onLoadComplete?.(true);
  }

  // Read-only view
  if (!isEditing) {
    return (
      <div className="ref-field">
        <label className="field-label">{label}</label>
        <div className={`read-only ${className}`}>
          {value && displayValue ? displayValue : <span className="empty-reference">-</span>}
        </div>
      </div>
    );
  }

  // Disabled view
  if (disabled) {
    return (
      <div className="ref-field">
        <label className="field-label">{label}</label>
        <div className="disabled-field">
          <i>This field is automatically set and cannot be edited.</i>
        </div>
      </div>
    );
  }

  // Editable view
  return (
    <div className="ref-field">
      <label className="field-label">
        {label}
        {required && <span className="required-mark">*</span>}
      </label>
      <div className="ref-field-container" ref={dropdownRef}>
        {value ? (
          <div className="selected-value-container">
            <div className={`selected-value ${displayValue && displayValue.startsWith("[Unable") ? "error-value" : ""} ${className}`}>
              {isLoading ? "Loading..." : displayValue || "-"}
            </div>
            {/* Only show clear button if allowClear is true */}
            {allowClear && (
              <button
                type="button"
                className="clear-button"
                onClick={handleClear}
                aria-label="Clear selection"
              >
                <X size={16} />
              </button>
            )}
          </div>
        ) : (
          <div className="search-container">
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => handleSearch(e.target.value)}
              className={`search-input ${className}`}
              placeholder="Search..."
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
                      .map(field => {
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