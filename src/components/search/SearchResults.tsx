"use client";
import { Item } from "@/types/types";

interface SearchResultProps {
  items: Item[];
  onSelect: (item: Item) => void;
}

export default function SearchResults({ items, onSelect }: SearchResultProps) {
  if (!items || items.length === 0) {
    return <div className="search-results__empty">No results found</div>;
  }

  return (
    <ul className="search-results">
      {items.map((item) => (
        <li key={item._id.toString()} className="search-results__item">
          <div className="search-results__content" onClick={() => onSelect(item)}>
            <div className="search-results__header">
              <div className="search-results__header-name">
                {`${item.general.firstName} ${item.general.lastName}`}
              </div>
            </div>

            <dl className="search-results__details">
              {item.general.email && (
                <div className="search-results__details-section">
                  <dd>{item.general.email}</dd>
                </div>
              )}
              {item.general.phone && (
                <div className="search-results__details-section">
                  <dd>{item.general.phone}</dd>
                </div>
              )}
            </dl>
          </div>
        </li>
      ))}
    </ul>
  );
}