import React, { useState, useEffect, useRef } from "react";
import { Search, X } from "lucide-react";
import { searchDocuments } from "@/app/actions/crudActions";

interface DisplayFieldConfig {
  path: string;
  label?: string; // Optional label for the field
  format?: (value: any) => string; // Optional formatter function
}

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
  // Enhanced display fields configuration
  displayFields?: (string | DisplayFieldConfig)[];
  displayTemplate?: string; // Optional template like "{name} - {email}"
  displaySeparator?: string; // Separator between fields (default: space)
  onLoadComplete?: (loaded: boolean, error?: string) => void;
  // Optional prop to save the name/display value in a separate field
  nameFieldPath?: string;
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
  displayTemplate,
  displaySeparator = " ",
  onLoadComplete,
  // Optional - if provided, will save the display name to this field
  nameFieldPath
}: RefFieldProps) {
  const [searchTerm, setSearchTerm] = useState("");
  const [isSearching, setIsSearching] = useState(false);
  const [results, setResults] = useState<any[]>([]);
  const [displayValue, setDisplayValue] = useState<React.ReactNode>("");
  const [isLocalLoading, setIsLocalLoading] = useState(false);
  const [showSearchInput, setShowSearchInput] = useState(!value);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const previousValueRef = useRef<string>("");

  // We'll only save the name if nameFieldPath is explicitly provided
  const shouldSaveName = !!nameFieldPath;

  // Normalize display fields to always use the object format
  const normalizedDisplayFields = displayFields.map(field => 
    typeof field === 'string' ? { path: field } : field
  );

  // Helper function to extract field value from an object using dot notation
  const getNestedValue = (obj: any, path: string): any => {
    const parts = path.split(".");
    let result = obj;
    for (const part of parts) {
      if (result === undefined || result === null) return undefined;
      result = result[part];
    }
    return result;
  };

  // Format a document into a display string or JSX element based on configuration
  const formatDisplayString = (doc: any): React.ReactNode => {
    if (displayTemplate) {
      // Use template string if provided
      let result = displayTemplate;
      normalizedDisplayFields.forEach(field => {
        const value = getNestedValue(doc, field.path);
        const formattedValue = field.format ? field.format(value) : value;
        result = result.replace(`{${field.path}}`, formattedValue || '');
      });
      return result;
    } else if (displaySeparator === '<br>') {
      // Special case for <br> separator - return JSX with line breaks
      return (
        <>
          {normalizedDisplayFields
            .map((field, index) => {
              const value = getNestedValue(doc, field.path);
              const formattedValue = field.format ? field.format(value) : value;
              return formattedValue ? (
                <React.Fragment key={index}>
                  {index > 0 && <br />}
                  {formattedValue}
                </React.Fragment>
              ) : null;
            })
            .filter(Boolean)}
        </>
      );
    } else {
      // Otherwise join field values with separator
      return normalizedDisplayFields
        .map(field => {
          const value = getNestedValue(doc, field.path);
          return field.format ? field.format(value) : value;
        })
        .filter(Boolean)
        .join(displaySeparator);
    }
  };

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

  useEffect(() => {
    // Skip effect if value hasn't changed
    if (previousValueRef.current === value) {
      return;
    }
    
    previousValueRef.current = value;
    
    async function fetchDisplayName() {
      if (!value) {
        setDisplayValue("");
        if (onLoadComplete) {
          onLoadComplete(true);
        }
        return;
      }
  
      try {
        setIsLocalLoading(true);
        
        const response = await searchDocuments(collectionName, value, "_id");
  
        if (response && response.length > 0) {
          // Format the document using our helper
          const display = formatDisplayString(response[0]);
  
          setDisplayValue(display);
          
          // Only save the display name if nameFieldPath is provided
          if (shouldSaveName && nameFieldPath) {
            handleUpdate(nameFieldPath, display);
          }
          
          if (onLoadComplete) {
            onLoadComplete(true);
          }
        } else {
          setDisplayValue("");
          // Clear the name field too if we're saving names
          if (shouldSaveName && nameFieldPath) {
            handleUpdate(nameFieldPath, "");
          }
          
          if (onLoadComplete) {
            onLoadComplete(true, "Referenced item not found");
          }
        }
      } catch (error) {
        console.error(`Failed to load ${collectionName} details:`, error);
        setDisplayValue(`[Unable to load ${collectionName}]`);
        // Clear the name field on error if we're saving names
        if (shouldSaveName && nameFieldPath) {
          handleUpdate(nameFieldPath, "");
        }
        
        if (onLoadComplete) {
          onLoadComplete(false, error instanceof Error ? error.message : "Unknown error");
        }
      } finally {
        setIsLocalLoading(false);
      }
    }
  
    fetchDisplayName();
    // The dependency array - include all variables used in the effect
  }, [value, collectionName, normalizedDisplayFields, displayTemplate, displaySeparator, fieldPath, nameFieldPath, shouldSaveName, onLoadComplete]);

  // When value changes, update the showSearchInput state
  useEffect(() => {
    setShowSearchInput(!value);
  }, [value]);

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
      const searchPromises = normalizedDisplayFields.map((field) =>
        searchDocuments(collectionName, term, field.path)
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
    const display = formatDisplayString(result);

    setDisplayValue(display);
    
    // Update the ID field
    handleUpdate(fieldPath, result._id, { displayValue: display });
    
    // Also update the name field if nameFieldPath is provided
    if (shouldSaveName && nameFieldPath) {
      handleUpdate(nameFieldPath, display);
    }
    
    setSearchTerm("");
    setIsSearching(false);
    
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
    
    // Notify parent about ID being cleared
    handleUpdate(fieldPath, "");
    
    // Also clear the name field if we're saving names
    if (shouldSaveName && nameFieldPath) {
      handleUpdate(nameFieldPath, "");
    }
    
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
    <div className="form-field ref-field" ref={dropdownRef}>
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
                    {formatDisplayString(result)}
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
