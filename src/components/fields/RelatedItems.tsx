"use client";
import { useState, useEffect, useCallback } from "react";
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
  onLoadingChange?: (isLoading: boolean) => void; // Callback for loading state changes
}

export function RelatedItems({
  id,
  referenceField,
  collectionName,
  displayFields,
  title,
  emptyMessage = "No items found",
  onItemClick,
  onLoadingChange,
}: RelatedItemsProps) {
  const [items, setItems] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Load related items when component mounts or ID changes
  useEffect(() => {
    let isMounted = true;

    const loadRelatedItems = async () => {
      if (!id) {
        setItems([]);
        return;
      }

      setIsLoading(true);
      if (onLoadingChange) {
        onLoadingChange(true);
      }
      setError(null);

      try {
        const results = await searchDocuments(
          collectionName,
          id,
          referenceField
        );

        if (isMounted) {
          setItems(results);
        }
      } catch (err) {
        console.error(`Error loading related ${collectionName}:`, err);
        if (isMounted) {
          setError(`Failed to load ${collectionName}`);
        }
      } finally {
        if (isMounted) {
          setIsLoading(false);
          if (onLoadingChange) {
            onLoadingChange(false);
          }
        }
      }
    };

    loadRelatedItems();

    // Cleanup function to handle unmounting
    return () => {
      isMounted = false;
    };
  }, [id, referenceField, collectionName]); // Remove onLoadingChange from dependency array

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

      <style jsx>{`
        .related-items {
          margin-bottom: 2rem;
        }

        .related-items__title {
          font-size: 1rem;
          font-weight: 600;
          margin-bottom: 0.5rem;
        }

        .related-items__list {
          display: flex;
          flex-direction: column;
          gap: 0.5rem;
          max-height: 300px;
          overflow-y: auto;
          display: flex;
          align-items: flex-start;
          padding: 0.75rem;
          border-radius: 4px;
          background-color: #white;
          border: 1px solid #e0e0e0;
          cursor: ${onItemClick ? "pointer" : "default"};
          transition: all 0.2s;
          color: var(--accent-color);
        }

        .related-items__item {
            display:flex;
            justify-content:space-between;
            width:100%;
        }
        .related-items__item:hover {
          text-decoration: underline;
        }

        .related-items__empty {
          padding: 0.75rem;
          border-radius: 4px;
          background-color: white;
          border: 1px solid #e0e0e0;
          color: #999;
          font-style: italic;
        }

        .related-items__loading,
        .related-items__error {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          padding: 0.75rem;
          font-style: italic;
          color: #666;
        }

        .related-items__error {
          color: #d32f2f;
        }

        .item-link-icon {
          opacity: 0.7;
        }
      `}</style>
    </div>
  );
}