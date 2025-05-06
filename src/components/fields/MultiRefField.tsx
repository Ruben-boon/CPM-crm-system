import React, { useState, useEffect, useRef } from "react";
import { Search, X, Plus } from "lucide-react";
import { searchDocuments } from "@/app/actions/crudActions";
import Button from "@/components/common/Button";
import { ContactModal } from "../contact/ContactModal";
import { SkeletonLoader } from "../SkeletonLoader";

interface MultiRefFieldProps {
  label: string;
  fieldPath: string; // Path to the field in the data model
  value: string[];
  updateField: (fieldPath: string, value: any) => void;
  required?: boolean;
  disabled?: boolean;
  isEditing?: boolean;
  isChanged?: boolean;
  className?: string;
  collectionName: string;
  displayFields?: string[];
  showQuickAdd?: boolean;
  setFieldLoading?: (isLoading: boolean) => void;
}

interface SearchResult {
  _id: string;
  [key: string]: any;
}

export function MultiRefField({
  label,
  fieldPath,
  value = [],
  updateField,
  required = false,
  disabled = false,
  isEditing = false,
  isChanged = false,
  className = "",
  collectionName,
  displayFields = ["name"],
  showQuickAdd = false,
  setFieldLoading,
}: MultiRefFieldProps) {
  const [searchTerm, setSearchTerm] = useState("");
  const [isSearching, setIsSearching] = useState(false);
  const [results, setResults] = useState<SearchResult[]>([]);
  const [displayNames, setDisplayNames] = useState<{[id: string]: string}>({});
  const [isLoading, setIsLoading] = useState(false);
  const [showSearchInput, setShowSearchInput] = useState(true);
  const [isContactModalOpen, setIsContactModalOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const loadedIdsRef = useRef<Set<string>>(new Set());

  // Helper function to extract nested values
  const getNestedValue = (obj: any, path: string) => {
    const parts = path.split(".");
    let value = obj;
    for (const part of parts) {
      value = value?.[part];
      if (value === undefined) return "";
    }
    return value;
  };

  // Format display value for a result
  const formatDisplayValue = (result: SearchResult) => {
    return displayFields
      .map((field) => getNestedValue(result, field))
      .filter(Boolean)
      .join(" ");
  };

  // Load display names for IDs that haven't been loaded yet
  useEffect(() => {
    // Skip if no values
    if (value.length === 0) return;
    
    // Find IDs that need to be loaded (excluding ones we've already tried to load)
    const idsToLoad = value.filter(id => !loadedIdsRef.current.has(id));
    
    // Skip if all IDs are already loaded or already loading
    if (idsToLoad.length === 0 || isLoading) return;
    
    // Set loading state and notify parent
    setIsLoading(true);
    if (setFieldLoading) setFieldLoading(true);
    
    // Load display names for new IDs
    const loadDisplayNames = async () => {
      try {
        // Create a copy of the current display names
        const newDisplayNames = { ...displayNames };
        
        // Process each ID individually to prevent one failure from affecting others
        for (const id of idsToLoad) {
          try {
            // Mark this ID as processed even before the search completes
            // This prevents infinite loops by ensuring we don't try to load it again
            loadedIdsRef.current.add(id);
            
            const result = await searchDocuments<SearchResult>(collectionName, id, "_id");
            
            if (result && Array.isArray(result) && result.length > 0) {
              newDisplayNames[id] = formatDisplayValue(result[0]);
            } else {
              // Handle case where the item was not found
              console.warn(`Item not found in ${collectionName}: ${id}`);
              newDisplayNames[id] = `[Not found]`;
            }
          } catch (itemError) {
            // Handle errors for individual items
            console.error(`Error loading ${id} from ${collectionName}:`, itemError);
            newDisplayNames[id] = `[Error loading]`;
            // Still mark as processed to avoid retrying
            loadedIdsRef.current.add(id);
          }
        }
        
        // Update display names all at once
        setDisplayNames(newDisplayNames);
      } catch (error) {
        console.error(`Failed to load ${collectionName} display names:`, error);
        
        // Mark all ids as processed to prevent retrying
        idsToLoad.forEach(id => {
          loadedIdsRef.current.add(id);
          
          // Only add error messages for ids that don't have display names yet
          if (!displayNames[id]) {
            const newDisplayNames = { ...displayNames };
            newDisplayNames[id] = `[Error]`;
            setDisplayNames(newDisplayNames);
          }
        });
      } finally {
        setIsLoading(false);
        if (setFieldLoading) setFieldLoading(false);
      }
    };
    
    loadDisplayNames();
    // Dependencies don't include displayNames to prevent infinite loops
  }, [value, collectionName, displayFields, setFieldLoading]);

  // Handle click outside to close dropdown
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
    };
  }, []);

  // Handle search
  const handleSearch = async (term: string) => {
    setSearchTerm(term);
    if (term.length < 2) {
      setResults([]);
      setIsSearching(false);
      return;
    }
    
    try {
      const searchPromises = displayFields.map((field) =>
        searchDocuments<SearchResult>(collectionName, term, field)
      );

      const results = await Promise.all(searchPromises);

      // Combine and deduplicate results, removing already selected items
      const filteredResults = Array.from(
        new Map(
          results
            .flat()
            .filter((item) => !value.includes(item._id))
            .map((item) => [item._id, item])
        ).values()
      );

      setResults(filteredResults);
      setIsSearching(filteredResults.length > 0);
    } catch (error) {
      console.error("Search failed:", error);
      setResults([]);
      setIsSearching(false);
    }
  };

  // Handle selecting a result
  const handleSelect = (result: SearchResult) => {
    const displayName = formatDisplayValue(result);
    
    // Update display names cache
    setDisplayNames(prev => ({
      ...prev,
      [result._id]: displayName
    }));
    
    // Mark as loaded
    loadedIdsRef.current.add(result._id);
    
    // Update the value
    const newValue = [...value, result._id];
    updateField(fieldPath, newValue);
    
    // Reset search
    setSearchTerm("");
    setIsSearching(false);
  };

  // Handle removing an item
  const handleRemove = (id: string) => {
    const newValue = value.filter(item => item !== id);
    updateField(fieldPath, newValue);
  };

  // Handle quick add functionality
  const handleQuickAdd = () => {
    if (collectionName === "contacts") {
      setIsContactModalOpen(true);
    }
  };

  // Callback for when a contact is created
  const handleContactCreated = (contactId: string, displayName: string) => {
    // Update display names cache
    setDisplayNames(prev => ({
      ...prev,
      [contactId]: displayName
    }));
    
    // Mark as loaded
    loadedIdsRef.current.add(contactId);
    
    // Update the value
    const newValue = [...value, contactId];
    updateField(fieldPath, newValue);

    // Close the modal
    setIsContactModalOpen(false);
  };

  const shouldShowQuickAdd =
    showQuickAdd && collectionName === "contacts" && isEditing;

  // Read-only view
  if (!isEditing) {
    return (
      <div className="multi-ref-field">
        <label className="field-label">{label}</label>
        <div className={`read-only ${className}`}>
          {isLoading ? (
            <SkeletonLoader count={value.length || 1} type="ref-field" />
          ) : value.length > 0 ? (
            <div className="selected-items-readonly">
              {value.map(id => (
                <div key={id} className="selected-item-readonly">
                  {displayNames[id] ? (
                    displayNames[id].startsWith('[Not found]') || displayNames[id].startsWith('[Error]') ? (
                      <span className="error-text">{displayNames[id]}</span>
                    ) : (
                      displayNames[id]
                    )
                  ) : id}
                </div>
              ))}
            </div>
          ) : (
            <span className="empty-reference">-</span>
          )}
        </div>
      </div>
    );
  }

  // Editable view
  return (
    <>
      <div className="multi-ref-field">
        <label className="field-label">
          {label}
          {required && <span className="required-mark">*</span>}
        </label>

        <div
          className={`ref-field-container ${isChanged ? "field-changed" : ""}`}
          ref={dropdownRef}
        >
          <div className="selected-items">
            {isLoading && Object.keys(displayNames).length === 0 ? (
              <SkeletonLoader count={value.length || 1} type="ref-field" />
            ) : (
              value.map(id => (
                <div key={id} className="selected-item">
                  <span>
                    {displayNames[id] ? (
                      displayNames[id].startsWith('[Not found]') || displayNames[id].startsWith('[Error]') ? (
                        <span className="error-text">{displayNames[id]}</span>
                      ) : (
                        displayNames[id]
                      )
                    ) : (
                      <span className="loading-inline">Loading...</span>
                    )}
                  </span>
                  <button
                    type="button"
                    onClick={() => handleRemove(id)}
                    className="remove-button"
                    disabled={disabled}
                  >
                    <X className="h-4 w-4" />
                  </button>
                </div>
              ))
            )}
          </div>

          {showSearchInput && (
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
                      <span className="result-name">
                        {formatDisplayValue(result)}
                      </span>
                      <span className="result-id">{result._id}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Inline Contact Modal */}
      {isContactModalOpen && (
        <ContactModal
          initialData={{ general: { role: "guest" } }}
          callback={handleContactCreated}
          onClose={() => setIsContactModalOpen(false)}
        />
      )}

      <style jsx>{`
        .loading-inline {
          font-style: italic;
          color: #888;
        }
        .error-text {
          color: #d32f2f;
          font-style: italic;
        }
      `}</style>
    </>
  );
}