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
  MapPin,
  Clock,
  Users,
  Bed,
  DollarSign,
} from "lucide-react";

interface SearchResultProps {
  items: Item[];
  onSelect: (item: Item) => void;
  onCopy?: (item: Item) => void;
  type?: "contacts" | "companies" | "bookings" | "hotels" | "stays";
}

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

// Helper function to format full date for stays
const formatFullDate = (dateString: string) => {
  if (!dateString) return "-";

  try {
    const date = new Date(dateString);
    if (isNaN(date.getTime())) return dateString;

    return date.toLocaleDateString("en-GB", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
  } catch (error) {
    return dateString;
  }
};

// Helper function to calculate nights between dates
const calculateNights = (
  checkInDate?: string,
  checkOutDate?: string
): string => {
  if (!checkInDate || !checkOutDate) return "-";

  try {
    const checkIn = new Date(checkInDate);
    const checkOut = new Date(checkOutDate);

    if (isNaN(checkIn.getTime()) || isNaN(checkOut.getTime())) return "-";

    const diffTime = checkOut.getTime() - checkIn.getTime();
    const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));

    return diffDays.toString();
  } catch (error) {
    return "-";
  }
};

// Helper function to get status label and class
const getStatusInfo = (status: string) => {
  const statusMap: Record<string, { label: string; className: string }> = {
    // Booking statuses
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

    // Stay statuses
    unconfirmed: { label: "Unconfirmed", className: "status-unconfirmed" },
    unconfirmed_prepaid: {
      label: "Unconfirmed Prepaid",
      className: "status-unconfirmed_prepaid",
    },
    confirmed_prepaid_upcoming: {
      label: "Confirmed Prepaid Upcoming",
      className: "status-confirmed_prepaid_upcoming",
    },
    confirmed_upcoming: {
      label: "Confirmed Upcoming",
      className: "status-confirmed_upcoming",
    },
    confirmed_prepaid_stayed: {
      label: "Confirmed Prepaid Stayed",
      className: "status-confirmed_prepaid_stayed",
    },
    confirmed_stayed: {
      label: "Confirmed Stayed",
      className: "status-confirmed_stayed",
    },
    purchase_invoice_received: {
      label: "Purchase Invoice Received",
      className: "status-purchase_invoice_received",
    },
    cancelled: { label: "Cancelled", className: "status-cancelled" },

    // Legacy/other statuses
    confirmed: {
      label: "Confirmed",
      className: "status-upcoming_confirmation_sent",
    },
    pending: { label: "Pending", className: "status-upcoming_no_action" },
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

// Helper function to format guest names for stays
const formatGuestNames = (stay: any): string => {
  // Check for guest names array
  if (
    stay.guestNames &&
    Array.isArray(stay.guestNames) &&
    stay.guestNames.length > 0
  ) {
    return stay.guestNames.join(", ");
  }

  // Check for guest IDs count
  if (
    stay.guestIds &&
    Array.isArray(stay.guestIds) &&
    stay.guestIds.length > 0
  ) {
    const count = stay.guestIds.length;
    return count === 1 ? "1 guest" : `${count} guests`;
  }

  return "No guests";
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

  const handleItemClick = (item: Item) => {
    onSelect(item);
  };

  const handleCopyClick = (e: React.MouseEvent, item: Item) => {
    e.stopPropagation();
    if (onCopy) {
      onCopy(item);
    }
  };

  const showCopyButton = onCopy && (type === "bookings" || type === "stays");

  const sortedItems = [...items];
  if (type === "bookings") {
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
          .map((s) => new Date(s.checkInDate))
          .filter((d) => !isNaN(d.getTime()));
        if (validDates.length === 0) return null;
        return new Date(
          Math.min.apply(
            null,
            validDates.map((d) => d.getTime())
          )
        );
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
          <li
            key={item._id.toString()}
            className={`search-results__item search-results__item--${type}`}
          >
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
                {showCopyButton && (
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
                    {/* EXPANDED: More contact information */}
                    {item.general?.email && (
                      <div className="search-results__details-section">
                        <dd>
                          <Mail size={14} />
                          {item.general.email}
                        </dd>
                      </div>
                    )}
                    {item.general?.phone && (
                      <div className="search-results__details-section">
                        <dd>
                          <Phone size={14} />
                          {item.general.phone}
                        </dd>
                      </div>
                    )}
                    {item.general?.companyName && (
                      <div className="search-results__details-section">
                        <dd>
                          <Building size={14} />
                          {item.general.companyName}
                        </dd>
                      </div>
                    )}
                    {(item.general?.city || item.general?.country) && (
                      <div className="search-results__details-section">
                        <dd>
                          <MapPin size={14} />
                          {[item.general?.city, item.general?.country]
                            .filter(Boolean)
                            .join(", ")}
                        </dd>
                      </div>
                    )}
                    {item.general?.role && (
                      <div className="search-results__details-section">
                        <dd>
                          <UserRound size={14} />
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
                          <House size={14} />
                          {item.address}
                        </dd>
                      </div>
                    )}
                    {item.city && (
                      <div className="search-results__details-section">
                        <dd>
                          <MapPin size={14} />
                          {item.city}
                          {item.postal_code ? `, ${item.postal_code}` : ""}
                          {item.country ? `, ${item.country}` : ""}
                        </dd>
                      </div>
                    )}
                    {item.phone && (
                      <div className="search-results__details-section">
                        <dd>
                          <Phone size={14} />
                          {item.phone}
                        </dd>
                      </div>
                    )}
                  </>
                ) : type === "hotels" ? (
                  <>
                    {item.address && (
                      <div className="search-results__details-section">
                        <dd>
                          <Hotel size={14} />
                          {item.address}
                        </dd>
                      </div>
                    )}
                    {item.city && (
                      <div className="search-results__details-section">
                        <dd>
                          <MapPin size={14} />
                          {item.city}
                          {item.postal_code ? `, ${item.postal_code}` : ""}
                          {item.country ? `, ${item.country}` : ""}
                        </dd>
                      </div>
                    )}
                    {item.email && (
                      <div className="search-results__details-section">
                        <dd>
                          <Mail size={14} />
                          {item.email}
                        </dd>
                      </div>
                    )}
                    {item.phone && (
                      <div className="search-results__details-section">
                        <dd>
                          <Phone size={14} />
                          {item.phone}
                        </dd>
                      </div>
                    )}
                  </>
                ) : type === "stays" ? (
                  <>
                    {/* EXPANDED: Much more stay information */}
                    <div className="search-results__details-section">
                      <dd>
                        <Calendar size={14} />
                        {formatFullDate(item.checkInDate)} -{" "}
                        {formatFullDate(item.checkOutDate)}
                        {(() => {
                          const nights = calculateNights(
                            item.checkInDate,
                            item.checkOutDate
                          );
                          return nights !== "-"
                            ? ` (${nights} ${
                                nights === "1" ? "night" : "nights"
                              })`
                            : "";
                        })()}
                      </dd>
                    </div>

                    {/* Guest information */}
                    <div className="search-results__details-section">
                      <dd>
                        <Users size={14} />
                        {formatGuestNames(item)}
                      </dd>
                    </div>

                    {/* Room and price information */}
                    {(item.roomType || item.roomPrice) && (
                      <div className="search-results__details-section">
                        <dd>
                          <Bed size={14} />
                          {[
                            item.roomType,
                            item.roomPrice
                              ? `${item.roomCurrency || "EUR"} ${
                                  item.roomPrice
                                }`
                              : null,
                          ]
                            .filter(Boolean)
                            .join(" - ")}
                        </dd>
                      </div>
                    )}

                    {/* Hotel confirmation number */}
                    {item.hotelConfirmationNo && (
                      <div className="search-results__details-section">
                        <dd>
                          <Hotel size={14} />
                          Hotel Conf: {item.hotelConfirmationNo}
                        </dd>
                      </div>
                    )}
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
                            .filter(Boolean)
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
