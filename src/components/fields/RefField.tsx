import React, { useState, useEffect, useRef, useCallback } from "react";
import { Search, X } from "lucide-react";
import { searchDocuments } from "@/app/actions/crudActions";

export function SkeletonLoader() {
  console.log("skeleton loader triggered nice!");
  return <div className="skeleton-item-ref-field"></div>;
}

interface DisplayFieldConfig {
  path: string;
  label?: string;
  format?: (value: any) => string;
}

interface RefFieldProps {
  label: string;
  fieldPath: string;
  value: string;
  updateField?: (fieldPath: string, value: any, metadata?: any) => void;
  onChange?: (fieldPath: string, value: any, metadata?: any) => void;
  required?: boolean;
  disabled?: boolean;
  isEditing?: boolean;
  isChanged?: boolean;
  className?: string;
  collectionName: string;
  displayFields?: (string | DisplayFieldConfig)[];
  displayTemplate?: string;
  displaySeparator?: string;
  onLoadComplete?: (loaded: boolean, error?: string) => void;
  setFieldLoading?: (isLoading: boolean) => void;
  searchDebounceMs?: number;
  nameFieldPath?: string;
  nameFields?: string[]; // <-- ADDED PROP
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
  setFieldLoading,
  searchDebounceMs = 300,
  nameFieldPath,
  nameFields, // <-- ADDED PROP
}: RefFieldProps) {
  const [searchTerm, setSearchTerm] = useState("");
  const [isSearching, setIsSearching] = useState(false);
  const [results, setResults] = useState<any[]>([]);
  const [displayValue, setDisplayValue] = useState<React.ReactNode>("");
  const [isLocalLoading, setIsLocalLoading] = useState(false);
  const [showSearchInput, setShowSearchInput] = useState(!value);

  const dropdownRef = useRef<HTMLDivElement>(null);
  const previousValueRef = useRef<string>("");
  const searchInputRef = useRef<HTMLInputElement>(null);
  const debounceTimerRef = useRef<NodeJS.Timeout>();

  // Normalize display fields to always use the object format
  const normalizedDisplayFields = displayFields.map((field) =>
    typeof field === "string" ? { path: field } : field
  );

  // Helper function to extract field value from an object using dot notation
  const getNestedValue = (obj: any, path: string): any => {
    return path.split(".").reduce((o, p) => (o ? o[p] : undefined), obj);
  };

  // Format a document into a display string or JSX element
  const formatDisplayString = (doc: any): React.ReactNode => {
    if (displayTemplate) {
      let result = displayTemplate;
      normalizedDisplayFields.forEach((field) => {
        const value = getNestedValue(doc, field.path);
        const formattedValue = field.format ? field.format(value) : value;
        result = result.replace(`{${field.path}}`, formattedValue || "");
      });
      return result;
    } else if (displaySeparator === "<br>") {
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
      return normalizedDisplayFields
        .map((field) => {
          const value = getNestedValue(doc, field.path);
          return field.format ? field.format(value) : value;
        })
        .filter(Boolean)
        .join(displaySeparator);
    }
  };

  // Use the appropriate update function
  const handleUpdate = (path: string, val: any, metadata?: any) => {
    if (onChange) {
      onChange(path, val, metadata);
    } else if (updateField) {
      updateField(path, val, metadata);
    } else {
      console.error("No update function provided to RefField");
    }
  };

  // Debounced search function
  const performSearch = useCallback(
    async (term: string) => {
      if (!term.trim()) {
        setResults([]);
        setIsSearching(false);
        return;
      }

      try {
        const searchPromises = normalizedDisplayFields.map((field) =>
          searchDocuments(collectionName, term, field.path)
        );

        const resultsArrays = await Promise.all(searchPromises);
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
    },
    [collectionName, normalizedDisplayFields]
  );

  // Handle search input with debounce
  const handleSearch = (term: string) => {
    setSearchTerm(term);

    if (debounceTimerRef.current) {
      clearTimeout(debounceTimerRef.current);
    }

    debounceTimerRef.current = setTimeout(() => {
      performSearch(term);
    }, searchDebounceMs);
  };

  // Cleanup debounce timer on unmount
  useEffect(() => {
    return () => {
      if (debounceTimerRef.current) {
        clearTimeout(debounceTimerRef.current);
      }
    };
  }, []);

  // Load display value effect
  useEffect(() => {
    if (previousValueRef.current === value) {
      return;
    }
    previousValueRef.current = value;

    async function fetchDisplayName() {
      if (!value) {
        setDisplayValue("");
        if (onLoadComplete) onLoadComplete(true);
        return;
      }

      try {
        setIsLocalLoading(true);
        if (setFieldLoading) setFieldLoading(true);

        const response = await searchDocuments(collectionName, value, "_id");

        if (response && response.length > 0) {
          const display = formatDisplayString(response[0]);
          setDisplayValue(display);
          if (onLoadComplete) onLoadComplete(true);
        } else {
          setDisplayValue("");
          if (onLoadComplete) onLoadComplete(true, "Referenced item not found");
        }
      } catch (error) {
        console.error(`Failed to load ${collectionName} details:`, error);
        setDisplayValue(`[Unable to load ${collectionName}]`);
        if (onLoadComplete) {
          onLoadComplete(
            false,
            error instanceof Error ? error.message : "Unknown error"
          );
        }
      } finally {
        setIsLocalLoading(false);
        if (setFieldLoading) setFieldLoading(false);
      }
    }

    fetchDisplayName();
  }, [
    value,
    collectionName,
    displayTemplate,
    displaySeparator,
    onLoadComplete,
    setFieldLoading,
    normalizedDisplayFields,
  ]);

  // Update showSearchInput when value changes
  useEffect(() => {
    setShowSearchInput(!value);
  }, [value]);

  // Handle selecting a search result
  const handleSelect = (result: any) => {
    const display = formatDisplayString(result);
    setDisplayValue(display);
    handleUpdate(fieldPath, result._id, { displayValue: display });

    // --- MODIFICATION START ---
    if (nameFieldPath) {
      let nameValue;
      if (nameFields && nameFields.length > 0) {
        // Use nameFields to construct the name
        nameValue = nameFields
          .map((field) => getNestedValue(result, field))
          .filter(Boolean)
          .join(" ");
      } else {
        // Fallback to original behavior: use the first displayField
        const primaryDisplayField = normalizedDisplayFields[0];
        if (primaryDisplayField) {
          nameValue = getNestedValue(result, primaryDisplayField.path);
        }
      }
      if (nameValue !== undefined) {
        handleUpdate(nameFieldPath, nameValue);
      }
    }
    // --- MODIFICATION END ---

    setSearchTerm("");
    setResults([]);
    setIsSearching(false);
    setShowSearchInput(false);
  };

  // Clear the selection
  const handleClear = () => {
    setDisplayValue("");
    setSearchTerm("");
    setResults([]);
    setIsSearching(false);
    setShowSearchInput(true);

    handleUpdate(fieldPath, "");
    if (nameFieldPath) {
      handleUpdate(nameFieldPath, "");
    }

    if (onLoadComplete) {
      onLoadComplete(true);
    }

    setTimeout(() => searchInputRef.current?.focus(), 0);
  };

  // Read-only view
  if (!isEditing) {
    return (
      <div className="form-field">
        <label className="field-label">{label}</label>
        <div className={`read-only ${className}`}>
          {value && isLocalLoading ? (
            <SkeletonLoader />
          ) : value && displayValue ? (
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
              {isLocalLoading ? <SkeletonLoader /> : displayValue || "-"}
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
              ref={searchInputRef}
              type="text"
              value={searchTerm}
              onChange={(e) => handleSearch(e.target.value)}
              className={`search-input ${
                isChanged ? "field-changed" : ""
              } ${className}`}
              placeholder="Search..."
              disabled={disabled}
              autoFocus
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