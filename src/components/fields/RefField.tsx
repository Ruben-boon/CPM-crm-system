import React, { useState, useEffect, useRef, useCallback } from "react";
import { Search, X } from "lucide-react";
import { searchDocuments } from "@/app/actions/crudActions";

export function SkeletonLoader() {
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
  nameFields?: string[];
}

// Global cache to prevent duplicate fetches across all RefField instances
const fetchCache = new Map<string, Promise<any>>();
const displayCache = new Map<string, any>();

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
  nameFields,
}: RefFieldProps) {
  const [searchTerm, setSearchTerm] = useState("");
  const [isSearching, setIsSearching] = useState(false);
  const [results, setResults] = useState<any[]>([]);
  const [displayValue, setDisplayValue] = useState<React.ReactNode>("");
  const [isLocalLoading, setIsLocalLoading] = useState(false);
  const [showSearchInput, setShowSearchInput] = useState(!value);

  const dropdownRef = useRef<HTMLDivElement>(null);
  const searchInputRef = useRef<HTMLInputElement>(null);
  const debounceTimerRef = useRef<NodeJS.Timeout>();
  const mountedRef = useRef(true);

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
    }
  };

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

        if (mountedRef.current) {
          setResults(combinedResults);
          setIsSearching(combinedResults.length > 0);
        }
      } catch (error) {
        console.error("Search failed:", error);
        if (mountedRef.current) {
          setResults([]);
          setIsSearching(false);
        }
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

  // Hot-reload resistant effect with caching
  useEffect(() => {
    if (!value) {
      setDisplayValue("");
      setShowSearchInput(true);
      if (onLoadComplete) onLoadComplete(true);
      return;
    }

    // Create cache key
    const cacheKey = `${collectionName}-${value}`;
    
    // Check if we already have this data cached
    if (displayCache.has(cacheKey)) {
      const cachedData = displayCache.get(cacheKey);
      setDisplayValue(cachedData);
      setShowSearchInput(false);
      if (onLoadComplete) onLoadComplete(true);
      return;
    }

    // Check if there's already a fetch in progress for this key
    if (fetchCache.has(cacheKey)) {
      fetchCache.get(cacheKey)!.then((response) => {
        if (mountedRef.current && response && response.length > 0) {
          const display = formatDisplayString(response[0]);
          setDisplayValue(display);
          setShowSearchInput(false);
          displayCache.set(cacheKey, display);
          if (onLoadComplete) onLoadComplete(true);
        }
      });
      return;
    }

    // Start new fetch
    setIsLocalLoading(true);
    if (setFieldLoading) setFieldLoading(true);

    const fetchPromise = searchDocuments(collectionName, value, "_id");
    fetchCache.set(cacheKey, fetchPromise);

    fetchPromise
      .then((response) => {
        if (!mountedRef.current) return;

        if (response && response.length > 0) {
          const display = formatDisplayString(response[0]);
          setDisplayValue(display);
          setShowSearchInput(false);
          displayCache.set(cacheKey, display);
          if (onLoadComplete) onLoadComplete(true);
        } else {
          setDisplayValue(`[Not found: ${value}]`);
          setShowSearchInput(false);
          if (onLoadComplete) onLoadComplete(true, "Referenced item not found");
        }
      })
      .catch((error) => {
        if (!mountedRef.current) return;
        
        console.error(`Failed to load ${collectionName} details:`, error);
        setDisplayValue(`[Error loading]`);
        if (onLoadComplete) {
          onLoadComplete(
            false,
            error instanceof Error ? error.message : "Unknown error"
          );
        }
      })
      .finally(() => {
        if (!mountedRef.current) return;
        
        setIsLocalLoading(false);
        if (setFieldLoading) setFieldLoading(false);
        // Remove from active fetch cache
        fetchCache.delete(cacheKey);
      });

  }, [value, collectionName]); // Minimal dependencies

  const handleSelect = (result: any) => {
    const display = formatDisplayString(result);
    setDisplayValue(display);
    setShowSearchInput(false);
    
    // Cache the result
    const cacheKey = `${collectionName}-${result._id}`;
    displayCache.set(cacheKey, display);

    // Handle the main field update
    handleUpdate(fieldPath, result._id, { displayValue: display });

    // Handle the name field update if specified
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
        handleUpdate(nameFieldPath, nameValue);
      }
    }
    
    setSearchTerm("");
    setResults([]);
    setIsSearching(false);
  };

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

  // Cleanup
  useEffect(() => {
    mountedRef.current = true;
    return () => {
      mountedRef.current = false;
      if (debounceTimerRef.current) {
        clearTimeout(debounceTimerRef.current);
      }
    };
  }, []);

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