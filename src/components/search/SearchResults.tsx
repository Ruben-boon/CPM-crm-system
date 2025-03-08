"use client";
import { Item } from "@/types/types";

interface SearchResultProps {
  items: Item[];
  onSelect: (item: Item) => void;
  type?: "contacts" | "companies" | "bookings";
}

// Helper function to get role display label
const getRoleLabel = (role: string) => {
  switch (role) {
    case "booker": return "Booker";
    case "guest": return "Guest";
    case "both": return "Booker & Guest";
    default: return role || "-";
  }
};

export default function SearchResults({ items, onSelect, type = "contacts" }: SearchResultProps) {
  if (!items || items.length === 0) {
    return <div className="search-results__empty">No results found</div>;
  }

  // Handle the click event for an item
  const handleItemClick = (item: Item) => {
    onSelect(item);
  };

  return (
    <ul className="search-results">
      {items.map((item) => (
        <li key={item._id.toString()} className="search-results__item">
          <div className="search-results__content" onClick={() => handleItemClick(item)}>
            <div className="search-results__header">
              <div className="search-results__header-name">
                {type === "contacts" 
                  ? `${item.general?.firstName} ${item.general?.lastName}`
                  : type === "companies"
                  ? `${item.name}`
                  : `${item.hotelConfirmationNo} - ${new Date(item.arrivalDate).toLocaleDateString()}`}
              </div>
            </div>

            <dl className="search-results__details">
              {type === "contacts" ? (
                <>
                  {item.general?.email && (
                    <div className="search-results__details-section">
                      <dd>{item.general.email}</dd>
                    </div>
                  )}
                  {item.general?.role && (
                    <div className="search-results__details-section">
                      <dd>{getRoleLabel(item.general.role)}</dd>
                    </div>
                  )}
                </>
              ) : type === "companies" ? (
                <>
                  {item.city && (
                    <div className="search-results__details-section">
                      <dd>{item.city}{item.country ? `, ${item.country}` : ''}</dd>
                    </div>
                  )}
                </>
              ) : (
                <>
                  {item.bookerName && (
                    <div className="search-results__details-section">
                      <dd>Booker: {item.bookerName}</dd>
                    </div>
                  )}
                  {item.nights && (
                    <div className="search-results__details-section">
                      <dd>Nights: {item.nights}</dd>
                    </div>
                  )}
                </>
              )}
            </dl>
          </div>
        </li>
      ))}
    </ul>
  );
}