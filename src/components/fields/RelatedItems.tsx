"use client";
import { useState, useEffect, useRef, memo, useCallback } from "react";
import { searchDocuments } from "@/app/actions/crudActions";
import { ExternalLink } from "lucide-react";
import { LoadingSpinner } from "../loadingSpinner";

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
  const loadedRef = useRef(false); // Track if data has been loaded once
  const isMountedRef = useRef(true); // Track if component is mounted

  // Memoize the function to report loading state to prevent it from changing on each render
  const reportLoadingState = useCallback((loading: boolean) => {
    // Report loading state to the parent component
    if (onLoadingChange) {
      onLoadingChange(loading);
    }
  }, [onLoadingChange]);

  // Load related items when component mounts or ID changes
  useEffect(() => {
    isMountedRef.current = true;

    // Skip data loading when in edit mode if data was already loaded once
    if (isFormEditing && loadedRef.current && items.length > 0) {
      return;
    }

    const loadRelatedItems = async () => {
      if (!id) {
        if (isMountedRef.current) {
          setItems([]);
        }
        return;
      }

      // Only show loading indicator when no data is already loaded
      if (!loadedRef.current) {
        if (isMountedRef.current) {
          setIsLoading(true);
          // Report loading state
          reportLoadingState(true);
        }
      }

      if (isMountedRef.current) {
        setError(null);
      }

      try {
        const results = await searchDocuments(
          collectionName,
          id,
          referenceField
        );

        if (isMountedRef.current) {
          setItems(results);
          loadedRef.current = true; // Mark data as loaded
          setIsLoading(false);
          // Report loading complete
          reportLoadingState(false);
        }
      } catch (err) {
        console.error(`Error loading related ${collectionName}:`, err);
        if (isMountedRef.current) {
          setError(`Failed to load ${collectionName}`);
          setIsLoading(false);
          // Report loading complete even on error
          reportLoadingState(false);
        }
      }
    };

    loadRelatedItems();

    // Cleanup function to handle unmounting
    return () => {
      isMountedRef.current = false;
      // Make sure to mark as not loading when component unmounts
      reportLoadingState(false);
    };
  }, [id, referenceField, collectionName, items.length, isFormEditing, reportLoadingState]);

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

  const handleItemClick = (itemId: string) => {
    if (onItemClick) {
      onItemClick(itemId, collectionName);
    }
  };

  // If in edit mode and we've already loaded data once, render a simpler version
  if (isFormEditing && loadedRef.current) {
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
          <LoadingSpinner isLoading={true} />
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
              onClick={() => handleItemClick(item._id)}
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