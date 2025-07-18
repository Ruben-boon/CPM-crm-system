"use client";
import { Item } from "@/types/types";
import {
  Briefcase,
  Calendar,
  Copy,
  Hotel,
  House,
  Mail,
  Phone,
  User,
  Building,
  CreditCard,
  UserRound,
} from "lucide-react";

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
    const monthNames = [
      "Jan",
      "Feb",
      "Mar",
      "Apr",
      "May",
      "Jun",
      "Jul",
      "Aug",
      "Sep",
      "Oct",
      "Nov",
      "Dec",
    ];
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

// Helper function to get status label and class
const getStatusInfo = (status: string) => {
  // New labels based on your status system
  const statusMap: Record<string, { label: string; className: string }> = {
    // Default booking statuses
    upcoming_no_action: {
      label: "Upcoming - No action taken",
      className: "status-upcoming_no_action",
    },
    upcoming_confirmation_sent: {
      label: "Upcoming - Confirmation send",
      className: "status-upcoming_confirmation_sent",
    },
    stayed_missing_invoice: {
      label: "Stayed - Missing Purchase Invoice(s)",
      className: "status-stayed_missing_invoice",
    },
    invoicing_missing_both: {
      label: "Invoicing - Missing both",
      className: "status-invoicing_missing_both",
    },
    invoicing_missing_sales: {
      label: "Invoicing - Missing sales invoice",
      className: "status-invoicing_missing_sales",
    },
    invoicing_missing_commission: {
      label: "Invoicing - Missing commission",
      className: "status-invoicing_missing_commission",
    },
    completed: { label: "Completed", className: "status-completed" },

    // Legacy/other statuses
    confirmed: {
      label: "Confirmed",
      className: "status-upcoming_confirmation_sent",
    },
    pending: { label: "Pending", className: "status-upcoming_no_action" },
    cancelled: { label: "Cancelled", className: "status-cancelled" },
    checked_in: {
      label: "Checked In",
      className: "status-upcoming_confirmation_sent",
    },
    checked_out: {
      label: "Checked Out",
      className: "status-stayed_missing_invoice",
    },
    no_show: { label: "No Show", className: "status-cancelled" },
  };

  return (
    statusMap[status] || { label: status || "-", className: "status-default" }
  );
};

export default function SearchResults({
  items,
  onSelect,
  onCopy,
  type = "contacts",
}: SearchResultProps) {
  if (!items || items.length === 0) {
    return <div className="search-results__empty"></div>;
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

  // Sort items by status if they're bookings
  const sortedItems = [...items];
  if (type === "bookings") {
    // Define status priority order (lower number = higher priority)
    const statusPriority: Record<string, number> = {
      upcoming_no_action: 1,
      upcoming_confirmation_sent: 2,
      stayed_missing_invoice: 3,
      invoicing_missing_both: 4,
      invoicing_missing_sales: 5,
      invoicing_missing_commission: 6,
      completed: 7,
      // Handle legacy statuses
      confirmed: 2,
      pending: 1,
      cancelled: 8,
      checked_in: 2,
      checked_out: 3,
      no_show: 8,
    };

    sortedItems.sort((a, b) => {
      // First sort by status priority
      const aPriority = statusPriority[a.status as string] || 99;
      const bPriority = statusPriority[b.status as string] || 99;

      if (aPriority !== bPriority) {
        return aPriority - bPriority;
      }

      // If status is the same, sort by the earliest check-in date from summaries
      const getEarliestDate = (summaries: any[] | undefined) => {
        if (!summaries || summaries.length === 0) return null;
        const validDates = summaries
          .map(s => new Date(s.checkInDate))
          .filter(d => !isNaN(d.getTime()));
        if (validDates.length === 0) return null;
        return new Date(Math.min.apply(null, validDates.map(d => d.getTime())));
      };

      const aDate = getEarliestDate(a.staySummaries);
      const bDate = getEarliestDate(b.staySummaries);

      if (aDate && bDate) {
        // Sort by descending date (most recent first)
        return bDate.getTime() - aDate.getTime();
      }

      // If dates are missing or invalid, fallback to confirmation number
      return (a.confirmationNo || "").localeCompare(b.confirmationNo || "");
    });
  }

  return (
    <>
      <ul className="search-results">
        {sortedItems.map((item) => (
          <li key={item._id.toString()} className="search-results__item">
            <div
              className="search-results__content"
              onClick={() => handleItemClick(item)}
            >
              <div className="search-results__header">
                <div className="search-results__header-name">
                  {type === "contacts"
                    ? `${item.general?.title || ""} ${
                        item.general?.firstName || ""
                      } ${item.general?.lastName || ""}`
                    : type === "companies"
                    ? `${item.name}`
                    : type === "hotels"
                    ? `${item.name}`
                    : type === "stays"
                    ? `${item.hotelName}`
                    : type === "bookings"
                    ? `${item.confirmationNo || "Booking"}`
                    : `Unknown item type`}
                </div>
                {onCopy && type !== "bookings" && (
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
                    {item.general?.email && (
                      <div className="search-results__details-section">
                        <dd>
                          <Mail size={14}></Mail>
                          {item.general.email}
                        </dd>
                      </div>
                    )}
                    {item.general?.companyName && (
                      <div className="search-results__details-section">
                        <dd>
                          <Building size={14}></Building>
                          {item.general.companyName}
                        </dd>
                      </div>
                    )}
                      {item.general?.role && (
                      <div className="search-results__details-section">
                        <dd>
                          <UserRound size={14}></UserRound>
                          {item.general.role}
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
                          {item.postal_code ? `, ${item.postal_code}` : ""}
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
                          {item.postal_code ? `, ${item.postal_code}` : ""}
                          {item.country ? `, ${item.country}` : ""}
                        </dd>
                      </div>
                    )}
                    {item.email && (
                      <div className="search-results__details-section">
                        <dd>
                          <Mail size={14}></Mail>
                          {item.email}
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
                      <dd>
                        <Calendar size={14}></Calendar>
                        {formatDate(item.checkInDate)} -{" "}
                        {formatDate(item.checkOutDate)}
                      </dd>
                    </div>
                  </>
                ) : type === "bookings" ? (
                  <>
                    {item.companyName && (
                      <div className="search-results__details-section">
                        <dd>
                          <Briefcase size={14} /> {item.companyName}
                        </dd>
                      </div>
                    )}
                    {item.bookerName && (
                      <div className="search-results__details-section">
                        <dd>
                          <User size={14} /> {item.bookerName}
                        </dd>
                      </div>
                    )}
                    {item.costCentre && (
                      <div className="search-results__details-section">
                        <dd>
                          <CreditCard size={14} /> {item.costCentre}
                        </dd>
                      </div>
                    )}
                    {item.staySummaries && item.staySummaries.length > 0 && (
                      <div className="search-results__details-section">
                        <dd>
                          <Hotel size={14} />{" "}
                          {[
                            ...new Set(
                              item.staySummaries.map((s) => s.hotelName)
                            ),
                          ]
                            .filter(Boolean) // Remove any null/undefined names
                            .join(", ")}
                        </dd>
                      </div>
                    )}
                    {item.status && (
                      <div className="search-results__details-section">
                        <dd className="status-container">
                          <span
                            className={`status-badge-small ${
                              getStatusInfo(item.status).className
                            }`}
                          >
                            {getStatusInfo(item.status).label}
                          </span>
                        </dd>
                      </div>
                    )}
                  </>
                ) : null}
              </dl>
            </div>
          </li>
        ))}
      </ul>
    </>
  );
}