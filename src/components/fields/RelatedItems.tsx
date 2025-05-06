"use client";
import { useState, useEffect, memo } from "react";
import { searchDocuments } from "@/app/actions/crudActions";
import { ExternalLink } from "lucide-react";

interface DisplayField {
  path: string; // Support for nested paths like "general.firstName"
  label?: string; // Optional label to display
}

interface RelatedItemsProps {
  id: string; // The ID to search for
  referenceField: string; // Field in the target collection that contains the ID (e.g., "general.companyId")
  collectionName: string; // The collection to search in (e.g., "contacts")
  displayFields: DisplayField[]; // Fields to display from the results
  title: string; // Title for the section (e.g., "Related Contacts")
  emptyMessage?: string; // Message to show when no items are found
  onItemClick?: (id: string, collection: string) => void;
  isFormEditing?: boolean; // Whether the parent form is in edit mode
  onLoadingChange?: (isLoading: boolean) => void; // Callback for loading changes
}

// Use React.memo to prevent unnecessary rerenders
const RelatedItems = memo(function RelatedItems({
  id,
  referenceField,
  collectionName,
  displayFields,
  title,
  emptyMessage = "No items found",
  onItemClick,
  isFormEditing = false,
  onLoadingChange
}: RelatedItemsProps) {
  const [items, setItems] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  // Simplified useEffect that prevents unnecessary fetches
  useEffect(() => {
    // Skip if no ID or already loading
    if (!id || isLoading) return;
    
    console.log(`[RelatedItems] Loading ${collectionName} for ${id} in ${referenceField}`);
    
    // Set loading state
    setIsLoading(true);
    if (onLoadingChange) onLoadingChange(true);
    
    // Reset error state
    setError(null);
    
    // Fetch data
    searchDocuments(collectionName, id, referenceField)
      .then(results => {
        console.log(`[RelatedItems] Loaded ${results.length} items from ${collectionName}`);
        setItems(results);
      })
      .catch(err => {
        console.error(`[RelatedItems] Error loading related ${collectionName}:`, err);
        setError(`Failed to load ${collectionName}`);
      })
      .finally(() => {
        setIsLoading(false);
        if (onLoadingChange) onLoadingChange(false);
      });
  }, [id, referenceField, collectionName]); // Removed onLoadingChange from dependencies

  // Helper function to get a value from an object using a path string
  const getNestedValue = (obj: any, path: string): string => {
    if (!obj) return "";

    return path.split(".").reduce((prev, curr) => {
      return prev ? prev[curr] : "";
    }, obj);
  };

  // Format the display value for an item
  const formatItemDisplay = (item: any): string => {
    return displayFields
      .map((field) => {
        const value = getNestedValue(item, field.path);
        return field.label ? `${field.label}: ${value}` : value;
      })
      .filter(Boolean)
      .join(" | ");
  };

  // If in edit mode, render a simpler version
  if (isFormEditing) {
    return (
      <div className="related-items related-items--edit-mode">
        <h3 className="related-items__title">{title}</h3>
        <div className="related-items__edit-message">
          {items.length > 0 
            ? `${items.length} ${items.length === 1 ? 'item' : 'items'} (visible after saving)` 
            : emptyMessage}
        </div>
      </div>
    );
  }

  return (
    <div className="related-items">
      <h3 className="related-items__title">{title}</h3>
      {isLoading ? (
        <div className="related-items__loading">
          <span>Loading...</span>
        </div>
      ) : error ? (
        <div className="related-items__error">{error}</div>
      ) : items.length > 0 ? (
        <div className="related-items__list">
          {items.map((item) => (
            <div
              key={item._id}
              className="related-items__item"
              onClick={() => onItemClick && onItemClick(item._id, collectionName)}
            >
              <span>{formatItemDisplay(item)}</span>
              {onItemClick && (
                <ExternalLink size={14} className="item-link-icon" />
              )}
            </div>
          ))}
        </div>
      ) : (
        <div className="related-items__empty">{emptyMessage}</div>
      )}
    </div>
  );
});

export { RelatedItems };