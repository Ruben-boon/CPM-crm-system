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

  // --- MODIFICATION START: Update queue ---
  const [updateQueue, setUpdateQueue] = useState<{ path: string; value: any; metadata?: any }[]>([]);
  // --- MODIFICATION END: Update queue ---

  const dropdownRef = useRef<HTMLDivElement>(null);
  const previousValueRef = useRef<string>("");
  const searchInputRef = useRef<HTMLInputElement>(null);
  const debounceTimerRef = useRef<NodeJS.Timeout>();

  const normalizedDisplayFields = displayFields.map((field) =>
    typeof field === "string" ? { path: field } : field
  );

  const getNestedValue = (obj: any, path: string): any => {
    return path.split(".").reduce((o, p) => (o ? o[p] : undefined), obj);
  };

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

  const handleUpdate = (path: string, val: any, metadata?: any) => {
    if (onChange) {
      onChange(path, val, metadata);
    } else if (updateField) {
      updateField(path, val, metadata);
    } else {
      console.error("No update function provided to RefField");
    }
  };
  
  // --- MODIFICATION START: Process update queue ---
  useEffect(() => {
    if (updateQueue.length > 0) {
      const [firstUpdate, ...restOfQueue] = updateQueue;
      handleUpdate(firstUpdate.path, firstUpdate.value, firstUpdate.metadata);
      setUpdateQueue(restOfQueue);
    }
  }, [updateQueue, handleUpdate]);
  // --- MODIFICATION END: Process update queue ---

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

  const handleSearch = (term: string) => {
    setSearchTerm(term);

    if (debounceTimerRef.current) {
      clearTimeout(debounceTimerRef.current);
    }

    debounceTimerRef.current = setTimeout(() => {
      performSearch(term);
    }, searchDebounceMs);
  };

  useEffect(() => {
    return () => {
      if (debounceTimerRef.current) {
        clearTimeout(debounceTimerRef.current);
      }
    };
  }, []);

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

  useEffect(() => {
    setShowSearchInput(!value);
  }, [value]);

  // --- MODIFICATION START: Use update queue on select ---
  const handleSelect = (result: any) => {
    const display = formatDisplayString(result);
    setDisplayValue(display);

    const updates = [{ path: fieldPath, value: result._id, metadata: { displayValue: display } }];

    if (nameFieldPath) {
      let nameValue;
      if (nameFields && nameFields.length > 0) {
        nameValue = nameFields
          .map((field) => getNestedValue(result, field))
          .filter(Boolean)
          .join(" ");
      } else {
        const primaryDisplayField = normalizedDisplayFields[0];
        if (primaryDisplayField) {
          nameValue = getNestedValue(result, primaryDisplayField.path);
        }
      }
      if (nameValue !== undefined) {
        updates.push({ path: nameFieldPath, value: nameValue });
      }
    }
    setUpdateQueue(updates);
    
    setSearchTerm("");
    setResults([]);
    setIsSearching(false);
    setShowSearchInput(false);
  };
  // --- MODIFICATION END: Use update queue on select ---

  // --- MODIFICATION START: Use update queue on clear ---
  const handleClear = () => {
    setDisplayValue("");
    setSearchTerm("");
    setResults([]);
    setIsSearching(false);
    setShowSearchInput(true);

    const updates = [{ path: fieldPath, value: "" }];
    if (nameFieldPath) {
      updates.push({ path: nameFieldPath, value: "" });
    }
    setUpdateQueue(updates);
    
    if (onLoadComplete) {
      onLoadComplete(true);
    }

    setTimeout(() => searchInputRef.current?.focus(), 0);
  };
  // --- MODIFICATION END: Use update queue on clear ---

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