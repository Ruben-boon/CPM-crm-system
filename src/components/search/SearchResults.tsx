"use client";
import { Item } from "@/types/types";
import { Briefcase, Calendar, Copy, Hotel, House, Mail, Phone, User } from "lucide-react";

interface SearchResultProps {
  items: Item[];
  onSelect: (item: Item) => void;
  onCopy?: (item: Item) => void;
  type?: "contacts" | "companies" | "bookings" | "hotels" | "stays";
}

// Helper function to get role display label
const getRoleLabel = (role: string) => {
  switch (role) {
    case "booker":
      return "Booker";
    case "guest":
      return "Guest";
    case "both":
      return "Booker & Guest";
    default:
      return role || "-";
  }
};

// Helper function to format date
const formatDate = (dateString: string) => {
  if (!dateString) return "-";
  
  try {
    const date = new Date(dateString);
    
    // Check if the date is valid
    if (isNaN(date.getTime())) {
      return dateString;
    }
    
    // Format date as "DD MMM" (e.g., "12 Dec")
    const day = date.getDate();
    // Get month abbreviation
    const monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", 
                        "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
    const month = monthNames[date.getMonth()];
    
    return `${day} ${month}`;
  } catch (error) {
    return dateString;
  }
};

// Helper function to get guest count text
const getGuestCountText = (guestIds: any[] | undefined) => {
  if (!guestIds || !Array.isArray(guestIds)) return "0 guests";
  
  const count = guestIds.length;
  return count === 1 ? "1 guest" : `${count} guests`;
};

// Helper function to get status label
const getStatusLabel = (status: string) => {
  switch (status) {
    case "confirmed":
      return "Confirmed";
    case "pending":
      return "Pending";
    case "cancelled":
      return "Cancelled";
    case "completed":
      return "Completed";
    case "checked_in":
      return "Checked In";
    case "checked_out":
      return "Checked Out";
    case "no_show":
      return "No Show";
    default:
      return status || "-";
  }
};

export default function SearchResults({
  items,
  onSelect,
  onCopy,
  type = "contacts",
}: SearchResultProps) {
  if (!items || items.length === 0) {
    return <div className="search-results__empty">No results found</div>;
  }

  // Handle the click event for an item
  const handleItemClick = (item: Item) => {
    onSelect(item);
  };

  // Handle the copy event for an item
  const handleCopyClick = (e: React.MouseEvent, item: Item) => {
    e.stopPropagation(); // Prevent triggering the parent click event
    if (onCopy) {
      onCopy(item);
    }
  };

  return (
    <ul className="search-results">
      {items.map((item) => (
        <li key={item._id.toString()} className="search-results__item">
          <div
            className="search-results__content"
            onClick={() => handleItemClick(item)}
          >
            <div className="search-results__header">
              <div className="search-results__header-name">
                {type === "contacts"
                  ? `${item.general?.title} ${item.general?.firstName} ${item.general?.lastName}`
                  : type === "companies"
                  ? `${item.name}`
                  : type === "hotels"
                  ? `${item.name}`
                  : type === "stays"
                  ? `${item.hotelName}`
                  : type === "bookings"
                  ? `${item.confirmationNo || "Booking"} - ${formatDate(
                      item.confirmationDate
                    )}`
                  : `Unknown item type`}
              </div>
              {onCopy && (
                <button
                  className="search-results__copy-btn"
                  onClick={(e) => handleCopyClick(e, item)}
                  title="Make a copy"
                  aria-label="Make a copy"
                >
                  <Copy size={16} />
                </button>
              )}
            </div>

            <dl className="search-results__details">
              {type === "contacts" ? (
                <>
                  {item.general?.role && (
                    <div className="search-results__details-section">
                      <dd>{getRoleLabel(item.general.role)}</dd>
                    </div>
                  )}
                  {item.general?.email && (
                    <div className="search-results__details-section">
                      <dd>
                        <Mail size={14}></Mail>
                        {item.general.email}
                      </dd>
                    </div>
                  )}
                  {item.general?.phone && (
                    <div className="search-results__details-section">
                      <dd>
                        <Phone size={14}></Phone>
                        {item.general.phone}
                      </dd>
                    </div>
                  )}
                </>
              ) : type === "companies" ? (
                <>
                  {item.address && (
                    <div className="search-results__details-section">
                      <dd>
                        <House size={14}></House>
                        {item.address}
                      </dd>
                    </div>
                  )}
                  {item.city && (
                    <div className="search-results__details-section">
                      <dd>
                        {item.city}
                        {item.country ? `, ${item.country}` : ""}
                      </dd>
                    </div>
                  )}
                </>
              ) : type === "hotels" ? (
                <>
                  {item.address && (
                    <div className="search-results__details-section">
                      <dd>
                        <Hotel size={14}></Hotel>
                        {item.address}
                      </dd>
                    </div>
                  )}

                  {item.city && (
                    <div className="search-results__details-section">
                      <dd>
                        {item.city}
                        {item.country ? `, ${item.country}` : ""}
                      </dd>
                    </div>
                  )}
                  {item.phone && (
                    <div className="search-results__details-section">
                      <dd>
                        <Phone size={14}></Phone>
                        {item.phone}
                      </dd>
                    </div>
                  )}
                </>
              ) : type === "stays" ? (
                <>
                  <div className="search-results__details-section">
                    <dd><Calendar size={14}></Calendar>
                      {formatDate(item.checkInDate)} - {" "}
                      {formatDate(item.checkOutDate)}
                    </dd>
                  </div>
                  <div className="search-results__details-section">
                    <dd>
                      <User size={14} />
                      {getGuestCountText(item.guestIds)}
                    </dd>
                  </div>
                  {/* {item.status && (
                    <div className="search-results__details-section">
                      <dd>Status: {getStatusLabel(item.status)}</dd>
                    </div>
                  )} */}
                </>
              ) : type === "bookings" ? (
                <>
                 <dd><Calendar size={14}></Calendar>
                      {formatDate(item.travelPeriodStart)} - {" "}
                      {formatDate(item.travelPeriodEnd)}
                    </dd>
                  {item.companyName && (
                    <div className="search-results__details-section">
                      <dd><Briefcase size={14}/> {item.companyName}</dd>
                    </div>
                  )}
                  {item.bookerName && (
                    <div className="search-results__details-section">
                      <dd><User size={14}/>{item.bookerName}</dd>
                    </div>
                  )}
                  {item.status && (
                    <div className="search-results__details-section">
                      <dd>{getStatusLabel(item.status)}</dd>
                    </div>
                  )}
                </>
              ) : null}
            </dl>
          </div>
        </li>
      ))}
    </ul>
  );
}