import React, { useState, useEffect, useRef } from "react";
import { Search, X, Plus } from "lucide-react";
import { searchDocuments } from "@/app/actions/crudActions";
import Button from "@/components/common/Button";
import { ContactModal } from "../contact/ContactModal";

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
  setFieldLoading?: (fieldPath: string, isLoading: boolean) => void;
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
  const [displayNames, setDisplayNames] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [showSearchInput, setShowSearchInput] = useState(true);
  const [isContactModalOpen, setIsContactModalOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const previousValuesRef = useRef<string[]>([]);

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

  // Set initial loading state when component mounts or value changes
  useEffect(() => {
    const hasValueChanges =
      JSON.stringify(value) !== JSON.stringify(previousValuesRef.current);

    if (hasValueChanges && value.length > 0) {
      // Only set loading state if there are values to load
      setIsLoading(true);
      if (setFieldLoading) {
        setFieldLoading(fieldPath, true);
      }
      fetchDisplayNames();
      previousValuesRef.current = [...value];
    } else if (hasValueChanges && value.length === 0) {
      // Clear display names if no values
      setDisplayNames([]);
      if (setFieldLoading) {
        setFieldLoading(fieldPath, false);
      }
      previousValuesRef.current = [];
    }
  }, [value, fieldPath]);

  // Fetch display names for the references
  const fetchDisplayNames = async () => {
    if (value.length === 0) {
      setDisplayNames([]);
      setIsLoading(false);
      if (setFieldLoading) {
        setFieldLoading(fieldPath, false);
      }
      return;
    }

    try {
      const namePromises = value.map((id) =>
        searchDocuments<SearchResult>(collectionName, id, "_id")
      );
      const results = await Promise.all(namePromises);
      const names = results
        .map((result) => (result[0] ? formatDisplayValue(result[0]) : ""))
        .filter(Boolean);

      setDisplayNames(names);
    } catch (error) {
      console.error(`Failed to load ${collectionName} display names:`, error);
      setDisplayNames(value.map(() => "Error loading name"));
    } finally {
      setIsLoading(false);
      if (setFieldLoading) {
        setFieldLoading(fieldPath, false);
      }
    }
  };

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
      // Clean up loading state on unmount
      if (setFieldLoading) {
        setFieldLoading(fieldPath, false);
      }
    };
  }, []);

  // Handle search
  const handleSearch = async (term: string) => {
    setSearchTerm(term);
    if (term.length > 0) {
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
    } else {
      setResults([]);
      setIsSearching(false);
    }
  };

  // Handle selecting a result
  const handleSelect = (result: SearchResult) => {
    const newValue = [...value, result._id];
    updateField(fieldPath, newValue);
    setSearchTerm("");
    setIsSearching(false);

    // Set loading state for the newly added item
    if (setFieldLoading) {
      setFieldLoading(fieldPath, true);
    }
  };

  // Handle removing an item
  const handleRemove = (index: number) => {
    const newValue = value.filter((_, i) => i !== index);
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
    const newValue = [...value, contactId];
    updateField(fieldPath, newValue);

    // Set loading state for the new contact
    if (setFieldLoading) {
      setFieldLoading(fieldPath, true);
    }

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
            <div className="loading-indicator">Loading...</div>
          ) : displayNames.length > 0 ? (
            <div className="selected-items-readonly">
              {displayNames.map((name, index) => (
                <div
                  key={`${value[index]}-${index}`}
                  className="selected-item-readonly"
                >
                  {name}
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
            {isLoading ? (
              <div className="loading-indicator">Loading...</div>
            ) : (
              value.map((id, index) => (
                <div key={`${id}-${index}`} className="selected-item">
                  <span>{displayNames[index] || id}</span>
                  <button
                    type="button"
                    onClick={() => handleRemove(index)}
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
    </>
  );
}
